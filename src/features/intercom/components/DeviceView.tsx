'use client';

import React from 'react';
import { useIntercomStore } from '../store/intercom.store';
import { useIntercom } from '../hooks/useIntercom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Bell, CheckCircle, XCircle, Wifi, WifiOff, Shield, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/shared/socket/socket.provider';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { useAppStore } from '@/shared/store/app.store';

export const DeviceView = () => {
    const { activeAlert } = useIntercomStore();
    const { acknowledgeAlert } = useIntercom();
    const user = useAuthStore((state) => state.user);
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const [customMessage, setCustomMessage] = React.useState('');

    // Derived values
    const { isConnected } = useSocket();
    const activeRole = user?.role?.name || user?.globalRole?.name || 'OPERATOR';

    // Fetch timeline blocks to know the current active segment
    const { data: timelineBlocks = [] } = useQuery<any[]>({
        queryKey: ['timeline', activeProductionId],
        queryFn: async () => {
            if (!activeProductionId) return [];
            return await (apiClient.get(`/productions/${activeProductionId}/timeline`) as any);
        },
        enabled: !!activeProductionId,
    });

    // Find the currently active block
    const activeBlock = timelineBlocks.find((b) => b.status === 'ACTIVE');

    // Get the last coordinator who sent a message from history
    const history = useIntercomStore((state) => state.history);
    const lastCoordinator = history.length > 0 ? history[0].senderName : 'Esperando...';

    const handleSendCustomMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customMessage.trim()) return;
        
        // This leverages the "acknowledgeAlert" logic which sends a response back to the Dashboard
        // We use a dummy ID 'chat' to indicate it's a direct message and not an alert acknowledgment
        acknowledgeAlert('chat', customMessage.trim());
        setCustomMessage('');
        setIsChatOpen(false);
    };

    if (!activeAlert) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8 bg-black">
                {/* Top Status Bar */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-stone-800 pointer-events-auto">
                        {isConnected ? (
                            <Wifi size={12} className="text-green-500" />
                        ) : (
                            <WifiOff size={12} className="text-red-500" />
                        )}
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
                            {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>

                    <button 
                        onClick={() => setIsChatOpen(true)}
                        className="flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 backdrop-blur-md px-4 py-3 rounded-2xl border border-stone-800 pointer-events-auto transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <MessageCircle size={16} className="text-indigo-400" />
                        <span className="text-[10px] text-white font-black uppercase tracking-[0.2em] mt-0.5">Chat</span>
                    </button>
                </div>

                <div className="w-24 h-24 bg-stone-900/50 rounded-full flex items-center justify-center mb-10 border border-white/5 shadow-2xl relative">
                    <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                    <Bell className="text-stone-700" size={40} />
                </div>

                {/* Current Production Status */}
                <div className="mb-10 w-full max-w-sm flex flex-col items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-3">En Vivo Ahora</h3>
                    <div className="bg-stone-900/50 border border-stone-800 px-6 py-4 rounded-3xl w-full">
                        {activeBlock ? (
                            <div className="flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-500 uppercase tracking-widest mb-2 border border-red-500/20">Al Aire</span>
                                <h4 className="text-lg font-bold text-white uppercase tracking-tighter leading-tight text-center">
                                    {activeBlock.title}
                                </h4>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center opacity-50">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-stone-800 text-stone-400 uppercase tracking-widest mb-2">Standby</span>
                                <h4 className="text-sm font-bold text-stone-300 uppercase tracking-tighter text-center">
                                    No hay bloque activo
                                </h4>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 px-6 py-4 rounded-2xl flex items-center gap-4 w-full max-w-xs shadow-2xl">
                    <div className="bg-indigo-500/20 p-2 text-indigo-400 rounded-xl">
                        <Shield size={20} />
                    </div>
                    <div className="text-left flex-1">
                        <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest leading-none mb-1">Tu Rol Activo</p>
                        <p className="text-base font-bold text-white uppercase tracking-tight">{activeRole}</p>
                    </div>
                </div>

                <p className="mt-12 text-stone-600 text-[10px] uppercase font-bold tracking-widest max-w-[200px] leading-loose">
                    Mantén la pantalla encendida. El dispositivo vibrará al recibir alertas.
                </p>

                {/* Chat Modal */}
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-6 left-6 right-6 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl z-50 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <MessageCircle size={14} /> Enviar Mensaje
                                </h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-stone-500 hover:text-white transition-colors bg-stone-800/50 p-1.5 rounded-full">
                                    <X size={16} />
                                </button>
                            </div>
                            <form onSubmit={handleSendCustomMessage} className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Escribe tu mensaje al master..."
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-stone-600 font-bold"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!customMessage.trim()}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-stone-800 disabled:text-stone-500 text-white rounded-xl py-3 font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    Enviar al Control
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                        className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"
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
