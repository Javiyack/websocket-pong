# Historias de Usuario y Tareas — WebSocket-Pong

## 1. Convenciones

- **ID**: `US-XX` para historias de usuario.
- **Formato**: _Como [rol], quiero [acción], para [beneficio]._
- **Tareas**: Desglose técnico de cada historia con ID `US-XX.Y`.
- **Estimación**: Puntos de historia en escala Fibonacci (1, 2, 3, 5, 8). 1 punto ≈ medio día de trabajo.
- **Prioridad**: Alta / Media / Baja.
- **Trazabilidad**: Cada historia referencia los requisitos funcionales (RF) y no funcionales (RNF) que cubre.

---

## 2. Sprint 1 — Setup del Proyecto + Infraestructura WebSocket Base

> **Hito M0**: Entorno listo — el proyecto compila y cliente/servidor se comunican via WebSocket.

---

### US-01 — Estructura del proyecto

**Como** desarrollador, **quiero** un proyecto inicializado con la estructura de carpetas, configuración de TypeScript y herramientas de desarrollo, **para** poder comenzar a implementar funcionalidades de forma productiva.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: O-4

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-01.1 | Crear estructura de carpetas: `client/src/`, `server/src/`, `shared/` | 1h |
| US-01.2 | Inicializar `package.json` raíz con workspaces o scripts centralizados | 1h |
| US-01.3 | Configurar `tsconfig.base.json` con `strict: true` y configs específicas para client y server | 2h |
| US-01.4 | Configurar Vite para el cliente (`vite.config.ts`, `index.html`, `main.ts` placeholder) | 2h |
| US-01.5 | Configurar servidor Node.js con TypeScript (`main.ts` con Express básico) | 2h |
| US-01.6 | Crear script `dev` que levante servidor y Vite en paralelo (ej. `concurrently`) | 1h |
| US-01.7 | Configurar ESLint + Prettier con reglas compartidas | 1h |
| US-01.8 | Crear `.gitignore` y realizar commit inicial | 0.5h |

**Criterio de aceptación**: `npm run dev` levanta servidor en un puerto y cliente Vite en otro sin errores de compilación.

---

### US-02 — Conexión WebSocket básica

**Como** desarrollador, **quiero** que el cliente pueda establecer una conexión WebSocket con el servidor y enviar/recibir mensajes de prueba, **para** validar que la infraestructura de comunicación en tiempo real funciona.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RF-23

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-02.1 | Instalar librería `ws` y tipos `@types/ws` en el servidor | 0.5h |
| US-02.2 | Crear `WebSocketServer.ts`: montar servidor WS sobre Express, manejar eventos `connection`, `message`, `close` | 3h |
| US-02.3 | Crear `WebSocketClient.ts` en el cliente: conectar a `ws://localhost:PORT`, manejar `open`, `message`, `close` | 2h |
| US-02.4 | Implementar echo de prueba: cliente envía mensaje → servidor lo devuelve | 1h |
| US-02.5 | Verificar en consola del navegador y del servidor que los mensajes se intercambian | 0.5h |

**Criterio de aceptación**: Al abrir el cliente en el navegador, la consola muestra que la conexión WS se estableció y un mensaje de prueba fue enviado y recibido.

---

### US-03 — Tipos y constantes compartidas

**Como** desarrollador, **quiero** definir las interfaces de TypeScript y constantes del juego en un módulo compartido, **para** garantizar consistencia entre cliente y servidor en tiempo de compilación.

**Prioridad**: Alta | **Puntos**: 2 | **Requisitos**: O-4

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-03.1 | Crear `shared/types.ts` con interfaces `GameState`, `PlayerInput`, `PlayerRole` | 1h |
| US-03.2 | Crear `shared/messages.ts` con tipos discriminados `ClientMessage` y `ServerMessage` | 1.5h |
| US-03.3 | Crear `shared/constants.ts` con `GAME_CONFIG` (dimensiones, velocidades, puntos para ganar, tick rate) | 1h |
| US-03.4 | Configurar path aliases en ambos `tsconfig` para importar `shared/` correctamente | 1h |
| US-03.5 | Verificar que cliente y servidor importan los tipos sin errores | 0.5h |

**Criterio de aceptación**: Ambos proyectos (client y server) importan tipos de `shared/` y compilan sin errores.

---

### US-04 — Validación de hosting WebSocket

