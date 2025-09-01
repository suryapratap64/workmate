import SimplePeer from "simple-peer";

export const defaultIceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

export const mediaConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export function createPeer({
  initiator = false,
  stream = null,
  config = {},
} = {}) {
  return new SimplePeer({
    initiator,
    stream,
    trickle: false,
    objectMode: true,
    config: {
      iceServers: defaultIceServers,
      ...config,
    },
  });
}

export function addPeerEvents(
  peer,
  { onSignal, onStream, onData, onConnect, onClose, onError } = {}
) {
  if (onSignal) peer.on("signal", onSignal);
  if (onStream) peer.on("stream", onStream);
  if (onData) peer.on("data", onData);
  if (onConnect) peer.on("connect", onConnect);
  if (onClose) peer.on("close", onClose);
  if (onError) peer.on("error", onError);

  return () => {
    peer.removeAllListeners();
    peer.destroy();
  };
}

export function handlePeerSignaling(peer, signal) {
  try {
    peer.signal(signal);
  } catch (err) {
    console.error("Error handling peer signal:", err);
  }
}

export function replacePeerStream(peer, newStream) {
  try {
    const senders = peer.getSenders();
    const tracks = newStream.getTracks();

    tracks.forEach((track, i) => {
      if (senders[i]) {
        senders[i].replaceTrack(track);
      }
    });
  } catch (err) {
    console.error("Error replacing peer stream:", err);
  }
}

export async function getLocalStream(constraints = mediaConstraints) {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    console.error("Error getting local stream:", err);
    throw err;
  }
}

export async function getScreenStream() {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always",
      },
      audio: false,
    });
  } catch (err) {
    console.error("Error getting screen share stream:", err);
    throw err;
  }
}

export function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

export async function getNetworkStats(peer) {
  try {
    const stats = await peer.getStats();
    const output = {
      video: { send: null, receive: null },
      audio: { send: null, receive: null },
      connection: { state: peer.connectionState },
    };

    stats.forEach((report) => {
      if (report.type === "outbound-rtp") {
        const kind = report.mediaType || report.kind;
        if (kind === "video") output.video.send = report;
        if (kind === "audio") output.audio.send = report;
      }
      if (report.type === "inbound-rtp") {
        const kind = report.mediaType || report.kind;
        if (kind === "video") output.video.receive = report;
        if (kind === "audio") output.audio.receive = report;
      }
    });

    return output;
  } catch (err) {
    console.error("Error getting network stats:", err);
    return null;
  }
}

export function checkMediaSupport() {
  return {
    video: !!navigator.mediaDevices?.getUserMedia,
    audio: !!navigator.mediaDevices?.getUserMedia,
    screen: !!navigator.mediaDevices?.getDisplayMedia,
    webRTC: typeof RTCPeerConnection !== "undefined",
  };
}

export function isTrackEnabled(stream, kind) {
  if (!stream) return false;
  const tracks =
    kind === "video" ? stream.getVideoTracks() : stream.getAudioTracks();
  return tracks[0]?.enabled ?? false;
}

// Add this to help with debugging
export function setupDebugListeners(peer, label = "Peer") {
  const events = [
    "signal",
    "connect",
    "close",
    "error",
    "stream",
    "track",
    "data",
  ];
  events.forEach((event) => {
    peer.on(event, (...args) => {
      console.log(`[${label}] ${event}:`, ...args);
    });
  });

  // Connection state changes
  peer.on("iceStateChange", (state) => {
    console.log(`[${label}] ICE state:`, state);
  });
}
