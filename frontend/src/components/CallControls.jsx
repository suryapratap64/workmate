import React, { useState } from "react";
import { Video, PhoneOff, VideoOff, Mic, MicOff } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../context/SocketContext";

const CallControls = ({ conversation, onCallStart, onCallEnd }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const { user, token } = useSelector((state) => state.worker);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const getOtherUser = () => {
    return conversation.client?._id === user._id
      ? conversation.worker
      : conversation.client;
  };

  const handleStartCall = async (type) => {
    if (!conversation?._id || !socket) {
      console.error("No conversation ID or socket connection available");
      return;
    }

    try {
      // First, check if socket is connected
      if (!socket.connected) {
        console.error("Socket not connected");
        try {
          await socket.connect();
        } catch (err) {
          console.error("Socket connection failed:", err);
          alert("Failed to connect to signaling server. Please try again.");
          return;
        }
      }

      // Request media permissions before creating the call.
      // Use a wrapper with timeout, enumerate devices to provide fallbacks,
      // and stop tracks immediately once we've validated permissions so
      // we don't hold devices open.
      const requestMediaWithTimeout = (constraints, ms = 12000) => {
        return new Promise((resolve, reject) => {
          let settled = false;
          const timer = setTimeout(() => {
            if (!settled) {
              settled = true;
              reject(new Error("getUserMedia timeout"));
            }
          }, ms);

          navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
              if (settled) {
                // If already timed out, stop tracks and ignore
                stream.getTracks().forEach((t) => t.stop());
                return;
              }
              settled = true;
              clearTimeout(timer);
              resolve(stream);
            })
            .catch((err) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              reject(err);
            });
        });
      };

      // Always start a video call; request camera+mic permissions
      const startType = "video";
      try {
        const stream = await requestMediaWithTimeout(
          { audio: true, video: true },
          12000
        );
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.warn("Could not access camera/microphone:", err);
        alert(
          "Please allow camera and microphone access to start the video call."
        );
        return;
      }

      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/api/v1/call/create`,
        {
          conversationId: conversation._id,
          // send the possibly-fallback call type
          callType: startType,
          userId: user._id,
          userType: user.userType || "worker",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token here
          },
        }
      );

      if (response.data.success) {
        const call = response.data.call;
        setCallType(type);
        setIsInCall(true);

        // Emit call incoming event with more details
        socket.emit(
          "call_incoming",
          {
            conversationId: conversation._id,
            callType: startType,
            callerId: user._id,
            callId: call._id,
            receiverId: getOtherUser()._id,
          },
          (acknowledgment) => {
            if (acknowledgment?.success) {
              console.log("Call incoming event acknowledged by server");
            } else {
              console.error("Call incoming event not acknowledged properly");
            }
          }
        );

        // For video calls, navigate to the video chat page
        // Navigate to the video chat page for all calls (video-only)
        navigate(`/video-chat/${conversation._id}/${call._id}`);
      }
    } catch (error) {
      console.error("Error starting call:", error);
      // Show error to user
      alert("Failed to start call. Please try again.");
    }
  };

  const handleEndCall = async () => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/api/v1/call/end/${conversation._id}`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Emit call ended event with acknowledgment
      socket.emit(
        "call_ended",
        {
          conversationId: conversation._id,
          callType: callType,
          userId: user._id,
          receiverId: getOtherUser()._id,
        },
        (acknowledgment) => {
          if (acknowledgment?.success) {
            console.log("Call ended event acknowledged by server");
          } else {
            console.error("Call ended event not acknowledged properly");
          }
        }
      );

      setIsInCall(false);
      setCallType(null);
      setIsMuted(false);
      setIsVideoOff(false);

      // If we're in a video call, navigate back
      if (window.location.pathname.includes("/video-chat")) {
        navigate(-1);
      }

      onCallEnd && onCallEnd();
    } catch (error) {
      console.error("Error ending call:", error);
      // Show error to user
      alert("Failed to end call. Please try again.");
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Emit mute/unmute event to other participants
    socket.emit("call_mute_toggle", {
      conversationId: conversation._id,
      isMuted: !isMuted,
    });
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // Emit video on/off event to other participants
    socket.emit("call_video_toggle", {
      conversationId: conversation._id,
      isVideoOff: !isVideoOff,
    });
  };

  const otherUser = getOtherUser();

  // Debug logging
  console.log("CallControls - conversation:", conversation);
  console.log("CallControls - user:", user);
  console.log("CallControls - otherUser:", otherUser);

  if (!conversation) {
    console.warn("CallControls: No conversation provided");
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Video Call Button */}
      <button
        onClick={() => handleStartCall("video")}
        disabled={isInCall}
        className={`p-2 rounded-full transition-colors duration-200 ${
          isInCall
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        title="Start video call"
      >
        <Video className="h-4 w-4" />
      </button>

      {/* Call Controls (shown when in call) */}
      {isInCall && (
        <>
          {/* Mute/Unmute Button */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          {/* Video On/Off Button (only for video calls) */}
          {callType === "video" && (
            <button
              onClick={handleToggleVideo}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isVideoOff
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              title={isVideoOff ? "Turn on video" : "Turn off video"}
            >
              {isVideoOff ? (
                <VideoOff className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200"
            title="End call"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default CallControls;
