import React from "react";
import { Mic, Video, Monitor, Users, PhoneOff } from "lucide-react";

const VideoControls = ({
  mediaState = { audio: true, video: true, screen: false },
  onEndCall = () => {},
  onToggleVideo = () => {},
  onToggleAudio = () => {},
  onShareScreen = () => {},
  onToggleParticipants = () => {},
  participantsOpen = false,
}) => {
  return (
    <div className="w-full flex items-center justify-center p-3 bg-transparent">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleAudio}
          className={`bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3`}
          aria-label="Toggle microphone"
        >
          <Mic
            className={`w-5 h-5 ${
              mediaState.audio ? "text-white" : "text-red-400"
            }`}
          />
        </button>

        <button
          onClick={onToggleVideo}
          className={`bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3`}
          aria-label="Toggle camera"
        >
          <Video
            className={`w-5 h-5 ${
              mediaState.video ? "text-white" : "text-red-400"
            }`}
          />
        </button>

        <button
          onClick={onShareScreen}
          className={`hidden sm:inline-flex bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 ${
            mediaState.screen ? "bg-blue-600" : ""
          }`}
          aria-label="Toggle screen share"
        >
          <Monitor className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onToggleParticipants}
          className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3"
          aria-label="Toggle participants"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={onEndCall}
          className="ml-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 sm:p-3"
          aria-label="End call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default VideoControls;
