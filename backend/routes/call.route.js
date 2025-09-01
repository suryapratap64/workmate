import express from "express";
import {
  createCall,
  joinCall,
  endCall,
  getCallStatus,
  getUserActiveCalls,
} from "../controllers/call.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Create a new call
router.post("/create", isAuthenticated, createCall);

// Join an existing call
router.post("/join/:conversationId", isAuthenticated, joinCall);

// End a call
router.post("/end/:conversationId", isAuthenticated, endCall);

// Get call status for a conversation
router.get("/status/:conversationId", isAuthenticated, getCallStatus);

// Get all active calls for the authenticated user
router.get("/active", isAuthenticated, getUserActiveCalls);

export default router;
