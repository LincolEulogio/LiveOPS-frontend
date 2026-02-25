'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../store/app.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
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

  const activeProductionId = useAppStore((state) => state.activeProductionId);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

    const socketInstance = io(socketUrl, {
      path: '/socket.io/',
      autoConnect: false, // Don't connect automatically
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      query: {
        productionId: useAppStore.getState().activeProductionId || '',
        userId: user?.id || '',
        userName: user?.name || '',
        roleId: user?.role?.id || user?.globalRole?.id || '',
        roleName: user?.role?.name || user?.globalRole?.name || 'Viewer',
      },
    });

    const initSocket = () => {
      // Only connect if we have a valid user session
      if (user?.id) {
        socketInstance.connect();
      }

      socketInstance.on('connect', () => {
        logger.info('Live Alert System: Connected', { id: socketInstance.id });
        setIsConnected(true);
        setIsConnecting(false);

        const currentActiveProductionId = useAppStore.getState().activeProductionId;
        if (currentActiveProductionId) {
          socketInstance.emit('production.join', { productionId: currentActiveProductionId });
        }
      });

      socketInstance.on('disconnect', (reason) => {
        logger.warn('Live Alert System: Disconnected', { reason });
        setIsConnected(false);
        if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
          setIsConnecting(true);
        }
      });

      socketInstance.on('connect_error', (error: Error) => {
        console.error('Socket connect_error details:', error.message);
        logger.error('Live Alert System: Connection error', error);
        setIsConnecting(true);
      });

      setSocket(socketInstance);
    };

    initSocket();

    const unsubscribeApp = useAppStore.subscribe((state, prevState) => {
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
      unsubscribeApp();
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user?.id, activeProductionId]); // Reconnect when user or production changes

  const pathname = usePathname();
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  return (
    <SocketContext.Provider value={{ socket, isConnected, isConnecting }}>
      {children}
      {!isAuthRoute && !isConnected && isConnecting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
          <div className="bg-stone-900 border border-stone-800 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Loader2 className="animate-spin text-indigo-500" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white ">Sync Interrupted</span>
              <span className="text-[10px] text-stone-500 font-medium uppercase ">Reestablishing gateway...</span>
            </div>
          </div>
        </div>
      )}
      {!isAuthRoute && !isConnected && !isConnecting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
          <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <WifiOff className="text-red-500" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-red-500 ">Backend Offline</span>
              <span className="text-[10px] text-red-400/60 font-medium uppercase ">Manual refresh required</span>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};
