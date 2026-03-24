import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3000", 10);

const app = express();
const server = createServer(app);

// Serve static client build in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../../dist/client");
  app.use(express.static(clientDist));
}

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");

  ws.on("message", (data) => {
    console.log("[WS] Received:", data.toString());
    // Echo for now – will be replaced by MessageRouter
    ws.send(data.toString());
  });

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
