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
      {/* Video Grid - full bleed, no gaps on mobile */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 p-0 h-full">
        {/* Local Video */}
        <div className="relative h-full">
          {localStream && (
            <video
              autoPlay
              muted
              playsInline
              ref={(video) => {
                if (video) video.srcObject = localStream;
              }}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-3 left-3 text-white bg-black bg-opacity-40 px-2 py-1 rounded text-xs">
            You
          </div>
        </div>

        {/* Remote Participants */}
        {participants.map((participant) => (
          <div
            key={participant.id || participant.participantId}
            className="relative h-full"
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
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 text-white bg-black bg-opacity-40 px-2 py-1 rounded text-xs">
              {participant.displayName ||
                participant.name ||
                participant.participantName ||
                "Participant"}
            </div>
          </div>
        ))}
      </div>

      {/* Controls - compact, no gaps, consistent sizes */}
      <div className="bg-black bg-opacity-70 p-3 flex justify-center items-center gap-3 md:gap-4">
        <button
          onClick={toggleMicrophone}
          aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
          className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-md transition-colors duration-150 ${
            micEnabled
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {micEnabled ? (
            <Mic className="text-white w-5 h-5" />
          ) : (
            <MicOff className="text-white w-5 h-5" />
          )}
        </button>

        <button
          onClick={toggleCamera}
          aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
          className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-md transition-colors duration-150 ${
            cameraEnabled
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {cameraEnabled ? (
            <Video className="text-white w-5 h-5" />
          ) : (
            <VideoOff className="text-white w-5 h-5" />
          )}
        </button>

        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          aria-label={
            isScreenSharing ? "Stop screen share" : "Start screen share"
          }
          className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-md transition-colors duration-150 ${
            isScreenSharing
              ? "bg-red-600 hover:bg-red-500"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          {isScreenSharing ? (
            <StopCircle className="text-white w-5 h-5" />
          ) : (
            <Monitor className="text-white w-5 h-5" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          aria-label="End call"
          className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 shadow-md transition-colors duration-150"
        >
          <PhoneOff className="text-white w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default VideoChat;
