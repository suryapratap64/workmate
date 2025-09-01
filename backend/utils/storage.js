import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for storing video call related files
const STORAGE_DIR = path.join(__dirname, "../uploads/video-calls");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Function to generate unique room ID
export const generateRoomId = () => {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Function to create a new room directory
export const createRoomStorage = (roomId) => {
  const roomDir = path.join(STORAGE_DIR, roomId);
  if (!fs.existsSync(roomDir)) {
    fs.mkdirSync(roomDir, { recursive: true });
  }
  return roomDir;
};

// Function to clean up room storage
export const cleanupRoomStorage = (roomId) => {
  const roomDir = path.join(STORAGE_DIR, roomId);
  if (fs.existsSync(roomDir)) {
    fs.rmSync(roomDir, { recursive: true, force: true });
  }
};

// Function to store room metadata
export const storeRoomMetadata = (roomId, metadata) => {
  const roomDir = createRoomStorage(roomId);
  const metadataPath = path.join(roomDir, "metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
};

// Function to get room metadata
export const getRoomMetadata = (roomId) => {
  const metadataPath = path.join(STORAGE_DIR, roomId, "metadata.json");
  if (fs.existsSync(metadataPath)) {
    const data = fs.readFileSync(metadataPath, "utf8");
    return JSON.parse(data);
  }
  return null;
};

// Function to list all active rooms
export const listActiveRooms = () => {
  if (!fs.existsSync(STORAGE_DIR)) return [];
  return fs
    .readdirSync(STORAGE_DIR)
    .filter((room) => {
      const metadataPath = path.join(STORAGE_DIR, room, "metadata.json");
      return fs.existsSync(metadataPath);
    })
    .map((room) => getRoomMetadata(room))
    .filter((metadata) => metadata && metadata.active);
};

export default {
  generateRoomId,
  createRoomStorage,
  cleanupRoomStorage,
  storeRoomMetadata,
  getRoomMetadata,
  listActiveRooms,
};
