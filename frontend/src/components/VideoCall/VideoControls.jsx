import React from "react";
import {
  MicrophoneIcon,
  VideoCameraIcon,
  PhoneIcon,
  ComputerDesktopIcon,
  MicrophoneIcon as MicrophoneIconSolid,
  VideoCameraIcon as VideoCameraIconSolid,
} from "@heroicons/react/24/solid";

const VideoControls = ({
  mediaState,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
  onShareScreen,
}) => {
  return (
    <div className="h-full flex items-center justify-center space-x-6">
      {/* Audio Toggle */}
      <button
        onClick={onToggleAudio}
        className={`p-4 rounded-full ${
          mediaState.audio ? "bg-gray-700" : "bg-red-500"
        } hover:opacity-80 transition-opacity`}
      >
        {mediaState.audio ? (
          <MicrophoneIcon className="h-6 w-6 text-white" />
        ) : (
          <MicrophoneIconSolid className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Video Toggle */}
      <button
        onClick={onToggleVideo}
        className={`p-4 rounded-full ${
          mediaState.video ? "bg-gray-700" : "bg-red-500"
        } hover:opacity-80 transition-opacity`}
      >
        {mediaState.video ? (
          <VideoCameraIcon className="h-6 w-6 text-white" />
        ) : (
          <VideoCameraIconSolid className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Screen Share */}
      <button
        onClick={onShareScreen}
        className={`p-4 rounded-full ${
          mediaState.screen ? "bg-blue-500" : "bg-gray-700"
        } hover:opacity-80 transition-opacity`}
      >
        <ComputerDesktopIcon className="h-6 w-6 text-white" />
      </button>

      {/* End Call */}
      <button
        onClick={onEndCall}
        className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
      >
        <PhoneIcon className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default VideoControls;
