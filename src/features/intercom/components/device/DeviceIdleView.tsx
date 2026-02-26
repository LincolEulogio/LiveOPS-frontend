import React from 'react';
import { Wifi, WifiOff, Shield, MessageCircle, Send, Bell, ChevronRight, CheckCircle, Volume2, Headset, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useWebRTC } from '@/features/intercom/hooks/useWebRTC';

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
    const { startTalking, stopTalking, isTalking, audioLevel, talkingUsers, talkingInfo } = useWebRTC({
        productionId,
        userId: user?.id || 'guest',
        isHost: false,
    });

    const isHostTalking = talkingUsers.has('admin') || Array.from(talkingUsers).some(id => id.includes('admin') || id.toLowerCase().includes('director'));
    const isPrivateComms = isHostTalking && talkingInfo?.targetUserId === user?.id;

    const activeScale = 1 + (audioLevel / 255) * 0.5;

    return (
        <div className="flex flex-col items-center justify-start min-h-[85vh] text-center py-12 bg-background safe-area-inset-bottom relative overflow-hidden">
            {/* Listening State Overlay */}
            <AnimatePresence>
                {isHostTalking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "absolute inset-0 pointer-events-none z-0 opacity-20",
                            isPrivateComms
                                ? "bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.3)_0%,transparent_70%)]"
                                : "bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.2)_0%,transparent_70%)]"
                        )}
                    />
                )}
            </AnimatePresence>

            {/* Top Status Bar */}
            <div className="w-full flex items-center justify-between mb-12 relative z-10">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card-bg/60 backdrop-blur-xl border border-card-border">
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
                    <span className="text-[10px] font-black uppercase text-foreground/80">
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
                className="w-full max-w-sm mb-10 text-left relative z-10"
            >
                <div className="mb-6">
                    <p className="text-[10px] text-muted uppercase font-black leading-none mb-1">Tu Identidad en Set</p>
                    <p className="text-lg font-black text-foreground uppercase">{activeRole}</p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div className="relative bg-card-bg border border-card-border p-6 sm:p-8 rounded-[2rem] overflow-hidden min-h-[160px] flex flex-col justify-center">
                        {activeBlock ? (
                            <>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-red-500 uppercase">Saliendo Al Aire</span>
                                </div>
                                <h4 className="text-2xl sm:text-3xl font-black text-foreground uppercase leading-none mb-2">
                                    {activeBlock.title}
                                </h4>
                                <p className="text-xs font-bold text-muted uppercase opacity-60">Bloque Actual de Producción</p>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-muted/30" />
                                    <span className="text-[10px] font-black text-muted uppercase">En Espera</span>
                                </div>
                                <h4 className="text-2xl font-black text-foreground/40 uppercase leading-none mb-2">
                                    Rundown Idle
                                </h4>
                                <p className="text-xs font-bold text-muted uppercase opacity-40 italic underline decoration-indigo-500/30 underline-offset-4">Esperando instrucción de control</p>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Chat Panel */}
            <div className="w-full max-w-sm bg-card-bg/40 backdrop-blur-xl border border-card-border/60 rounded-[2.5rem] flex flex-col h-[380px] overflow-hidden relative z-10">
                <div className="p-4 border-b border-card-border/50 bg-card-bg/50 flex justify-between items-center">
                    <h4 className="text-[11px] uppercase font-black text-indigo-400 flex items-center gap-2">
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
                                        className={cn("flex w-full mb-1", isMine ? "justify-end" : "justify-start")}
                                    >
                                        <div className={cn(
                                            "max-w-[85%] px-4 py-3 text-[12px] font-medium leading-normal",
                                            isMine
                                                ? "bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-[4px] border border-indigo-500/30 ring-4 ring-indigo-600/5"
                                                : "bg-background text-foreground rounded-[1.5rem] rounded-tl-[4px] border border-card-border/80 ring-4 ring-black/5"
                                        )}>
                                            <div className={cn("text-[10px] font-black uppercase mb-1", isMine ? "text-indigo-200" : "text-indigo-500")}>
                                                {isMine ? 'Tú' : (msg.senderName || 'Control Room')}
                                            </div>
                                            <div className="break-words mb-1 text-sm font-bold">
                                                {msg.message.replace('Mensaje:', '').trim()}
                                            </div>
                                            <div className={cn("text-[9px] font-black flex justify-end items-center gap-1", isMine ? "text-indigo-200/60" : "text-muted")}>
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
                            <p className="text-[10px] font-black uppercase text-muted">No hay mensajes recientes</p>
                        </div>
                    )}
                </div>

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
                            className="flex-1 bg-transparent px-5 py-2.5 text-sm text-foreground focus:outline-none placeholder:text-muted font-black uppercase"
                        />
                        <button
                            type="submit"
                            disabled={!customMessage.trim()}
                            className={cn(
                                "p-2.5 rounded-full transition-all active:scale-90 group/send",
                                customMessage.trim()
                                    ? "bg-indigo-600 text-white border border-indigo-500"
                                    : "bg-white/5 text-muted border border-transparent"
                            )}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Communication Indicators Label */}
            <AnimatePresence>
                {isHostTalking && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-6 mb-2 flex flex-col items-center gap-1 z-10"
                    >
                        <div className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-full border border-card-border backdrop-blur-md animate-pulse",
                            isPrivateComms ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30"
                        )}>
                            <div className="relative">
                                {isPrivateComms ? (
                                    <Volume2 size={16} className="text-amber-500" />
                                ) : (
                                    <Headset size={16} className="text-red-500" />
                                )}
                                <div className={cn(
                                    "absolute -inset-1 rounded-full animate-ping opacity-40",
                                    isPrivateComms ? "bg-amber-500" : "bg-red-500"
                                )} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] italic",
                                isPrivateComms ? "text-amber-500" : "text-red-500"
                            )}>
                                {isPrivateComms ? 'ESCUCHANDO DIRECTOR' : 'COMUNICACIÓN ACTIVA'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PTT Section */}
            <div className="mt-2 relative w-full flex items-center justify-center gap-6 py-4 z-10">
                <div className="relative w-24 flex justify-center">
                    <AnimatePresence mode="wait">
                        {isHostTalking ? (
                            <motion.div
                                key="active-speaker"
                                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                                className={cn(
                                    "relative w-24 h-24 rounded-[2rem] border-2 backdrop-blur-3xl shadow-2xl flex flex-col items-center justify-center gap-1",
                                    isPrivateComms
                                        ? "bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-amber-500/20"
                                        : "bg-red-500/20 border-red-500/40 text-red-500 shadow-red-500/20"
                                )}
                            >
                                <div className="relative">
                                    <Volume2 size={40} className="relative z-10" />
                                    <motion.div
                                        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className={cn(
                                            "absolute inset-0 rounded-full",
                                            isPrivateComms ? "bg-amber-500" : "bg-red-500"
                                        )}
                                    />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-tighter opacity-80">
                                    {isPrivateComms ? 'DIRECTOR' : 'BROADCAST'}
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle-speaker"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.2 }}
                                className="w-24 h-24 rounded-[2rem] border border-dashed border-card-border flex items-center justify-center text-muted"
                            >
                                <Volume2 size={32} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onPointerDown={(e) => { e.preventDefault(); startTalking(); }}
                    onPointerUp={(e) => { e.preventDefault(); stopTalking(); }}
                    onPointerLeave={() => stopTalking()}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ transform: `scale(${isTalking ? activeScale : 1})` }}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-40 h-40 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-75 select-none touch-none",
                        isTalking
                            ? "bg-red-600 ring-8 ring-red-500/30 text-white"
                            : "bg-indigo-600 ring-4 ring-indigo-500/20 text-indigo-100 hover:bg-indigo-500"
                    )}
                >
                    <Mic size={48} className={cn("mb-2 transition-transform", isTalking && "animate-pulse scale-110")} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">
                        {isTalking ? 'HABLANDO...' : 'MANTENER PRESIONADO'}
                    </span>
                    {isTalking && (
                        <div className="absolute -inset-4 rounded-full border border-red-500/50 animate-ping opacity-50" />
                    )}
                </button>

                <div className="w-24 hidden sm:block pointer-events-none opacity-0" />
            </div>

            <div className="mt-8 flex flex-col items-center gap-8 w-full max-w-sm relative z-10">
                <button
                    onClick={onSubscribePush}
                    className="w-full flex items-center justify-between p-4 bg-card-bg/50 border border-card-border rounded-2xl group active:scale-95 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 group-active:bg-amber-500 group-active:text-black transition-colors">
                            <Bell size={18} className="text-amber-400 group-active:text-inherit" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-foreground">Activar Notificaciones Push</p>
                            <p className="text-[9px] text-muted font-black uppercase">Alertas en pantalla bloqueada</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                </button>

                <p className="text-muted text-[10px] uppercase font-bold max-w-[200px] leading-loose text-center opacity-60">
                    Mantén la pantalla encendida. El dispositivo vibrará al recibir alertas.
                </p>

                <div className="flex items-center gap-2 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                    <span className="text-[10px] font-black uppercase">Screen Always On</span>
                </div>
            </div>
        </div>
    );
};
