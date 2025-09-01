import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { VideoRoom, WebRTCClient } from "../types/webRTC.types.js";
import { createServer } from "http";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    // Prefer polling first so environments that can't upgrade to websocket
    // won't fail the connection with low-level frame errors.
    transports: ["polling", "websocket"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    serveClient: false,
    cookie: false,
    maxHttpBufferSize: 1e8,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const { userId, userType } = socket.handshake.query;

      // Log connection attempt
      console.log("Socket connection attempt:", {
        userId,
        userType,
        transport: socket.conn.transport.name,
        remoteAddress: socket.handshake.address,
      });

      if (!token) {
        console.log("No token provided for user:", userId);
        return next(new Error("Authentication error: No token provided"));
      }

      if (!userId) {
        console.log("No userId provided in query params");
        return next(new Error("Authentication error: No userId provided"));
      }

      try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Validate that the token belongs to the connecting user
        if (decoded.userId !== userId) {
          console.log("Token userId mismatch:", decoded.userId, userId);
          return next(new Error("Authentication error: Invalid user token"));
        }

        socket.userId = userId;
        socket.userType = userType || decoded.userType || "worker";
        socket.decodedToken = decoded; // Store decoded token for future use

        console.log(
          `User authenticated successfully: ${socket.userId} (${socket.userType}) using ${socket.conn.transport.name}`
        );
        next();
      } catch (jwtError) {
        console.log("JWT verification failed:", jwtError);
        next(new Error("Authentication error: Invalid or expired token"));
      }
    } catch (error) {
      console.log("Socket authentication error:", error);
      next(new Error("Authentication error: " + error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userType})`);

    // Join user to their personal room
    socket.join(socket.userId);

    // Handle joining conversation rooms
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(
        `User ${socket.userId} joined conversation ${conversationId}`
      );
    });

    // Handle leaving conversation rooms
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on("send_message", async (data, callback) => {
      try {
        console.log("Received message data:", data);
        const {
          conversationId,
          content,
          messageType = "text",
          sender,
          senderModel,
          receiver,
          receiverModel,
        } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          console.log("Conversation not found:", conversationId);
          socket.emit("error", { message: "Conversation not found" });
          callback &&
            callback({ success: false, error: "Conversation not found" });
          return;
        }

        // Check if user is part of this conversation
        if (
          conversation.client.toString() !== socket.userId &&
          conversation.worker.toString() !== socket.userId
        ) {
          console.log("Access denied for user:", socket.userId);
          socket.emit("error", { message: "Access denied" });
          callback && callback({ success: false, error: "Access denied" });
          return;
        }

        const message = new Message({
          sender: socket.userId,
          senderModel: socket.userType === "client" ? "Client" : "Worker",
          receiver,
          receiverModel,
          content,
          messageType,
          jobId: conversation.jobId,
        });

        await message.save();

        // Update conversation
        conversation.lastMessage = message._id;
        if (socket.userType === "client") {
          conversation.unreadCount.worker += 1;
        } else {
          conversation.unreadCount.client += 1;
        }
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "firstName lastName profilePicture")
          .populate("receiver", "firstName lastName profilePicture");

        // Emit to all users in the conversation
        io.to(conversationId).emit("new_message", {
          message: populatedMessage,
          conversationId,
        });

        // Emit to receiver's personal room for notifications
        io.to(receiver.toString()).emit("message_notification", {
          message: populatedMessage,
          conversationId,
          sender: socket.userId,
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (conversationId) => {
      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on("typing_stop", (conversationId) => {
      socket.to(conversationId).emit("user_stopped_typing", {
        userId: socket.userId,
        conversationId,
      });
    });

    // Handle read receipts
    socket.on("mark_as_read", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Check if user is part of this conversation
        if (
          conversation.client.toString() !== socket.userId &&
          conversation.worker.toString() !== socket.userId
        ) {
          return;
        }

        // Mark messages as read
        await Message.updateMany(
          {
            receiver: socket.userId,
            jobId: conversation.jobId,
            isRead: false,
          },
          { isRead: true }
        );

        // Reset unread count
        if (conversation.client.toString() === socket.userId) {
          conversation.unreadCount.client = 0;
        } else {
          conversation.unreadCount.worker = 0;
        }
        await conversation.save();

        // Emit read receipt
        socket.to(conversationId).emit("messages_read", {
          userId: socket.userId,
          conversationId,
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Handle online status
    socket.on("set_online_status", (status) => {
      socket.broadcast.emit("user_status_changed", {
        userId: socket.userId,
        status,
      });
    });

    // Handle call events
    socket.on("call_incoming", (data) => {
      const { conversationId, callType, callerId, callId, receiverId } = data;
      // Emit to conversation room for users currently viewing conversation
      socket.to(conversationId).emit("call_incoming", {
        conversationId,
        callType,
        callerId,
        callId: callId || null,
      });

      // Also emit to the specific receiver's personal room so they get a notification
      if (receiverId) {
        io.to(receiverId.toString()).emit("call_incoming", {
          conversationId,
          callType,
          callerId,
          callId: callId || null,
        });
      }
    });

    socket.on("call_accepted", (data) => {
      const { conversationId, callId } = data;
      socket.to(conversationId).emit("call_accepted", {
        conversationId,
        callId,
      });
    });

    socket.on("call_rejected", (data) => {
      const { conversationId, callId } = data;
      socket.to(conversationId).emit("call_rejected", {
        conversationId,
        callId,
      });
    });

    socket.on("call_ended", (data) => {
      const { conversationId, callId } = data;
      socket.to(conversationId).emit("call_ended", {
        conversationId,
        callId,
      });
    });

    // WebRTC signaling
    socket.on("offer", (data) => {
      const { conversationId, offer, targetUserId } = data;
      socket.to(targetUserId).emit("offer", {
        conversationId,
        offer,
        fromUserId: socket.userId,
      });
    });

    socket.on("answer", (data) => {
      const { conversationId, answer, targetUserId } = data;
      socket.to(targetUserId).emit("answer", {
        conversationId,
        answer,
        fromUserId: socket.userId,
      });
    });

    socket.on("ice_candidate", (data) => {
      const { conversationId, candidate, targetUserId } = data;
      socket.to(targetUserId).emit("ice_candidate", {
        conversationId,
        candidate,
        fromUserId: socket.userId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
