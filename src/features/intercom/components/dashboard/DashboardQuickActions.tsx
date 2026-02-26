import React from 'react';
import { Zap, Mic, Radio } from 'lucide-react';
import { IntercomTemplate } from '@/features/intercom/types/intercom.types';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardQuickActionsProps {
    templates: IntercomTemplate[];
    onMassAlert: (message: string) => void;
    startTalking: () => void;
    stopTalking: () => void;
    isTalking: boolean;
    talkingInfo: { senderUserId: string, targetUserId: string | null } | null;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
    templates, onMassAlert, startTalking, stopTalking, isTalking, talkingInfo
}) => {
    const isBroadcasting = isTalking && !talkingInfo?.targetUserId;
    const isPrivateTalk = isTalking && !!talkingInfo?.targetUserId;

    return (
        <div className="bg-white/50 dark:bg-card-bg/30 backdrop-blur-xl border border-black/5 dark:border-card-border/40 rounded-[1.5rem] p-2 flex items-center gap-2 overflow-x-auto no-scrollbar relative group/actions min-w-0 snap-x">
            {/* Tactical Status Indicator */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-[1rem] shrink-0 snap-start">
                <div className="relative">
                    <Zap size={13} className="text-amber-400 relative z-10" />
                    <div className="absolute inset-0 bg-amber-400/20 blur-sm animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-indigo-400 uppercase leading-none mb-0.5 tracking-tighter">Tactical</span>
                    <span className="text-[10px] font-black text-foreground uppercase whitespace-nowrap">Node Matrix</span>
                </div>
            </div>

            <div className="h-8 w-[1px] bg-card-border/50 mx-1 shrink-0" />

            {/* Main Broadcast Button */}
            <div className="relative group/btn">
                <button
                    onPointerDown={(e) => { e.preventDefault(); if (!isPrivateTalk) startTalking(); }}
                    onPointerUp={(e) => { e.preventDefault(); stopTalking(); }}
                    onPointerLeave={() => stopTalking()}
                    onContextMenu={(e) => e.preventDefault()}
                    disabled={isPrivateTalk}
                    className={cn(
                        "relative flex items-center gap-3 px-8 py-3 rounded-[1rem] border text-[11px] uppercase font-black transition-all select-none touch-none shrink-0 overflow-hidden",
                        isBroadcasting
                            ? "bg-red-600 text-white border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                            : isPrivateTalk
                                ? "bg-muted/10 text-muted/40 border-card-border/50 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 hover:scale-[1.02] active:scale-95"
                    )}
                >
                    <div className="relative">
                        <Radio size={16} className={cn("relative z-10", isBroadcasting && "animate-pulse")} />
                        {isBroadcasting && (
                            <motion.div
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.8, opacity: 0 }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-0 bg-white rounded-full"
                            />
                        )}
                    </div>

                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[11px] tracking-widest">{isBroadcasting ? 'BROADCAST ACTIVE' : 'ALL-TALK (PTT)'}</span>
                        {isBroadcasting && <span className="text-[7px] opacity-70 mt-1">TRANSMITTING TO ALL NODES</span>}
                    </div>

                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </button>

                {/* Status indicator line */}
                {isBroadcasting && (
                    <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-white rounded-full animate-pulse shadow-sm" />
                )}
            </div>

            <div className="h-8 w-[1px] bg-card-border/50 mx-1 shrink-0" />

            {/* Protocol Templates Area */}
            <div className="flex items-center gap-2 pr-4 min-w-0 flex-1">
                <AnimatePresence>
                    {templates.length > 0 ? templates.map((t, idx) => (
                        <motion.button
                            key={t.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => onMassAlert(t.name)}
                            className="shrink-0 px-5 py-3 bg-black/5 dark:bg-white/[0.03] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-black/5 dark:border-white/[0.05] hover:border-indigo-500/40 rounded-[1rem] text-[9px] font-black text-muted-foreground dark:text-muted hover:text-foreground uppercase transition-all whitespace-nowrap active:scale-95 group/template relative overflow-hidden snap-start"
                        >
                            <div className="flex items-center gap-2.5 relative z-10">
                                <div
                                    className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                                    style={{ backgroundColor: t.color || '#6366f1', color: t.color || '#6366f1' }}
                                />
                                {t.name}
                            </div>
                            {/* Inner glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </motion.button>
                    )) : (
                        <div className="flex items-center gap-3 px-6 h-11 border border-dashed border-card-border/30 rounded-[1rem] opacity-30 w-full animate-pulse">
                            <span className="text-[8px] font-black text-muted uppercase tracking-[0.2em] italic">Protocols: Offline Matrix</span>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