**Como** desarrollador, **quiero** verificar que el proveedor de hosting elegido soporta conexiones WebSocket persistentes, **para** evitar bloqueos en la fase de despliegue.

**Prioridad**: Alta | **Puntos**: 1 | **Requisitos**: RNF-10

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-04.1 | Desplegar el servidor "hello world" con WebSocket en el proveedor candidato (Railway/Render) | 2h |
| US-04.2 | Conectar desde el navegador y verificar que la conexión WSS se mantiene abierta durante 2 min | 1h |
| US-04.3 | Documentar resultado y decisión de proveedor en el README | 0.5h |

**Criterio de aceptación**: Conexión WSS estable durante al menos 2 minutos desde un navegador externo.

---

## 3. Sprint 2 — Servidor: Sistema de Salas y Emparejamiento

> **Hito M1**: Networking funcional — dos clientes se emparejan en una sala via WebSocket.

---

### US-05 — Crear una sala de juego

**Como** jugador, **quiero** crear una nueva sala de juego y recibir un código único, **para** poder compartirlo con mi oponente e iniciar una partida.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RF-01, RF-19

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-05.1 | Crear clase `Room` con estado (`waiting`, `playing`, `finished`, `destroyed`), referencia a jugadores y timestamps | 2h |
| US-05.2 | Crear clase `RoomManager` con `Map<string, Room>`, métodos `createRoom()`, `getRoom()`, `removeRoom()` | 2h |
| US-05.3 | Implementar generador de códigos alfanuméricos de 4 caracteres (sin 0/O, 1/l) para evitar ambigüedad | 1h |
| US-05.4 | Al recibir mensaje `{ type: "join" }` sin `roomCode`, crear sala y responder `{ type: "waiting", roomCode }` | 2h |
| US-05.5 | Asociar la conexión WebSocket del jugador 1 a la sala creada | 1h |

**Criterio de aceptación**: El servidor crea una sala con código único y responde `waiting` con el código al jugador creador.

---

### US-06 — Unirse a una sala existente

**Como** jugador, **quiero** unirme a una sala existente introduciendo el código que me compartió mi oponente, **para** empezar a jugar juntos.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RF-02, RF-03

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-06.1 | Al recibir `{ type: "join", roomCode: "ABCD" }`, buscar sala en `RoomManager` | 1h |
| US-06.2 | Validar que la sala existe y está en estado `waiting` | 1h |
| US-06.3 | Si la sala no existe o está llena, responder `{ type: "error", message: "..." }` | 1h |
| US-06.4 | Asociar la conexión del jugador 2 a la sala; cambiar estado a `playing` | 1h |
| US-06.5 | Emitir `{ type: "start", role: "player1" }` al jugador 1 y `{ type: "start", role: "player2" }` al jugador 2 | 2h |

**Criterio de aceptación**: Dos pestañas: la primera crea sala, la segunda se une con el código; ambas reciben `start` con sus roles asignados.

---

### US-07 — Notificación de desconexión del oponente

**Como** jugador, **quiero** ser notificado inmediatamente si mi oponente se desconecta, **para** saber que la partida no puede continuar.

**Prioridad**: Alta | **Puntos**: 2 | **Requisitos**: RF-04

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-07.1 | En el evento `close` del WebSocket, identificar a qué sala pertenece el jugador desconectado | 1h |
| US-07.2 | Si la sala está en estado `playing`, enviar `{ type: "opponent_disconnected" }` al jugador restante | 1h |
| US-07.3 | Si la sala está en estado `waiting`, destruir la sala directamente | 0.5h |
| US-07.4 | Implementar heartbeat (ping/pong WebSocket nativo) para detectar conexiones muertas sin evento `close` | 2h |

**Criterio de aceptación**: Al cerrar una pestaña, la otra recibe `opponent_disconnected` en menos de 3 segundos.

---

### US-08 — Validación y seguridad de mensajes

**Como** operador del servidor, **quiero** que todos los mensajes entrantes se validen y se aplique rate limiting, **para** prevenir crashes por datos malformados y mitigar abuso.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RNF-11, RNF-12

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-08.1 | Crear `MessageValidator.ts`: verificar JSON válido, tipo conocido, campos requeridos, valores en rango | 3h |
| US-08.2 | Crear `MessageRouter.ts`: deserializar → validar → despachar al handler correcto según `type` | 2h |
| US-08.3 | Crear `RateLimiter.ts`: token bucket (60 tokens/s por conexión); descartar mensajes excedentes | 2h |
| US-08.4 | Si el abuso persiste (3 violaciones consecutivas), cerrar la conexión | 1h |
| US-08.5 | Tests unitarios para MessageValidator con mensajes válidos, inválidos y edge cases | 2h |

