import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebRTC } from "../../hooks/useWebRTC.js";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import { useMediaPermissions } from "../../hooks/usePermissions";
import VideoPermissionDialog from "./VideoPermissionDialog";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Monitor,
  StopCircle,
} from "lucide-react";

const VideoChat = () => {
  const { conversationId, callId } = useParams();
  const meetingId = callId || conversationId;
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useSelector((state) => state.worker);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const {
    permissions,
    error: permissionError,
    requestPermissions,
  } = useMediaPermissions();

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
    participantId: user?._id,
    displayName: `${user?.firstName} ${user?.lastName}`,
    cameraEnabled: permissions.camera,
    micEnabled: permissions.microphone,
  });

  useEffect(() => {
    // If there's no conversationId, bail out and redirect to messages.
    if (!conversationId) {
      navigate("/message");
      return;
    }

    // If socket hasn't been initialized yet, wait — do not redirect.
    // SocketContext initializes asynchronously; navigating away here causes
    // an immediate return to messages when arriving from the caller flow.
    if (!socket) {
      return;
    }

    // If permissions are not yet granted, show the permission dialog and wait.
    if (!permissions.camera || !permissions.microphone) {
      setShowPermissionDialog(true);
      return;
    }

    // Join the video room only when we have permissions and the socket is ready
    if (permissions.camera && permissions.microphone) {
      socket.emit("join-room", {
        meetingId: meetingId,
        participantId: user._id,
        participantName: `${user.firstName} ${user.lastName}`,
        cameraEnabled: true,
        micEnabled: true,
      });
    }

    return () => {
      socket.emit("leave-room", {
        meetingId: meetingId,
        participantId: user._id,
      });
      endCall();
    };
  }, [conversationId, socket, permissions]);

  const handlePermissionRequest = async () => {
    await requestPermissions();
    setShowPermissionDialog(false);
  };

  const handleEndCall = () => {
    endCall();
    navigate("/message");
  };

  const handlePermissionCancel = () => {
    navigate("/message");
  };

  if (showPermissionDialog) {
    return (
      <VideoPermissionDialog
        onRequestPermissions={handlePermissionRequest}
        onCancel={handlePermissionCancel}
        error={permissionError}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <div className="relative">
          {localStream && (
            <video
              autoPlay
              muted
              playsInline
              ref={(video) => {
                if (video) video.srcObject = localStream;
              }}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
          <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Remote Participants */}
        {participants.map((participant) => (
          <div
            key={participant.id || participant.participantId}
            className="relative"
          >
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video && participant.stream) {
                  try {
                    video.srcObject = participant.stream;
                    // Attempt to play to satisfy autoplay policies
                    video.play().catch(() => {});
                  } catch (e) {
                    // ignore
                  }
                }
              }}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {participant.displayName ||
                participant.name ||
                participant.participantName ||
                "Participant"}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex justify-center items-center space-x-4">
        <button
          onClick={toggleMicrophone}
          className={`p-4 rounded-full ${
            micEnabled
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {micEnabled ? (
            <Mic className="text-white" />
          ) : (
            <MicOff className="text-white" />
          )}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full ${
            cameraEnabled
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {cameraEnabled ? (
            <Video className="text-white" />
          ) : (
            <VideoOff className="text-white" />
          )}
        </button>

        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`p-4 rounded-full ${
            isScreenSharing
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {isScreenSharing ? (
            <StopCircle className="text-white" />
          ) : (
            <Monitor className="text-white" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default VideoChat;
