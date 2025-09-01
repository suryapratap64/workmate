import express from "express";
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markAsRead,
} from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Get all conversations for the authenticated user
router.get("/conversations", isAuthenticated, getConversations);

// Get messages for a specific conversation
router.get(
  "/conversations/:conversationId/messages",
  isAuthenticated,
  getMessages
);

// Create a new conversation
router.post("/conversations", isAuthenticated, createConversation);

// Send a message
router.post("/messages", isAuthenticated, sendMessage);

// Mark messages as read
router.put("/conversations/:conversationId/read", isAuthenticated, markAsRead);

export default router;
