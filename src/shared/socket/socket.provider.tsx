'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/app.store';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // We grab the active productionId from Zustand so we can join its room
  const activeProductionId = useAppStore((state) => state.activeProductionId);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

    const socketInstance = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket'],
      autoConnect: true,
      // You can pass auth headers here when connecting if needed
      // auth: { token: '...' }
    });

    const initSocket = () => {
      // Reconnect if needed
      if (!socketInstance.connected) {
        socketInstance.connect();
      }

      // Listen for connection
      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket server:', socketInstance.id);
        setIsConnected(true);

        // Join the active production room if one is set
        const currentActiveProductionId = useAppStore.getState().activeProductionId;
        if (currentActiveProductionId) {
          socketInstance.emit('production.join', { productionId: currentActiveProductionId });
        }
      });

      // Listen for disconnect
      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      setSocket(socketInstance);
    };

    // Initial init
    initSocket();

    // Subscribe to store changes to join production rooms dynamically
    const unsubscribe = useAppStore.subscribe((state, prevState) => {
      const newProductionId = state.activeProductionId;
      const prevProductionId = prevState.activeProductionId;

      if (newProductionId !== prevProductionId && socketInstance?.connected) {
        if (prevProductionId) {
          socketInstance.emit('production.leave', { productionId: prevProductionId });
        }
        if (newProductionId) {
          socketInstance.emit('production.join', { productionId: newProductionId });
        }
      }
    });

    return () => {
      unsubscribe();
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
};
