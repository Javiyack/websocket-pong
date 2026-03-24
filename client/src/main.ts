import { WebSocketClient } from "./network/WebSocketClient.js";

const wsUrl =
  location.protocol === "https:"
    ? `wss://${location.host}`
    : `ws://${location.hostname}:3000`;

const client = new WebSocketClient(wsUrl);

client.connect();

// Placeholder – will be replaced by ScreenManager
const app = document.getElementById("app")!;
app.innerHTML = `<p style="font-family:'Press Start 2P',monospace;font-size:14px">Connecting...</p>`;

client.on("open", () => {
  app.innerHTML = `<p style="font-family:'Press Start 2P',monospace;font-size:14px">Connected to server</p>`;
});

client.on("close", () => {
  app.innerHTML = `<p style="font-family:'Press Start 2P',monospace;font-size:14px">Disconnected</p>`;
});
