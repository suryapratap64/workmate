import { useState, useEffect, useCallback, useRef } from "react";
import Peer from "simple-peer";

export const useVideoCall = (conversationId, currentUser) => {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [participants, setParticipants] = useState(new Map());
  const [isInCall, setIsInCall] = useState(false);
  const [mediaState, setMediaState] = useState({
    video: true,
    audio: true,
    screen: false,
  });

  const wsRef = useRef(null);
  const peersRef = useRef(new Map());

  const createPeer = useCallback((targetId, stream, initiator) => {
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

    peer.on("signal", (data) => {
      wsRef.current.send(
        JSON.stringify({
          type: "webrtc-signal",
          targetId,
          signalData: data,
        })
      );
    });

    return peer;
  }, []);

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsInCall(true);

      // Connect to WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/video`);
      wsRef.current = ws;

      ws.onopen = () => {
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
        handleWebSocketMessage(data, stream);
      };
    } catch (error) {
      console.error("Error starting video call:", error);
    }
  }, [conversationId, currentUser]);

  const handleWebSocketMessage = useCallback(
    (data, stream) => {
      switch (data.type) {
        case "room-participants":
          data.participants.forEach((participant) => {
            const peer = createPeer(participant.userId, stream, true);
            peersRef.current.set(participant.userId, peer);
            setPeers(new Map(peersRef.current));
          });
          setParticipants(new Map(data.participants.map((p) => [p.userId, p])));
          break;

        case "participant-joined":
          const newPeer = createPeer(data.participant.userId, stream, false);
          peersRef.current.set(data.participant.userId, newPeer);
          setPeers(new Map(peersRef.current));
          setParticipants(
            (prev) =>
              new Map(prev.set(data.participant.userId, data.participant))
          );
          break;

        case "participant-left":
          const peerToRemove = peersRef.current.get(data.userId);
          if (peerToRemove) {
            peerToRemove.destroy();
            peersRef.current.delete(data.userId);
            setPeers(new Map(peersRef.current));
          }
          setParticipants((prev) => {
            const next = new Map(prev);
            next.delete(data.userId);
            return next;
          });
          break;

        case "webrtc-signal":
          const peer = peersRef.current.get(data.fromUserId);
          if (peer) {
            peer.signal(data.signalData);
          }
          break;
      }
    },
    [createPeer]
  );

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setMediaState((prev) => ({ ...prev, video: videoTrack.enabled }));
        wsRef.current?.send(
          JSON.stringify({
            type: "media-state",
            video: videoTrack.enabled,
            audio: mediaState.audio,
          })
        );
      }
    }
  }, [localStream, mediaState.audio]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMediaState((prev) => ({ ...prev, audio: audioTrack.enabled }));
        wsRef.current?.send(
          JSON.stringify({
            type: "media-state",
            video: mediaState.video,
            audio: audioTrack.enabled,
          })
        );
      }
    }
  }, [localStream, mediaState.video]);

  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      videoTrack.onended = () => {
        peers.forEach((peer) => {
          const videoTrack = localStream.getVideoTracks()[0];
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
  }, [localStream, peers]);

  const endCall = useCallback(() => {
    localStream?.getTracks().forEach((track) => track.stop());
    peers.forEach((peer) => peer.destroy());
    wsRef.current?.close();
    setLocalStream(null);
    setPeers(new Map());
    setParticipants(new Map());
    setIsInCall(false);
    setMediaState({ video: true, audio: true, screen: false });
  }, [localStream, peers]);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    peers,
    participants,
    isInCall,
    mediaState,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    shareScreen,
  };
};