**Criterio de aceptación**: Mensajes malformados o excesivos no crashean el servidor; se descartan silenciosamente o se cierra la conexión.

---

### US-09 — Limpieza automática de salas inactivas

**Como** operador del servidor, **quiero** que las salas inactivas se eliminen automáticamente tras 5 minutos, **para** evitar fugas de memoria y salas zombis.

**Prioridad**: Media | **Puntos**: 1 | **Requisitos**: RNF-09

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-09.1 | Añadir campo `lastActivity` a `Room`, actualizado en cada mensaje procesado | 0.5h |
| US-09.2 | En `RoomManager`, crear intervalo de 60 s que recorra las salas y elimine las inactivas > 5 min | 1.5h |
| US-09.3 | Al eliminar una sala con jugadores conectados, notificarlos antes de cerrar | 1h |

**Criterio de aceptación**: Una sala sin actividad durante 5 minutos no aparece en el mapa de salas del servidor.

---

## 4. Sprint 3 — Servidor: Game Loop y Motor de Física

> **Hito M2**: Motor de juego operativo — game loop con física y marcador funcional.

---

### US-10 — Mover la paleta en tiempo real

**Como** jugador, **quiero** que al presionar una tecla de dirección mi paleta se mueva inmediatamente en el servidor, **para** poder interceptar la pelota.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RF-07, RF-23, RF-25

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-10.1 | Crear `GameLoop.ts` con `setInterval` a tick rate configurable (30 Hz por defecto); calcular delta time | 3h |
| US-10.2 | Mantener cola FIFO de inputs por jugador; procesar al inicio de cada tick | 2h |
| US-10.3 | Actualizar posición `y` de la paleta según dirección (`up`/`down`/`stop`) y `PADDLE_SPEED * dt` | 1.5h |
| US-10.4 | Aplicar clamping: la paleta no puede salir de los bordes del campo | 0.5h |
| US-10.5 | Integrar `GameLoop` en `Room`: instanciar al recibir `start`, destruir al terminar | 1h |

**Criterio de aceptación**: El servidor procesa inputs y la posición de la paleta cambia en el estado emitido a los clientes.

---

### US-11 — Pelota en movimiento con rebotes

**Como** jugador, **quiero** ver la pelota moviéndose continuamente y rebotando en los bordes del campo, **para** experimentar la mecánica central del Pong.

**Prioridad**: Alta | **Puntos**: 5 | **Requisitos**: RF-08, RF-13, RF-25

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-11.1 | Crear `Physics.ts` como módulo puro (sin side effects): recibe estado, retorna estado actualizado | 1h |
| US-11.2 | Implementar movimiento de la pelota: `x += vx * dt`, `y += vy * dt` | 1h |
| US-11.3 | Implementar colisión con bordes superior/inferior: invertir `vy`, ajustar posición para evitar penetración | 1.5h |
| US-11.4 | Implementar colisión con paletas usando swept collision para prevenir tunneling | 3h |
| US-11.5 | Variar el ángulo de rebote según el punto de impacto relativo al centro de la paleta | 2h |
| US-11.6 | Tests unitarios: rebote en bordes, rebote en paleta centro, rebote en paleta borde, tunneling a velocidad máxima | 3h |

**Criterio de aceptación**: La pelota rebota en bordes y paletas sin atravesarlos; el ángulo varía según el punto de impacto. Tests pasan.

---

### US-12 — Aceleración progresiva de la pelota

**Como** jugador, **quiero** que la pelota se acelere durante cada rally, **para** que la partida sea cada vez más intensa y desafiante.

**Prioridad**: Media | **Puntos**: 2 | **Requisitos**: RF-12

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-12.1 | Tras cada colisión con una paleta, incrementar la magnitud de la velocidad en `BALL_SPEED_INCREMENT` | 1h |
| US-12.2 | Respetar `BALL_MAX_SPEED`: si la velocidad alcanza el máximo, no incrementar más | 0.5h |
| US-12.3 | Reiniciar la velocidad a `BALL_INITIAL_SPEED` tras cada gol | 0.5h |
| US-12.4 | Test unitario: verificar que la velocidad crece y se limita correctamente | 1h |

