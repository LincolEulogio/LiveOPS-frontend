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
    Sparkles,
    Tv
} from 'lucide-react';
import { useTally } from '@/features/streaming/hooks/useTally';

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
    // We should also check if the current logged in user is the "owner" of this view
    // or if we should just show alerts for this userId regardless
    const myHistory = history.filter(h =>
        (h.status === 'ACKNOWLEDGED' || h.id === activeAlert?.id)
    );

    const handleRespond = (type: string) => {
        console.log(`[MemberPersonalView] Sending response: ${type} for alert: ${activeAlert?.id}`);
        if (activeAlert) {
            acknowledgeAlert(activeAlert.id, type);
            setLastResponse(type);
            // Vibrate on response
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
                    <span className="text-[10px] font-black uppercase  text-muted">
                        View: {members.find(m => m.userId === userId)?.userName || 'Personal Terminal'}
                    </span>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                    <Wifi size={14} />
                    <Battery size={14} />
                    <span className="text-[10px] font-black">100%</span>
                </div>
            </div>

            {/* Active Alert Area (The "Big Screen") */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeAlert ? (
                        <motion.div
                            key={activeAlert.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full max-w-md bg-card-bg border-2 border-indigo-500/50 rounded-[40px] p-8   flex flex-col items-center text-center relative z-10"
                        >
                            <div
                                className="absolute inset-0 opacity-5 rounded-[40px] pointer-events-none"
                                style={{ backgroundColor: activeAlert.color }}
                            />

                            <div className="p-4 bg-indigo-500/10 rounded-2xl mb-6">
                                <Activity size={32} className="text-indigo-400" />
                            </div>

                            <p className="text-[12px] font-black text-indigo-400 uppercase  mb-4">
                                Nueva Instrucción
                            </p>

                            <h1 className="text-4xl font-black uppercase er mb-8 break-words leading-none">
                                {activeAlert.message}
                            </h1>

                            {/* Response Grid */}
                            <div className="grid grid-cols-2 gap-3 w-full mb-6">
                                <button
                                    onClick={() => handleRespond('OK')}
                                    className="py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase  text-sm   active:scale-95 transition-all"
                                >
                                    OK
                                </button>
                                <button
                                    onClick={() => handleRespond('COPIADO')}
                                    className="py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase  text-sm   active:scale-95 transition-all"
                                >
                                    COPIADO
                                </button>
                                <button
                                    onClick={() => handleRespond('FALA')}
                                    className="py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase  text-sm   active:scale-95 transition-all"
                                >
                                    FALA
                                </button>
                                <button
                                    onClick={() => handleRespond('DUDA')}
                                    className="py-5 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-black uppercase  text-sm   active:scale-95 transition-all"
                                >
                                    DUDA
                                </button>
                                <button
                                    onClick={() => handleRespond('LISTO')}
                                    className="py-4 bg-background hover:bg-card-border text-muted rounded-2xl font-black uppercase  text-[10px] active:scale-95 transition-all border border-card-border"
                                >
                                    LISTO
                                </button>
                                <button
                                    onClick={() => handleRespond('CHECK')}
                                    className="py-4 bg-background hover:bg-card-border text-muted rounded-2xl font-black uppercase  text-[10px] active:scale-95 transition-all border border-card-border"
                                >
                                    CHECK
                                </button>
                            </div>

                            {/* Custom Response Input */}
                            <div className="w-full flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Mensaje personalizado..."
                                    className="flex-1 bg-background/40 border border-card-border rounded-xl px-4 py-3 text-xs font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500/50 transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleRespond((e.target as HTMLInputElement).value);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        if (input.value.trim()) {
                                            handleRespond(input.value);
                                            input.value = '';
                                        }
                                    }}
                                    className="p-3 bg-foreground text-background rounded-xl hover:opacity-90 active:scale-95 transition-all "
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center text-center space-y-8"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border border-card-border flex items-center justify-center relative overflow-hidden bg-card-bg/20">
                                    <Clock size={48} className="text-muted/50 animate-pulse" />
                                    {/* Rotating Ring Decor */}
                                    <div className="absolute inset-0 border-t-2 border-indigo-500/20 rounded-full animate-spin [animation-duration:3s]" />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-card-bg border border-card-border rounded-full">
                                    <p className="text-[8px] font-black text-muted uppercase  whitespace-nowrap">Standby Mode</p>
                                </div>
                            </div>

                            <div>
                                <h1 className="text-2xl font-black uppercase  mb-3 text-foreground/90">
                                    Ready for <span className="text-indigo-500">Alerts</span>
                                </h1>
                                <p className="text-[10px] font-bold text-muted uppercase  leading-relaxed max-w-[200px] mx-auto">
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

                {/* Tally Indicator for non-camera users or just extra info */}
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

                {/* Source Selector (In case auto-detection fails) */}
                {!associatedSource && (
                    <div className="absolute bottom-40 flex flex-col items-center gap-2">
                        <p className="text-[10px] font-black text-muted uppercase">Seleccionar cámara para Tally</p>
                        <div className="flex gap-2">
                            {['Cam 1', 'Cam 2', 'Cam 3'].map(src => (
                                <button
                                    key={src}
                                    onClick={() => setAssociatedSource(src)}
                                    className="px-3 py-1 bg-card-bg border border-card-border rounded-lg text-[10px] font-black uppercase hover:border-indigo-500 transition-all"
                                >
                                    {src}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Background Decor */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]" />
                </div>
            </div>

            {/* Bottom History Drawer */}
            <div className="bg-card-bg/80 backdrop-blur-xl border-t border-card-border p-6 rounded-t-[40px] max-h-[30vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase  text-muted flex items-center gap-2">
                        <MessageSquare size={14} /> Historial Local
                    </h3>
                    <ChevronRight size={16} className="text-muted/50" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {myHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-card-border/30">
                            <div>
                                <p className="text-[11px] font-bold uppercase  text-foreground/80">{item.message}</p>
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
