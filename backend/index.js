import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import jobRoute from "./routes/job.route.js";
import messageRoute from "./routes/message.route.js";
import callRoute from "./routes/call.route.js";
import { createServer } from "http";
import { initializeSocket } from "./utils/socket.js";
import { initializeVideoSocket } from "./utils/videoSocket.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Apply CORS to all routes

const app = express();
const server = createServer(app);
const Port = process.env.PORT || 8000;
// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://workmate-two.vercel.app",
    "http://workmate-two.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// Initialize Socket.IO and VideoSocket with error handling
let io;
try {
  io = initializeSocket(server);
  initializeVideoSocket(server);

  // Error handling for Socket.IO
  if (io?.engine) {
    io.engine.on("connection_error", (err) => {
      console.error("Socket.IO connection error:", err);
    });

    io.engine.on("upgrade", () => {
      console.log("Transport upgraded to WebSocket");
    });

    io.engine.on("connection", (socket) => {
      console.log("New socket connection:", {
        id: socket.id,
        transport: socket.conn?.transport?.name,
      });
    });
  }
} catch (error) {
  console.error("Error initializing socket servers:", error);
}

// Serve static files from uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "I am coming from backend",
    success: true,
  });
});

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/call", callRoute);

server.listen(Port, () => {
  connectDB();
  console.log(`Server is running on PORT ${Port}`);
});