**Criterio de aceptación**: La velocidad de la pelota crece con cada rebote en paleta y nunca supera el máximo configurado.

---

### US-13 — Sistema de puntuación y fin de partida

**Como** jugador, **quiero** que se anote un punto cuando la pelota pasa la paleta del oponente y que la partida termine al llegar a 11 puntos, **para** tener una partida con objetivo claro.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RF-09, RF-10, RF-11

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-13.1 | Crear `Scoring.ts`: detectar cuando `ball.x` supera los límites izquierdo/derecho del campo | 1.5h |
| US-13.2 | Incrementar el marcador del jugador contrario al detectar gol | 0.5h |
| US-13.3 | Emitir mensaje `{ type: "score", scorer, score }` a ambos clientes | 1h |
| US-13.4 | Reiniciar la pelota en el centro con velocidad inicial y dirección aleatoria tras gol | 1h |
| US-13.5 | Detectar fin de partida cuando `score >= WINNING_SCORE`; emitir `{ type: "end", winner, score }` y detener game loop | 1.5h |
| US-13.6 | Tests: verificar gol, incremento de marcador, reinicio de pelota, fin de partida | 2h |

**Criterio de aceptación**: Los goles se detectan, el marcador se actualiza, la pelota se reinicia y la partida termina a los 11 puntos.

---

### US-14 — Emisión del estado del juego a los clientes

**Como** cliente, **quiero** recibir el estado completo del juego a una tasa fija, **para** poder renderizar la partida en tiempo real.

**Prioridad**: Alta | **Puntos**: 2 | **Requisitos**: RF-24, RF-25

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-14.1 | Al final de cada tick del game loop, serializar el `GameState` a JSON | 0.5h |
| US-14.2 | Enviar `{ type: "state", gameState, tick }` a ambas conexiones WebSocket de la sala | 1h |
| US-14.3 | Incluir número de tick para que el cliente pueda descartar estados fuera de orden | 0.5h |
| US-14.4 | Verificar que los mensajes se envían a 30 Hz estables midiendo intervalos | 1h |

**Criterio de aceptación**: Ambos clientes reciben mensajes `state` a ~30 Hz con el estado completo del juego y número de tick.

---

## 5. Sprint 4 — Cliente: Renderizado Canvas y Estética Retro

> **Hito M3**: Renderizado completo — canvas retro a 60 FPS con interpolación.

---

### US-15 — Ver el campo de juego con estética retro

**Como** jugador, **quiero** ver un campo de juego con fondo negro, paletas blancas, pelota y línea central, **para** experimentar la estética del Pong original.

**Prioridad**: Alta | **Puntos**: 5 | **Requisitos**: RF-14, RF-15, RF-16

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-15.1 | Crear elemento `<canvas>` en `index.html`; aplicar estilos CSS (fondo negro, centrado, sin bordes) | 1h |
| US-15.2 | Crear `Renderer.ts` con método `render(state: GameState)` que borra y redibuja el canvas completo | 2h |
| US-15.3 | Dibujar fondo negro (`#000`) cubriendo todo el canvas | 0.5h |
| US-15.4 | Dibujar paletas como rectángulos blancos (`#FFF`) en las posiciones del estado | 1h |
| US-15.5 | Dibujar la pelota como cuadrado blanco en la posición del estado | 0.5h |
| US-15.6 | Dibujar la línea central como segmentos discontinuos (patrón de rayas) | 1h |
| US-15.7 | Cargar fuente pixelada (ej. "Press Start 2P") y verificar que está disponible antes de renderizar | 1h |

**Criterio de aceptación**: El canvas muestra todos los elementos del juego exclusivamente en blanco sobre negro, con la línea central discontinua.

---

### US-16 — Ver el marcador en tiempo real

**Como** jugador, **quiero** ver el marcador actualizado en la parte superior del campo, **para** saber el estado de la partida en todo momento.

**Prioridad**: Alta | **Puntos**: 2 | **Requisitos**: RF-17

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-16.1 | En `Renderer.ts`, dibujar el marcador de ambos jugadores en la parte superior del canvas con tipografía pixelada | 1.5h |
| US-16.2 | Posicionar los marcadores a cada lado de la línea central (simétricos) | 0.5h |
| US-16.3 | Escalar el tamaño de la tipografía proporcionalmente al tamaño del canvas | 1h |

