export interface WebRTCClient {
  userId: string;
  username: string;
  socket: any; // Socket.IO socket
  roomId?: string;
  cameraEnabled?: boolean;
  micEnabled?: boolean;
  screenEnabled?: boolean;
}

export interface VideoRoom {
  roomId: string;
  participants: Map<string, WebRTCClient>;
  createdAt: Date;
}

export type WebRTCMessage = {
  type:
    | "webrtc-offer"
    | "webrtc-answer"
    | "webrtc-ice-candidate"
    | "media-state-change"
    | "shared-screen";
  targetId?: string;
  senderId: string;
  payload: any;
};
