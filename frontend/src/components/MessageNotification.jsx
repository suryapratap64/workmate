import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useSelector } from "react-redux";
import { MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MessageNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useSelector((state) => state.worker);
  const navigate = useNavigate();

  useEffect(() => {
    if (socket && user) {
      socket.on("message_notification", handleNewMessageNotification);

      return () => {
        socket.off("message_notification");
      };
    }
  }, [socket, user]);

  const handleNewMessageNotification = (data) => {
    // Only show notification if user is not currently viewing the conversation
    const notification = {
      id: Date.now(),
      message: data.message,
      conversationId: data.conversationId,
      sender: data.sender,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification) => {
    removeNotification(notification.id);
    navigate("/message");
  };

  // Don't render if no user is logged in
  if (!user || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-blue-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">New message</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message.content}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {notification.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageNotification;
