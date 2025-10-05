import React, { useState, useEffect, useRef } from "react";
import VideoGrid from "./VideoGrid";
import VideoControls from "./VideoControls";
import ParticipantList from "./ParticipantList";
import SimplePeer from "simple-peer";

// Polyfill global
if (typeof global === "undefined") {
  window.global = window;
}

const VideoCall = ({ conversationId, currentUser, onClose }) => {
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [participants, setParticipants] = useState(new Map());
  const [mediaState, setMediaState] = useState({
    video: true,
    audio: true,
    screen: false,
  });
  const [showParticipants, setShowParticipants] = useState(false);

  const peersRef = useRef(new Map());
  const wsRef = useRef(null);
  useEffect(() => {
    // Don't automatically start call on mount
    // Instead, wait for user action
    return () => {
      // Cleanup when component unmounts
      cleanup();
    };
  }, []);

  const startCall = async () => {
    try {
      // Get user's media stream
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(userStream);

      // Connect to WebSocket server
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/video`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Join the video room
        ws.send(
          JSON.stringify({
            type: "join-room",
            conversationId,
            userId: currentUser._id,
            username: currentUser.name,
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data, userStream);
      };
    } catch (error) {
      console.error("Error starting video call:", error);
    }
  };

  const handleWebSocketMessage = (data, userStream) => {
    switch (data.type) {
      case "room-participants":
        handleExistingParticipants(data.participants, userStream);
        break;
      case "participant-joined":
        handleNewParticipant(data.participant, userStream);
        break;
      case "participant-left":
        handleParticipantLeft(data.userId);
        break;
      case "webrtc-signal":
        handleWebRTCSignal(data);
        break;
    }
  };

  const createPeer = (targetId, stream, initiator) => {
    const peer = new SimplePeer({
      initiator,
      stream,
      trickle: false,
      objectMode: true,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
    });

    peer.on("signal", (data) => {
      wsRef.current?.send(
        JSON.stringify({
          type: "webrtc-signal",
          targetId,
          signalData: data,
        })
      );
    });

    return peer;
  };

  const handleExistingParticipants = (participants, userStream) => {
    participants.forEach((participant) => {
      const peer = createPeer(participant.userId, userStream, true);
      peersRef.current.set(participant.userId, peer);
    });
    setPeers(new Map(peersRef.current));
    setParticipants(new Map(participants.map((p) => [p.userId, p])));
  };

  const handleNewParticipant = (participant, userStream) => {
    const peer = createPeer(participant.userId, userStream, false);
    peersRef.current.set(participant.userId, peer);
    setPeers(new Map(peersRef.current));
    setParticipants(
      (prev) => new Map(prev.set(participant.userId, participant))
    );
  };

  const handleParticipantLeft = (userId) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.destroy();
      peersRef.current.delete(userId);
      setPeers(new Map(peersRef.current));
    }
    setParticipants((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  };

  const handleWebRTCSignal = (data) => {
    const peer = peersRef.current.get(data.fromUserId);
    if (peer) {
      peer.signal(data.signalData);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setMediaState((prev) => ({ ...prev, video: videoTrack.enabled }));
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMediaState((prev) => ({ ...prev, audio: audioTrack.enabled }));
      }
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      videoTrack.onended = () => {
        peers.forEach((peer) => {
          const videoTrack = stream.getVideoTracks()[0];
          peer.replaceTrack(
            peer.streams[0].getVideoTracks()[0],
            videoTrack,
            peer.streams[0]
          );
        });
        setMediaState((prev) => ({ ...prev, screen: false }));
      };

      peers.forEach((peer) => {
        peer.replaceTrack(
          peer.streams[0].getVideoTracks()[0],
          videoTrack,
          peer.streams[0]
        );
      });

      setMediaState((prev) => ({ ...prev, screen: true }));
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const cleanup = () => {
    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Destroy all peer connections
    peers.forEach((peer) => peer.destroy());

    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const handleEndCall = () => {
    cleanup();
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 p-2 sm:p-4">
        <VideoGrid
          localStream={stream}
          peers={peers}
          participants={participants}
        />
      </div>

      {/* Sidebar with participants (hidden on small screens) */}
      <div className="hidden sm:block w-64 bg-gray-800 h-full fixed right-0 top-0 p-4">
        <ParticipantList participants={participants} />
      </div>

      {/* Mobile participants overlay */}
      {showParticipants && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowParticipants(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-gray-800 p-4 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                className="text-white p-2 rounded-full bg-gray-700"
                onClick={() => setShowParticipants(false)}
                aria-label="Close participants"
              >
                ✕
              </button>
            </div>
            <ParticipantList participants={participants} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="h-24 sm:h-20 bg-gray-800 border-t border-gray-700">
        <VideoControls
          mediaState={mediaState}
          onEndCall={handleEndCall}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onShareScreen={shareScreen}
          onToggleParticipants={() => setShowParticipants((s) => !s)}
          participantsOpen={showParticipants}
        />
      </div>
    </div>
  );
};

export default VideoCall;
