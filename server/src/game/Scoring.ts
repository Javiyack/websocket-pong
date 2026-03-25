import { GameState, PlayerRole } from "../../../shared/types.js";
import { GAME_CONFIG, DifficultyConfig, DIFFICULTY_SETTINGS } from "../../../shared/constants.js";
import { resetBall } from "./Physics.js";

export interface ScoreResult {
  scored: boolean;
  scorer?: PlayerRole;
  gameOver: boolean;
  winner?: PlayerRole;
}

export function checkScoring(state: GameState, dc: DifficultyConfig = DIFFICULTY_SETTINGS.normal): ScoreResult {
  const ball = state.ball;
  const { CANVAS_WIDTH } = GAME_CONFIG;

  let scorer: PlayerRole | undefined;

  if (ball.x <= 0) {
    scorer = "player2";
  } else if (ball.x >= CANVAS_WIDTH) {
    scorer = "player1";
  }

  if (!scorer) {
    return { scored: false, gameOver: false };
  }

  state.score[scorer]++;

  const gameOver = state.score[scorer] >= dc.winningScore;

  if (gameOver) {
    state.status = "finished";
  } else {
    resetBall(state, dc);
    state.status = "scored";
  }

  return {
    scored: true,
    scorer,
    gameOver,
    winner: gameOver ? scorer : undefined,
  };
}
