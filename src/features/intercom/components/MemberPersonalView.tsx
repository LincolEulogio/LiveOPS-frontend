'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { useIntercom } from '@/features/intercom/hooks/useIntercom';
import { useIntercomStore } from '@/features/intercom/store/intercom.store';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    Send,
    Activity,
    Wifi,
    Battery,
    ChevronRight,
    MessageSquare,
    Headset,
    Mic,
    Tv
} from 'lucide-react';
import { useTally } from '@/features/streaming/hooks/useTally';
import { useWebRTC } from '@/features/intercom/hooks/useWebRTC';
import { useAppStore } from '@/shared/store/app.store';

interface MemberPersonalViewProps {
    userId: string;
    productionId: string;
}

export const MemberPersonalView = ({ userId, productionId }: MemberPersonalViewProps) => {
    const { acknowledgeAlert, members } = useIntercom(userId);
    const { activeAlert, history } = useIntercomStore();
    const { setActiveProductionId } = useAppStore();
    const [lastResponse, setLastResponse] = useState<string | null>(null);
    const { tally } = useTally(productionId);
    const [associatedSource, setAssociatedSource] = useState<string | null>(null);

    // Get current member info to find associated source
    const me = members.find(m => m.userId === userId);
    const myRole = me?.roleName;

    const { talkingUsers } = useWebRTC({
        productionId,
        userId,
        isHost: false
    });

    const isHostTalking = talkingUsers.has('admin') || Array.from(talkingUsers).some(id => id.includes('admin') || id.toLowerCase().includes('director'));

    // Try to auto-detect source by role name (e.g. "Cam 1")
    useEffect(() => {
        if (myRole && myRole.toLowerCase().includes('cam')) {
            setAssociatedSource(myRole);
        }
    }, [myRole]);

    // Sync production context for socket
    useEffect(() => {
        if (productionId) {
            setActiveProductionId(productionId);
        }
    }, [productionId, setActiveProductionId]);

    // Filter history for this specific user's alerts
    const myHistory = history.filter(h =>
        (h.status === 'ACKNOWLEDGED' || h.id === activeAlert?.id)
    );

    const handleRespond = (type: string) => {
        if (activeAlert) {
            acknowledgeAlert(activeAlert.id, type);
            setLastResponse(type);
            if ('vibrate' in navigator) navigator.vibrate(50);
        }
    };

    const isProgram = associatedSource && tally?.program === associatedSource;
    const isPreview = associatedSource && tally?.preview === associatedSource;

    return (
        <div className={cn(
            "min-h-screen text-foreground flex flex-col font-sans select-none transition-colors duration-500",
            isProgram ? "bg-red-600" : isPreview ? "bg-emerald-600" : "bg-background"
        )}>
            {/* Top Status Bar (Mobile focused) */}
            <div className={cn(
                "px-6 py-4 border-b flex items-center justify-between",
                (isProgram || isPreview) ? "bg-black/20 border-white/10" : "bg-background/50 border-card-border"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isProgram ? "bg-white shadow-[0_0_10px_white]" : isPreview ? "bg-white" : "bg-green-500"
                    )} />
                    <span className="text-[10px] font-black uppercase text-muted">
                        View: {me?.userName || 'Personal Terminal'}
                    </span>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                    {isHostTalking && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-full animate-pulse mr-2">
                            <Headset size={12} className="text-red-500" />
                            <span className="text-[8px] font-black text-red-500 uppercase">Incoming</span>
                        </div>
                    )}
                    <Wifi size={14} />
                    <Battery size={14} />
                    <span className="text-[10px] font-black">100%</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeAlert ? (
                        <motion.div
                            key={activeAlert.id}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="w-full max-w-sm space-y-8 z-10"
                        >
                            <div className="bg-card-bg/40 backdrop-blur-2xl border-4 border-white/20 p-8 rounded-[3rem] shadow-2xl text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 bg-indigo-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                                        <AlertCircle size={40} className="text-white" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Instrucción Directa</p>
                                    <h2 className="text-3xl font-black uppercase text-foreground leading-[1.1] italic">
                                        {activeAlert.message}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => handleRespond('OK / ENTERED')}
                                        className="py-6 bg-white text-black rounded-3xl font-black text-lg uppercase active:scale-95 transition-all shadow-xl"
                                    >
                                        COPIADO / OK
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleRespond('STANDBY')}
                                            className="py-4 bg-white/10 border border-white/20 rounded-2xl font-black text-xs uppercase active:scale-95 transition-all"
                                        >
                                            STANDBY
                                        </button>
                                        <button
                                            onClick={() => handleRespond('PROBLEM')}
                                            className="py-4 bg-red-500/20 border border-red-500/40 text-red-500 rounded-2xl font-black text-xs uppercase active:scale-95 transition-all"
                                        >
                                            PROBLEMA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center text-center space-y-8"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border border-card-border flex items-center justify-center relative overflow-hidden bg-card-bg/20">
                                    <Clock size={48} className="text-muted/50 animate-pulse" />
                                    <div className="absolute inset-0 border-t-2 border-indigo-500/20 rounded-full animate-spin [animation-duration:3s]" />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-card-bg border border-card-border rounded-full">
                                    <p className="text-[8px] font-black text-muted uppercase whitespace-nowrap">Standby Mode</p>
                                </div>
                            </div>

                            <div>
                                <h1 className="text-2xl font-black uppercase mb-3 text-foreground/90">
                                    Ready for <span className="text-indigo-500">Alerts</span>
                                </h1>
                                <p className="text-[10px] font-bold text-muted uppercase leading-relaxed max-w-[200px] mx-auto">
                                    Esperando instrucciones críticas del operador en tiempo real
                                </p>
                            </div>

                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={cn("w-1 h-3 rounded-full", (isProgram || isPreview) ? "bg-white/40" : "bg-indigo-500/40")} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Incoming Voice Overlay */}
                <AnimatePresence>
                    {isHostTalking && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none p-6"
                        >
                            <div className="relative w-full max-w-xs">
                                <div className="absolute inset-x-1/2 inset-y-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/20 rounded-full animate-ping duration-1000" />
                                <div className="absolute inset-x-1/2 inset-y-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/30 rounded-full animate-ping duration-700" />

                                <div className="relative bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] border-4 border-white p-8 rounded-[3rem] flex flex-col items-center gap-4">
                                    <Headset size={48} className="text-white animate-bounce" />
                                    <div className="text-center">
                                        <h2 className="text-white font-black text-xl uppercase italic leading-none mb-2">Comms Active</h2>
                                        <p className="text-white/80 font-bold text-[10px] uppercase">Control is speaking</p>
                                    </div>
                                    <div className="flex gap-1 items-center h-4">
                                        <div className="w-1.5 bg-white/40 rounded-full h-8 animate-[bounce_0.6s_infinite]" />
                                        <div className="w-1.5 bg-white rounded-full h-12 animate-[bounce_0.4s_infinite]" />
                                        <div className="w-1.5 bg-white/40 rounded-full h-8 animate-[bounce_0.5s_infinite]" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tally Indicator for non-camera users */}
                {!isProgram && !isPreview && associatedSource && (
                    <div className="absolute top-20 text-[10px] font-black uppercase text-muted tracking-widest">
                        Tally: {associatedSource} (Standby)
                    </div>
                )}

                {isProgram && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-10 flex items-center gap-2 bg-white text-red-600 px-4 py-1 rounded-full font-black text-xs uppercase tracking-tighter"
                    >
                        <Tv size={14} /> ON AIR
                    </motion.div>
                )}
            </div>

            {/* Bottom History Drawer */}
            <div className="bg-card-bg/80 backdrop-blur-xl border-t border-card-border p-6 rounded-t-[40px] max-h-[30vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase text-muted flex items-center gap-2">
                        <MessageSquare size={14} /> Historial Local
                    </h3>
                    <ChevronRight size={16} className="text-muted/50" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {myHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-card-border/30">
                            <div>
                                <p className="text-[11px] font-bold uppercase text-foreground/80">{item.message}</p>
                                <p className="text-[9px] text-muted font-bold uppercase mt-0.5">{new Date(item.timestamp).toLocaleTimeString()}</p>
                            </div>
                            {item.status === 'ACKNOWLEDGED' && (
                                <div className="flex items-center gap-1.5 text-green-500/50">
                                    <CheckCircle2 size={12} />
                                    <span className="text-[9px] font-black uppercase ">SENT</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {myHistory.length === 0 && (
                        <p className="text-center text-muted/50 text-[10px] font-bold uppercase py-4">No hay actividad reciente</p>
                    )}
                </div>
            </div>
        </div>
    );
};
