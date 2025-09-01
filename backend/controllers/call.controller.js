import { Worker } from "../models/worker.model.js";
import { Client } from "../models/client.model.js";
import Conversation from "../models/conversation.model.js";

// Store active calls in memory (in production, use Redis)
const activeCalls = new Map();

// Create or join a call
export const createCall = async (req, res) => {
  try {
    // Prefer authenticated user id from middleware, fall back to body
    const { conversationId, callType } = req.body; // callType: 'audio' or 'video'
    const userIdFromBody = req.body.userId;
    const userTypeFromBody = req.body.userType;
    const userId = userIdFromBody || req.user?.userId;
    const userType = userTypeFromBody || req.user?.userType || "worker";

    if (!conversationId || !callType || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: { conversationId, callType, userId },
      });
    }

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      conversation.client.toString() !== userId &&
      conversation.worker.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Debug log: incoming request and authenticated user
    console.log("createCall payload:", {
      conversationId,
      callType,
      userId,
      userType,
      authenticatedUser: req.user,
    });

    // Check if there's already an active call for this conversation
    const existingCall = activeCalls.get(conversationId);
    if (existingCall) {
      // If a call is already in progress, return it instead of an error so clients
      // can gracefully join or show the ongoing call UI rather than failing.
      return res.status(200).json({
        success: true,
        message: "Call already in progress",
        call: existingCall,
      });
    }

    // Create new call
    const generatedId = `call_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const call = {
      id: generatedId,
      _id: generatedId,
      callId: generatedId,
      conversationId,
      callType,
      initiator: userId,
      userType,
      participants: [userId],
      status: "ringing", // ringing, connected, ended
      startTime: new Date(),
      endTime: null,
    };

    activeCalls.set(conversationId, call);

    res.status(201).json({
      success: true,
      call,
    });
  } catch (error) {
    console.error("Error creating call:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Join an existing call
export const joinCall = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    const call = activeCalls.get(conversationId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (
      conversation.client.toString() !== userId &&
      conversation.worker.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Add participant if not already in call
    if (!call.participants.includes(userId)) {
      call.participants.push(userId);
    }

    // Update call status to connected
    call.status = "connected";

    res.status(200).json({
      success: true,
      call,
    });
  } catch (error) {
    console.error("Error joining call:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// End a call
export const endCall = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    const call = activeCalls.get(conversationId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    // Verify user is part of the call
    if (!call.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update call status
    call.status = "ended";
    call.endTime = new Date();

    // Remove call from active calls
    activeCalls.delete(conversationId);

    res.status(200).json({
      success: true,
      message: "Call ended successfully",
      call,
    });
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get call status
export const getCallStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      conversation.client.toString() !== userId &&
      conversation.worker.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const call = activeCalls.get(conversationId);

    res.status(200).json({
      success: true,
      call,
    });
  } catch (error) {
    console.error("Error getting call status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all active calls for a user
export const getUserActiveCalls = async (req, res) => {
  try {
    const { userId } = req.user;

    const userCalls = [];
    for (const [conversationId, call] of activeCalls.entries()) {
      if (call.participants.includes(userId)) {
        userCalls.push({
          ...call,
          conversationId,
        });
      }
    }

    res.status(200).json({
      success: true,
      calls: userCalls,
    });
  } catch (error) {
    console.error("Error getting user active calls:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
