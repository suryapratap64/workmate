import { WebSocketServer, WebSocket } from "ws";
import storage from "./storage.js";

const rooms = new Map();

export function initializeVideoSocket(server) {
  // Create WebSocket server by upgrading HTTP server
  const wss = new WebSocketServer({
    noServer: true,
    path: "/ws",
  });

  // Handle upgrade requests
  server.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");
    // Send immediate ack to client
    ws.send(JSON.stringify({ type: "connected" }));

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "join-room":
            const {
              meetingId,
              participantId,
              participantName,
              cameraEnabled,
              micEnabled,
            } = data;
            ws.meetingId = meetingId;
            ws.participantId = participantId;
            ws.participantName = participantName;
            ws.cameraEnabled = cameraEnabled;
            ws.micEnabled = micEnabled;

            if (!rooms.has(meetingId)) {
              rooms.set(meetingId, new Set());
            }
            rooms.get(meetingId)?.add(ws);

            // Notify other participants
            broadcastToRoom(
              meetingId,
              {
                type: "participant-joined",
                participant: {
                  id: participantId,
                  name: participantName,
                  cameraEnabled,
                  micEnabled,
                },
              },
              ws
            );

            // Send current participants to new user
            const roomClients = rooms.get(meetingId);
            if (roomClients) {
              const participants = Array.from(roomClients)
                .filter((client) => client !== ws && client.participantId)
                .map((client) => ({
                  id: client.participantId,
                  name: client.participantName,
                  cameraEnabled: client.cameraEnabled,
                  micEnabled: client.micEnabled,
                }));

              ws.send(
                JSON.stringify({
                  type: "room-participants",
                  participants,
                })
              );
            }
            break;

          case "webrtc-offer":
          case "webrtc-answer":
          case "webrtc-ice-candidate":
            // Forward WebRTC signaling messages
            const targetClient = findClientByParticipantId(
              ws.meetingId,
              data.targetId
            );
            if (targetClient && targetClient.readyState === WebSocket.OPEN) {
              targetClient.send(
                JSON.stringify({
                  ...data,
                  fromId: ws.participantId,
                })
              );
            }
            break;
          case "leave-room": {
            const { meetingId, participantId } = data;
            const roomClients = rooms.get(meetingId);
            if (roomClients) {
              // Find the client WebSocket instance
              const leavingClient = Array.from(roomClients).find(
                (client) => client.participantId === participantId
              );
              if (leavingClient) {
                roomClients.delete(leavingClient);
                // Optionally, close the socket (if you want)
                leavingClient.close();
              }
              // Broadcast to others that this participant left
              broadcastToRoom(meetingId, {
                type: "participant-left",
                participantId,
              });
              // Clean up empty rooms
              if (roomClients.size === 0) {
                rooms.delete(meetingId);
              }
            }
            break;
          }

          case "media-state-change":
            // Broadcast media state changes (mute/unmute, camera on/off)

            broadcastToRoom(
              ws.meetingId,
              {
                type: "participant-media-change",
                participantId: ws.participantId,
                cameraEnabled: data.cameraEnabled,
                micEnabled: data.micEnabled,
              },
              ws
            );
            break;

          case "shared-screen":
            // Handle screen sharing

            broadcastToRoom(
              ws.meetingId,
              {
                type: "shared-screen-toogle",
                participantId: ws.participantId,
                screenEnabled: data.screenEnabled,
              },
              ws
            );
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (ws.meetingId && ws.participantId) {
        const roomClients = rooms.get(ws.meetingId);
        if (roomClients) {
          roomClients.delete(ws);

          // Notify other participants
          broadcastToRoom(
            ws.meetingId,
            {
              type: "participant-left",
              participantId: ws.participantId,
            },
            ws
          );

          // Clean up empty rooms
          if (roomClients.size === 0) {
            rooms.delete(ws.meetingId);
          }
        }
      }
    });
  });

  function broadcastToRoom(meetingId, message, sender) {
    const roomClients = rooms.get(meetingId);
    if (roomClients) {
      roomClients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  function findClientByParticipantId(meetingId, participantId) {
    const roomClients = rooms.get(meetingId);
    if (roomClients) {
      return Array.from(roomClients).find(
        (client) => client.participantId === participantId
      );
    }
    return undefined;
  }
}
