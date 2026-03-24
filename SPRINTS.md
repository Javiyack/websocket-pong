# Sprints e Hitos — WebSocket-Pong

## 1. Metodología

El proyecto se organiza en **6 sprints de 1 semana** (5 días laborales cada uno). Cada sprint tiene objetivos concretos, entregables verificables y un hito asociado. Al final de cada sprint se realiza una revisión para validar los criterios de aceptación antes de avanzar.

---

## 2. Visión General

```
Sprint 1       Sprint 2       Sprint 3       Sprint 4       Sprint 5       Sprint 6
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│ Setup  │───►│Servidor│───►│Servidor│───►│Cliente │───►│Integra-│───►│Testing │
│  +     │    │ Salas  │    │  Game  │    │Render +│    │  ción  │    │  +     │
│Infra WS│    │  + WS  │    │  Loop  │    │Estética│    │End-2-End│   │Deploy  │
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘    └────────┘
    M0             M1             M2            M3            M4            M5
```

---

## 3. Detalle de Sprints

### Sprint 1 — Setup del Proyecto + Infraestructura WebSocket Base

**Duración**: Semana 1 (días 1–5)
**Fases del plan**: Fase 0 + inicio de Fase 1

#### Objetivos
1. Inicializar el proyecto con la estructura completa de carpetas.
2. Configurar el entorno de desarrollo (TypeScript, Vite, scripts).
3. Establecer la conexión WebSocket básica entre cliente y servidor.

#### Tareas

| Día | Tarea | Detalle |
|-----|-------|---------|
| 1 | Inicializar repositorio | Crear estructura `client/`, `server/`, `shared/`; `package.json`; `.gitignore` |
| 1 | Configurar TypeScript | `tsconfig.base.json`, configs para client y server |
| 2 | Configurar Vite para el cliente | `vite.config.ts`, `index.html`, `main.ts` básico |
| 2 | Configurar servidor Node.js | `main.ts` con Express + `ws`; script de compilación |
| 3 | Script de desarrollo | Comando `dev` que levante servidor y Vite en paralelo |
| 3 | ESLint + Prettier | Configuración compartida |
| 4 | WebSocket básico en servidor | Aceptar conexiones, log de eventos (`open`, `close`, `message`) |
| 4 | WebSocket básico en cliente | Conectar al servidor, enviar/recibir mensaje de prueba |
| 5 | Definir tipos compartidos | `shared/types.ts`, `shared/messages.ts`, `shared/constants.ts` con los tipos iniciales |
| 5 | Spike de despliegue | Desplegar el "hello world" WebSocket en el proveedor elegido para validar soporte WSS |

#### Entregables
- Proyecto compilable y ejecutable con `npm run dev`.
- Cliente y servidor se comunican via WebSocket (verificable en consola).
- Tipos compartidos importables desde ambos lados.

#### Hito M0 — Entorno Listo
| Criterio de aceptación | Método de verificación |
|-------------------------|------------------------|
| El proyecto compila sin errores TypeScript | `npm run build` exitoso |
| El servidor arranca y acepta conexiones WebSocket | Log en consola del servidor |
| El cliente se conecta al servidor | Log en consola del navegador |
| WSS funciona en el proveedor de hosting elegido | Prueba de conexión desde el navegador |

---

### Sprint 2 — Servidor: Sistema de Salas y Emparejamiento

**Duración**: Semana 2 (días 6–10)
**Fases del plan**: Fase 1 (completar)

#### Objetivos
1. Implementar el sistema completo de salas (crear, unirse, destruir).
2. Implementar el emparejamiento de jugadores.
3. Implementar seguridad básica (validación, rate limiting).

#### Tareas

| Día | Tarea | Detalle |
|-----|-------|---------|
| 6 | RoomManager | Crear sala, generar código único, almacenar en Map |
| 6 | Room | Clase con estado, referencias a jugadores, ciclo de vida |
| 7 | Mensaje `join` (crear sala) | Cliente envía `join` sin código → servidor crea sala y responde `waiting` |
| 7 | Mensaje `join` (unirse) | Cliente envía `join` con código → servidor busca sala y empareja |
| 8 | Evento `start` | Cuando ambos jugadores conectados, emitir `start` con roles |
| 8 | Desconexión | Detectar `close`, notificar oponente, liberar sala según estado |
| 9 | MessageRouter | Despacho centralizado de mensajes a los handlers correctos |
| 9 | MessageValidator | Validar estructura, tipo y valores de cada mensaje |
| 10 | RateLimiter | Token bucket por conexión (60 msg/s) |
| 10 | Limpieza de salas | Cron interno que elimina salas inactivas cada 60 s (timeout 5 min) |

