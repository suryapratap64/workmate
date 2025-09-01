import React, { useState } from "react";
import { VideoCall } from "../VideoCall/VideoCall";
import { PhoneIcon } from "@heroicons/react/24/solid";
import socket from "../../socket";

export const Chat = ({ conversation, currentUser }) => {
  const {
    localStream,
    peers,
    participants,
    isInCall,
    mediaState,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    shareScreen,
  } = useVideoCall(conversation._id, currentUser);

  return (
    <div className="relative h-full">
      {/* Regular chat content */}
      {!isInCall && (
        <div className="h-full flex flex-col">
          {/* Chat header with video call button */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">
              {conversation.name || "Chat"}
            </h2>
            <button
              onClick={startCall}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              <PhoneIcon className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Your existing chat messages and input */}
          {/* ... */}
        </div>
      )}

      {/* Video call overlay */}
      {isInCall && (
        <VideoCall
          localStream={localStream}
          peers={peers}
          participants={participants}
          mediaState={mediaState}
          onEndCall={endCall}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onShareScreen={shareScreen}
        />
      )}
    </div>
  );
};
