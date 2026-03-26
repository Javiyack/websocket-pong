# Despliegue en Render Cloud

Este documento explica cómo desplegar el proyecto `websocket-pong` en Render (Web Service) usando la configuración actual del repositorio.

## Resumen
- Repositorio monorepo con: `client/` (Vite) y `server/` (Express + `ws`).
- El cliente se compila a `dist/client` y el servidor sirve esos archivos en producción y expone un WebSocket en el mismo puerto.
- El servidor escucha en `process.env.PORT` (por tanto Render inyecta el puerto automáticamente).

## Prerrequisitos
- Cuenta en Render y repo Git accesible (GitHub/GitLab/Bitbucket).
- Node >= 18.
- Ramas: elige la rama que quieras desplegar (ej. `main`).

## Comandos de build y start recomendados
Usaremos comandos que construyen ambos subproyectos y luego ejecutan el servidor compilado.

Build (en Render o localmente):

```bash
bash -lc "npm ci && npm ci --prefix client && npm ci --prefix server && npm run build"
```

Start command (Render):

```bash
node dist/server/src/main.js
```

> Nota: el `start` ejecuta el servidor compilado desde la raíz del repo. El servidor está preparado para servir `dist/client` en producción.

## Configuración recomendada en el panel de Render (Web Service)
- Service Type: Web Service
- Branch: `main` (u otra rama elegida)
- Build Command: usa la línea de arriba
- Start Command: `node dist/server/src/main.js`
- Environment: `NODE_ENV=production` (Render normalmente lo configura, pero puedes añadirlo)
- Health check path: `/`
- Instance/Plan: Small o Standard según tráfico esperado

Render inyecta `PORT` automáticamente: el servidor usa `process.env.PORT` (ver `server/src/main.ts`).

## Archivo `render.yaml` (opcional)
Puedes añadir un `render.yaml` en la raíz para configurar el servicio automáticamente. Ejemplo mínimo:

```yaml
services:
  - type: web_service
    name: websocket-pong
    env: node
    branch: main
    plan: free
    buildCommand: bash -lc "npm ci && npm ci --prefix client && npm ci --prefix server && npm run build"
    startCommand: node dist/server/src/main.js
    envVars:
      - key: NODE_ENV
        value: production
```

Asegúrate de validar la sintaxis del `render.yaml` con la documentación de Render antes de usarlo.

## Verificación local rápida
1. Instalar deps y hacer build:

```bash
npm ci --prefix client
npm ci --prefix server
npm run build
```

2. Ejecutar el servidor compilado:

```bash
node dist/server/src/main.js
```

3. Abrir `http://localhost:3000` (o la URL/puerto donde el servidor esté escuchando). El cliente debería cargar y el WebSocket conectarse automáticamente al mismo host (el cliente usa `location.host`).

## Consideraciones sobre WebSocket y HTTPS
- En producción, al servir mediante HTTPS el cliente usará `wss://` automáticamente (el código del cliente detecta `location.protocol`).
- Asegúrate de que tanto la web como el WebSocket se sirvan desde el mismo dominio (Render sirve TLS por defecto), así el cliente no necesita puerto explícito.

## Troubleshooting rápido
- `404` en assets: verifica que `dist/client` exista tras el build y que el servidor sirva esa carpeta (ver `server/src/main.ts`).
- WebSocket no conecta: comprueba que el navegador intenta `wss://<tu-dominio>` (inspecciona la consola/red). Revisa logs en Render.
- Errores de runtime por versión de Node: selecciona Node >= 18 en Render o añade `engines.node` en `package.json`.

## Archivos clave (referencia)
- `server/src/main.ts` — entry del servidor y configuración WebSocket
- `client/src/main.ts` — inicialización cliente WebSocket (usa `location.host`)
- `client/vite.config.ts` — salida a `dist/client`
- `server/tsconfig.json` y `package.json` — configuración de build/start del servidor

---

Si quieres, puedo:
- añadir un `render.yaml` al repo,
- crear un `Procfile`/README más breve para el panel de Render,
- o hacer el commit y push de `RENDER.md` ahora.
