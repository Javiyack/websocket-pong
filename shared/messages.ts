import { GameState, PlayerRole } from "./types.js";

// Client → Server
export type ClientMessage =
  | { type: "join"; roomCode?: string }
  | { type: "input"; direction: "up" | "down" | "stop" }
  | { type: "rematch" };

// Server → Client
export type ServerMessage =
  | { type: "waiting"; roomCode: string }
  | { type: "start"; role: PlayerRole }
  | { type: "state"; gameState: GameState; tick: number }
  | { type: "score"; scorer: PlayerRole; score: GameState["score"] }
  | { type: "end"; winner: PlayerRole; score: GameState["score"] }
  | { type: "opponent_disconnected" }
  | { type: "error"; message: string };
