import React from 'react';
import { Wifi, WifiOff, Shield, MessageCircle, Send, Bell, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useWebRTC } from '@/features/intercom/hooks/useWebRTC';
import { Mic } from 'lucide-react';

interface DeviceIdleViewProps {
    productionId: string;
    isConnected: boolean;
    activeRole: string;
    activeBlock: any;
    userHistory: any[];
    user: any;
    customMessage: string;
    setCustomMessage: (val: string) => void;
    onSendCustomMessage: (e: React.FormEvent) => void;
    onSubscribePush: () => void;
}

export const DeviceIdleView: React.FC<DeviceIdleViewProps> = ({
    isConnected,
    activeRole,
    activeBlock,
    userHistory,
    user,
    customMessage,
    setCustomMessage,
    onSendCustomMessage,
    onSubscribePush,
    productionId
}) => {
    const { startTalking, stopTalking, isTalking, audioLevel } = useWebRTC({
        productionId,
        userId: user?.id || 'guest',
        isHost: false,
    });

    // Calculate a pulse scale based on audio volume (0 to ~1)
    const activeScale = 1 + (audioLevel / 255) * 0.5;

    return (
        <div className="flex flex-col items-center justify-start min-h-[85vh] text-center py-12 bg-background safe-area-inset-bottom">
            {/* Top Status Bar - Floating Style */}
            <div className="w-full flex items-center justify-between mb-12">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card-bg/60 backdrop-blur-xl border border-card-border ">
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
                    <span className="text-[10px] font-black uppercase  text-foreground/80">
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
                    <p className="text-[10px] text-muted uppercase font-black  leading-none mb-1">Tu Identidad en Set</p>
                    <p className="text-lg font-black text-foreground uppercase ">{activeRole}</p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div className="relative bg-card-bg border border-card-border p-6 sm:p-8 rounded-[2rem]  overflow-hidden min-h-[160px] flex flex-col justify-center">
                        {activeBlock ? (
                            <>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-red-500 uppercase ">Saliendo Al Aire</span>
                                </div>
                                <h4 className="text-2xl sm:text-3xl font-black text-foreground uppercase er leading-none mb-2">
                                    {activeBlock.title}
                                </h4>
                                <p className="text-xs font-bold text-muted uppercase  opacity-60">Bloque Actual de Producción</p>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-muted/30" />
                                    <span className="text-[10px] font-black text-muted uppercase ">En Espera</span>
                                </div>
                                <h4 className="text-2xl font-black text-foreground/40 uppercase er leading-none mb-2">
                                    Rundown Idle
                                </h4>
                                <p className="text-xs font-bold text-muted uppercase  opacity-40 italic underline decoration-indigo-500/30 underline-offset-4">Esperando instrucción de control</p>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* WhatsApp Style Chat Panel */}
            <div className="w-full max-w-sm bg-card-bg/40 backdrop-blur-xl border border-card-border/60 rounded-[2.5rem] flex flex-col h-[380px]  overflow-hidden">
                <div className="p-4 border-b border-card-border/50 bg-card-bg/50 flex justify-between items-center">
                    <h4 className="text-[11px] uppercase font-black  text-indigo-400 flex items-center gap-2">
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
                                                max-w-[85%] px-4 py-3 text-[12px] font-medium leading-normal 
                                                ${isMine
                                                    ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-[4px] border border-indigo-500/30 ring-4 ring-indigo-600/5'
                                                    : 'bg-background text-foreground rounded-[1.5rem] rounded-tl-[4px] border border-card-border/80 ring-4 ring-black/5'
                                                }
                                            `}
                                        >
                                            <div className={`text-[10px] font-black uppercase  ${isMine ? 'text-indigo-200' : 'text-indigo-500'} mb-1`}>
                                                {isMine ? 'Tú' : (msg.senderName || 'Control Room')}
                                            </div>
                                            <div className="break-words mb-1 text-sm font-bold ">
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
                            <p className="text-[10px] font-black uppercase  text-muted">No hay mensajes recientes</p>
                        </div>
                    )}
                </div>

                {/* Quick Reply Box */}
                <div className="p-4 border-t border-card-border/50 bg-card-bg/80">
                    <form
                        onSubmit={onSendCustomMessage}
                        className="flex items-center bg-background border-2 border-card-border rounded-full p-1 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all"
                    >
                        <input
                            type="text"
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Escribe a control..."
                            className="flex-1 bg-transparent px-5 py-2.5 text-sm text-foreground focus:outline-none placeholder:text-muted font-black uppercase "
                        />
                        <button
                            type="submit"
                            disabled={!customMessage.trim()}
                            className={cn(
                                "p-2.5 rounded-full transition-all active:scale-90 group/send",
                                customMessage.trim()
                                    ? "bg-indigo-600 text-white   border border-indigo-500"
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

            {/* Huge PTT Walkie-Talkie Button */}
            <div className="mt-8 relative w-full flex justify-center py-4">
                <button
                    onPointerDown={(e) => { e.preventDefault(); startTalking(); }}
                    onPointerUp={(e) => { e.preventDefault(); stopTalking(); }}
                    onPointerLeave={() => stopTalking()}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ transform: `scale(${isTalking ? activeScale : 1})` }}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-36 h-36 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-75 select-none touch-none",
                        isTalking
                            ? "bg-red-600 ring-8 ring-red-500/30 text-white"
                            : "bg-indigo-600 ring-4 ring-indigo-500/20 text-indigo-100 hover:bg-indigo-500"
                    )}
                >
                    <Mic size={48} className={cn("mb-2 transition-transform", isTalking && "animate-pulse scale-110")} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">
                        {isTalking ? 'HABLANDO...' : 'MANTENER PRESIONADO'}
                    </span>

                    {/* Ring animation when talking */}
                    {isTalking && (
                        <div className="absolute -inset-4 rounded-full border border-red-500/50 animate-ping opacity-50" />
                    )}
                </button>
            </div>

            <div className="mt-8 flex flex-col items-center gap-8 w-full max-w-sm">
                <button
                    onClick={onSubscribePush}
                    className="w-full flex items-center justify-between p-4 bg-card-bg/50 border border-card-border rounded-2xl group active:scale-95 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 group-active:bg-amber-500 group-active:text-black transition-colors">
                            <Bell size={18} className="text-amber-400 group-active:text-inherit" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-foreground ">Activar Notificaciones Push</p>
                            <p className="text-[9px] text-muted font-black uppercase ">Alertas en pantalla bloqueada</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                </button>

                <p className="text-muted text-[10px] uppercase font-bold  max-w-[200px] leading-loose text-center opacity-60">
                    Mantén la pantalla encendida. El dispositivo vibrará al recibir alertas.
                </p>

                <div className="flex items-center gap-2 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                    <span className="text-[10px] font-black uppercase ">Screen Always On</span>
                </div>
            </div>
        </div>
    );
};
