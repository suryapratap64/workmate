import React, { useEffect, useRef } from "react";

const VideoTile = ({ stream, username, muted, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-800">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm">{username}</p>
      </div>
    </div>
  );
};

const VideoGrid = ({ localStream, peers, participants }) => {
  const totalParticipants = peers.size + 1; // Including local user

  // Calculate grid columns based on participant count
  const getGridColumns = () => {
    if (totalParticipants <= 2) return "grid-cols-1";
    if (totalParticipants <= 4) return "grid-cols-2";
    return "grid-cols-3";
  };

  return (
    <div className={`grid ${getGridColumns()} gap-4 h-full`}>
      {/* Local video */}
      {localStream && (
        <VideoTile stream={localStream} username="You" muted={true} />
      )}

      {/* Remote videos */}
      {Array.from(peers.entries()).map(([userId, peer]) => {
        const participant = participants.get(userId);
        return (
          <VideoTile
            key={userId}
            stream={peer.streams[0]}
            username={participant?.username || "Unknown"}
            muted={false}
          />
        );
      })}
    </div>
  );
};

export default VideoGrid;
