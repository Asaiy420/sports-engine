import { WebSocket, WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { matches } from '../db/schema';

function sendJson(socket: WebSocket, payload: Record<string, unknown>) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcast(wss: WebSocketServer, payload: Record<string, unknown>) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) return;

    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 1024 * 1024, // 1mb
  });

  wss.on('connection', socket => {
    sendJson(socket, { type: 'welcome' });
    socket.on('error', console.error);
  });

  function broadcastMatchCreated(match: typeof matches.$inferSelect) {
    broadcast(wss, { type: 'match_created', data: match });
  }

  return { broadcastMatchCreated };
}