#### Entregables
- Dos clientes (pestañas del navegador) pueden crear/unirse a una sala y ver `start`.
- Desconexión de un cliente notifica al otro.
- Mensajes inválidos son rechazados sin crashear el servidor.

#### Hito M1 — Networking Funcional
| Criterio de aceptación | Método de verificación |
|-------------------------|------------------------|
| Crear sala genera un código de 4 caracteres | Verificar en consola/UI |
| Segundo jugador se une con el código y ambos reciben `start` | Prueba con dos pestañas |
| Cerrar una pestaña envía `opponent_disconnected` a la otra | Prueba manual |
| Enviar JSON inválido no crashea el servidor | Enviar basura desde DevTools |
| Salas sin actividad se eliminan tras 5 min | Verificar con logs |

---

### Sprint 3 — Servidor: Game Loop y Motor de Física

**Duración**: Semana 3 (días 11–15)
**Fases del plan**: Fase 2

#### Objetivos
1. Implementar el game loop autoritativo con tick rate fijo.
2. Implementar la física completa (movimiento, colisiones, marcador).
3. Emitir estado del juego a los clientes cada tick.

#### Tareas

| Día | Tarea | Detalle |
|-----|-------|---------|
| 11 | GameLoop | `setInterval` a 30 Hz con delta time; estructura del bucle |
| 11 | Procesar inputs | Cola FIFO de inputs por jugador; actualizar posición de paletas |
| 12 | Physics: movimiento pelota | Actualizar posición según velocidad y delta time |
| 12 | Physics: colisión con bordes | Invertir `vy` al tocar borde superior/inferior |
| 13 | Physics: colisión con paletas | Swept collision; invertir `vx`; variar `vy` según punto de impacto |
| 13 | Physics: aceleración | Incrementar velocidad tras cada colisión con paleta; respetar máximo |
| 14 | Scoring | Detectar gol; actualizar marcador; reiniciar pelota en centro |
| 14 | Fin de partida | Detectar marcador ganador (11 pts); emitir evento `end` |
| 15 | Emitir estado | Enviar `state` a ambos clientes cada tick con el estado completo |
| 15 | Tests unitarios | Tests para Physics (colisiones, tunneling, velocidad max) y Scoring |

#### Entregables
- Game loop ejecutándose a 30 Hz estable.
- Física simulada correctamente (verificable con logs o cliente de debug).
- Clientes reciben mensajes `state` con posiciones actualizadas.

#### Hito M2 — Motor de Juego Operativo
| Criterio de aceptación | Método de verificación |
|-------------------------|------------------------|
| Tick rate estable a 30 Hz (± 2) durante 5 minutos | Log de intervalos entre ticks |
| Pelota rebota en bordes y paletas sin atravesarlos | Tests unitarios pasan |
| Gol se detecta y marcador se actualiza | Test de integración |
| Partida termina al llegar a 11 puntos | Test de integración |
| Clientes reciben mensajes `state` a 30 Hz | Verificar en DevTools Network |

---

### Sprint 4 — Cliente: Renderizado Canvas y Estética Retro

**Duración**: Semana 4 (días 16–20)
**Fases del plan**: Fase 3 + inicio de Fase 4

#### Objetivos
1. Implementar el renderizado completo del juego en Canvas 2D.
2. Lograr la estética fiel al Pong original.
3. Implementar la interpolación de estados para animación a 60 FPS.

#### Tareas

