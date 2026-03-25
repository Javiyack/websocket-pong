import { WebSocketClient } from "../network/WebSocketClient.js";
import { Renderer } from "../rendering/Renderer.js";
import { StateInterpolator } from "../rendering/StateInterpolator.js";
import { InputHandler } from "../input/InputHandler.js";
import { GameState, PlayerRole } from "@shared/types.js";
import { GAME_CONFIG, Difficulty } from "@shared/constants.js";

export type Screen = "lobby" | "waiting" | "game" | "result";

export class ScreenManager {
  private screen: Screen = "lobby";
  private client: WebSocketClient;
  private renderer: Renderer;
  private interpolator: StateInterpolator;
  private inputHandler: InputHandler;
  private app: HTMLElement;
  private canvas: HTMLCanvasElement;
  private animFrame: number | null = null;

  // State
  private myRole: PlayerRole | null = null;
  private roomCode = "";
  private lastState: GameState | null = null;
  private winner: PlayerRole | null = null;
  private finalScore: { player1: number; player2: number } | null = null;
  private waitingRematch = false;
  private selectedDifficulty: Difficulty = "normal";

  constructor(client: WebSocketClient, app: HTMLElement) {
    this.client = client;
    this.app = app;

    this.canvas = document.createElement("canvas");
    this.renderer = new Renderer(this.canvas);
    this.interpolator = new StateInterpolator();
    this.inputHandler = new InputHandler(client);

    window.addEventListener("resize", () => {
      this.renderer.resize();
    });

    this.setupNetworkHandlers();
    this.showLobby();
  }

  private setupNetworkHandlers(): void {
    this.client.on("waiting", (msg: any) => {
      this.roomCode = msg.roomCode;
      this.selectedDifficulty = msg.difficulty || "normal";
      this.transition("waiting");
    });

    this.client.on("start", (msg: any) => {
      this.myRole = msg.role;
      this.waitingRematch = false;
      this.interpolator.reset();
      this.transition("game");
    });

    this.client.on("state", (msg: any) => {
      this.interpolator.push(msg.gameState);
      this.lastState = msg.gameState;
    });

    this.client.on("end", (msg: any) => {
      this.winner = msg.winner;
      this.finalScore = msg.score;
      this.inputHandler.stop();
      this.transition("result");
    });

    this.client.on("opponent_disconnected", () => {
      this.inputHandler.stop();
      this.stopRenderLoop();
      this.showDisconnectOverlay();
    });

    this.client.on("error", (msg: any) => {
      console.warn("[Game] Error:", msg.message);
    });

    this.client.on("close", () => {
      this.inputHandler.stop();
      this.stopRenderLoop();
      this.transition("lobby");
    });
  }

  private transition(screen: Screen): void {
    this.screen = screen;
    this.stopRenderLoop();

    switch (screen) {
      case "lobby":
        this.showLobby();
        break;
      case "waiting":
        this.showWaiting();
        break;
      case "game":
        this.showGame();
        break;
      case "result":
        this.showResult();
        break;
    }
  }

