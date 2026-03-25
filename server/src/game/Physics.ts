import { GameState } from "../../../shared/types.js";
import { GAME_CONFIG, DifficultyConfig, DIFFICULTY_SETTINGS } from "../../../shared/constants.js";

const {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_SIZE,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  BALL_INITIAL_SPEED,
  BALL_SPEED_INCREMENT,
  BALL_MAX_SPEED,
  PADDLE_SPEED,
} = GAME_CONFIG;

const DEFAULT_CONFIG = DIFFICULTY_SETTINGS.normal;

/**
 * Pure physics module — receives state, mutates and returns it.
 * No side effects or dependencies on Room/WebSocket.
 */

export function movePaddle(
  state: GameState,
  paddle: "player1" | "player2",
  direction: "up" | "down" | "stop",
  dt: number,
  dc: DifficultyConfig = DEFAULT_CONFIG
): void {
  const p = state.paddles[paddle];
  const speed = PADDLE_SPEED * dc.paddleSpeedMultiplier * dt * GAME_CONFIG.TICK_RATE;
  const paddleH = PADDLE_HEIGHT * dc.paddleHeightMultiplier;

  if (direction === "up") {
    p.y = Math.max(0, p.y - speed);
  } else if (direction === "down") {
    p.y = Math.min(CANVAS_HEIGHT - paddleH, p.y + speed);
  }
}

export function updateBall(state: GameState, _dt: number, dc: DifficultyConfig = DEFAULT_CONFIG): void {
  const ball = state.ball;
  const paddleH = PADDLE_HEIGHT * dc.paddleHeightMultiplier;

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/bottom wall collision
  if (ball.y <= 0) {
    ball.y = -ball.y;
    ball.vy = -ball.vy;
  } else if (ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
    ball.y = 2 * (CANVAS_HEIGHT - BALL_SIZE) - ball.y;
    ball.vy = -ball.vy;
  }

  // Paddle collision — Player 1 (left)
  const p1 = state.paddles.player1;
  const p1x = PADDLE_MARGIN;
  if (
    ball.vx < 0 &&
    ball.x <= p1x + PADDLE_WIDTH &&
    ball.y + BALL_SIZE >= p1.y &&
    ball.y <= p1.y + paddleH
  ) {
    ball.x = p1x + PADDLE_WIDTH;
    ball.vx = -ball.vx;
    applyBounceAngle(ball, p1.y, paddleH, dc);
    accelerateBall(ball, dc);
  }

  // Paddle collision — Player 2 (right)
  const p2 = state.paddles.player2;
  const p2x = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
  if (
    ball.vx > 0 &&
    ball.x + BALL_SIZE >= p2x &&
    ball.y + BALL_SIZE >= p2.y &&
    ball.y <= p2.y + paddleH
  ) {
    ball.x = p2x - BALL_SIZE;
    ball.vx = -ball.vx;
    applyBounceAngle(ball, p2.y, paddleH, dc);
    accelerateBall(ball, dc);
  }
}

function applyBounceAngle(
  ball: GameState["ball"],
  paddleY: number,
  paddleH: number,
  dc: DifficultyConfig
): void {
  const relativeHit =
    (ball.y + BALL_SIZE / 2 - (paddleY + paddleH / 2)) /
    (paddleH / 2);
  ball.vy = relativeHit * BALL_INITIAL_SPEED * dc.ballSpeedMultiplier;
}

function accelerateBall(ball: GameState["ball"], dc: DifficultyConfig): void {
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  const newSpeed = Math.min(speed + BALL_SPEED_INCREMENT * dc.ballSpeedMultiplier, BALL_MAX_SPEED * dc.ballSpeedMultiplier);
  const factor = newSpeed / speed;
  ball.vx *= factor;
  ball.vy *= factor;
}

export function resetBall(state: GameState, dc: DifficultyConfig = DEFAULT_CONFIG): void {
  const dirX = Math.random() > 0.5 ? 1 : -1;
  const dirY = (Math.random() - 0.5) * 2;
  const mag = Math.sqrt(1 + dirY * dirY);
  const ballSpeed = BALL_INITIAL_SPEED * dc.ballSpeedMultiplier;

  state.ball = {
    x: (CANVAS_WIDTH - BALL_SIZE) / 2,
    y: (CANVAS_HEIGHT - BALL_SIZE) / 2,
    vx: (ballSpeed * dirX) / mag,
    vy: (ballSpeed * dirY) / mag,
  };
}

export function createInitialState(dc: DifficultyConfig = DEFAULT_CONFIG): GameState {
  const paddleH = PADDLE_HEIGHT * dc.paddleHeightMultiplier;
  const paddleY = (CANVAS_HEIGHT - paddleH) / 2;
  const dirX = Math.random() > 0.5 ? 1 : -1;
  const ballSpeed = BALL_INITIAL_SPEED * dc.ballSpeedMultiplier;

  return {
    ball: {
      x: (CANVAS_WIDTH - BALL_SIZE) / 2,
      y: (CANVAS_HEIGHT - BALL_SIZE) / 2,
      vx: ballSpeed * dirX,
      vy: 0,
    },
    paddles: {
      player1: { y: paddleY },
      player2: { y: paddleY },
    },
    score: { player1: 0, player2: 0 },
    status: "countdown",
  };
}
