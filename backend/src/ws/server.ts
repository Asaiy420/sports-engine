import { WebSocket, WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { matches } from '../db/schema';
import { wsArcjet } from '../../arcjet';
import type { Request } from 'express';

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

function sendJson(socket: WebSocket, payload: Record<string, unknown>) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcast(wss: WebSocketServer, payload: Record<string, unknown>) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 1024 * 1024, // 1mb
  });

  wss.on('connection', async (socket: ExtWebSocket, req: Request) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);

        if (decision.isDenied()) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? 'Rate limit exceeded!'
            : 'Access Denied';
          socket.close(code, reason);
          return;
        }
      } catch (e) {
        console.error('Websocket Connection Error', e);
        socket.close(1011, 'Server Security Error');
        return;
      }
    }

    socket.isAlive = true;
    socket.on('pong', () => {
      socket.isAlive = true;
    });
    sendJson(socket, { type: 'welcome' });
    socket.on('error', console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      const extWs = ws as ExtWebSocket;
      if (extWs.isAlive === false) {
        ws.terminate();
      } else {
        extWs.isAlive = false;
        ws.ping();
      }
    });
  }, 30000);
  wss.on('close', () => clearInterval(interval));

  function broadcastMatchCreated(match: typeof matches.$inferSelect) {
    broadcast(wss, { type: 'match_created', data: match });
  }

  return { broadcastMatchCreated };
}
