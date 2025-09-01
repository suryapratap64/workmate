import React, { useEffect, useRef } from "react";
import Peer from "simple-peer";
import { VideoGrid } from "./VideoGrid";
import { Controls } from "./Controls";

const VideoCall = ({ conversationId, currentUser, onClose }) => {
  const [localStream, setLocalStream] = React.useState(null);
  const [peers, setPeers] = React.useState(new Map());
  const [participants, setParticipants] = React.useState(new Map());
  const [mediaState, setMediaState] = React.useState({
    video: true,
    audio: true,
  });

  const wsRef = useRef(null);
  const peersRef = useRef(new Map());

  useEffect(() => {
    initializeCall();
    return () => cleanup();
  }, []);

  const initializeCall = async () => {
    try {
      // Get media stream
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
        handleSocketMessage(data, stream);
      };
    } catch (error) {
      console.error("Failed to start call:", error);
      onClose();
    }
  };

  const handleSocketMessage = (data, stream) => {
    switch (data.type) {
      case "user-joined":
        createPeer(data.userId, stream, true);
        break;
      case "user-left":
        removePeer(data.userId);
        break;
      case "signal":
        const peer = peersRef.current.get(data.fromUserId);
        if (peer) {
          peer.signal(data.signal);
        }
        break;
    }
  };

  const createPeer = (userId, stream, initiator) => {
    const peer = new Peer({
      initiator,
      stream,
      trickle: false,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      wsRef.current?.send(
        JSON.stringify({
          type: "signal",
          signal,
          targetId: userId,
        })
      );
    });

    peer.on("stream", (remoteStream) => {
      setPeers(
        (prev) => new Map(prev.set(userId, { peer, stream: remoteStream }))
      );
    });

    peersRef.current.set(userId, peer);
    return peer;
  };

  const removePeer = (userId) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.destroy();
      peersRef.current.delete(userId);
      setPeers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setMediaState((prev) => ({ ...prev, video: videoTrack.enabled }));
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMediaState((prev) => ({ ...prev, audio: audioTrack.enabled }));
      }
    }
  };

  const cleanup = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    peers.forEach(({ peer }) => peer.destroy());
    wsRef.current?.close();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      <VideoGrid
        localStream={localStream}
        peers={peers}
        participants={participants}
      />
      <Controls
        mediaState={mediaState}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onEndCall={() => {
          cleanup();
          onClose();
        }}
      />
    </div>
  );
};

export default VideoCall;
