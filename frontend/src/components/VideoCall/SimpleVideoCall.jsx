import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const VideoCall = ({ conversationId, currentUser, onClose }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const wsRef = useRef(null);
  const peersRef = useRef(new Map());

  useEffect(() => {
    startCall();
    return () => cleanup();
  }, []);

  const startCall = async () => {
    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      // Connect to WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/video`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "join",
            conversationId,
            userId: currentUser._id,
            username: currentUser.name,
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data, stream);
      };
    } catch (error) {
      console.error("Error starting video call:", error);
    }
  };

  const handleWebSocketMessage = (data, stream) => {
    switch (data.type) {
      case "user-joined":
        // Create new peer connection
        const peer = new Peer({
          initiator: true,
          stream: stream,
          trickle: false,
        });

        peer.on("signal", (signal) => {
          wsRef.current.send(
            JSON.stringify({
              type: "signal",
              toUserId: data.userId,
              signal,
            })
          );
        });

        peer.on("stream", (remoteStream) => {
          setRemoteStreams(
            (prev) => new Map(prev.set(data.userId, remoteStream))
          );
        });

        peersRef.current.set(data.userId, peer);
        break;

      case "signal":
        const existingPeer = peersRef.current.get(data.fromUserId);
        if (existingPeer) {
          existingPeer.signal(data.signal);
        }
        break;
    }
  };

  const cleanup = () => {
    // Stop all tracks
    localStream?.getTracks().forEach((track) => track.stop());

    // Close peer connections
    peersRef.current.forEach((peer) => peer.destroy());

    // Close WebSocket
    wsRef.current?.close();

    // Reset state
    setLocalStream(null);
    setRemoteStreams(new Map());
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const VideoTile = ({ stream, username, muted }) => {
    const videoRef = useRef();

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div className="relative bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
          <span className="text-white text-sm">{username}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4">
        {localStream && (
          <VideoTile stream={localStream} username="You" muted={true} />
        )}
        {Array.from(remoteStreams).map(([userId, stream]) => (
          <VideoTile
            key={userId}
            stream={stream}
            username="Remote User"
            muted={false}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="h-20 bg-gray-800 flex items-center justify-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${
            isAudioEnabled ? "bg-gray-700" : "bg-red-500"
          } hover:opacity-80`}
        >
          {isAudioEnabled ? "🎤" : "🚫"}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            isVideoEnabled ? "bg-gray-700" : "bg-red-500"
          } hover:opacity-80`}
        >
          {isVideoEnabled ? "📹" : "🚫"}
        </button>
        <button
          onClick={() => {
            cleanup();
            onClose();
          }}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600"
        >
          ❌
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
