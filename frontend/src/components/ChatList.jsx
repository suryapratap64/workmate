import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { MessageCircle, Clock, User } from "lucide-react";

const ChatList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useSelector((state) => state.worker);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/message/conversations",
        {
          withCredentials: true, // Use cookies instead of Bearer token
        }
      );

      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUnreadCount = (conversation) => {
    return user?.userType === "client"
      ? conversation.unreadCount?.client || 0
      : conversation.unreadCount?.worker || 0;
  };

  const getUserDisplayName = (user) => {
    if (!user) return "Unknown User";
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <MessageCircle className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-sm">Start a conversation by applying to a job</p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {conversations.map((conversation) => {
            const otherUser = conversation.client?.firstName
              ? conversation.client
              : conversation.worker;
            const unreadCount = getUnreadCount(conversation);
            const isSelected = selectedConversationId === conversation._id;

            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  isSelected
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {otherUser?.profilePicture ? (
                      <img
                        src={otherUser.profilePicture}
                        alt={getUserDisplayName(otherUser)}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {getUserDisplayName(otherUser)}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.jobId?.title || "Job conversation"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    {conversation.lastMessage && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