**Criterio de aceptación**: El marcador se muestra con fuente pixelada en la parte superior, actualizado en cada frame según el estado recibido.

---

### US-17 — Animación fluida a 60 FPS

**Como** jugador, **quiero** que la pelota y las paletas se muevan suavemente sin saltos, **para** tener una experiencia visual agradable aunque el servidor envíe actualizaciones a 30 Hz.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RNF-01

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-17.1 | Crear `StateInterpolator.ts`: almacenar los 2 últimos estados recibidos con timestamp | 2h |
| US-17.2 | Calcular factor de interpolación α en cada frame: `α = (t_frame - t0) / (t1 - t0)` | 1h |
| US-17.3 | Interpolar linealmente posiciones de pelota y paletas: `pos = pos0 + (pos1 - pos0) * α` | 1.5h |
| US-17.4 | Si no llega nuevo estado a tiempo, congelar en la última posición conocida (no extrapolar) | 1h |
| US-17.5 | Crear render loop con `requestAnimationFrame`: interpolar → renderizar en cada frame | 1h |

**Criterio de aceptación**: Chrome Performance Monitor muestra 60 FPS estables; el movimiento es suave sin saltos visibles entre ticks del servidor.

---

### US-18 — Controlar la paleta con el teclado

**Como** jugador, **quiero** mover mi paleta hacia arriba y abajo con las teclas de flecha o W/S, **para** jugar la partida usando el teclado.

**Prioridad**: Alta | **Puntos**: 2 | **Requisitos**: RF-21, RF-23

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-18.1 | Crear `InputHandler.ts`: escuchar eventos `keydown` y `keyup` para teclas ArrowUp, ArrowDown, W, S | 1.5h |
| US-18.2 | Normalizar input a `"up"` / `"down"` / `"stop"` | 0.5h |
| US-18.3 | Solo enviar mensaje `input` al servidor cuando el estado de dirección **cambia** (no en cada keydown) | 1h |
| US-18.4 | Prevenir scroll del navegador al presionar teclas de flecha (`event.preventDefault()`) | 0.5h |

**Criterio de aceptación**: Presionar flechas o W/S envía inputs al servidor; la paleta se mueve en la pantalla. No hay scroll indeseado.

---

### US-19 — Campo de juego responsive

**Como** jugador, **quiero** que el campo de juego se adapte al tamaño de mi ventana o pantalla, **para** poder jugar en cualquier dispositivo o resolución.

**Prioridad**: Media | **Puntos**: 2 | **Requisitos**: RNF-05

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-19.1 | Calcular factor de escala basado en las dimensiones del viewport manteniendo aspect ratio 4:3 | 1h |
| US-19.2 | Aplicar el factor de escala a todas las coordenadas de dibujo en `Renderer.ts` | 1.5h |
| US-19.3 | Agregar listener `window.resize` para recalcular el factor de escala y el tamaño del canvas | 1h |
| US-19.4 | Aplicar CSS `image-rendering: pixelated` para mantener bordes duros al escalar | 0.5h |

**Criterio de aceptación**: El canvas mantiene la proporción y los elementos son visibles desde 320 px hasta 1920 px.

---

## 6. Sprint 5 — Integración End-to-End y Pantallas de UI

> **Hito M4**: Juego jugable end-to-end — partida completa desde lobby hasta resultado.

---

### US-20 — Pantalla de lobby para crear o unirse a una partida

**Como** jugador, **quiero** ver una pantalla de inicio donde pueda crear una nueva partida o unirme a una existente con un código, **para** empezar a jugar de forma rápida e intuitiva.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RF-18

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-20.1 | Crear `ScreenManager.ts`: máquina de estados que gestiona las transiciones Lobby → Waiting → Game → Result | 2h |
| US-20.2 | Crear `LobbyScreen.ts`: renderizar título "PONG" con fuente retro, botón "Crear partida" y campo + botón "Unirse" | 2h |
| US-20.3 | Al pulsar "Crear partida", enviar mensaje `join` sin código al servidor | 0.5h |
| US-20.4 | Al pulsar "Unirse", enviar mensaje `join` con el código introducido | 0.5h |
| US-20.5 | Validar en el cliente que el código tenga 4 caracteres alfanuméricos antes de enviarlo | 0.5h |

**Criterio de aceptación**: La pantalla de lobby se muestra al cargar la app; ambos flujos (crear/unirse) envían los mensajes correctos al servidor.

