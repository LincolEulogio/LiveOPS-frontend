'use client';

import React from 'react';
import { useIntercomStore } from '../store/intercom.store';
import { useIntercom } from '../hooks/useIntercom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Bell, CheckCircle, XCircle, Wifi, WifiOff, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/shared/socket/socket.provider';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';

export const DeviceView = () => {
    const { activeAlert } = useIntercomStore();
    const { acknowledgeAlert } = useIntercom();
    const user = useAuthStore((state) => state.user);
    const { isConnected, socket } = useSocket();
    const [selectedRole, setSelectedRole] = React.useState<string | null>(null);

    // Get available roles from query (same as dashboard)
    const { data: roles = [] } = useQuery<any[]>({
        queryKey: ['roles'],
        queryFn: async () => {
            const data = await (apiClient.get('/users/roles') as any);
            return data || [];
        }
    });

    const activeRole = selectedRole || user?.role?.name || user?.globalRole?.name || 'VIEWER';

    const handleRoleSelect = (roleName: string) => {
        setSelectedRole(roleName);
        // We notify the socket about the new role for this session
        if (socket && isConnected) {
            socket.emit('role.identify', { roleName });
        }
    };

    if (activeRole === 'VIEWER' && !selectedRole) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 bg-black text-center">
                <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Identificación de Rol</h2>
                <p className="text-stone-500 text-[10px] uppercase font-bold tracking-widest mb-8">Selecciona tu puesto en esta producción</p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    {['CÁMARA 1', 'CÁMARA 2', 'CÁMARA 3', 'CÁMARA 4', 'SONIDO', 'PISO'].map(role => (
                        <button
                            key={role}
                            onClick={() => handleRoleSelect(role)}
                            className="bg-stone-900 border border-stone-800 p-4 rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] hover:border-indigo-500 transition-colors active:scale-95"
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!activeAlert) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8 bg-black">
                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-800">
                    {isConnected ? (
                        <Wifi size={12} className="text-green-500" />
                    ) : (
                        <WifiOff size={12} className="text-red-500" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                        {isConnected ? 'Sincronizado' : 'Desconectado'}
                    </span>
                </div>

                <div className="w-24 h-24 bg-stone-900/50 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative">
                    <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                    <Bell className="text-stone-700" size={40} />
                </div>

                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">Estado del Sistema</h3>
                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">LISTO PARA ALERTAS</h2>

                <div className="bg-stone-900/50 border border-stone-800 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <Shield size={16} className="text-indigo-400" />
                    <div className="text-left">
                        <p className="text-[9px] text-stone-500 uppercase font-black tracking-widest leading-none">Tu Rol</p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{activeRole}</p>
                    </div>
                </div>

                <p className="mt-12 text-stone-600 text-[10px] uppercase font-bold tracking-widest max-w-[200px] leading-loose">
                    Mantén la pantalla encendida. El dispositivo vibrará al recibir órdenes.
                </p>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeAlert.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-12 px-6 overflow-hidden"
                style={{ backgroundColor: activeAlert.color || '#3b82f6' }}
            >
                {/* Background Pattern for urgency */}
                {activeAlert.message.toLowerCase().includes('aire') && (
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"
                    />
                )}

                <div className="w-full flex justify-between items-start z-10">
                    <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                        <p className="text-[9px] text-white/50 uppercase font-black tracking-widest leading-none mb-1">Coordinación</p>
                        <p className="text-xs font-black text-white uppercase tracking-tight">{activeAlert.senderName}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-right">
                        <p className="text-[9px] text-white/50 uppercase font-black tracking-widest leading-none mb-1">Tu Rol</p>
                        <p className="text-xs font-black text-white uppercase tracking-tight">{activeRole}</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full px-4">
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", damping: 12 }}
                    >
                        <h1 className="text-6xl sm:text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                            {activeAlert.message}
                        </h1>
                    </motion.div>
                </div>

                <div className="w-full max-w-sm grid grid-cols-2 gap-3 z-10">
                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'OK')}
                        className="col-span-2 flex items-center justify-center gap-3 bg-white text-stone-900 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl text-lg"
                    >
                        <CheckCircle size={28} />
                        CONFIRMAR OK
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Problema')}
                        className="flex flex-col items-center justify-center gap-1 bg-black/30 backdrop-blur-md border border-white/20 text-white py-5 rounded-[2rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        PROBLEMA
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'No me ponches')}
                        className="flex flex-col items-center justify-center gap-1 bg-red-600/40 backdrop-blur-md border border-red-400/30 text-white py-5 rounded-[2rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        PONCHE NO
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Check')}
                        className="flex flex-col items-center justify-center gap-1 bg-black/30 backdrop-blur-md border border-white/20 text-white py-4 rounded-[1.5rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        CHECK
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Listo')}
                        className="flex flex-col items-center justify-center gap-1 bg-green-600/40 backdrop-blur-md border border-green-400/30 text-white py-4 rounded-[1.5rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        LISTO
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
