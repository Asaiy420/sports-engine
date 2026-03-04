import { WebSocket, WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { matches } from '../db/schema';
import { wsArcjet } from '../../arcjet';
import type { Request } from 'express';

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
  subscriptions: Set<number>;
}

const matchSubscribers = new Map();

function subscribeToMatch(matchId: number, socket: WebSocket) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId).add(socket);
}

function unSubscribeFromMatch(matchId: number, socket: WebSocket) {
  const subscribers = matchSubscribers.get(matchId);

  if (!subscribers) return;
  if (subscribers.size === 0) {
    matchSubscribers.delete(matchId);
  }
  subscribers.delete(socket);
}

function cleanUpSubscriptions(socket: ExtWebSocket) {
  for (const matchId of socket.subscriptions) {
    unSubscribeFromMatch(matchId, socket);
  }
}

function sendJson(socket: WebSocket, payload: Record<string, unknown>) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcastToAll(
  wss: WebSocketServer,
  payload: Record<string, unknown>
) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

function broadCastToMatch(matchId: number, payload: Record<string, unknown>) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers || subscribers.size === 0) return;

  const message = JSON.stringify(payload);

  for (const client of subscribers) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function handleMessage(socket: ExtWebSocket, data: WebSocket.RawData) {
  let message: Record<string, unknown>;

  try {
    message = JSON.parse(data.toString()); // this converts buffer to string and then parses it as JSON
  } catch (e) {
    sendJson(socket, {
      type: 'error',
      error: 'Invalid JSON',
      e,
    });
    return;
  }

  if (message?.type === 'subscribe' && Number.isInteger(message.matchId)) {
    subscribeToMatch(message.matchId as number, socket);
    socket.subscriptions.add(message.matchId as number);
    sendJson(socket, {
      type: 'subscribed',
      matchId: message.matchId,
    });
  }

  if (message?.type === 'unsubscribe' && Number.isInteger(message.matchId)) {
    unSubscribeFromMatch(message.matchId as number, socket);
    socket.subscriptions.delete(message.matchId as number);
    sendJson(socket, {
      type: 'unsubscribed',
      matchId: message.matchId,
    });
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

    socket.subscriptions = new Set();

    sendJson(socket, { type: 'welcome' });

    socket.on('message', data => {
      handleMessage(socket, data);
    });

    socket.on('error', () => {
      socket.terminate();
    });

    socket.on('close', () => {
      cleanUpSubscriptions(socket);
    });

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
    broadcastToAll(wss, { type: 'match_created', data: match });
  }

  function broadcastCommentary(
    matchId: number,
    comment: Record<string, unknown>
  ) {
    broadCastToMatch(matchId, { type: 'commentary', data: comment });
  }

  return { broadcastMatchCreated, broadcastCommentary };
}
