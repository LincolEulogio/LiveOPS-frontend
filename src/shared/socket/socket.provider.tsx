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

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server:', socketInstance.id);
      setIsConnected(true);

      // If we have an active production, join its room immediately upon connection
      if (activeProductionId) {
        socketInstance.emit('production.join', { productionId: activeProductionId });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Effect to handle joining/leaving rooms if the active production changes dynamically
  useEffect(() => {
    if (socket && isConnected) {
      if (activeProductionId) {
        socket.emit('production.join', { productionId: activeProductionId });
      } else {
        socket.emit('production.leave');
      }
    }
  }, [socket, isConnected, activeProductionId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
};
