# Desafíos y Estrategias de Mitigación — WebSocket-Pong

## 1. Introducción

Este documento identifica los desafíos técnicos, de diseño y operativos previstos durante el desarrollo de WebSocket-Pong, junto con estrategias concretas para abordarlos y minimizar su impacto en el progreso del proyecto.

---

## 2. Desafíos Técnicos

### D-01 — Latencia de red y experiencia de juego en tiempo real

**Descripción**: La comunicación WebSocket introduce latencia variable entre la acción del jugador y su reflejo en pantalla. En un juego de ritmo rápido como Pong, incluso 100-200 ms de retraso hacen que el juego se sienta poco responsivo.

**Impacto**: Alto — Afecta directamente la jugabilidad y la satisfacción del usuario.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Interpolación en el cliente | Suavizar la transición entre estados del servidor recibidos a 30 Hz para renderizar a 60 FPS sin saltos visibles |
| 2 | Optimización del payload | Mantener los mensajes JSON por debajo de 200 bytes; enviar solo datos que cambiaron si es necesario |
| 3 | Tick rate configurable | Permitir ajustar el tick rate (30-60 Hz) según las condiciones de red |
| 4 | Monitoreo de latencia | Implementar ping/pong periódico para medir RTT y mostrarlo opcionalmente en la UI de debug |

---

### D-02 — Sincronización de estado entre servidor y clientes

**Descripción**: El modelo de servidor autoritativo requiere que ambos clientes visualicen el mismo estado de forma consistente. Diferencias de timing, pérdida de paquetes o jitter pueden causar que los clientes muestren estados desincronizados.

**Impacto**: Alto — Los jugadores podrían ver la pelota en posiciones distintas o no coincidir en quién anotó.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Estado completo por tick | Enviar el estado completo del juego en cada tick (no deltas) para que los clientes siempre puedan recuperarse |
| 2 | Número de tick en cada mensaje | Incluir un contador de tick para que el cliente detecte y descarte estados fuera de orden |
| 3 | Congelamiento ante desincronización | Si el cliente no recibe estado durante N frames, congelar la animación en lugar de extrapolar incorrectamente |
| 4 | Test con latencia simulada | Probar con herramientas como `tc` (Linux) o Chrome DevTools throttling para validar el comportamiento bajo latencia alta |

---

### D-03 — Física del juego y detección de colisiones

**Descripción**: A velocidades altas, la pelota puede "atravesar" una paleta entre dos ticks del game loop (tunneling). El ángulo de rebote según punto de impacto requiere matemáticas precisas para sentirse natural.

**Impacto**: Medio — Los jugadores percibirán bugs visibles si la pelota atraviesa la paleta o si los rebotes son erráticos.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Detección de colisión continua | Usar swept collision (verificar la trayectoria entre posición anterior y actual) en lugar de solo la posición actual |
| 2 | Limitar velocidad máxima | Establecer `BALL_MAX_SPEED` para que la pelota nunca se desplace más de la mitad del ancho de la paleta en un tick |
| 3 | Implementación incremental | Empezar con rebote simple (inversión de `vx`), luego añadir variación angular en una segunda iteración |
| 4 | Tests unitarios de física | Escribir tests específicos para casos límite: colisión en esquinas, velocidad máxima, pelota justo en el borde |

---

### D-04 — Gestión del ciclo de vida de conexiones WebSocket

**Descripción**: Los jugadores pueden perder la conexión por problemas de red, cerrar la pestaña accidentalmente o experimentar interrupciones momentáneas. El servidor debe manejar estos escenarios sin dejar salas huérfanas ni estados inconsistentes.

**Impacto**: Alto — Salas zombis consumen memoria; desconexiones sin manejo frustran al otro jugador.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Reconexión con ventana de gracia | Al desconectarse un jugador, pausar la partida durante 5 segundos antes de declararla terminada |
| 2 | Heartbeat periódico | Implementar ping/pong a nivel WebSocket para detectar conexiones muertas que no generaron evento `close` |
| 3 | Limpieza por timeout | Un cron job interno revisa salas cada 60 segundos y elimina las inactivas por más de 5 minutos |
| 4 | Notificación inmediata | Al detectar desconexión, enviar `opponent_disconnected` al jugador restante sin esperar el timeout completo |

---

### D-05 — Renderizado responsive y consistencia visual

**Descripción**: El juego debe verse correcto en resoluciones que van desde 320 px (móvil) hasta 2560 px (monitor ultrawide). El canvas tiene dimensiones lógicas fijas (800×600) pero debe escalarse sin distorsión.

**Impacto**: Medio — En pantallas pequeñas los elementos podrían ser difíciles de ver; en grandes podrían verse pixelados.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Coordenadas lógicas + escalado | Toda la lógica usa coordenadas del campo (800×600); el renderer escala al tamaño real del viewport manteniendo el aspect ratio |
| 2 | CSS `image-rendering: pixelated` | Usar esta propiedad para que el escalado del canvas respete la estética pixelada sin suavizado |
| 3 | Listener de resize | Recalcular el factor de escala al redimensionar la ventana para adaptarse dinámicamente |
| 4 | Breakpoint mínimo | Definir un ancho mínimo de 320 px; por debajo, mostrar un mensaje pidiendo girar el dispositivo |

---

## 3. Desafíos de Diseño y UX

### D-06 — Flujo de emparejamiento sin fricción

**Descripción**: Sin sistema de cuentas ni matchmaking automático, el emparejamiento depende de compartir un código de sala. El flujo debe ser lo suficientemente intuitivo para que dos personas se conecten en segundos.

