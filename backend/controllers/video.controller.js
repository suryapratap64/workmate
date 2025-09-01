const Conversation = require("../models/conversation.model");

async function startVideoCall(req, res) {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Update conversation with video call status
    conversation.videoCall = {
      active: true,
      startedBy: userId,
      startedAt: new Date(),
      participants: [
        {
          userId,
          joinedAt: new Date(),
        },
      ],
    };

    await conversation.save();

    return res.status(200).json({
      message: "Video call started",
      conversation,
    });
  } catch (error) {
    console.error("Error starting video call:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function endVideoCall(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // End the video call
    conversation.videoCall = {
      active: false,
      endedAt: new Date(),
    };

    await conversation.save();

    return res.status(200).json({
      message: "Video call ended",
      conversation,
    });
  } catch (error) {
    console.error("Error ending video call:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function joinVideoCall(req, res) {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.videoCall.active) {
      return res.status(404).json({ message: "Active video call not found" });
    }

    // Add participant to video call
    if (!conversation.videoCall.participants.some((p) => p.userId === userId)) {
      conversation.videoCall.participants.push({
        userId,
        joinedAt: new Date(),
      });
    }

    await conversation.save();

    return res.status(200).json({
      message: "Joined video call",
      conversation,
    });
  } catch (error) {
    console.error("Error joining video call:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function leaveVideoCall(req, res) {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Remove participant from video call
    if (conversation.videoCall?.participants) {
      conversation.videoCall.participants =
        conversation.videoCall.participants.filter((p) => p.userId !== userId);

      // If no participants left, end the call
      if (conversation.videoCall.participants.length === 0) {
        conversation.videoCall.active = false;
        conversation.videoCall.endedAt = new Date();
      }
    }

    await conversation.save();

    return res.status(200).json({
      message: "Left video call",
      conversation,
    });
  } catch (error) {
    console.error("Error leaving video call:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  startVideoCall,
  endVideoCall,
  joinVideoCall,
  leaveVideoCall,
};
