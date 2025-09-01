import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoCall from "../components/VideoCall/VideoCall";

const VideoCallPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch conversation details
    fetchConversation();
    // Get current user
    fetchCurrentUser();
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();
      setConversation(data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      navigate("/chat"); // Navigate back to chat on error
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/current");
      const data = await response.json();
      setCurrentUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/chat");
    }
  };

  const handleEndCall = () => {
    navigate(`/chat/${conversationId}`);
  };

  if (!conversation || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <VideoCall
      conversationId={conversationId}
      currentUser={currentUser}
      onClose={handleEndCall}
    />
  );
};

export default VideoCallPage;
