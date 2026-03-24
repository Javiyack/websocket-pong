export interface GameState {
  ball: { x: number; y: number; vx: number; vy: number };
  paddles: {
    player1: { y: number };
    player2: { y: number };
  };
  score: { player1: number; player2: number };
  status: "countdown" | "playing" | "scored" | "finished";
}

export interface PlayerInput {
  direction: "up" | "down" | "stop";
}

export type PlayerRole = "player1" | "player2";
