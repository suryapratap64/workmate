import { useEffect, useState, useRef } from "react";
import { API_URL, WS_URL } from "../config";
async function fetchXirsysIceServers() {
  const username = "themradul07"; // move to server env
  const secret = "5ea51720-5d66-11f0-a9ef-0242ac150003"; // move to server env
  const channel = "MyFirstApp";

  // "This code requests TURN/STUN server details from Xirsys using Basic Auth. The response gives us ICE servers, which are needed for WebRTC peer connections to work across different networks."
  const response = await fetch(`https://global.xirsys.net/_turn/${channel}`, {
    method: "PUT",
    headers: {
      Authorization: "Basic " + btoa(username + ":" + secret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ format: "urls" }),
  });

  if (!response.ok) {
    throw new Error(`Xirsys error ${response.status}`);
  }

  const data = await response.json();
  let iceServers = data?.v?.iceServers ?? [];
  if (!Array.isArray(iceServers)) iceServers = [iceServers];
  return iceServers;
}

// --- Dummy tracks (used when camera/mic denied) ---
function createSilentAudioTrack() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const dst = ctx.createMediaStreamDestination();
  oscillator.connect(dst);
  oscillator.start();
  setTimeout(() => {
    try {
      oscillator.stop();
      ctx.close();
    } catch {}
  }, 100);
  const track = dst.stream.getAudioTracks()[0];
  track.enabled = false;
  // @ts-ignore tag for our logic
  track._isDummy = true;
  return track;
}

function createBlackVideoTrack() {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context from canvas");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const stream = canvas.captureStream(5);
  const track = stream.getVideoTracks()[0];
  track.enabled = false;
  // @ts-ignore tag for our logic
  track._isDummy = true;
  return track;
}