| Día | Tarea | Detalle |
|-----|-------|---------|
| 16 | Canvas base | Elemento canvas, fondo negro, escalado responsive con aspect ratio |
| 16 | Renderizar paletas | Rectángulos blancos en posiciones recibidas del servidor |
| 17 | Renderizar pelota | Cuadrado blanco; renderizar línea central discontinua |
| 17 | Renderizar marcador | Tipografía pixelada ("Press Start 2P") en parte superior |
| 18 | StateInterpolator | Almacenar últimos 2 estados; interpolar posiciones por frame |
| 18 | Render loop | `requestAnimationFrame` → interpolar → renderizar |
| 19 | InputHandler | Captura de teclas (flechas, W/S); envío al servidor solo al cambiar |
| 19 | Integrar con WebSocketClient | GameScreen recibe `state`, alimenta interpolator y renderer |
| 20 | Responsive | Listener de resize; recalcular escala; CSS `image-rendering: pixelated` |
| 20 | Pruebas visuales | Verificar estética en Chrome, Firefox; comparar con referencia Pong |

#### Entregables
- Juego renderizado en canvas con estética retro fiel.
- Animación fluida a 60 FPS con interpolación.
- Controles de teclado funcionales.
- Canvas responsive en distintas resoluciones.

#### Hito M3 — Renderizado Completo
| Criterio de aceptación | Método de verificación |
|-------------------------|------------------------|
| Canvas muestra paletas, pelota, línea central y marcador | Captura de pantalla |
| Estética monocromática (negro + blanco exclusivamente) | Inspección visual |
| 60 FPS estables durante 2 minutos de juego | Chrome Performance Monitor |
| Interpolación suaviza el movimiento (sin saltos visibles) | Prueba visual |
| El canvas se adapta a ventanas de 320 px a 1920 px | Resize del navegador |

---

### Sprint 5 — Integración End-to-End y Pantallas de UI

**Duración**: Semana 5 (días 21–25)
**Fases del plan**: Fase 4 (completar)

#### Objetivos
1. Completar todas las pantallas de UI (lobby, espera, resultado).
2. Integrar todos los flujos end-to-end.
3. Implementar reconexión y manejo de errores en el cliente.

#### Tareas

| Día | Tarea | Detalle |
|-----|-------|---------|
| 21 | ScreenManager | Máquina de estados: Lobby → Waiting → Game → Result |
| 21 | LobbyScreen | UI para crear sala o unirse con código; botón de copiar código/URL |
| 22 | Flujo crear + esperar | Crear sala → mostrar código → animación "Esperando oponente..." |
| 22 | Flujo unirse | Ingresar código → validar → transición a juego |
| 23 | Cuenta regresiva | 3-2-1 overlay antes de iniciar la partida |
| 23 | ResultScreen | Marcador final, ganador, botones de revancha y salir |
| 24 | Revancha | Flujo `rematch`: ambos aceptan → nueva partida en misma sala |
| 24 | Reconexión automática | WebSocketClient con retry + backoff exponencial (máx 5 s) |
| 25 | Manejo de desconexión | Mostrar overlay "Oponente desconectado" con opción de volver al lobby |
| 25 | Prueba E2E completa | Dos jugadores juegan partida completa: lobby → juego → resultado → revancha |

#### Entregables
- Juego completamente jugable de principio a fin.
- Todas las pantallas funcionales con estética retro.
- Reconexión y manejo de errores integrados.

#### Hito M4 — Juego Jugable End-to-End
| Criterio de aceptación | Método de verificación |
|-------------------------|------------------------|
| Flujo completo: lobby → crear → esperar → unirse → jugar → resultado | Prueba manual con 2 navegadores |
| Código de sala funciona como enlace compartible | Copiar URL y abrir en otro navegador |
| Cuenta regresiva 3-2-1 se muestra antes de iniciar | Prueba visual |
| Revancha inicia nueva partida sin recargar | Prueba manual |
| Desconexión muestra overlay y permite volver al lobby | Cerrar una pestaña y verificar la otra |
| Reconexión automática funciona tras corte breve (< 5 s) | Desactivar red brevemente |

---

### Sprint 6 — Testing, Pulido y Despliegue a Producción

**Duración**: Semana 6 (días 26–30)
**Fases del plan**: Fase 5

#### Objetivos
1. Completar la suite de tests (unitarios + integración).
2. Ejecutar pruebas de rendimiento, compatibilidad y seguridad.
3. Desplegar a producción.

#### Tareas

