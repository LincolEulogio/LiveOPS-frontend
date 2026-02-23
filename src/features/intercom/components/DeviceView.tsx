'use client';

import React from 'react';
import { useIntercomStore } from '../store/intercom.store';
import { useIntercom } from '../hooks/useIntercom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Bell, CheckCircle, XCircle, Wifi, WifiOff, Shield, MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/shared/socket/socket.provider';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { useAppStore } from '@/shared/store/app.store';
import { TimelineBlock } from '../../timeline/types/timeline.types';

export const DeviceView = () => {
    const { activeAlert, history } = useIntercomStore();
    const { acknowledgeAlert, sendCommand, sendDirectMessage } = useIntercom();
    const user = useAuthStore((state) => state.user);
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const [customMessage, setCustomMessage] = React.useState('');
    const [alertReply, setAlertReply] = React.useState('');

    // Derived values
    const { isConnected } = useSocket();
    const activeRole = user?.role?.name || user?.globalRole?.name || 'OPERATOR';

    // Fetch timeline blocks to know the current active segment
    const { data: timelineBlocks = [] } = useQuery<TimelineBlock[]>({
        queryKey: ['timeline', activeProductionId],
        queryFn: async () => {
            if (!activeProductionId) return [];
            return await apiClient.get<TimelineBlock[]>(`/productions/${activeProductionId}/timeline`);
        },
        enabled: !!activeProductionId,
    });

    // Find the currently active block
    const activeBlock = timelineBlocks.find((b) => b.status === 'ACTIVE');

    // Filter history to ONLY show chat messages (WhatsApp style) and not commands/alerts
    const userHistory = history.filter(h =>
        h.message?.startsWith('Mensaje:')
    ).slice(0, 15); // Show last 15

    const handleSendCustomMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customMessage.trim()) return;

        // Extract last coordinator ID
        const chatMsgs = history.filter(h => h.message.startsWith('Mensaje:') && h.senderId !== user?.id);
        const lastTargetUserId = chatMsgs.length > 0 ? chatMsgs[0].senderId : undefined;

        if (lastTargetUserId) {
            // Send a direct message back via standard command
            sendDirectMessage({
                message: `Mensaje: ${customMessage.trim()}`,
                targetUserId: lastTargetUserId,
            });
        }

        setCustomMessage('');
        setIsChatOpen(false);
    };

    if (!activeAlert) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8 bg-background">
                {/* Top Status Bar */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card-bg/80 backdrop-blur-md border border-card-border pointer-events-auto">
                        {isConnected ? (
                            <Wifi size={12} className="text-green-500" />
                        ) : (
                            <WifiOff size={12} className="text-red-500" />
                        )}
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted">
                            {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>

                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="flex items-center gap-2 bg-card-bg/80 hover:bg-card-border backdrop-blur-md px-4 py-3 rounded-2xl border border-card-border pointer-events-auto transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <MessageCircle size={16} className="text-indigo-400" />
                        <span className="text-[10px] text-foreground font-black uppercase tracking-[0.2em] mt-0.5">Chat</span>
                    </button>
                </div>

                <div className="w-24 h-24 bg-card-bg/50 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative">
                    <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                    <Bell className="text-muted" size={40} />
                </div>

                {/* Current Production Status */}
                <div className="mb-10 w-full max-w-sm flex flex-col items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-3">En Vivo Ahora</h3>
                    <div className="bg-card-bg/50 border border-card-border px-6 py-4 rounded-3xl w-full">
                        {activeBlock ? (
                            <div className="flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-500 uppercase tracking-widest mb-2 border border-red-500/20">Al Aire</span>
                                <h4 className="text-lg font-bold text-white uppercase tracking-tighter leading-tight text-center">
                                    {activeBlock.title}
                                </h4>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center opacity-50">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-card-border text-muted uppercase tracking-widest mb-2">Standby</span>
                                <h4 className="text-sm font-bold text-foreground uppercase tracking-tighter text-center">
                                    No hay bloque activo
                                </h4>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card-bg border border-card-border px-6 py-4 rounded-2xl flex items-center gap-4 w-full max-w-sm shadow-2xl mb-8">
                    <div className="bg-indigo-500/20 p-2 text-indigo-400 rounded-xl">
                        <Shield size={20} />
                    </div>
                    <div className="text-left flex-1">
                        <p className="text-[10px] text-muted uppercase font-black tracking-widest leading-none mb-1">Tu Rol Activo</p>
                        <p className="text-base font-bold text-foreground uppercase tracking-tight">{activeRole}</p>
                    </div>
                </div>

                {/* Inline Chat History Panel */}
                <div className="w-full max-w-sm bg-card-bg/30 border border-card-border/50 rounded-3xl flex flex-col h-[280px] overflow-hidden">
                    <div className="p-3 border-b border-card-border/50 bg-card-bg/50 flex justify-between items-center">
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-400 flex items-center gap-2">
                            <MessageCircle size={12} /> Mensajes Recientes
                        </h4>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 gap-3 custom-scrollbar flex flex-col-reverse justify-start">
                        {userHistory.length > 0 ? (
                            [...userHistory].map((msg, i) => {
                                const isMine = msg.senderId === user?.id;

                                return (
                                    <AnimatePresence key={`msg-${i}`}>
                                        <motion.div
                                            initial={{ opacity: 0, x: isMine ? 10 : -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-2`}
                                        >
                                            <div
                                                className={`
                                                    max-w-[85%] px-3 py-2 text-[11px] font-medium leading-tight shadow-md
                                                    ${isMine
                                                        ? 'bg-indigo-600/20 text-indigo-200 rounded-2xl rounded-tr-sm border border-indigo-500/30'
                                                        : 'bg-card-border text-foreground rounded-2xl rounded-tl-sm border border-card-border/50'
                                                    }
                                                `}
                                            >
                                                <div className={`text-[9px] font-black uppercase tracking-widest ${isMine ? 'text-indigo-400' : 'text-indigo-300'} mb-0.5`}>
                                                    {isMine ? `Tú (${user?.role?.name || user?.globalRole?.name || 'Operador'})` : (msg.senderName || 'Control')}
                                                </div>
                                                <div className="break-words mb-1 text-sm font-semibold opacity-90">
                                                    {msg.message.replace('Mensaje:', '').trim()}
                                                </div>
                                                <div className={`text-[8px] font-bold text-right pt-1 flex justify-end items-center gap-1 ${isMine ? 'text-indigo-300' : 'text-muted'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMine && <CheckCircle size={10} className="opacity-70" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                );
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                <MessageCircle size={24} className="mb-2 text-muted/50" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted">No hay mensajes directos</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Reply Box */}
                    <div className="p-3 border-t border-card-border/50 bg-card-bg/50 mt-auto">
                        <form
                            onSubmit={handleSendCustomMessage}
                            className="flex items-center gap-2 bg-black/40 rounded-xl p-1.5 border border-white/5 focus-within:border-indigo-500/50 transition-colors"
                        >
                            <input
                                type="text"
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Responder a control..."
                                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-foreground focus:outline-none placeholder:text-muted font-bold"
                            />
                            <button
                                type="submit"
                                disabled={!customMessage.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-card-border disabled:text-muted text-foreground p-2 rounded-lg transition-colors active:scale-95"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </div>

                <p className="mt-8 text-muted text-[10px] uppercase font-bold tracking-widest max-w-[200px] leading-loose text-center">
                    Mantén la pantalla encendida. El dispositivo vibrará al recibir alertas.
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
                        className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"
                    />
                )}

                <div className="w-full flex justify-between items-start z-10">
                    <div className="bg-background/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-foreground/10">
                        <p className="text-[9px] text-muted uppercase font-black tracking-widest leading-none mb-1">Coordinación</p>
                        <p className="text-xs font-black text-foreground uppercase tracking-tight">{activeAlert.senderName}</p>
                    </div>
                    <div className="bg-background/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-foreground/10 text-right">
                        <p className="text-[9px] text-muted uppercase font-black tracking-widest leading-none mb-1">Tu Rol</p>
                        <p className="text-xs font-black text-foreground uppercase tracking-tight">{activeRole}</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full px-4">
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", damping: 12 }}
                    >
                        <h1 className="text-6xl sm:text-7xl md:text-9xl font-black text-foreground uppercase tracking-tighter leading-[0.85] drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                            {activeAlert.message}
                        </h1>
                    </motion.div>
                </div>

                <div className="w-full max-w-sm grid grid-cols-2 gap-3 z-10">
                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Confirmado')}
                        className="col-span-2 flex items-center justify-center gap-3 bg-foreground text-background py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl text-lg"
                    >
                        <CheckCircle size={28} />
                        CONFIRMADO
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Problema')}
                        className="flex flex-col items-center justify-center gap-1 bg-background/30 backdrop-blur-md border border-foreground/20 text-foreground py-5 rounded-[2rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
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
                        className="flex flex-col items-center justify-center gap-1 bg-background/30 backdrop-blur-md border border-foreground/20 text-foreground py-4 rounded-[1.5rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        CHECK
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Listo')}
                        className="flex flex-col items-center justify-center gap-1 bg-green-600/40 backdrop-blur-md border border-green-400/30 text-white py-4 rounded-[1.5rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        LISTO
                    </button>

                    {/* Chat Response Input */}
                    <div className="col-span-2 mt-2 bg-background/40 backdrop-blur-md border border-foreground/20 rounded-3xl p-2 flex items-center gap-2 transition-all focus-within:bg-background/60 focus-within:border-foreground/40">
                        <input
                            type="text"
                            value={alertReply}
                            onChange={(e) => setAlertReply(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && alertReply.trim()) {
                                    e.preventDefault();

                                    // 1. Send to true 1-1 chat history
                                    sendCommand({
                                        message: `Mensaje: ${alertReply.trim()}`,
                                        targetUserId: activeAlert.senderId,
                                        requiresAck: true,
                                    });

                                    // 2. Clear this alert and update master dashboard status indicator
                                    acknowledgeAlert(activeAlert.id, `Mensaje: ${alertReply.trim()}`);

                                    setAlertReply('');
                                }
                            }}
                            placeholder="Escribe tu respuesta personalizada..."
                            className="flex-1 bg-transparent px-4 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted font-bold"
                        />
                        <button
                            onClick={() => {
                                if (alertReply.trim()) {
                                    sendCommand({
                                        message: `Mensaje: ${alertReply.trim()}`,
                                        targetUserId: activeAlert.senderId,
                                        requiresAck: true,
                                    });
                                    acknowledgeAlert(activeAlert.id, `Mensaje: ${alertReply.trim()}`);
                                    setAlertReply('');
                                }
                            }}
                            disabled={!alertReply.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-foreground/10 disabled:text-foreground/30 text-foreground p-3 rounded-2xl transition-colors active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