export function useWebRTC(meetingId, userSettings) {
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  // refs (must be top-level; not inside effects or inner fns)
  const socketState = useRef(null); // WebSocket instance
  const wsRetriesRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  const peerConnections = useRef(new Map());
  const pendingCandidates = useRef(new Map());
  const pendingAnswers = useRef(new Map());
  const peerCreationTimestamps = useRef(new Map());
  const remoteStreams = useRef(new Map());
  const joinedRef = useRef(false);

  const MAX_PEER_CONNECTIONS = 12;

  // Helper: broadcast a fresh offer to everyone
  const renegotiateAllPeers = async () => {
    for (const [id, pc] of Array.from(peerConnections.current.entries())) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketState.current?.send(
          JSON.stringify({ type: "webrtc-offer", targetId: id, offer })
        );
      } catch (e) {
        console.error("Error renegotiating with peer", id, e);
      }
    }
  };

  // --- Effect: bootstraps media + signaling ---
  useEffect(() => {
    if (!meetingId || !userSettings) return;

    let mounted = true; // stop state updates after unmount

    const init = async () => {
      try {
        // 1) ICE servers
        const iceServers = await fetchXirsysIceServers();

        // 2) build local stream w/ fallbacks
        const tracks = [];
        const desiredCam = userSettings.cameraEnabled !== false;
        const desiredMic = userSettings.micEnabled !== false;

        if (desiredCam) {
          try {
            const cam = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            tracks.push(...cam.getVideoTracks());
          } catch (err) {
            console.warn("Camera denied; using black video", err);
            tracks.push(createBlackVideoTrack());
          }
        } else {
          tracks.push(createBlackVideoTrack());
        }

        if (desiredMic) {
          try {
            const mic = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            tracks.push(...mic.getAudioTracks());
          } catch (err) {
            console.warn("Mic denied; using silent audio", err);
            tracks.push(createSilentAudioTrack());
          }
        } else {
          tracks.push(createSilentAudioTrack());
        }

        const stream = new MediaStream(tracks);
        if (!mounted) return;
        setLocalStream(stream);
        setCameraEnabled(
          tracks.find((t) => t.kind === "video" && !t._isDummy) ? true : false
        );
        setMicEnabled(
          tracks.find((t) => t.kind === "audio" && !t._isDummy) ? true : false
        );

        // 3) connect signaling (WebSocket)
        const apiUrl = API_URL;
        // Prefer explicit runtime WS_URL; fall back to derive from API_URL
        let wsUrl = WS_URL ? WS_URL + "/ws" : null;
        if (!wsUrl) {
          try {
            const parsed = new URL(apiUrl);
            const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";
            wsUrl = `${wsProtocol}//${parsed.host}/ws`;
          } catch {
            const wsProtocol =
              window.location.protocol === "https:" ? "wss:" : "ws:";
            wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws`;
          }
        }

        const cleanupWs = () => {
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
          }
          if (socketState.current) {
            try {
              socketState.current.onopen =
                socketState.current.onclose =
                socketState.current.onmessage =
                socketState.current.onerror =
                  null;
            } catch {}
            try {
              socketState.current.close();
            } catch {}
            socketState.current = null;
          }
        };

        const connectWebSocket = () => {
          cleanupWs();
          if (wsRetriesRef.current > 3) {
            console.error("Max WebSocket retries reached");
            return;
          }
          try {
            const ws = new WebSocket(wsUrl);
            socketState.current = ws;

            ws.onopen = () => {
              wsRetriesRef.current = 0;
              if (!joinedRef.current) {
                ws.send(
                  JSON.stringify({
                    type: "join-room",
                    meetingId,
                    participantId: userSettings.participantId,
                    participantName: userSettings.displayName,
                    cameraEnabled: tracks.some(
                      (t) => t.kind === "video" && !t._isDummy
                    ),
                    micEnabled: tracks.some(
                      (t) => t.kind === "audio" && !t._isDummy
                    ),
                  })
                );
                joinedRef.current = true;
              }
            };

            ws.onerror = (e) => {
              console.error("WebSocket error", e);
            };

            ws.onclose = (evt) => {
              console.log("WebSocket closed", evt.code, evt.reason);
              if (!mounted) return;
              wsRetriesRef.current += 1;
              retryTimeoutRef.current = setTimeout(connectWebSocket, 2000);
            };

            ws.onmessage = async (event) => {
              if (!mounted) return;
              const data = JSON.parse(event.data);

              switch (data.type) {
                case "participant-joined": {
                  const p = data.participant;
                  if (p.id !== userSettings.participantId) {
                    if (!peerConnections.current.has(p.id)) {
                      await createPeerConnection(
                        p.id,
                        stream,
                        ws,
                        true,
                        iceServers
                      );
                    }
                    setParticipants((prev) =>
                      prev.some((x) => x.id === p.id) ? prev : [...prev, p]
                    );
                  }
                  break;
                }
                case "room-participants": {
                  const others = (data.participants || []).filter(
                    (p) => p.id !== userSettings.participantId
                  );
                  setParticipants(others);
                  for (const p of others) {
                    if (!peerConnections.current.has(p.id)) {
                      await createPeerConnection(
                        p.id,
                        stream,
                        ws,
                        false,
                        iceServers
                      );
                    }
                  }
                  break;
                }
                case "webrtc-offer":
                  await handleOffer(
                    data.fromId,
                    data.offer,
                    stream,
                    ws,
                    iceServers
                  );
                  break;
                case "webrtc-answer":
                  await handleAnswer(data.fromId, data.answer);
                  break;
                case "webrtc-ice-candidate":
                  await handleIceCandidate(data.fromId, data.candidate);
                  break;
                case "participant-left":
                  handleParticipantLeft(data.participantId);
                  break;
                case "participant-media-change":
                  setParticipants((prev) =>
                    prev.map((p) =>
                      p.id === data.participantId
                        ? {
                            ...p,
                            cameraEnabled: data.cameraEnabled,
                            micEnabled: data.micEnabled,
                          }
                        : p
                    )
                  );
                  break;
                case "shared-screen": // server broadcast when someone toggles
                case "shared-screen-toggle": // handle typo/alt
                case "shared-screen-toogle": // backward-compat with earlier typo
                  setParticipants((prev) =>
                    prev.map((p) =>
                      p.id === data.participantId
                        ? { ...p, screenEnabled: data.screenEnabled }
                        : p
                    )
                  );
                  break;
                default:
                  // ignore unknown
                  break;
              }
            };
          } catch (e) {
            console.error("WS create error", e);
            wsRetriesRef.current += 1;
            retryTimeoutRef.current = setTimeout(connectWebSocket, 2000);
          }
        };

        connectWebSocket();

        // cleanup on unmount
        return () => cleanupWs();
      } catch (e) {
        console.error("Init WebRTC failed", e);
      }
    };

    const wsCleanup = init();

    return () => {
      mounted = false;

      // Stop WS first
      try {
        socketState.current?.close();
      } catch {}
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

      // Close all peer connections, stop tracks
      peerConnections.current.forEach((pc) => {
        try {
          pc.getSenders().forEach((s) => {
            try {
              s.track?.stop();
            } catch {}
          });
          pc.getReceivers().forEach((r) => {
            try {
              r.track?.stop();
            } catch {}
          });
          pc.getTransceivers().forEach((t) => {
            try {
              t.stop?.();
            } catch {}
          });
          pc.close();
        } catch {}
      });
      peerConnections.current.clear();
      remoteStreams.current.clear();
      pendingCandidates.current.clear();
      pendingAnswers.current.clear();
      peerCreationTimestamps.current.clear();

      if (localStream) {
        localStream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
      }

      joinedRef.current = false;
      wsRetriesRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, JSON.stringify(userSettings)]);

  // --- PeerConnection helpers ---
  const createPeerConnection = async (
    participantId,
    stream,
    ws,
    initiator,
    iceServers
  ) => {
    if (peerConnections.current.has(participantId)) return;

    const last = peerCreationTimestamps.current.get(participantId) || 0;
    const now = Date.now();
    if (now - last < 2000) return; // rate-limit
    if (peerConnections.current.size >= MAX_PEER_CONNECTIONS) return;

    peerCreationTimestamps.current.set(participantId, now);

    const pc = new RTCPeerConnection({
      iceServers,
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });

    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, stream);
        } catch (e) {
          console.warn("addTrack failed", e);
        }
      });
    }

    pc.ontrack = (event) => {
      const remote =
        remoteStreams.current.get(participantId) || new MediaStream();
      const exists = remote.getTracks().some((t) => t.id === event.track.id);
      if (!exists) remote.addTrack(event.track);
      remoteStreams.current.set(participantId, remote);
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, stream: remote } : p))
      );

      event.track.onended = () => {
        remote.removeTrack(event.track);
        if (remote.getTracks().length === 0)
          remoteStreams.current.delete(participantId);
      };
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws?.send(
          JSON.stringify({
            type: "webrtc-ice-candidate",
            targetId: participantId,
            candidate: event.candidate,
          })
        );
      }
    };

    pc.onconnectionstatechange = async () => {
      const state = pc.connectionState;
      if (state === "failed") {
        try {
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          socketState.current?.send(
            JSON.stringify({
              type: "webrtc-offer",
              targetId: participantId,
              offer,
            })
          );
        } catch (e) {
          try {
            pc.close();
          } catch {}
          peerConnections.current.delete(participantId);
          remoteStreams.current.delete(participantId);
          setParticipants((prev) => prev.filter((p) => p.id !== participantId));
        }
      } else if (state === "closed") {
        peerConnections.current.delete(participantId);
        remoteStreams.current.delete(participantId);
        setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      }
    };

    peerConnections.current.set(participantId, pc);

    // Drain queued answer/candidates
    const queuedAnswer = pendingAnswers.current.get(participantId);
    if (queuedAnswer) {
      try {
        await pc.setRemoteDescription(queuedAnswer);
      } catch (e) {
        console.warn("queued answer fail", e);
      }
      pendingAnswers.current.delete(participantId);
    }
    const queued = pendingCandidates.current.get(participantId) || [];
    for (const cand of queued) {
      try {
        await pc.addIceCandidate(cand);
      } catch (e) {
        console.warn("queued cand fail", e);
      }
    }
    pendingCandidates.current.delete(participantId);

    if (initiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws?.send(
          JSON.stringify({
            type: "webrtc-offer",
            targetId: participantId,
            offer,
          })
        );
      } catch (e) {
        console.error("createOffer failed", e);
      }
    }
  };

  const handleOffer = async (fromId, offer, stream, ws, iceServers) => {
    let pc = peerConnections.current.get(fromId);
    let retries = 0;
    const maxRetries = 3;

    const attempt = async () => {
      try {
        if (!pc) {
          await createPeerConnection(fromId, stream, ws, false, iceServers);
          pc = peerConnections.current.get(fromId);
          if (!pc) throw new Error("pc not created");
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws?.send(
          JSON.stringify({ type: "webrtc-answer", targetId: fromId, answer })
        );
        return true;
      } catch (e) {
        if (++retries <= maxRetries) {
          await new Promise((r) => setTimeout(r, 1000));
          return attempt();
        }
        console.error("handleOffer failed", e);
        return false;
      }
    };

    await attempt();
  };

  const handleAnswer = async (fromId, answer) => {
    const pc = peerConnections.current.get(fromId);
    if (!pc) {
      pendingAnswers.current.set(fromId, answer);
      return;
    }
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      const queued = pendingCandidates.current.get(fromId) || [];
      for (const cand of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch {}
      }
      pendingCandidates.current.delete(fromId);
    } catch (e) {
      try {
        pc.close();
      } catch {}
      peerConnections.current.delete(fromId);
    }
  };

  const handleIceCandidate = async (fromId, candidate) => {
    const pc = peerConnections.current.get(fromId);
    if (!pc) {
      const list = pendingCandidates.current.get(fromId) || [];
      list.push(candidate);
      pendingCandidates.current.set(fromId, list);
      return;
    }
    try {
      await pc.addIceCandidate(candidate);
    } catch (e) {
      console.error("addIceCandidate", e);
    }
  };

  const handleParticipantLeft = (participantId) => {
    const pc = peerConnections.current.get(participantId);
    if (pc) {
      try {
        pc.close();
      } catch {}
    }
    peerConnections.current.delete(participantId);
    remoteStreams.current.delete(participantId);
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
  };

  const sendMediaStateChange = (camera, mic) => {
    socketState.current?.send(
      JSON.stringify({
        type: "media-state-change",
        participantId: userSettings.participantId,
        cameraEnabled: camera,
        micEnabled: mic,
      })
    );
  };

  const toggleCamera = async () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];

    if (videoTrack && !videoTrack._isDummy) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
      sendMediaStateChange(videoTrack.enabled, micEnabled);
      return;
    }

    // Enable real camera (replace dummy)
    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      const real = cam.getVideoTracks()[0];

      if (videoTrack) {
        localStream.removeTrack(videoTrack);
      }
      localStream.addTrack(real);
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(real);
        else pc.addTrack(real, localStream);
      });
      setCameraEnabled(true);
      sendMediaStateChange(true, micEnabled);
      await renegotiateAllPeers();
    } catch (e) {
      console.error("enable camera failed", e);
    }
  };

  const toggleMicrophone = async () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];

    if (audioTrack && !audioTrack._isDummy) {
      // mute -> swap to dummy so senders stay alive
      audioTrack.enabled = false;
      localStream.removeTrack(audioTrack);
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track === audioTrack);
        if (sender) pc.removeTrack(sender);
      });
      const dummy = createSilentAudioTrack();
      localStream.addTrack(dummy);
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
        if (sender) sender.replaceTrack(dummy);
        else pc.addTrack(dummy, localStream);
      });
      await renegotiateAllPeers();
      setMicEnabled(false);
      sendMediaStateChange(cameraEnabled, false);
      return;
    }

    // unmute -> request real mic
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      const real = mic.getAudioTracks()[0];
      if (audioTrack) {
        localStream.removeTrack(audioTrack);
      }
      localStream.addTrack(real);
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
        if (sender) sender.replaceTrack(real);
        else pc.addTrack(real, localStream);
      });
      await renegotiateAllPeers();
      setMicEnabled(true);
      sendMediaStateChange(cameraEnabled, true);
    } catch (e) {
      console.error("enable mic failed", e);
    }
  };

  const startScreenShare = async () => {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setScreenStream(display);
      setIsScreenSharing(true);
      const screenTrack = display.getVideoTracks()[0];

      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });

      // Update local preview: replace video track in local stream
      const newStream = new MediaStream([
        screenTrack,
        ...localStream.getAudioTracks(),
      ]);
      setLocalStream(newStream);

      socketState.current?.send(
        JSON.stringify({
          type: "shared-screen",
          participantId: userSettings.participantId,
          screenEnabled: true,
        })
      );

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (e) {
      console.error("screen share failed", e);
    }
  };

  const stopScreenShare = async () => {
    try {
      screenStream?.getTracks().forEach((t) => t.stop());
    } catch {}
    setScreenStream(null);
    setIsScreenSharing(false);

    // restore camera track based on current cameraEnabled
    if (cameraEnabled) {
      try {
        const cam = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = cam.getVideoTracks()[0];
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(camTrack);
        });
        const newStream = new MediaStream([
          camTrack,
          ...localStream.getAudioTracks(),
        ]);
        setLocalStream(newStream);
      } catch (e) {
        console.error("restore camera failed", e);
      }
    } else {
      const black = createBlackVideoTrack();
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(black);
      });
      const newStream = new MediaStream([
        black,
        ...localStream.getAudioTracks(),
      ]);
      setLocalStream(newStream);
    }

    socketState.current?.send(
      JSON.stringify({
        type: "shared-screen",
        participantId: userSettings.participantId,
        screenEnabled: false,
      })
    );
  };

  const endCall = () => {
    try {
      socketState.current?.send(
        JSON.stringify({
          type: "leave-room",
          meetingId,
          participantId: userSettings.participantId,
        })
      );
    } catch {}
    try {
      localStream?.getTracks().forEach((t) => t.stop());
    } catch {}
    setLocalStream(null);
    peerConnections.current.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    peerConnections.current.clear();
    setParticipants([]);
    setTimeout(() => {
      try {
        socketState.current?.close();
      } catch {}
    }, 200);
  };

  const sendScreenShareState = (enabled) => {
    socketState.current?.send(
      JSON.stringify({
        type: "shared-screen",
        participantId: userSettings.participantId,
        screenEnabled: enabled,
      })
    );
  };

  return {
    localStream,
    participants,
    cameraEnabled,
    micEnabled,
    isScreenSharing,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    endCall,
    sendScreenShareState,
  };
}

// Definition:

// "WebRTC is a technology that enables real-time peer-to-peer communication in the browser, without requiring plugins."

// Main Components:

// Media capture → Access mic/camera using getUserMedia().

// Peer-to-Peer connection → Exchange audio, video, or data directly.

// Signaling → Uses another channel (like WebSocket or Socket.IO) to exchange connection info.

// NAT Traversal → Uses STUN (to discover public IP) and TURN (relay if direct connection fails).

// Step-by-Step Flow:

// (a) Capture: User grants permission → browser captures audio/video stream.

// (b) Create Offer: One peer creates an SDP (Session Description Protocol) offer.

// (c) Signaling: Offer/Answer and ICE candidates are exchanged via a signaling server (not handled by WebRTC itself — usually WebSocket/Socket.IO).

// (d) ICE Gathering: Browser collects possible network paths (candidates).

// (e) Connection: Using STUN/TURN + ICE candidates, peers find the best route to connect.

// (f) Data Transfer: Once connected, audio/video/data flows directly between peers.

// Protocols Used:

// SRTP → secure media transfer.

// DTLS → for encryption and key exchange.

// ICE (Interactive Connectivity Establishment) → connection establishment.