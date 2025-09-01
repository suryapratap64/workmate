import { API_URL } from "../config";
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useSelector } from "react-redux";
import axios from "axios";
import { Send, Paperclip, Smile, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CallControls from "./CallControls";
import VideoCall from "./VideoCall/VideoCall";
import { useWebRTC } from "../hooks/useWebRTC.js";
import VideoControls from "./VideoCall/VideoControls";
import VideoGrid from "./VideoCall/VideoGrid";

const ChatWindow = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.worker);
  // Only start WebRTC when there is an active call (use call id).
  // Passing null/undefined meetingId prevents the hook from initializing until a call exists.
  const meetingIdForWebRTC = currentCall?._id || currentCall?.callId || null;

  const {
    localStream,
    participants,
    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMicrophone,
    endCall,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC(meetingIdForWebRTC, {
    participantId: user?._id,
    displayName: `${user?.firstName} ${user?.lastName}`,
    cameraEnabled: true,
    micEnabled: true,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      joinConversation();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ensure header is always visible
  useEffect(() => {
    const header = document.querySelector(".chat-header");
    if (header) {
      header.style.display = "flex";
      header.style.visibility = "visible";
      header.style.opacity = "1";
    }
  }, [conversation]);

  useEffect(() => {
    if (socket) {
      socket.on("new_message", handleNewMessage);
      socket.on("user_typing", handleUserTyping);
      socket.on("user_stopped_typing", handleUserStoppedTyping);
      socket.on("messages_read", handleMessagesRead);
      socket.on("call_incoming", handleIncomingCall);
      socket.on("call_accepted", handleCallAccepted);
      socket.on("call_rejected", handleCallRejected);
      socket.on("call_ended", handleCallEnded);

      return () => {
        socket.off("new_message");
        socket.off("user_typing");
        socket.off("user_stopped_typing");
        socket.off("messages_read");
        socket.off("call_incoming");
        socket.off("call_accepted");
        socket.off("call_rejected");
        socket.off("call_ended");
      };
    }
  }, [socket]);

  const joinConversation = () => {
    if (socket && conversation && isConnected) {
      console.log("Joining conversation:", conversation._id);
      socket.emit("join_conversation", conversation._id, (acknowledgement) => {
        console.log("Join conversation acknowledgement:", acknowledgement);
      });

      // Mark messages as read when joining conversation
      socket.emit("mark_as_read", conversation._id);
    } else {
      console.log("Cannot join conversation:", {
        hasSocket: !!socket,
        hasConversation: !!conversation,
        isConnected,
      });
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/v1/message/conversations/${conversation._id}/messages`,
        {
          withCredentials: true, // Use cookies instead of Bearer token
        }
      );

      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.conversationId === conversation._id) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  const handleUserTyping = (data) => {
    if (data.conversationId === conversation._id && data.userId !== user._id) {
      setTypingUsers((prev) => [
        ...prev.filter((id) => id !== data.userId),
        data.userId,
      ]);
    }
  };

  const handleUserStoppedTyping = (data) => {
    if (data.conversationId === conversation._id) {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    }
  };

  const handleMessagesRead = (data) => {
    if (data.conversationId === conversation._id) {
      // Update read status in UI if needed
    }
  };

  const handleIncomingCall = (data) => {
    if (data.conversationId === conversation._id) {
      // Ensure callId is captured so accepting the call initializes WebRTC with the correct meeting id
      setIncomingCall({
        conversationId: data.conversationId,
        // force video-only UI/flow
        callType: "video",
        callerId: data.callerId,
        callId: data.callId || data._id || null,
      });
      setShowCallInterface(true);
    }
  };

  const handleCallAccepted = (data) => {
    if (data.conversationId === conversation._id) {
      setCurrentCall(data);
      setIncomingCall(null);
    }
  };

  const handleCallRejected = (data) => {
    if (data.conversationId === conversation._id) {
      setIncomingCall(null);
      setShowCallInterface(false);
    }
  };

  const handleCallEnded = (data) => {
    if (data.conversationId === conversation._id) {
      setCurrentCall(null);
      setIncomingCall(null);
      setShowCallInterface(false);
    }
  };

  const handleCallStart = (call) => {
    setCurrentCall(call);
    setShowCallInterface(true);
  };

  const handleCallEnd = () => {
    endCall();
    setCurrentCall(null);
    setShowCallInterface(false);
  };

  const handleCallClose = () => {
    setShowCallInterface(false);
    setCurrentCall(null);
    setIncomingCall(null);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !isConnected || !socket) {
      console.log("Cannot send message:", {
        hasMessage: !!newMessage.trim(),
        isConnected,
        hasSocket: !!socket,
      });
      return;
    }

    try {
      const messageData = {
        conversationId: conversation._id,
        content: newMessage.trim(),
        messageType: "text",
        sender: user._id,
        senderModel: user.userType === "client" ? "Client" : "Worker",
        receiver: getOtherUser()._id,
        receiverModel:
          getOtherUser().userType === "client" ? "Client" : "Worker",
      };

      console.log("Sending message:", messageData);

      // Send via socket for real-time
      socket.emit("send_message", messageData, (acknowledgement) => {
        console.log("Message acknowledgement:", acknowledgement);
      });

      // Also send via HTTP for persistence
      const response = await axios.post(
        `${API_URL}/api/v1/message/messages`,
        messageData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Message sent response:", response.data);

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    if (!isTyping && isConnected) {
      setIsTyping(true);
      socket.emit("typing_start", conversation._id);
    }
  };

  const handleStopTyping = () => {
    if (isTyping && isConnected) {
      setIsTyping(false);
      socket.emit("typing_stop", conversation._id);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOtherUser = () => {
    return conversation.client?._id === user._id
      ? conversation.worker
      : conversation.client;
  };

  const getUserDisplayName = (user) => {
    if (!user) return "Unknown User";
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User"
    );
  };

  const otherUser = getOtherUser();

  // Debug logging
  console.log("ChatWindow - conversation:", conversation);
  console.log("ChatWindow - user:", user);
  console.log("ChatWindow - otherUser:", otherUser);

  if (!conversation) {
    console.warn("ChatWindow: No conversation provided");
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ overflow: "visible" }}
    >
      {/* Header - Always visible */}
      <div
        className="chat-header mt-14 flex items-center p-4 border-b border-gray-200 bg-white  max-w-full z-10 relative"
        style={{
          transition: "none !important",
          display: "flex !important",
          visibility: "visible !important",
          opacity: "1 !important",
          position: "relative !important",
          zIndex: "10 !important",
        }}
      >
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {otherUser?.profilePicture ? (
            <img
              src={otherUser.profilePicture}
              alt={getUserDisplayName(otherUser)}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {getUserDisplayName(otherUser).charAt(0) || "U"}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-medium text-gray-900">
              {getUserDisplayName(otherUser)}
            </h3>
            <p className="text-sm text-gray-500">
              {conversation.jobId?.title || "Job conversation"}
            </p>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
          <CallControls
            conversation={conversation}
            onCallStart={(call) => {
              console.log("Call started:", call);
              // Ensure call object contains _id for meeting identification
              setCurrentCall({
                ...call,
                _id: call._id || call.callId,
                callType: "video",
              });
              setShowCallInterface(true);
            }}
            onCallEnd={() => {
              console.log("Call ended");
              endCall();
              setCurrentCall(null);
              setShowCallInterface(false);
            }}
          />
        </div>

        {/* Add call notification for incoming calls */}
        {incomingCall && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              {/* incoming call header */}
              <h3 className="text-lg font-medium mb-4">Incoming video call</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    socket.emit("call_accepted", {
                      conversationId: incomingCall.conversationId,
                      callId: incomingCall.callId,
                    });
                    // populate currentCall so hook can initialize if needed
                    setCurrentCall({
                      ...incomingCall,
                      _id: incomingCall.callId,
                      callType: "video",
                    });
                    setIncomingCall(null);
                    // navigate into the single video chat page
                    navigate(
                      `/video-chat/${conversation._id}/${incomingCall.callId}`
                    );
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Join
                </button>
                <button
                  onClick={() => {
                    socket.emit("call_rejected", {
                      conversationId: incomingCall.conversationId,
                      callId: incomingCall.callId,
                    });
                    setIncomingCall(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[calc(100vh-200px)]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.sender._id === user._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                  <p className="text-sm italic">Typing...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Paperclip className="h-5 w-5 text-gray-500" />
          </button>

          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                  handleStopTyping();
                }
              }}
              onBlur={handleStopTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Smile className="h-5 w-5 text-gray-500" />
          </button>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Video Call Interface */}
      {showCallInterface && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
          <VideoCall
            conversationId={conversation._id}
            localParticipant={{
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              type: user.userType,
            }}
            remoteParticipant={{
              id: otherUser._id,
              name: getUserDisplayName(otherUser),
              type: otherUser.userType,
            }}
            onClose={() => {
              handleCallEnd();
              handleCallClose();
            }}
          >
            <VideoGrid
              localStream={localStream}
              remoteStreams={
                Array.isArray(participants)
                  ? participants.map((p) => p.stream)
                  : []
              }
            />
            <VideoControls
              cameraEnabled={cameraEnabled}
              micEnabled={micEnabled}
              isScreenSharing={isScreenSharing}
              onToggleCamera={toggleCamera}
              onToggleMic={toggleMicrophone}
              onToggleScreenShare={
                isScreenSharing ? stopScreenShare : startScreenShare
              }
              onEndCall={() => {
                handleCallEnd();
                handleCallClose();
              }}
            />
          </VideoCall>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
