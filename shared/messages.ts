import { GameState, PlayerRole } from "./types.js";
import { Difficulty } from "./constants.js";

// Client → Server
export type ClientMessage =
  | { type: "join"; roomCode?: string; difficulty?: Difficulty }
  | { type: "input"; direction: "up" | "down" | "stop" }
  | { type: "rematch" };

// Server → Client
export type ServerMessage =
  | { type: "waiting"; roomCode: string; difficulty: Difficulty }
  | { type: "start"; role: PlayerRole; difficulty: Difficulty }
  | { type: "state"; gameState: GameState; tick: number }
  | { type: "score"; scorer: PlayerRole; score: GameState["score"] }
  | { type: "end"; winner: PlayerRole; score: GameState["score"] }
  | { type: "opponent_disconnected" }
  | { type: "error"; message: string };
