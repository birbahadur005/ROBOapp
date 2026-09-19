import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

interface SocketContextType {
  isConnected: boolean;
  subscribeToAppointment: (referenceNo: string) => void;
  lastUpdate: any;
  newRequestAlert: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [newRequestAlert, setNewRequestAlert] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();
  const subscribedRef = useRef<string | null>(null);

  useEffect(() => {
    let reconnectTimeout: any;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.port === '5173' ? `${window.location.hostname}:5000` : window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          // If user logged in, identify
          if (user) {
            ws.send(JSON.stringify({
              type: 'IDENTIFY_USER',
              userId: user.id,
              role: user.role,
              authorityId: user.authorityProfile?.id
            }));
          }
          // Re-subscribe if had existing ref
          if (subscribedRef.current) {
            ws.send(JSON.stringify({
              type: 'SUBSCRIBE_APPOINTMENT',
              referenceNo: subscribedRef.current
            }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'APPOINTMENT_UPDATED') {
              setLastUpdate(message);
            } else if (message.type === 'NEW_APPOINTMENT_REQUEST') {
              setNewRequestAlert(message.data);
            }
          } catch (e) {
            // ignore
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (e) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  const subscribeToAppointment = (referenceNo: string) => {
    subscribedRef.current = referenceNo;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE_APPOINTMENT',
        referenceNo
      }));
    }
  };

  return (
    <SocketContext.Provider value={{ isConnected, subscribeToAppointment, lastUpdate, newRequestAlert }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
