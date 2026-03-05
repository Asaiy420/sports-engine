import { useEffect, useRef, useState, useCallback } from 'react';
import type { WsMessage } from '../types';

type MessageHandler = (msg: WsMessage) => void;

export function useWebSocket(onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${window.location.host}/ws`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.addEventListener('open', () => setConnected(true));
    ws.addEventListener('close', () => setConnected(false));
    ws.addEventListener('message', (event) => {
      try {
        const data: WsMessage = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch {
        // ignore non-JSON messages
      }
    });

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const send = useCallback((payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, []);

  const subscribe = useCallback(
    (matchId: number) => send({ type: 'subscribe', matchId }),
    [send]
  );

  const unsubscribe = useCallback(
    (matchId: number) => send({ type: 'unsubscribe', matchId }),
    [send]
  );

  return { connected, subscribe, unsubscribe };
}