  private showLobby(): void {
    // Check URL for room code
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room");

    this.app.innerHTML = `
      <div style="text-align:center;font-family:'Press Start 2P',monospace;color:#fff">
        <h1 style="font-size:48px;margin-bottom:40px;letter-spacing:8px">PONG</h1>
        <p style="font-size:10px;margin-bottom:30px;color:#888">Multiplayer WebSocket</p>
        <div style="margin-bottom:30px">
          <p style="font-size:10px;margin-bottom:12px;color:#888">DIFICULTAD</p>
          <div id="difficulty-selector" style="display:inline-flex;gap:0">
            <button class="diff-btn" data-diff="easy" style="
              font-family:'Press Start 2P',monospace;font-size:10px;
              padding:10px 16px;cursor:pointer;
              background:#000;color:#888;border:2px solid #555;
              border-right:1px solid #555;
            ">FÁCIL</button>
            <button class="diff-btn" data-diff="normal" style="
              font-family:'Press Start 2P',monospace;font-size:10px;
              padding:10px 16px;cursor:pointer;
              background:#fff;color:#000;border:2px solid #fff;
              border-left:1px solid #fff;border-right:1px solid #fff;
            ">NORMAL</button>
            <button class="diff-btn" data-diff="hard" style="
              font-family:'Press Start 2P',monospace;font-size:10px;
              padding:10px 16px;cursor:pointer;
              background:#000;color:#888;border:2px solid #555;
              border-left:1px solid #555;
            ">DIFÍCIL</button>
          </div>
        </div>
        <button id="btn-create" style="
          font-family:'Press Start 2P',monospace;font-size:14px;
          padding:15px 30px;margin:10px;cursor:pointer;
          background:#fff;color:#000;border:none;
        ">CREAR PARTIDA</button>
        <div style="margin-top:30px">
          <input id="input-code" type="text" maxlength="4" placeholder="CODE"
            value="${urlRoom || ""}"
            style="
              font-family:'Press Start 2P',monospace;font-size:18px;
              padding:10px;width:120px;text-align:center;
              background:#000;color:#fff;border:2px solid #fff;
              text-transform:uppercase;letter-spacing:4px;
            " />
          <button id="btn-join" style="
            font-family:'Press Start 2P',monospace;font-size:14px;
            padding:15px 30px;margin:10px;cursor:pointer;
            background:#fff;color:#000;border:none;
          ">UNIRSE</button>
        </div>
      </div>
    `;

    // Difficulty selector logic
    const diffButtons = document.querySelectorAll<HTMLButtonElement>(".diff-btn");
    const updateDiffButtons = () => {
      diffButtons.forEach((btn) => {
        const isSelected = btn.dataset.diff === this.selectedDifficulty;
        btn.style.background = isSelected ? "#fff" : "#000";
        btn.style.color = isSelected ? "#000" : "#888";
        btn.style.borderColor = isSelected ? "#fff" : "#555";
      });
    };
    diffButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectedDifficulty = btn.dataset.diff as Difficulty;
        updateDiffButtons();
      });
    });

    document.getElementById("btn-create")!.addEventListener("click", () => {
      this.client.send({ type: "join", difficulty: this.selectedDifficulty });
    });

    document.getElementById("btn-join")!.addEventListener("click", () => {
      const code = (document.getElementById("input-code") as HTMLInputElement).value.trim().toUpperCase();
      if (code.length === 4 && /^[A-Z0-9]+$/.test(code)) {
        this.client.send({ type: "join", roomCode: code });
      }
    });

    // Allow Enter key on code input
    document.getElementById("input-code")!.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("btn-join")!.click();
      }
    });
  }

  private showWaiting(): void {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${this.roomCode}`;
    const diffLabel = this.selectedDifficulty === "easy" ? "FÁCIL" : this.selectedDifficulty === "hard" ? "DIFÍCIL" : "NORMAL";

    this.app.innerHTML = `
      <div style="text-align:center;font-family:'Press Start 2P',monospace;color:#fff">
        <p style="font-size:12px;margin-bottom:20px;color:#888">CÓDIGO DE SALA</p>
        <p id="room-code" style="font-size:48px;letter-spacing:12px;margin-bottom:20px">${this.roomCode}</p>
        <p style="font-size:10px;margin-bottom:30px;color:#888">DIFICULTAD: ${diffLabel}</p>
        <p class="blink" style="font-size:12px;margin-bottom:30px">Esperando oponente...</p>
        <button id="btn-copy" style="
          font-family:'Press Start 2P',monospace;font-size:10px;
          padding:10px 20px;cursor:pointer;
          background:#000;color:#fff;border:2px solid #fff;
        ">COPIAR ENLACE</button>
        <style>.blink{animation:b 1s infinite}@keyframes b{0%,100%{opacity:1}50%{opacity:0}}</style>
      </div>
    `;

    document.getElementById("btn-copy")!.addEventListener("click", () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        document.getElementById("btn-copy")!.textContent = "¡COPIADO!";
        setTimeout(() => {
          const btn = document.getElementById("btn-copy");
          if (btn) btn.textContent = "COPIAR ENLACE";
        }, 2000);
      });
    });
  }

  private showGame(): void {
    this.app.innerHTML = "";
    this.app.appendChild(this.canvas);
    this.renderer.resize();
    this.inputHandler.start();
    this.startRenderLoop();
  }

  private showResult(): void {
    this.stopRenderLoop();
    const won = this.winner === this.myRole;
    const p1 = this.finalScore?.player1 ?? 0;
    const p2 = this.finalScore?.player2 ?? 0;

    this.app.innerHTML = `
      <div style="text-align:center;font-family:'Press Start 2P',monospace;color:#fff">
        <p style="font-size:36px;margin-bottom:20px">${won ? "¡GANASTE!" : "PERDISTE"}</p>
        <p style="font-size:48px;margin-bottom:40px">${p1} - ${p2}</p>
        <button id="btn-rematch" style="
          font-family:'Press Start 2P',monospace;font-size:14px;
          padding:15px 30px;margin:10px;cursor:pointer;
          background:#fff;color:#000;border:none;
        ">REVANCHA</button>
        <button id="btn-lobby" style="
          font-family:'Press Start 2P',monospace;font-size:14px;
          padding:15px 30px;margin:10px;cursor:pointer;
          background:#000;color:#fff;border:2px solid #fff;
        ">SALIR</button>
        <p id="rematch-status" style="font-size:10px;margin-top:20px;color:#888"></p>
      </div>
    `;

    document.getElementById("btn-rematch")!.addEventListener("click", () => {
      this.client.send({ type: "rematch" });
      this.waitingRematch = true;
      document.getElementById("rematch-status")!.textContent = "Esperando al oponente...";
    });

    document.getElementById("btn-lobby")!.addEventListener("click", () => {
      this.client.disconnect();
      this.client.connect();
      this.client.on("open", () => this.transition("lobby"));
    });
  }

  private showDisconnectOverlay(): void {
    this.app.innerHTML = `
      <div style="text-align:center;font-family:'Press Start 2P',monospace;color:#fff">
        <p style="font-size:18px;margin-bottom:30px">OPONENTE DESCONECTADO</p>
        <button id="btn-back-lobby" style="
          font-family:'Press Start 2P',monospace;font-size:14px;
          padding:15px 30px;cursor:pointer;
          background:#fff;color:#000;border:none;
        ">VOLVER AL LOBBY</button>
      </div>
    `;

    document.getElementById("btn-back-lobby")!.addEventListener("click", () => {
      this.client.disconnect();
      this.client.connect();
      this.client.on("open", () => this.transition("lobby"));
    });
  }

  private startRenderLoop(): void {
    const loop = () => {
      const state = this.interpolator.getInterpolated();
      if (state) {
        if (state.status === "countdown") {
          const latest = this.interpolator.getLatest();
          // Estimate countdown from tick rate
          const secondsLeft = latest
            ? Math.ceil(GAME_CONFIG.COUNTDOWN_SECONDS - (Date.now() - (this as any)._gameStartTime || Date.now()) / 1000)
            : GAME_CONFIG.COUNTDOWN_SECONDS;
          this.renderer.renderCountdown(state, Math.max(1, secondsLeft));
        } else {
          this.renderer.render(state);
        }
      }
      this.animFrame = requestAnimationFrame(loop);
    };

    (this as any)._gameStartTime = Date.now();
    this.animFrame = requestAnimationFrame(loop);
  }

  private stopRenderLoop(): void {
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }
}