---

### US-21 — Pantalla de espera con código de sala

**Como** jugador que creó una sala, **quiero** ver el código de la sala y un indicador de espera, **para** poder compartir el código con mi oponente y saber que el sistema está esperando su conexión.

**Prioridad**: Alta | **Puntos**: 2 | **Requisitos**: RF-19

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-21.1 | Transicionar a `WaitingScreen` al recibir mensaje `waiting` del servidor | 0.5h |
| US-21.2 | Mostrar el código de sala en grande con fuente retro | 1h |
| US-21.3 | Generar URL compartible (`?room=ABCD`) y mostrar botón "Copiar enlace" que copia al portapapeles | 1.5h |
| US-21.4 | Añadir animación de texto parpadeante "Esperando oponente..." | 1h |
| US-21.5 | Al recibir `start`, transicionar automáticamente a la pantalla de juego | 0.5h |

**Criterio de aceptación**: El código se muestra claramente; el botón copia la URL al portapapeles; la transición al juego es automática al conectarse el oponente.

---

### US-22 — Cuenta regresiva antes de iniciar

**Como** jugador, **quiero** ver una cuenta regresiva 3-2-1 antes de que comience la partida, **para** prepararme y no ser sorprendido por la pelota.

**Prioridad**: Baja | **Puntos**: 2 | **Requisitos**: RF-20

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-22.1 | Al recibir `start`, mostrar overlay en el canvas con números 3, 2, 1 en secuencia (1 segundo cada uno) | 2h |
| US-22.2 | Renderizar los números con fuente retro grande y centrados | 1h |
| US-22.3 | El game loop del servidor espera 3 s antes de empezar a mover la pelota (estado `countdown`) | 1h |
| US-22.4 | Al terminar la cuenta regresiva, ocultar overlay y empezar animación normal | 0.5h |

**Criterio de aceptación**: Se muestra 3-2-1 centrado en el campo; la pelota no se mueve hasta que termina la cuenta.

---

### US-23 — Pantalla de resultado con marcador final

**Como** jugador, **quiero** ver el resultado final de la partida al terminar, **para** saber quién ganó y decidir si quiero jugar otra vez.

**Prioridad**: Media | **Puntos**: 2 | **Requisitos**: RF-05

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-23.1 | Al recibir mensaje `end`, transicionar a `ResultScreen` | 0.5h |
| US-23.2 | Mostrar marcador final, texto "¡GANASTE!" o "PERDISTE" según el rol del jugador | 1.5h |
| US-23.3 | Mostrar botón "Revancha" y botón "Salir al lobby" | 1h |
| US-23.4 | Estilizar con estética retro (fuente pixelada, colores monocromáticos) | 1h |

**Criterio de aceptación**: La pantalla de resultado muestra el marcador correcto y el texto apropiado según si el jugador ganó o perdió.

---

### US-24 — Revancha sin salir de la sala

**Como** jugador, **quiero** pedir una revancha al terminar la partida sin tener que crear una nueva sala, **para** seguir jugando rápidamente con el mismo oponente.

**Prioridad**: Baja | **Puntos**: 3 | **Requisitos**: RF-06

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-24.1 | Al pulsar "Revancha", enviar mensaje `{ type: "rematch" }` al servidor | 0.5h |
| US-24.2 | En el servidor, rastrear qué jugadores pidieron revancha en la sala | 1h |
| US-24.3 | Cuando ambos jugadores piden revancha, reiniciar el estado del juego y emitir `start` nuevamente | 2h |
| US-24.4 | Si solo un jugador pide revancha, mostrar "Esperando al oponente..." en la pantalla de resultado | 1h |
| US-24.5 | Si el oponente sale al lobby en vez de aceptar, notificar al jugador que esperaba | 1h |

**Criterio de aceptación**: Ambos jugadores presionan "Revancha" → se inicia nueva partida con marcador 0-0 sin recargar la página.

---

### US-25 — Reconexión automática tras corte breve

**Como** jugador, **quiero** que el juego intente reconectarme automáticamente si pierdo la conexión por unos segundos, **para** no perder la partida por un problema de red momentáneo.

