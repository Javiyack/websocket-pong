# Criterios de Éxito — WebSocket-Pong

## 1. Introducción

Este documento define las métricas cuantitativas y los objetivos cualitativos que se utilizarán para evaluar si el proyecto WebSocket-Pong ha sido completado exitosamente. Cada criterio está vinculado a los objetivos del proyecto definidos en el documento de requisitos.

---

## 2. Criterios de Éxito Funcionales

### CE-01 — Jugabilidad completa end-to-end

**Vinculado a**: O-1, O-3

| Métrica | Objetivo | Método de verificación |
|---------|----------|------------------------|
| Dos jugadores pueden completar una partida desde navegadores distintos | 100% de éxito en 10 pruebas consecutivas | Prueba manual con dos navegadores |
| Flujo completo: lobby → crear sala → compartir código → unirse → jugar → resultado | Sin errores ni bloqueos | Prueba manual del flujo completo |
| Tiempo desde acceso a la URL hasta jugar (con oponente listo) | < 15 segundos / 3 clics | Cronometrado manual |
| Partida termina correctamente al alcanzar 11 puntos | 100% de consistencia | Prueba manual + test automatizado |

### CE-02 — Mecánicas de juego correctas

**Vinculado a**: RF-07 a RF-13

| Métrica | Objetivo | Método de verificación |
|---------|----------|------------------------|
| La pelota rebota correctamente en bordes superior/inferior | Sin atravesamientos en 50 rallies | Prueba visual + test unitario |
| La pelota rebota en las paletas sin tunneling | 0 fallos en 100 colisiones a velocidad máxima | Test unitario con casos extremos |
| El ángulo de rebote varía según el punto de impacto | Impacto en borde produce ángulo pronunciado vs. centro | Prueba visual |
| La velocidad aumenta durante el rally | Incremento verificable tras cada colisión con paleta | Test unitario |
| El marcador se actualiza correctamente tras cada gol | 100% de precisión | Test de integración |

### CE-03 — Gestión de conexiones resiliente

**Vinculado a**: RF-04, RNF-08, RNF-09

| Métrica | Objetivo | Método de verificación |
|---------|----------|------------------------|
| Desconexión breve (< 5 s) permite reconexión | Éxito en 8 de 10 intentos | Prueba manual (desactivar/reactivar red) |
| Desconexión prolongada notifica al oponente | Mensaje mostrado en < 6 s | Prueba manual |
| Salas inactivas se eliminan automáticamente | 0 salas zombis tras 10 minutos | Verificar con logs del servidor |
| Revancha funciona sin recrear la conexión | Éxito en 5 de 5 intentos | Prueba manual |

---

## 3. Criterios de Éxito de Rendimiento

### CE-04 — Rendimiento del cliente

**Vinculado a**: RNF-01, RNF-05

| Métrica | Objetivo | Método de verificación |
|---------|----------|------------------------|
| Frame rate durante el juego | ≥ 60 FPS estables | Chrome DevTools Performance Monitor |
| Frame rate en dispositivo de gama media | ≥ 55 FPS | Prueba en hardware limitado o throttle de CPU |
| Tiempo de carga inicial (first paint) | < 2 segundos (conexión 4G) | Lighthouse / WebPageTest |
| Tamaño del bundle del cliente | < 100 KB (gzipped) | `vite build` + análisis de output |

### CE-05 — Rendimiento del servidor

**Vinculado a**: RNF-02, RNF-06

| Métrica | Objetivo | Método de verificación |
|---------|----------|------------------------|
| Tick rate estable bajo carga | 30 ticks/s ± 2 durante 10 min | Logging del intervalo entre ticks |
| Uso de CPU con 50 salas activas | < 70% en instancia de 1 vCPU | Prueba de carga + monitoreo |
| Uso de memoria con 50 salas activas | < 256 MB | Prueba de carga + `process.memoryUsage()` |
| Tiempo de procesamiento por tick | < 5 ms | Profiling del game loop |

### CE-06 — Latencia de red

**Vinculado a**: O-1, RNF-03

| Métrica | Objetivo | Método de verificación |
|---------|----------|------------------------|
| RTT (Round Trip Time) entre cliente y servidor | < 100 ms (misma región) | Ping/pong WebSocket con timestamp |
| Latencia percibida (input → cambio visual) | < 150 ms | Medición subjetiva + análisis de timestamps |
| Juego aceptable con latencia artificial de 150 ms | Sin errores de colisión ni desincronización | Chrome DevTools Network throttling |

---

## 4. Criterios de Éxito de Calidad Visual

### CE-07 — Fidelidad a la estética retro

**Vinculado a**: O-2, RF-14 a RF-17

