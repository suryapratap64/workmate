import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { Worker } from "../models/worker.model.js";
import { Client } from "../models/client.model.js";
import Job from "../models/job.model.js";

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const { userId, userType } = req.user;

    let conversations;
    if (userType === "client") {
      conversations = await Conversation.find({ client: userId })
        .populate("worker", "firstName lastName profilePicture")
        .populate("jobId", "title description")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
    } else {
      conversations = await Conversation.find({ worker: userId })
        .populate("client", "firstName lastName profilePicture")
        .populate("jobId", "title description")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
    }

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if user is part of this conversation
    if (
      conversation.client.toString() !== userId &&
      conversation.worker.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const messages = await Message.find({
      jobId: conversation.jobId,
      $or: [
        { sender: conversation.client, receiver: conversation.worker },
        { sender: conversation.worker, receiver: conversation.client },
      ],
    })
      .populate("sender", "firstName lastName profilePicture")
      .populate("receiver", "firstName lastName profilePicture")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        receiver: userId,
        jobId: conversation.jobId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { jobId, workerId, clientId } = req.body;
    const { userId, userType } = req.user;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    let client, worker;

    // Determine the conversation participants based on user type
    if (userType === "client") {
      // Client is starting conversation with worker
      client = userId;
      worker = workerId;

      // Verify the client owns the job
      if (job.client.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied - you don't own this job",
        });
      }
    } else {
      // Worker is starting conversation with client
      client = clientId || job.client;
      worker = userId;

      // Verify the worker is not the job owner
      if (job.client.toString() === userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied - you cannot message yourself",
        });
      }
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      jobId,
      client,
      worker,
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversation: existingConversation,
      });
    }

    // Verify worker exists
    const workerDoc = await Worker.findById(worker);
    if (!workerDoc) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Verify client exists
    const clientDoc = await Client.findById(client);
    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const conversation = new Conversation({
      jobId,
      client,
      worker,
    });

    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("worker", "firstName lastName profilePicture")
      .populate("client", "firstName lastName profilePicture")
      .populate("jobId", "title description");

    res.status(201).json({
      success: true,
      conversation: populatedConversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = "text" } = req.body;
    const { userId, userType } = req.user;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if user is part of this conversation
    if (
      conversation.client.toString() !== userId &&
      conversation.worker.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Determine receiver
    const receiver =
      conversation.client.toString() === userId
        ? conversation.worker
        : conversation.client;
    const receiverModel =
      conversation.client.toString() === userId ? "Worker" : "Client";

    const message = new Message({
      sender: userId,
      senderModel: userType === "client" ? "Client" : "Worker",
      receiver,
      receiverModel,
      content,
      messageType,
      jobId: conversation.jobId,
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    if (userType === "client") {
      conversation.unreadCount.worker += 1;
    } else {
      conversation.unreadCount.client += 1;
    }
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "firstName lastName profilePicture")
      .populate("receiver", "firstName lastName profilePicture");

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if user is part of this conversation
    if (
      conversation.client.toString() !== userId &&
      conversation.worker.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Mark messages as read
    await Message.updateMany(
      {
        receiver: userId,
        jobId: conversation.jobId,
        isRead: false,
      },
      { isRead: true }
    );

    // Reset unread count
    if (conversation.client.toString() === userId) {
      conversation.unreadCount.client = 0;
    } else {
      conversation.unreadCount.worker = 0;
    }
    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
