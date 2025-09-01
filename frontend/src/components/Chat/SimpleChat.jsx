import React, { useState } from "react";
import SimpleVideoCall from "../VideoCall/SimpleVideoCall";

const Chat = ({ conversation, currentUser, messages }) => {
  const [showVideoCall, setShowVideoCall] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {showVideoCall ? (
        <SimpleVideoCall
          conversationId={conversation._id}
          currentUser={currentUser}
          onClose={() => setShowVideoCall(false)}
        />
      ) : (
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              {conversation.name || "Chat"}
            </h2>
            <button
              onClick={() => setShowVideoCall(true)}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              📞
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages?.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  msg.sender === currentUser._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[70%] ${
                    msg.sender === currentUser._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-lg border p-2"
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