**Prioridad**: Media | **Puntos**: 3 | **Requisitos**: RNF-08

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-25.1 | En `WebSocketClient.ts`, detectar evento `close` e iniciar reconexión con backoff exponencial (500 ms → 1 s → 2 s → 5 s) | 2h |
| US-25.2 | Mostrar overlay "Reconectando..." en el canvas durante el intento | 1h |
| US-25.3 | En el servidor, mantener la sala del jugador desconectado durante 5 s antes de declararla terminada | 2h |
| US-25.4 | Si el jugador reconecta dentro de la ventana de gracia, re-asociar su conexión a la sala y reanudar | 2h |
| US-25.5 | Si la reconexión falla tras 5 s, mostrar mensaje de error y redirigir al lobby | 1h |

**Criterio de aceptación**: Desactivar red durante 3 s → el cliente reconecta y el juego continúa. Desactivar durante 6 s → se muestra error y se vuelve al lobby.

---

### US-26 — Notificación visual de desconexión del oponente

**Como** jugador, **quiero** ver un mensaje claro si mi oponente se desconecta, **para** saber por qué la partida se detuvo y poder volver al lobby.

**Prioridad**: Media | **Puntos**: 1 | **Requisitos**: RF-04

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-26.1 | Al recibir `opponent_disconnected`, mostrar overlay "Oponente desconectado" sobre el canvas | 1h |
| US-26.2 | Incluir botón "Volver al lobby" en el overlay | 0.5h |
| US-26.3 | Al pulsar el botón, cerrar la conexión WS actual y transicionar a `LobbyScreen` | 0.5h |

**Criterio de aceptación**: Al cerrarse la pestaña del oponente, el jugador restante ve el overlay con opción de volver al lobby.

---

## 7. Sprint 6 — Testing, Pulido y Despliegue

> **Hito M5**: Producción — aplicación desplegada, testeada y accesible públicamente.

---

### US-27 — Jugar una partida completa en producción

**Como** jugador, **quiero** acceder al juego desde una URL pública y jugar una partida completa con alguien en otro dispositivo, **para** disfrutar del juego sin necesidad de configuración local.

