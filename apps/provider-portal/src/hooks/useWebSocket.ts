import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client, type IMessage } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => console.log('WebSocket connected'),
      onDisconnect: () => console.log('WebSocket disconnected'),
    });
    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, []);

  const subscribe = useCallback((destination: string, callback: (msg: IMessage) => void) => {
    if (clientRef.current?.connected) {
      return clientRef.current.subscribe(destination, callback);
    }
    // Retry after connection
    const interval = setInterval(() => {
      if (clientRef.current?.connected) {
        clearInterval(interval);
        clientRef.current.subscribe(destination, callback);
      }
    }, 500);
    return null;
  }, []);

  const send = useCallback((destination: string, body: object) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) });
    }
  }, []);

  return { subscribe, send, client: clientRef };
}
