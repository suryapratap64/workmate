export class WebRTCClient {
  constructor(userId, username, socket) {
    this.userId = userId;
    this.username = username;
    this.socket = socket;
    this.roomId = undefined;
    this.cameraEnabled = true;
    this.micEnabled = true;
    this.screenEnabled = false;
  }
}

export class VideoRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.participants = new Map();
    this.createdAt = new Date();
  }
}