| Métrica | Objetivo | Método de verificación |
|---------|----------|------------------------|
| Paleta de colores | Exclusivamente negro (#000) y blanco (#FFF) en la pantalla de juego | Inspección visual + revisión de código |
| Elementos del campo | Dos paletas rectangulares, pelota cuadrada, línea central discontinua, marcador | Captura de pantalla vs. referencia del Pong original |
| Tipografía | Fuente pixelada/retro para el marcador y textos | Inspección visual |
| Sin bordes redondeados ni sombras | Elementos puramente rectangulares con bordes duros | Inspección visual |

### CE-08 — Compatibilidad de navegadores

**Vinculado a**: RNF-04

| Navegador | Versión mínima | Criterio |
|-----------|----------------|----------|
| Chrome | Últimas 2 versiones estables | Juego funcional, 60 FPS, sin errores de consola |
| Firefox | Últimas 2 versiones estables | Juego funcional, 60 FPS, sin errores de consola |
| Edge | Últimas 2 versiones estables | Juego funcional, 60 FPS, sin errores de consola |
| Safari | Últimas 2 versiones estables | Juego funcional, 55+ FPS, sin errores de consola |

### CE-09 — Responsive

**Vinculado a**: RNF-05

| Resolución | Criterio |
|------------|----------|
| 1920×1080 (desktop) | Canvas centrado, proporción correcta, elementos legibles |
| 1366×768 (laptop) | Canvas escalado, todos los elementos visibles |
| 768×1024 (tablet) | Canvas adaptado, jugable con teclado externo |
| 375×667 (móvil) | Canvas visible, elementos no se superponen |
| 320×568 (móvil mín.) | Canvas visible aunque compacto; mensaje de girar si es necesario |

---

## 5. Criterios de Éxito de Seguridad

### CE-10 — Seguridad de la aplicación

**Vinculado a**: RNF-10, RNF-11, RNF-12

| Métrica | Objetivo | Método de verificación |
|---------|----------|------------------------|
| Conexiones en producción usan WSS | 100% | Verificar que `wss://` se usa en la URL de conexión |
| Mensajes malformados no crashean el servidor | 0 crashes tras enviar 100 mensajes inválidos | Script de fuzzing básico |
| Rate limiting funciona | Mensajes excedentes son descartados; conexión persistente se cierra tras abuso | Script que envía 200 msg/s |
| No se expone información sensible del servidor | Mensajes `state` solo contienen datos de renderizado | Inspección del payload en DevTools |

---

## 6. Criterios de Éxito del Proyecto (globales)

### CE-11 — Definición de "Proyecto Exitoso"

El proyecto se considera **exitoso** cuando se cumplen **TODOS** los criterios siguientes:

| # | Criterio | Estado requerido |
|---|----------|------------------|
| 1 | Dos jugadores pueden jugar una partida completa desde navegadores distintos en internet | ✅ Verificado |
| 2 | El juego renderiza a ≥ 60 FPS en Chrome y Firefox | ✅ Verificado |
| 3 | La latencia percibida es < 150 ms en la misma región geográfica | ✅ Verificado |
| 4 | La estética visual es fiel al Pong original de Atari | ✅ Verificado |
| 5 | El servidor soporta 50 salas simultáneas sin degradación | ✅ Verificado |
| 6 | No hay errores críticos (crashes, salas zombis, desincronizaciones) en 30 min de juego continuo | ✅ Verificado |
| 7 | La aplicación está desplegada y accesible públicamente mediante URL | ✅ Verificado |
| 8 | El código compila sin errores de TypeScript y los tests pasan | ✅ Verificado |

---

## 7. Métricas de Calidad del Código

| Métrica | Objetivo |
|---------|----------|
| Errores de TypeScript | 0 (strict mode) |
| Tests unitarios del game loop | ≥ 90% cobertura de ramas en `Physics.ts` y `Scoring.ts` |
| Tests de integración del flujo de salas | Cubrir: crear, unirse, desconectar, revancha |
| Código duplicado | Ninguna lógica duplicada entre cliente y servidor (usar `shared/`) |
| Dependencias de producción | ≤ 5 (mantener el proyecto ligero) |

---

## 8. Checklist de Aceptación Final

Antes del despliegue a producción, todos los puntos deben estar marcados:

- [ ] Partida completa funcional entre dos jugadores remotos
- [ ] 60 FPS en Chrome, Firefox, Edge y Safari
- [ ] Latencia < 150 ms en misma región
- [ ] Estética retro fiel (captura de pantalla aprobada)
- [ ] Reconexión automática funcional
- [ ] Salas inactivas se limpian correctamente
- [ ] Rate limiting activo
- [ ] WSS configurado
- [ ] Tests unitarios y de integración pasan
- [ ] Build de producción < 100 KB gzipped
- [ ] README actualizado con instrucciones de uso
- [ ] Desplegado y accesible públicamente
