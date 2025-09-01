import React, { createContext, useContext, useState } from "react";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [callState, setCallState] = useState({
    isInCall: false,
    mediaEnabled: {
      video: true,
      audio: true,
      screen: false,
    },
    participants: new Map(),
  });

  return (
    <VideoContext.Provider value={[callState, setCallState]}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
