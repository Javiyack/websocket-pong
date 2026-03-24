/**
 * Load test script: creates N rooms with simulated players sending inputs.
 * Usage: npx tsx server/tests/load-test.ts [roomCount]
 */
import WebSocket from "ws";

const SERVER_URL = process.env.WS_URL || "ws://localhost:3000";
const ROOM_COUNT = parseInt(process.argv[2] || "50", 10);
const TEST_DURATION = 30_000; // 30 seconds

interface Connection {
  ws: WebSocket;
  roomCode?: string;
  role?: string;
}

let created = 0;
let joined = 0;
let errors = 0;
let totalMessages = 0;

function createRoom(): Promise<Connection> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL);
    const conn: Connection = { ws };

    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "join" }));
    });

    ws.on("message", (data) => {
      totalMessages++;
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "waiting") {
          conn.roomCode = msg.roomCode;
          created++;
          resolve(conn);
        } else if (msg.type === "error") {
          errors++;
        }
      } catch {
        errors++;
      }
    });

    ws.on("error", () => {
      errors++;
      reject(new Error("Connection failed"));
    });

    setTimeout(() => reject(new Error("Timeout")), 5000);
  });
}

function joinRoom(roomCode: string): Promise<Connection> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL);
    const conn: Connection = { ws, roomCode };

    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "join", roomCode }));
    });

    ws.on("message", (data) => {
      totalMessages++;
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "start") {
          conn.role = msg.role;
          joined++;
          resolve(conn);
        }
      } catch {
        errors++;
      }
    });

    ws.on("error", () => {
      errors++;
      reject(new Error("Connection failed"));
    });

    setTimeout(() => reject(new Error("Timeout")), 5000);
  });
}

function simulateInputs(conn: Connection): NodeJS.Timeout {
  const directions = ["up", "down", "stop"];
  return setInterval(() => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      conn.ws.send(JSON.stringify({ type: "input", direction: dir }));
    }
  }, 100); // 10 inputs/sec per player
}

async function run() {
  console.log(`[Load Test] Creating ${ROOM_COUNT} rooms on ${SERVER_URL}...`);

  const connections: Connection[] = [];
  const timers: NodeJS.Timeout[] = [];
  const startTime = Date.now();

  // Phase 1: Create rooms
  for (let i = 0; i < ROOM_COUNT; i++) {
    try {
      const creator = await createRoom();
      connections.push(creator);
      process.stdout.write(`\r  Created ${i + 1}/${ROOM_COUNT} rooms`);
    } catch {
      errors++;
    }
  }
  console.log();

  // Phase 2: Join rooms
  for (const conn of connections) {
    if (conn.roomCode) {
      try {
        const joiner = await joinRoom(conn.roomCode);
        connections.push(joiner);
        timers.push(simulateInputs(conn));
        timers.push(simulateInputs(joiner));
      } catch {
        errors++;
      }
    }
  }

  console.log(`[Load Test] ${created} rooms created, ${joined} players joined`);
  console.log(`[Load Test] Running for ${TEST_DURATION / 1000}s...`);

  const memBefore = process.memoryUsage();

  await new Promise((r) => setTimeout(r, TEST_DURATION));

  const elapsed = Date.now() - startTime;

  // Cleanup
  for (const t of timers) clearInterval(t);
  for (const c of connections) c.ws.close();

  console.log("\n[Load Test] Results:");
  console.log(`  Duration: ${(elapsed / 1000).toFixed(1)}s`);
  console.log(`  Rooms: ${created}`);
  console.log(`  Players joined: ${joined}`);
  console.log(`  Total WS messages received: ${totalMessages}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Messages/sec: ${(totalMessages / (elapsed / 1000)).toFixed(0)}`);
}

run().catch(console.error);
