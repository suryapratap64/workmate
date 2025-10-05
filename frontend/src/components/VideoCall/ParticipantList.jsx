import React from "react";
import {
  MicrophoneIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const ParticipantList = ({ participants }) => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-white text-lg font-semibold mb-4">
        Participants ({participants.size})
      </h3>
      <div className="flex-1 overflow-y-auto">
        {Array.from(participants.entries()).map(([userId, participant]) => (
          <div
            key={userId}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg mb-2 bg-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm">
                  {participant.username[0].toUpperCase()}
                </span>
              </div>
              <span className="text-white truncate max-w-[160px]">
                {participant.username}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              {participant.mediaState.audio ? (
                <MicrophoneIcon className="h-5 w-5 text-green-400" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-red-400" />
              )}
              {participant.mediaState.video ? (
                <VideoCameraIcon className="h-5 w-5 text-green-400" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-red-400" />
              )}
              {participant.mediaState.screen && (
                <ComputerDesktopIcon className="h-5 w-5 text-blue-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;