| Día | Tarea | Detalle |
|-----|-------|---------|
| 26 | Tests unitarios | Completar tests de Physics, Scoring, RoomManager, MessageValidator |
| 26 | Tests de integración | Flujo de salas: crear, unirse, desconectar, expirar |
| 27 | Pruebas de navegadores | Validar en Chrome, Firefox, Edge, Safari (últimas 2 versiones) |
| 27 | Pruebas responsive | Verificar en resoluciones: 320px, 375px, 768px, 1366px, 1920px |
| 28 | Prueba de carga | Script que crea 50 salas simultáneas; verificar CPU < 70%, memoria < 256 MB |
| 28 | Prueba de seguridad | Fuzzing de mensajes, test de rate limiting, verificar WSS |
| 29 | Configurar producción | Build optimizado; WSS con TLS; variables de entorno; Dockerfile si aplica |
| 29 | Desplegar | Push al proveedor; verificar acceso público; smoke test |
| 30 | README + documentación | Actualizar README con instrucciones de uso, despliegue y desarrollo |
| 30 | Revisión final | Validar todos los criterios de éxito del documento SUCCESS_CRITERIA.md |

#### Entregables
- Suite de tests completa y pasando.
- Aplicación desplegada y accesible públicamente.
- README actualizado.
- Todos los criterios de éxito verificados.

#### Hito M5 — Producción
| Criterio de aceptación | Método de verificación |
|-------------------------|------------------------|
| Todos los tests unitarios y de integración pasan | `npm test` exitoso |
| 60 FPS en Chrome, Firefox, Edge y Safari | Chrome DevTools en cada navegador |
| 50 salas simultáneas sin degradación | Script de carga automatizado |
| Mensajes malformados no crashean el servidor | Script de fuzzing |
| WSS activo en producción | Verificar `wss://` en DevTools |
| Aplicación accesible por URL pública | Abrir desde dispositivo externo |
| Checklist de SUCCESS_CRITERIA.md completado al 100% | Revisión manual |

---

## 4. Resumen de Hitos y Criterios

| Sprint | Hito | Nombre | Condición de salida principal |
|--------|------|--------|-------------------------------|
| Sprint 1 | **M0** | Entorno Listo | Proyecto compila; WS conecta; spike de deploy exitoso |
| Sprint 2 | **M1** | Networking Funcional | Dos jugadores se emparejan en una sala via WS |
| Sprint 3 | **M2** | Motor de Juego Operativo | Game loop con física y marcador funcional |
| Sprint 4 | **M3** | Renderizado Completo | Canvas retro a 60 FPS con interpolación |
| Sprint 5 | **M4** | Juego Jugable E2E | Partida completa desde lobby hasta resultado |
| Sprint 6 | **M5** | Producción | Desplegado, testeado y accesible públicamente |

---

## 5. Diagrama de Dependencias entre Sprints

```
Sprint 1 ──► Sprint 2 ──► Sprint 3 ──┐
                                       ├──► Sprint 5 ──► Sprint 6
                          Sprint 4* ───┘
```

> \* Sprint 4 (renderizado) puede solapar parcialmente con Sprint 3 usando datos mock para el canvas. Sin embargo, la integración completa requiere que Sprint 3 esté finalizado.

---

## 6. Ceremonias por Sprint

| Ceremonia | Momento | Duración | Descripción |
|-----------|---------|----------|-------------|
| **Sprint Planning** | Día 1 del sprint | 30 min | Revisar tareas, confirmar alcance, identificar riesgos |
| **Daily Check** | Cada día | 10 min | Revisar progreso, identificar bloqueos |
| **Sprint Review** | Día 5 del sprint | 30 min | Demo del entregable; verificar criterios del hito |
| **Retrospectiva** | Día 5 del sprint | 15 min | ¿Qué funcionó? ¿Qué mejorar? Ajustes para el siguiente sprint |

---

## 7. Definición de Done (por Sprint)

Un sprint se considera completado cuando:

1. Todas las tareas del sprint están implementadas y commiteadas.
2. El código compila sin errores de TypeScript (`strict: true`).
3. Los criterios de aceptación del hito asociado están verificados.
4. No hay bugs conocidos bloqueantes pendientes.
5. El código está en la rama principal (o en PR aprobado listo para merge).
