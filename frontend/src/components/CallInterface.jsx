import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  PhoneOff,
  VideoOff,
  Mic,
  MicOff,
  X,
  Settings,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import axios from "axios";

const CallInterface = ({
  conversation,
  initialStream,
  onEndCall,
  onClose,
  cameraEnabled,
  micEnabled,
  toggleCamera,
  toggleMicrophone,
  isScreenSharing,
  startScreenShare,
  stopScreenShare,
  isIncoming,
  callType,
  onAccept,
  onReject,
  callId,
}) => {
  // participants feature removed — UI shows only the primary remote stream
  const [isMuted, setIsMuted] = useState(!micEnabled);
  const [isVideoOff, setIsVideoOff] = useState(!cameraEnabled);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callStatus, setCallStatus] = useState(
    isIncoming ? "incoming" : "connecting"
  );
  const [isIncomingCall, setIsIncomingCall] = useState(isIncoming);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);

  const { user } = useSelector((state) => state.worker);
  const { socket } = useSocket();

  const localVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const offerSentRef = useRef(false);
  const pendingIceCandidatesRef = useRef([]);
  const durationIntervalRef = useRef(null);

  const getOtherUser = () => {
    return conversation.client?._id === user._id
      ? conversation.worker
      : conversation.client;
  };

  const otherUser = getOtherUser();

  useEffect(() => {
    if (localVideoRef.current && initialStream) {
      setLocalStream(initialStream);
      localVideoRef.current.srcObject = initialStream;
    }
  }, [initialStream]);

  const initializeCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // If a peer connection already exists, skip re-initialization
      if (peerConnectionRef.current) {
        console.log("PeerConnection already initialized, skipping");
        return;
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add connection state change handler
      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.connectionState);
        if (peerConnection.connectionState === "connected") {
          console.log("WebRTC connection established");
        } else if (peerConnection.connectionState === "failed") {
          setError("Connection failed");
        }
      };

      // Add ICE connection state change handler
      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
      };

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            conversationId: conversation._id,
            candidate: event.candidate,
            targetUserId: otherUser._id,
          });
        }
      };

      // Create and send offer
      if (!offerSentRef.current) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit("offer", {
          conversationId: conversation._id,
          offer,
          targetUserId: otherUser._id,
        });
        offerSentRef.current = true;
      } else {
        console.log("Offer already sent, skipping duplicate offer");
      }

      setCallStatus("connecting");
    } catch (error) {
      console.error("Error initializing call:", error);
      setError("Failed to access camera/microphone");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCallAccepted = async (data) => {
    if (data.conversationId === conversation._id) {
      setCallStatus("connected");
      startCallDuration();
    }
  };

  const handleCallRejected = (data) => {
    if (data.conversationId === conversation._id) {
      setCallStatus("rejected");
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleCallEnded = (data) => {
    if (data.conversationId === conversation._id) {
      setCallStatus("ended");
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleOffer = async (data) => {
    if (data.conversationId === conversation._id) {
      try {
        setIsConnecting(true);

        // If a peer connection already exists, reuse it
        let peerConnection = peerConnectionRef.current;
        // Get user media if we don't have a local stream yet
        let stream = localStream;
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: callType === "video",
            audio: true,
          });
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }

        if (!peerConnection) {
          peerConnection = new RTCPeerConnection({
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          });

          peerConnectionRef.current = peerConnection;

          // Add local stream to peer connection
          stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
          });

          // Handle remote stream more reliably
          const remoteStreamRef = useRef(new MediaStream());

          peerConnection.ontrack = (event) => {
            console.log("Got remote track:", event.track.kind);
            // Check if track already exists
            const existingTrack = remoteStreamRef.current
              .getTracks()
              .find((t) => t.id === event.track.id);
            if (!existingTrack) {
              remoteStreamRef.current.addTrack(event.track);
            }

            setRemoteStream(remoteStreamRef.current);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStreamRef.current;
            }
          };

          // Handle ICE candidates
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice_candidate", {
                conversationId: conversation._id,
                candidate: event.candidate,
                targetUserId: data.fromUserId,
              });
            }
          };

          // Drain any queued ICE candidates
          if (pendingIceCandidatesRef.current.length) {
            pendingIceCandidatesRef.current.forEach((cand) => {
              peerConnection
                .addIceCandidate(new RTCIceCandidate(cand))
                .catch((e) =>
                  console.warn("Error adding queued candidate:", e)
                );
            });
            pendingIceCandidatesRef.current = [];
          }
        }

        // Add connection state change handler
        peerConnection.onconnectionstatechange = () => {
          console.log("Connection state:", peerConnection.connectionState);
          if (peerConnection.connectionState === "connected") {
            console.log("WebRTC connection established");
          } else if (peerConnection.connectionState === "failed") {
            setError("Connection failed");
          }
        };

        // Add ICE connection state change handler
        peerConnection.oniceconnectionstatechange = () => {
          console.log(
            "ICE connection state:",
            peerConnection.iceConnectionState
          );
        };

        peerConnectionRef.current = peerConnection;

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          console.log("Received remote stream:", event.streams[0]);
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice_candidate", {
              conversationId: conversation._id,
              candidate: event.candidate,
              targetUserId: data.fromUserId,
            });
          }
        };

        // Set remote description
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        // Create and send answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", {
          conversationId: conversation._id,
          answer,
          targetUserId: data.fromUserId,
        });

        setCallStatus("connected");
        startCallDuration();
      } catch (error) {
        console.error("Error handling offer:", error);
        setError("Failed to establish connection");
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleAnswer = async (data) => {
    if (data.conversationId === conversation._id) {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.warn(
            "Received answer but peerConnection is not initialized, queueing"
          );
          // queue the answer until pc exists
          // store raw RTCSessionDescriptionInit
          pendingIceCandidatesRef.current =
            pendingIceCandidatesRef.current || [];
          // We don't have a dedicated pendingAnswer container here; store on ref
          pendingIceCandidatesRef.current._pendingAnswer = data.answer;
          return;
        }

        const signalingState = pc.signalingState;
        // Only set remote description if we're in a state expecting an answer
        if (
          signalingState === "have-local-offer" ||
          signalingState === "stable"
        ) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else {
          console.warn(
            "Ignoring remote answer due to signalingState:",
            signalingState
          );
          return;
        }
        setCallStatus("connected");
        startCallDuration();
      } catch (error) {
        console.error("Error handling answer:", error);
        setError("Failed to establish connection");
      }
    }
  };

  const handleIceCandidate = async (data) => {
    if (data.conversationId === conversation._id) {
      try {
        if (!peerConnectionRef.current) {
          // Queue candidate until pc exists
          pendingIceCandidatesRef.current =
            pendingIceCandidatesRef.current || [];
          pendingIceCandidatesRef.current.push(data.candidate);
          console.warn("Queuing ICE candidate until peerConnection exists");
          return;
        }

        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  };

  const startCallDuration = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAcceptCall = async () => {
    try {
      setIsConnecting(true);

      // Get user media for incoming call
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection for incoming call
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add connection state change handler
      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.connectionState);
        if (peerConnection.connectionState === "connected") {
          console.log("WebRTC connection established");
        } else if (peerConnection.connectionState === "failed") {
          setError("Connection failed");
        }
      };

      // Add ICE connection state change handler
      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
      };

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            conversationId: conversation._id,
            candidate: event.candidate,
            targetUserId: otherUser._id,
          });
        }
      };

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      await axios.post(
        `${apiUrl}/api/v1/call/join/${conversation._id}`,
        {},
        { withCredentials: true }
      );

      socket.emit("call_accepted", {
        conversationId: conversation._id,
        callId: callId || conversation._id || null,
      });

      setIsIncomingCall(false);
      setCallStatus("connected");
      startCallDuration();
      onAccept && onAccept();
    } catch (error) {
      console.error("Error accepting call:", error);
      setError("Failed to accept call");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRejectCall = () => {
    socket.emit("call_rejected", {
      conversationId: conversation._id,
      callId: callId || conversation._id || null,
    });

    onReject && onReject();
    onClose();
  };

  const handleEndCall = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      await axios.post(
        `${apiUrl}/api/v1/call/end/${conversation._id}`,
        {},
        { withCredentials: true }
      );

      socket.emit("call_ended", {
        conversationId: conversation._id,
        callId: callId || conversation._id || null,
      });

      // Stop all tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      onEndCall && onEndCall();
      onClose();
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {otherUser?.profilePicture ? (
                <img
                  src={otherUser.profilePicture}
                  alt={otherUser.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {otherUser?.firstName?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {otherUser?.firstName} {otherUser?.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {isIncomingCall
                  ? "Incoming call..."
                  : callStatus === "connected"
                  ? formatDuration(callDuration)
                  : callStatus}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative bg-gray-900 aspect-video p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Local Video */}
            <div className="bg-gray-800 rounded-lg overflow-hidden relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-2xl text-white">
                      {user?.firstName?.charAt(0) || "U"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="bg-gray-800 rounded-lg overflow-hidden relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onLoadedMetadata={(e) => {
                  if (e.target.paused) {
                    e.target
                      .play()
                      .catch((err) =>
                        console.warn("Auto-play prevented:", err)
                      );
                  }
                }}
              />
              {!remoteVideoRef.current?.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                    {otherUser?.profilePicture ? (
                      <img
                        src={otherUser.profilePicture}
                        alt={otherUser.firstName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-2xl text-white">
                        {otherUser?.firstName?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* audio-only view removed; interface is video-only */}

          {/* Loading/Error States */}
          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Connecting...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-500 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="p-6 bg-gray-50">
          {isIncomingCall || callStatus === "incoming" ? (
            // Incoming call controls
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleAcceptCall}
                disabled={isConnecting}
                className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full disabled:opacity-50"
              >
                <Video className="h-6 w-6" />
              </button>
              <button
                onClick={handleRejectCall}
                disabled={isConnecting}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full disabled:opacity-50"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          ) : (
            // Active call controls
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </button>

              {callType === "video" && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full ${
                    isVideoOff
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="h-6 w-6" />
                  ) : (
                    <Video className="h-6 w-6" />
                  )}
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
