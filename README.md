# WebSocket Pong 🏓

Juego multijugador en tiempo real del clásico Pong con estética retro, construido con WebSocket.

## Tecnologías

- **TypeScript** — Lenguaje principal (strict mode)
- **Node.js + Express** — Servidor HTTP y WebSocket
- **ws** — Librería WebSocket para Node.js
- **Vite** — Bundler del cliente con HMR
- **HTML5 Canvas** — Renderizado 2D con estética retro
- **"Press Start 2P"** — Fuente pixelada de Google Fonts

## Arquitectura

- **Servidor autoritativo**: toda la lógica de juego se ejecuta en el servidor a 30 Hz
- **Cliente interpolado**: renderiza a 60 FPS con interpolación lineal entre estados del servidor
- **Protocolo JSON**: mensajes tipados sobre WebSocket (join, input, rematch, state, score, end)

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
git clone <repo-url>
cd websocket-pong
npm install
```

## Desarrollo

```bash
npm run dev
```

Inicia el servidor (puerto 3000) y el cliente Vite (puerto 5173) en paralelo.

- Cliente: http://localhost:5173
- Servidor WS: ws://localhost:3000

## Producción

```bash
npm run build
npm start
```

Construye el cliente con Vite y arranca el servidor Express sirviendo los archivos estáticos.

## Variables de entorno

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `PORT` | `3000` | Puerto del servidor |
| `NODE_ENV` | `development` | Modo de ejecución |

## Cómo jugar

1. Abre la app en el navegador
2. Pulsa **CREAR PARTIDA** para generar una sala
3. Comparte el código de 4 letras (o el enlace) con tu oponente
4. El oponente introduce el código y pulsa **UNIRSE**
5. Cuenta regresiva 3-2-1 y a jugar

### Controles

| Tecla | Acción |
|-------|--------|
| `↑` / `W` | Mover paleta arriba |
| `↓` / `S` | Mover paleta abajo |

## Estructura del proyecto

```
websocket-pong/
├── shared/           # Tipos, mensajes y constantes compartidos
│   ├── types.ts
│   ├── messages.ts
│   └── constants.ts
├── server/
│   ├── src/
│   │   ├── main.ts             # Entry point del servidor
│   │   ├── game/
│   │   │   ├── GameLoop.ts     # Loop a 30Hz con countdown
│   │   │   ├── Physics.ts      # Movimiento, colisiones, rebotes
│   │   │   └── Scoring.ts      # Detección de gol y fin de partida
│   │   ├── rooms/
│   │   │   ├── Room.ts         # Sala de juego
│   │   │   └── RoomManager.ts  # Gestión de salas y códigos
│   │   ├── network/
│   │   │   ├── MessageRouter.ts  # Dispatch de mensajes
│   │   │   └── RateLimiter.ts    # Token bucket 60 msg/s
│   │   └── validation/
│   │       └── MessageValidator.ts
│   └── tests/
│       ├── load-test.ts        # Prueba de carga (50 salas)
│       └── fuzz-test.ts        # Prueba de fuzzing
├── client/
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── network/
│       │   └── WebSocketClient.ts
│       ├── rendering/
│       │   ├── Renderer.ts          # Canvas 2D retro
│       │   └── StateInterpolator.ts  # Interpolación 60FPS
│       ├── input/
│       │   └── InputHandler.ts
│       └── screens/
│           └── ScreenManager.ts  # Lobby/Waiting/Game/Result
└── docs/
    ├── REQUIREMENTS.md
    ├── PROJECT_PLAN.md
    ├── ARCHITECTURE.md
    ├── CHALLENGES.md
    ├── SUCCESS_CRITERIA.md
    ├── SPRINTS.md
    └── USER_STORIES.md
```

## Tests

```bash
# Prueba de carga (requiere servidor corriendo)
npx tsx server/tests/load-test.ts 50

# Prueba de fuzzing (requiere servidor corriendo)
npx tsx server/tests/fuzz-test.ts
```

## Navegadores soportados

- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Edge (últimas 2 versiones)
- Safari (últimas 2 versiones)
