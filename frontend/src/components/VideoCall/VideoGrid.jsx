import React, { useEffect, useRef } from "react";

const VideoTile = ({ stream, username, muted = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      try {
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Failed to attach stream to video element", err);
      }
    }
  }, [stream]);

  return (
    <div className="relative bg-black rounded overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm truncate">{username}</p>
      </div>
    </div>
  );
};

const VideoGrid = ({
  localStream,
  peers = new Map(),
  participants = new Map(),
}) => {
  const totalParticipants = (peers?.size || 0) + (localStream ? 1 : 0);

  const getGridColumns = () => {
    if (totalParticipants <= 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-1 sm:grid-cols-2";
    if (totalParticipants <= 4)
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
  };

  return (
    <div className={`grid ${getGridColumns()} gap-3 h-full`}>
      {localStream && (
        <VideoTile stream={localStream} username="You" muted={true} />
      )}

      {Array.from(peers.entries()).map(([userId, peer]) => {
        const participant = participants.get(userId) || {};
        const stream = peer?.streams?.[0] || null;
        if (!stream) return null;
        return (
          <VideoTile
            key={userId}
            stream={stream}
            username={participant.username || `User-${userId}`}
            muted={false}
          />
        );
      })}
    </div>
  );
};

export default VideoGrid;
