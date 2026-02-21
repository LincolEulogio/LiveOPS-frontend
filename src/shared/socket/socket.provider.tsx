'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/app.store';
import { logger } from '../utils/logger';
import { WifiOff, Loader2 } from 'lucide-react';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
  isConnecting: true,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  // We grab the active productionId from Zustand so we can join its room
  const activeProductionId = useAppStore((state) => state.activeProductionId);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

    const socketInstance = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    const initSocket = () => {
      // Listen for connection
      socketInstance.on('connect', () => {
        logger.info('WebSocket connected:', { id: socketInstance.id });
        setIsConnected(true);
        setIsConnecting(false);

        const currentActiveProductionId = useAppStore.getState().activeProductionId;
        if (currentActiveProductionId) {
          socketInstance.emit('production.join', { productionId: currentActiveProductionId });
        }
      });

      // Listen for disconnect
      socketInstance.on('disconnect', (reason) => {
        logger.warn('WebSocket disconnected:', { reason });
        setIsConnected(false);
        if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
          setIsConnecting(true);
        }
      });

      socketInstance.on('connect_error', (error) => {
        logger.error('WebSocket connection error:', error);
        setIsConnecting(true);
      });

      setSocket(socketInstance);
    };

    initSocket();

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
    <SocketContext.Provider value={{ socket, isConnected, isConnecting }}>
      {children}
      {/* Global Connection Banner */}
      {!isConnected && isConnecting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
          <div className="bg-stone-900 border border-stone-800 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Loader2 className="animate-spin text-indigo-500" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight">Sync Interrupted</span>
              <span className="text-[10px] text-stone-500 font-medium uppercase tracking-widest">Reestablishing gateway...</span>
            </div>
          </div>
        </div>
      )}
      {!isConnected && !isConnecting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
          <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <WifiOff className="text-red-500" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-red-500 tracking-tight">Backend Offline</span>
              <span className="text-[10px] text-red-400/60 font-medium uppercase tracking-widest">Manual refresh required</span>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};
