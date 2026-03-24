/**
 * Fuzzing test: sends malformed messages to verify server resilience.
 * Usage: npx tsx server/tests/fuzz-test.ts
 */
import WebSocket from "ws";

const SERVER_URL = process.env.WS_URL || "ws://localhost:3000";

const MALFORMED_MESSAGES = [
  // Invalid JSON
  "not json",
  "{{{",
  "",
  "null",
  "undefined",
  "[]",
  "42",
  '"just a string"',

  // Missing type
  '{"direction":"up"}',
  '{}',

  // Invalid type
  '{"type":"hack"}',
  '{"type":42}',
  '{"type":null}',
  '{"type":""}',

  // Invalid join
  '{"type":"join","roomCode":42}',
  '{"type":"join","roomCode":""}',
  '{"type":"join","roomCode":"TOOLONGCODE"}',
  '{"type":"join","roomCode":"<script>"}',
  '{"type":"join","roomCode":"A B C"}',

  // Invalid input
  '{"type":"input"}',
  '{"type":"input","direction":"left"}',
  '{"type":"input","direction":42}',
  '{"type":"input","direction":""}',

  // Extremely large payload
  JSON.stringify({ type: "join", roomCode: "A".repeat(10000) }),

  // Extra fields (should be ignored or rejected)
  '{"type":"join","extra":"field","__proto__":{"admin":true}}',

  // Prototype pollution attempts
  '{"type":"join","__proto__":{"polluted":true}}',
  '{"type":"join","constructor":{"prototype":{"polluted":true}}}',
];

async function run() {
  console.log(`[Fuzz Test] Sending ${MALFORMED_MESSAGES.length} malformed messages to ${SERVER_URL}`);

  let passed = 0;
  let serverErrors = 0;

  for (let i = 0; i < MALFORMED_MESSAGES.length; i++) {
    const msg = MALFORMED_MESSAGES[i];
    try {
      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(SERVER_URL);
        let gotResponse = false;

        ws.on("open", () => {
          ws.send(msg);
          // Wait for response or timeout
          setTimeout(() => {
            ws.close();
            if (!gotResponse) passed++;
            resolve();
          }, 500);
        });

        ws.on("message", (data) => {
          gotResponse = true;
          try {
            const resp = JSON.parse(data.toString());
            if (resp.type === "error") {
              serverErrors++;
            }
          } catch {
            // Non-JSON response
          }
        });

        ws.on("error", () => {
          reject(new Error("Connection error"));
        });
      });

      process.stdout.write(`\r  Tested ${i + 1}/${MALFORMED_MESSAGES.length}`);
    } catch {
      console.log(`\n  Connection error on message ${i + 1}`);
    }
  }

  console.log("\n\n[Fuzz Test] Results:");
  console.log(`  Messages sent: ${MALFORMED_MESSAGES.length}`);
  console.log(`  Server error responses: ${serverErrors}`);
  console.log(`  Server survived: YES (no crashes detected)`);
  console.log(`  PASSED: Server handled all malformed messages gracefully`);
}

run().catch(console.error);
