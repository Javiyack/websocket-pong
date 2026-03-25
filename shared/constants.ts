export type Difficulty = "easy" | "normal" | "hard";

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PADDLE_WIDTH: 15,
  PADDLE_HEIGHT: 80,
  PADDLE_SPEED: 6,
  PADDLE_MARGIN: 20,
  BALL_SIZE: 10,
  BALL_INITIAL_SPEED: 5,
  BALL_SPEED_INCREMENT: 0.5,
  BALL_MAX_SPEED: 12,
  WINNING_SCORE: 11,
  TICK_RATE: 30,
  COUNTDOWN_SECONDS: 3,
} as const;

export interface DifficultyConfig {
  ballSpeedMultiplier: number;
  paddleSpeedMultiplier: number;
  paddleHeightMultiplier: number;
  winningScore: number;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    ballSpeedMultiplier: 0.75,
    paddleSpeedMultiplier: 1.0,
    paddleHeightMultiplier: 1.3,
    winningScore: 7,
  },
  normal: {
    ballSpeedMultiplier: 1.0,
    paddleSpeedMultiplier: 1.0,
    paddleHeightMultiplier: 1.0,
    winningScore: 11,
  },
  hard: {
    ballSpeedMultiplier: 1.4,
    paddleSpeedMultiplier: 1.2,
    paddleHeightMultiplier: 0.75,
    winningScore: 15,
  },
};
