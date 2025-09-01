import React, { useState, useEffect } from "react";
import { Video, PhoneOff, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

const CallNotification = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallInterface, setShowCallInterface] = useState(false);
  const { user } = useSelector((state) => state.worker);
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on("call_incoming", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);

    return () => {
      socket.off("call_incoming", handleIncomingCall);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
    };
  }, [socket]);

  const handleIncomingCall = (data) => {
    setIncomingCall(data);
  };

  const handleCallAccepted = (data) => {
    if (incomingCall && data.conversationId === incomingCall.conversationId) {
      // navigate to shared video page when accepted by someone
      navigate(
        `/video-chat/${incomingCall.conversationId}/${
          incomingCall.callId || incomingCall._id
        }`
      );
    }
  };

  const handleCallRejected = (data) => {
    if (incomingCall && data.conversationId === incomingCall.conversationId) {
      setIncomingCall(null);
      setShowCallInterface(false);
    }
  };

  const handleCallEnded = (data) => {
    if (incomingCall && data.conversationId === incomingCall.conversationId) {
      setIncomingCall(null);
      setShowCallInterface(false);
    }
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    socket.emit("call_accepted", {
      conversationId: incomingCall.conversationId,
      callId: incomingCall.callId || incomingCall._id || null,
    });
    // navigate to the shared video-chat page
    navigate(
      `/video-chat/${incomingCall.conversationId}/${
        incomingCall.callId || incomingCall._id
      }`
    );
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;

    socket.emit("call_rejected", {
      conversationId: incomingCall.conversationId,
      callId: incomingCall.callId || incomingCall._id || null,
    });

    setIncomingCall(null);
  };

  const handleCloseNotification = () => {
    setIncomingCall(null);
  };

  const handleCloseCallInterface = () => {
    setShowCallInterface(false);
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <>
      {/* Incoming Call Notification */}
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 max-w-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Incoming Call</h3>
            <p className="text-sm text-gray-500">Video call</p>
          </div>
          <button
            onClick={handleCloseNotification}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={handleAcceptCall}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            onClick={handleRejectCall}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Call Interface */}
      {/* in-app call interface removed: answering navigates to the /video-chat page */}
    </>
  );
};

export default CallNotification;