**Prioridad**: Alta | **Puntos**: 5 | **Requisitos**: RNF-10

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-27.1 | Crear build de producción del cliente (`vite build`) | 1h |
| US-27.2 | Configurar el servidor para servir archivos estáticos del build del cliente | 1h |
| US-27.3 | Configurar WSS con TLS en producción (certificado del proveedor o Let's Encrypt) | 2h |
| US-27.4 | Configurar variables de entorno: `PORT`, `NODE_ENV`, `WS_URL` | 1h |
| US-27.5 | Desplegar en el proveedor elegido (Railway/Render/VPS) | 2h |
| US-27.6 | Smoke test: dos dispositivos juegan partida completa a través de la URL pública | 1h |
| US-27.7 | Verificar que la conexión WSS se mantiene estable durante una partida completa | 1h |

**Criterio de aceptación**: Dos personas en distintos dispositivos/redes juegan una partida completa a través de la URL pública sin errores.

---

### US-28 — Estabilidad bajo carga

**Como** operador del servidor, **quiero** verificar que el servidor maneja 50 salas simultáneas sin degradación, **para** garantizar una experiencia aceptable a múltiples usuarios.

**Prioridad**: Alta | **Puntos**: 3 | **Requisitos**: RNF-06

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-28.1 | Crear script de prueba de carga que abre 100 conexiones WebSocket y crea 50 salas con inputs simulados | 3h |
| US-28.2 | Monitorear CPU, memoria y tick rate durante la prueba (5 min de duración) | 1h |
| US-28.3 | Verificar: CPU < 70%, memoria < 256 MB, tick rate estable en todas las salas | 1h |
| US-28.4 | Si hay degradación, perfilar y optimizar los cuellos de botella | 3h |

**Criterio de aceptación**: 50 salas simultáneas con CPU < 70%, memoria < 256 MB y tick rate de 30 Hz ± 2 durante 5 min.

---

### US-29 — Resiliencia ante mensajes maliciosos

**Como** operador del servidor, **quiero** verificar que el servidor es resistente a mensajes malformados y abuso, **para** garantizar estabilidad en producción.

**Prioridad**: Alta | **Puntos**: 2 | **Requisitos**: RNF-11, RNF-12

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-29.1 | Crear script de fuzzing: enviar 100 mensajes JSON inválidos, campos faltantes, tipos incorrectos, strings excesivamente largos | 2h |
| US-29.2 | Verificar que el servidor no crashea y que los mensajes son rechazados | 1h |
| US-29.3 | Crear script de rate limit test: enviar 200 msg/s y verificar que se descartan los excedentes | 1h |
| US-29.4 | Verificar que el rate limiter cierra la conexión ante abuso persistente | 0.5h |

**Criterio de aceptación**: 0 crashes tras 100 mensajes inválidos; rate limiter descarta > 60 msg/s y desconecta tras abuso.

---

### US-30 — Compatibilidad entre navegadores

**Como** jugador, **quiero** poder jugar desde Chrome, Firefox, Edge o Safari, **para** no depender de un navegador específico.

**Prioridad**: Media | **Puntos**: 2 | **Requisitos**: RNF-04

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-30.1 | Probar flujo completo en Chrome (últimas 2 versiones): lobby → juego → resultado | 1h |
| US-30.2 | Probar flujo completo en Firefox (últimas 2 versiones) | 1h |
| US-30.3 | Probar flujo completo en Edge (últimas 2 versiones) | 0.5h |
| US-30.4 | Probar flujo completo en Safari (últimas 2 versiones) | 1h |
| US-30.5 | Documentar y corregir cualquier incompatibilidad encontrada | 2h |

**Criterio de aceptación**: Juego funcional a 60 FPS sin errores de consola en los 4 navegadores.

---

### US-31 — Documentación de uso y despliegue

**Como** desarrollador o contribuidor, **quiero** un README actualizado con instrucciones claras de instalación, desarrollo y despliegue, **para** poder trabajar en el proyecto o desplegarlo fácilmente.

**Prioridad**: Media | **Puntos**: 1 | **Requisitos**: —

| Tarea | Descripción | Estimación |
|-------|-------------|------------|
| US-31.1 | Actualizar README con: descripción del proyecto, captura de pantalla del juego, instrucciones de instalación | 1h |
| US-31.2 | Documentar comandos: `npm run dev`, `npm run build`, `npm test` | 0.5h |
| US-31.3 | Documentar proceso de despliegue y variables de entorno requeridas | 0.5h |
| US-31.4 | Añadir sección de tecnologías utilizadas con enlaces | 0.5h |

**Criterio de aceptación**: Un desarrollador nuevo puede clonar el repo, instalar dependencias y ejecutar el proyecto siguiendo solo el README.

---

## 8. Resumen: Historias por Sprint

| Sprint | Historias | Puntos totales |
|--------|-----------|----------------|
| Sprint 1 — Setup + Infra WS | US-01, US-02, US-03, US-04 | 9 |
| Sprint 2 — Salas y Emparejamiento | US-05, US-06, US-07, US-08, US-09 | 12 |
| Sprint 3 — Game Loop y Física | US-10, US-11, US-12, US-13, US-14 | 15 |
| Sprint 4 — Renderizado y Estética | US-15, US-16, US-17, US-18, US-19 | 14 |
| Sprint 5 — Integración E2E y UI | US-20, US-21, US-22, US-23, US-24, US-25, US-26 | 16 |
| Sprint 6 — Testing y Despliegue | US-27, US-28, US-29, US-30, US-31 | 13 |
| **Total** | **31 historias** | **79 puntos** |

---

## 9. Matriz de Trazabilidad: Historias → Requisitos

| Requisito | Historia(s) |
|-----------|-------------|
| RF-01 | US-05 |
| RF-02 | US-06 |
| RF-03 | US-06 |
| RF-04 | US-07, US-26 |
| RF-05 | US-23 |
| RF-06 | US-24 |
| RF-07 | US-10 |
| RF-08 | US-11 |
| RF-09 | US-13 |
| RF-10 | US-13 |
| RF-11 | US-13 |
| RF-12 | US-12 |
| RF-13 | US-11 |
| RF-14 | US-15 |
| RF-15 | US-15 |
| RF-16 | US-15 |
| RF-17 | US-16 |
| RF-18 | US-20 |
| RF-19 | US-05, US-21 |
| RF-20 | US-22 |
| RF-21 | US-18 |
| RF-23 | US-02, US-10, US-18 |
| RF-24 | US-14 |
| RF-25 | US-10, US-11, US-13, US-14 |
| RNF-01 | US-17 |
| RNF-05 | US-19 |
| RNF-06 | US-28 |
| RNF-08 | US-25 |
| RNF-09 | US-09 |
| RNF-10 | US-04, US-27 |
| RNF-11 | US-08, US-29 |
| RNF-12 | US-08, US-29 |
| RNF-04 | US-30 |
