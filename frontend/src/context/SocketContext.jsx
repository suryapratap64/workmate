import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useSelector((state) => state.worker);

  useEffect(() => {
    if (token && user) {
      console.log("Initializing socket connection for user:", user._id);

      const newSocket = io(
        import.meta.env.VITE_API_URL || "http://localhost:8000",
        {
          auth: {
            token: token,
          },
          // Force polling-only transport and disable upgrade to websocket.
          // This avoids low-level websocket frame/upgrade failures in dev
          // environments or when a proxy interferes with websocket frames.
          transports: ["polling"],
          upgrade: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          withCredentials: true,
          autoConnect: false,
          forceNew: true,
          query: {
            userId: user._id,
            userType: user.userType || "worker",
          },
        }
      );

      // Add connection state logging
      newSocket.on("connect_error", (error) => {
        console.log("Connection error details:", {
          message: error.message,
          description: error.description,
          type: error.type,
          transport: newSocket.io.engine.transport.name,
        });
      });

      newSocket.io.on("upgrade", () => {
        console.log(
          "Transport upgraded to:",
          newSocket.io.engine.transport.name
        );
      });

      newSocket.io.on("error", (error) => {
        console.error("Transport error:", error);
      });

      // Add more detailed error handling
      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        // Try to reconnect with polling if websocket fails or if we see
        // low-level websocket frame errors (Invalid frame header/closed before established)
        const msg = (error && error.message) || "";
        if (
          msg.includes("websocket") ||
          msg.includes("Invalid frame header") ||
          msg.includes("closed before the connection is established")
        ) {
          console.log(
            "WebSocket transport failing — switching to polling and reconnecting..."
          );
          try {
            newSocket.io.opts.transports = ["polling"];
            // Force reconnection attempt
            if (newSocket.connected) newSocket.disconnect();
            newSocket.connect();
          } catch (e) {
            console.error("Error forcing polling transport reconnect:", e);
          }
        }
      });

      // Add more robust error handlers
      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
        setIsConnected(false);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
        setIsConnected(true);
      });

      newSocket.on("reconnect_error", (error) => {
        console.error("Socket reconnection error:", error);
      });

      newSocket.on("reconnect_failed", () => {
        console.error("Socket reconnection failed");
        setIsConnected(false);
      });

      // Manually connect after setting up all handlers
      newSocket.connect();

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
