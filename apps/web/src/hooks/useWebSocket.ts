import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

type WebSocketEvent = {
  type: 'MultisigCreated' | 'ProposalCreated' | 'ApprovalSubmitted' | 'ThresholdReached' | 'ExecutionCompleted';
  data: any;
  timestamp: string;
};

export function useWebSocket(url: string, onEvent?: (event: WebSocketEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectDelay = 30000;

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), maxReconnectDelay);
        reconnectAttempts.current++;
        reconnectTimeout.current = setTimeout(connect, delay);
      };

      ws.current.onmessage = (message) => {
        try {
          const event: WebSocketEvent = JSON.parse(message.data);
          
          // Default global handlers
          switch (event.type) {
            case 'ThresholdReached':
              toast.success('Proposal threshold reached! Ready for execution.');
              break;
            case 'ExecutionCompleted':
              toast.success('Proposal executed successfully.');
              break;
          }

          if (onEvent) {
            onEvent(event);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) ws.current.close();
    };
  }, [url, onEvent]);

  return { isConnected };
}
