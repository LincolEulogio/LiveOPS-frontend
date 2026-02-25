'use client';

import React from 'react';
import { useIntercomStore } from '../store/intercom.store';
import { useIntercom } from '../hooks/useIntercom';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Bell, CheckCircle, XCircle, Wifi, WifiOff, Shield, MessageCircle, X, Send, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/shared/socket/socket.provider';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { useAppStore } from '@/shared/store/app.store';
import { TimelineBlock } from '../../timeline/types/timeline.types';
import { cn } from '@/shared/utils/cn';

export const DeviceView = () => {
    const { activeAlert, history } = useIntercomStore();
    const { acknowledgeAlert, sendCommand, sendDirectMessage } = useIntercom();
    const user = useAuthStore((state) => state.user);
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const [customMessage, setCustomMessage] = React.useState('');
    const [alertReply, setAlertReply] = React.useState('');

    // Derived values
    const { isConnected } = useSocket();
    const activeRole = user?.role?.name || user?.globalRole?.name || 'OPERATOR';
    const { subscribeToPush } = usePushNotifications();

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
            sendDirectMessage({
                message: `Mensaje: ${customMessage.trim()}`,
                targetUserId: lastTargetUserId,
            });
        }

        setCustomMessage('');
    };

    if (!activeAlert) {
        return (
            <div className="flex flex-col items-center justify-start min-h-[85vh] text-center py-12 bg-background safe-area-inset-bottom">
                {/* Top Status Bar - Floating Style */}
                <div className="w-full flex items-center justify-between mb-12">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card-bg/60 backdrop-blur-xl border border-card-border shadow-sm">
                        <div className="relative">
                            {isConnected ? (
                                <>
                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                                    <Wifi size={14} className="text-green-500 relative" />
                                </>
                            ) : (
                                <WifiOff size={14} className="text-red-500" />
                            )}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/80">
                            {isConnected ? 'SISTEMA CONECTADO' : 'SIN CONEXIÓN'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                            <Shield className="text-indigo-400" size={20} />
                        </div>
                    </div>
                </div>

                {/* Hero Status Section */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm mb-10 text-left"
                >
                    <div className="mb-6">
                        <p className="text-[10px] text-muted uppercase font-black tracking-widest leading-none mb-1">Tu Identidad en Set</p>
                        <p className="text-lg font-black text-foreground uppercase tracking-tight">{activeRole}</p>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <div className="relative bg-card-bg border border-card-border p-6 sm:p-8 rounded-[2rem] shadow-xl overflow-hidden min-h-[160px] flex flex-col justify-center">
                            {activeBlock ? (
                                <>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Saliendo Al Aire</span>
                                    </div>
                                    <h4 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tighter leading-none mb-2">
                                        {activeBlock.title}
                                    </h4>
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest opacity-60">Bloque Actual de Producción</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-muted/30" />
                                        <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">En Espera</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-foreground/40 uppercase tracking-tighter leading-none mb-2">
                                        Rundown Idle
                                    </h4>
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest opacity-40 italic underline decoration-indigo-500/30 underline-offset-4">Esperando instrucción de control</p>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* WhatsApp Style Chat Panel */}
                <div className="w-full max-w-sm bg-card-bg/40 backdrop-blur-xl border border-card-border/60 rounded-[2.5rem] flex flex-col h-[380px] shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-card-border/50 bg-card-bg/50 flex justify-between items-center">
                        <h4 className="text-[11px] uppercase font-black tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <MessageCircle size={14} /> Canal de Comandos
                        </h4>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 gap-3 custom-scrollbar flex flex-col-reverse justify-start">
                        {userHistory.length > 0 ? (
                            [...userHistory].map((msg, i) => {
                                const isMine = msg.senderId === user?.id;

                                return (
                                    <AnimatePresence key={`msg-${i}`}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
                                        >
                                            <div
                                                className={`
                                                    max-w-[85%] px-4 py-3 text-[12px] font-medium leading-normal shadow-sm
                                                    ${isMine
                                                        ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-[4px] border border-indigo-500/30 ring-4 ring-indigo-600/5'
                                                        : 'bg-background text-foreground rounded-[1.5rem] rounded-tl-[4px] border border-card-border/80 ring-4 ring-black/5'
                                                    }
                                                `}
                                            >
                                                <div className={`text-[10px] font-black uppercase tracking-widest ${isMine ? 'text-indigo-200' : 'text-indigo-500'} mb-1`}>
                                                    {isMine ? 'Tú' : (msg.senderName || 'Control Room')}
                                                </div>
                                                <div className="break-words mb-1 text-sm font-bold tracking-tight">
                                                    {msg.message.replace('Mensaje:', '').trim()}
                                                </div>
                                                <div className={`text-[9px] font-black flex justify-end items-center gap-1 ${isMine ? 'text-indigo-200/60' : 'text-muted'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    {isMine && <CheckCircle size={10} className="fill-current" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                );
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                                    <MessageCircle size={24} className="text-indigo-400" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted">No hay mensajes recientes</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Reply Box */}
                    <div className="p-4 border-t border-card-border/50 bg-card-bg/80">
                        <form
                            onSubmit={handleSendCustomMessage}
                            className="flex items-center bg-background border-2 border-card-border rounded-full p-1 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all"
                        >
                            <input
                                type="text"
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Escribe a control..."
                                className="flex-1 bg-transparent px-5 py-2.5 text-sm text-foreground focus:outline-none placeholder:text-muted font-black uppercase tracking-tight"
                            />
                            <button
                                type="submit"
                                disabled={!customMessage.trim()}
                                className={cn(
                                    "p-2.5 rounded-full transition-all active:scale-90 group/send",
                                    customMessage.trim()
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500"
                                        : "bg-white/5 text-muted border border-transparent"
                                )}
                            >
                                <Send size={18} className={cn(
                                    "transition-transform",
                                    customMessage.trim() && "group-hover/send:translate-x-0.5"
                                )} />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-8 w-full max-w-sm">
                    <button
                        onClick={async () => {
                            const result = await subscribeToPush();
                            if (result.success) {
                                alert('¡Notificaciones activadas!');
                            } else {
                                alert(`Error al activar notificaciones: ${result.error}`);
                            }
                        }}
                        className="w-full flex items-center justify-between p-4 bg-card-bg/50 border border-card-border rounded-2xl group active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 group-active:bg-amber-500 group-active:text-black transition-colors">
                                <Bell size={18} className="text-amber-400 group-active:text-inherit" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-foreground tracking-tight">Activar Notificaciones Push</p>
                                <p className="text-[9px] text-muted font-black uppercase tracking-widest">Alertas en pantalla bloqueada</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-muted" />
                    </button>

                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest max-w-[200px] leading-loose text-center opacity-60">
                        Mantén la pantalla encendida. El dispositivo vibrará al recibir alertas.
                    </p>

                    <div className="flex items-center gap-2 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Screen Always On</span>
                    </div>
                </div>
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

                <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full px-4 text-white">
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", damping: 12 }}
                    >
                        <h1 className="text-6xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                            {activeAlert.message}
                        </h1>
                    </motion.div>
                </div>

                <div className="w-full max-w-sm grid grid-cols-2 gap-3 z-10">
                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Confirmado')}
                        className="col-span-2 flex items-center justify-center gap-3 bg-white text-black py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-2xl text-lg"
                    >
                        <CheckCircle size={28} />
                        CONFIRMADO
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Problema')}
                        className="flex flex-col items-center justify-center gap-1 bg-black/20 backdrop-blur-md border border-white/20 text-white py-5 rounded-[2rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        PROBLEMA
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'No me ponches')}
                        className="flex flex-col items-center justify-center gap-1 bg-red-600/40 backdrop-blur-md text-white border border-red-500/30 py-5 rounded-[2rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        PONCHE NO
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Check')}
                        className="flex flex-col items-center justify-center gap-1 bg-black/20 backdrop-blur-md border border-white/20 text-white py-4 rounded-[1.5rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        CHECK
                    </button>

                    <button
                        onClick={() => acknowledgeAlert(activeAlert.id, 'Listo')}
                        className="flex flex-col items-center justify-center gap-1 bg-green-600/40 backdrop-blur-md text-white border border-green-500/30 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                    >
                        LISTO
                    </button>

                    {/* Chat Response Input */}
                    <div className="col-span-2 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-2 flex items-center gap-2 transition-all focus-within:bg-white/20 focus-within:border-white/40">
                        <input
                            type="text"
                            value={alertReply}
                            onChange={(e) => setAlertReply(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && alertReply.trim()) {
                                    e.preventDefault();
                                    acknowledgeAlert(activeAlert.id, `Mensaje: ${alertReply.trim()}`);
                                    setAlertReply('');
                                }
                            }}
                            placeholder="Respuesta rápida..."
                            className="flex-1 bg-transparent px-4 py-2 text-sm text-white focus:outline-none placeholder:text-white/40 font-bold"
                        />
                        <button
                            onClick={() => {
                                if (alertReply.trim()) {
                                    acknowledgeAlert(activeAlert.id, `Mensaje: ${alertReply.trim()}`);
                                    setAlertReply('');
                                }
                            }}
                            disabled={!alertReply.trim()}
                            className="bg-white text-black p-3 rounded-2xl transition-colors active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
