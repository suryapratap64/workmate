import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useWebRTC } from "../hooks/useWebRTC.js";
import { useSocket } from "../context/SocketContext";

const VideoChat = () => {
  const { conversationId, callId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.worker);
  const { socket } = useSocket();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Prefer callId as meeting id if present in URL (call-specific room), fallback to conversationId
  const meetingId = callId || conversationId;

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
  } = useWebRTC(meetingId, {
    participantId: user._id,
    displayName: `${user.firstName} ${user.lastName}`,
    cameraEnabled: true,
    micEnabled: true,
  });

  useEffect(() => {
    if (!socket || !conversationId) {
      setError("Connection not available");
      return;
    }

    const handleError = async (error) => {
      console.error("WebRTC Error:", error);
      setError(error.message || "An error occurred during the call");

      // Handle specific errors
      if (error.name === "NotAllowedError") {
        setError("Please allow camera and microphone access to join the call");
      } else if (error.name === "NotFoundError") {
        setError("Camera or microphone not found. Please check your devices");
      } else if (error.name === "NotReadableError") {
        setError(
          "Could not access your camera or microphone. Please try again"
        );
      }
    };

    const init = async () => {
      try {
        setIsLoading(true);
        // Check if devices are available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(
          (device) => device.kind === "videoinput"
        );
        const hasMic = devices.some((device) => device.kind === "audioinput");

        if (!hasCamera && !hasMic) {
          throw new Error("No camera or microphone found");
        }

        // Join the conversation room (for messages) and join the call room if callId present
        socket.emit("join_conversation", conversationId);
        if (callId) {
          socket.emit("join_conversation", callId);
        }

        setIsLoading(false);
      } catch (err) {
        handleError(err);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      socket.emit("leave_conversation", conversationId);
      endCall();
    };
  }, [socket, conversationId]);

  // Handle errors
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-1 flex flex-wrap p-4 gap-4">
        {/* Local Video */}
        <div className="relative w-full md:w-1/4">
          {localStream && (
            <video
              className="w-full rounded-lg object-cover"
              ref={(video) => {
                if (video) {
                  video.srcObject = localStream;
                  video.play().catch(console.error);
                }
              }}
              muted
              autoPlay
              playsInline
            />
          )}
        </div>

        {/* Remote Videos */}
        {participants.map((participant) => (
          <div key={participant.id} className="relative w-full md:w-1/4">
            {participant.stream && (
              <video
                className="w-full rounded-lg object-cover"
                ref={(video) => {
                  if (video) {
                    video.srcObject = participant.stream;
                    video.play().catch(console.error);
                  }
                }}
                autoPlay
                playsInline
              />
            )}
            <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {participant.name}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4">
        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full ${
            cameraEnabled ? "bg-blue-500" : "bg-red-500"
          }`}
        >
          <i className={`fas fa-video${cameraEnabled ? "" : "-slash"}`}></i>
        </button>
        <button
          onClick={toggleMicrophone}
          className={`p-3 rounded-full ${
            micEnabled ? "bg-blue-500" : "bg-red-500"
          }`}
        >
          <i className={`fas fa-microphone${micEnabled ? "" : "-slash"}`}></i>
        </button>
        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`p-3 rounded-full ${
            isScreenSharing ? "bg-blue-500" : "bg-gray-500"
          }`}
        >
          <i className="fas fa-desktop"></i>
        </button>
        <button
          onClick={() => {
            endCall();
            navigate(-1);
          }}
          className="p-3 rounded-full bg-red-500"
        >
          <i className="fas fa-phone-slash"></i>
        </button>
      </div>
    </div>
  );
};

export default VideoChat;
