const express = require("express");
const router = express.Router();
const videoController = require("../controllers/video.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");

// Start a video call in a conversation
router.post(
  "/conversations/:conversationId/video/start",
  isAuthenticated,
  videoController.startVideoCall
);

// End a video call
router.post(
  "/conversations/:conversationId/video/end",
  isAuthenticated,
  videoController.endVideoCall
);

// Join a video call
router.post(
  "/conversations/:conversationId/video/join",
  isAuthenticated,
  videoController.joinVideoCall
);

// Leave a video call
router.post(
  "/conversations/:conversationId/video/leave",
  isAuthenticated,
  videoController.leaveVideoCall
);

module.exports = router;
