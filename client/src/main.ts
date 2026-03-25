import { WebSocketClient } from "./network/WebSocketClient.js";
import { ScreenManager } from "./screens/ScreenManager.js";

const wsUrl =
  location.protocol === "https:"
    ? `wss://${location.host}`
    : `ws://${location.hostname}:3000`;

const client = new WebSocketClient(wsUrl);

const app = document.getElementById("app")!;

// Show loading until connected
app.innerHTML = `<p style="font-family:'Press Start 2P',monospace;font-size:14px">Connecting...</p>`;

client.on("open", () => {
  new ScreenManager(client, app);
});

client.on("close", () => {
  // Reconnection with exponential backoff
  let delay = 500;
  const maxDelay = 5000;

  const tryReconnect = () => {
    app.innerHTML = `<p style="font-family:'Press Start 2P',monospace;font-size:14px">Reconectando...</p>`;
    setTimeout(() => {
      client.connect();
      delay = Math.min(delay * 2, maxDelay);
    }, delay);
  };

  // Only auto-reconnect if not intentionally disconnected
  tryReconnect();
});

// Connect AFTER registering listeners to avoid race condition
client.connect();
