import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { MessageCircle } from "lucide-react";

const MessagePage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToChatList = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)]">
        <div className="flex h-full bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Chat List Sidebar */}
          <div
            className={`w-full md:w-80 border-r border-gray-200 bg-white ${
              selectedConversation ? "hidden md:block" : "block"
            }`}
          >
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <MessageCircle className="h-6 w-6 mr-2 text-blue-500" />
                Messages
              </h1>
            </div>
            <ChatList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?._id}
            />
          </div>

          {/* Chat Window */}
          <div
            className={`flex-1 overflow-hidden ${
              selectedConversation ? "block" : "hidden md:block"
            }`}
          >
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                onBack={handleBackToChatList}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
