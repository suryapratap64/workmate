import React from "react";

export const Controls = ({
  mediaState,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
}) => {
  return (
    <div className="h-20 bg-gray-800 flex items-center justify-center space-x-4">
      <button
        onClick={onToggleAudio}
        className={`p-3 rounded-full ${
          mediaState.audio ? "bg-gray-700" : "bg-red-500"
        } hover:opacity-80 transition-opacity`}
      >
        {mediaState.audio ? "🎤" : "🚫"}
      </button>
      <button
        onClick={onToggleVideo}
        className={`p-3 rounded-full ${
          mediaState.video ? "bg-gray-700" : "bg-red-500"
        } hover:opacity-80 transition-opacity`}
      >
        {mediaState.video ? "📹" : "🚫"}
      </button>
      <button
        onClick={onEndCall}
        className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
      >
        ❌
      </button>
    </div>
  );
};