**Impacto**: Medio — Un flujo confuso hará que los usuarios abandonen antes de jugar.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Código corto y legible | Generar códigos de 4 caracteres alfanuméricos (sin caracteres ambiguos como `0/O`, `1/l`) |
| 2 | URL compartible | Al crear una sala, generar un enlace directo (`/?room=ABCD`) que el jugador pueda copiar y compartir |
| 3 | Botón de copiar | Un solo clic para copiar el código o URL al portapapeles |
| 4 | Feedback inmediato | Mostrar claramente "Esperando oponente..." con animación para que el creador sepa que la sala está activa |

---

### D-07 — Fidelidad a la estética retro sin sacrificar usabilidad

**Descripción**: La estética del Pong original es extremadamente minimalista (monocromática, sin texto decorativo). Reproducirla fielmente puede dificultar la comunicación de estados del juego (lobby, esperando, resultado).

**Impacto**: Bajo — Es un desafío de diseño que afecta la percepción pero no la funcionalidad.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Estética retro para el juego, funcional para el UI | El canvas de juego es fiel al original; las pantallas de lobby/resultado usan una estética retro pero con más texto y botones claros |
| 2 | Tipografía pixelada unificada | Usar una sola fuente retro (ej. "Press Start 2P") para mantener coherencia visual en todas las pantallas |
| 3 | Animaciones sutiles | Parpadeo del texto "Esperando oponente", cuenta regresiva con efecto de escala, para dar vida sin romper la estética |

---

## 4. Desafíos Operativos y de Infraestructura

### D-08 — Soporte de WebSocket en el hosting de producción

**Descripción**: No todos los proveedores de hosting soportan conexiones WebSocket persistentes de forma nativa. Algunos terminan las conexiones idle, tienen timeouts agresivos o requieren configuración especial.

**Impacto**: Alto — Sin WebSocket funcional, el juego no puede operar.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Evaluar proveedores temprano | Verificar soporte WSS en Railway, Render y Fly.io antes de elegir; consultar documentación y limits |
| 2 | Heartbeat para mantener conexión | Enviar pings periódicos para evitar que el proveedor cierre conexiones idle |
| 3 | Prueba de despliegue en Fase 0 | Hacer un "spike" de despliegue con un WebSocket básico en la fase de setup para validar el proveedor elegido |
| 4 | Plan B con VPS | Si los PaaS presentan limitaciones, usar un VPS (DigitalOcean, Hetzner) con control total |

---

### D-09 — Escalabilidad más allá de una instancia

**Descripción**: Con una sola instancia, el estado de las salas vive en memoria. Si la demanda crece, escalar horizontalmente requiere que ambos jugadores de una sala estén en la misma instancia.

**Impacto**: Bajo (para v1) — El requisito inicial es 50 salas, manejable en una instancia. Se convierte en alto si el juego gana tracción.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Diseño stateless-ready | Aunque v1 es single-instance, diseñar el `RoomManager` de forma que pudiera delegar a un store externo en el futuro |
| 2 | Sticky sessions | Al escalar, usar un load balancer con sticky sessions por IP o cookie para que una sala se mantenga en una instancia |
| 3 | No over-engineer | No implementar Redis ni pub/sub hasta que sea necesario; evitar complejidad prematura |

---

### D-10 — Seguridad: prevención de trampas y abuso

**Descripción**: Aunque el servidor es autoritativo (el cliente no puede manipular el marcador ni la posición de la pelota), un cliente malicioso podría enviar inputs a velocidad anormal, intentar unirse a múltiples salas o enviar mensajes malformados para crashear el servidor.

**Impacto**: Medio — En un juego casual sin rankings el incentivo para hacer trampas es bajo, pero la estabilidad del servidor es crítica.

**Estrategias**:
| # | Estrategia | Detalle |
|---|------------|---------|
| 1 | Rate limiting estricto | Token bucket de 60 msg/s por conexión; descartar mensajes excedentes |
| 2 | Validación exhaustiva | `MessageValidator` verifica tipo, estructura y rango de valores de cada mensaje antes de procesarlo |
| 3 | Un jugador = una sala | Impedir que una conexión participe en múltiples salas simultáneamente |
| 4 | Límite de conexiones por IP | Máximo de N conexiones simultáneas desde la misma IP (ej. 5) para mitigar floods |
| 5 | No exponer estado interno | Los mensajes `state` solo envían datos necesarios para el renderizado; nunca velocidades internas ni IDs del servidor |

---

## 5. Resumen de Desafíos por Prioridad

| Prioridad | Desafíos | Fase impactada |
|-----------|----------|----------------|
| **Crítica** | D-01 (Latencia), D-02 (Sincronización), D-04 (Conexiones), D-08 (Hosting WSS) | Fases 1, 2, 4, 5 |
| **Alta** | D-03 (Física/colisiones), D-06 (Emparejamiento), D-10 (Seguridad) | Fases 1, 2, 4 |
| **Media** | D-05 (Responsive), D-07 (Estética vs UX), D-09 (Escalabilidad) | Fases 3, 4, 5 |

---

## 6. Plan de Contingencia General

Si un desafío bloquea el progreso de una fase por más de 2 días:

1. **Simplificar**: Reducir el alcance de la funcionalidad afectada (ej. quitar variación angular, usar tick rate fijo).
2. **Spike técnico**: Dedicar un timebox de 4 horas a investigar y prototipar una solución aislada.
3. **Consultar**: Buscar soluciones en comunidades especializadas (gamedev, networking).
4. **Diferir**: Mover la funcionalidad a un backlog de "v1.1" y continuar con lo esencial.
