import React from 'react';
import { AlertCircle, MessageCircle, CheckCircle2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface CrewCardStatusProps {
    currentStatus: string;
    lastAck?: {
        message: string;
        timestamp: string;
        type: string;
    };
}

const getAckDisplay = (type: string) => {
    const t = type.toUpperCase().trim();
    if (t === 'PROBLEMA') return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'CRITICAL ALERT' };
    if (t === 'PONCHE NO' || t.includes('PONCHE')) return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'PONCHE NO' };
    if (t === 'CHECK') return { icon: Eye, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'EYE ON' };
    if (t === 'LISTO' || t === 'CONFIRMADO' || t === 'OK') return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'PROCESSED' };
    if (t.startsWith('MENSAJE:')) return { icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: t.substring(0, 15) };

    return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: type.substring(0, 12) };
};

export const CrewCardStatus: React.FC<CrewCardStatusProps> = ({ currentStatus, lastAck }) => {
    return (
        <div className="mx-6 mb-6 p-6 bg-background/40 backdrop-blur-md rounded-[2rem] border border-card-border/60  flex flex-col justify-center relative overflow-hidden group/status">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black text-muted uppercase ">Operational Phase</p>
                <p className="text-[8px] font-black text-muted/40 uppercase ">Live Feedback</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-500 ",
                        currentStatus === 'AL AIRE' ? 'bg-red-500 animate-pulse ' :
                            currentStatus === 'IDLE' ? 'bg-muted/40' :
                                'bg-indigo-500 '
                    )} />
                    <span className={cn(
                        "text-base font-black uppercase  italic transition-colors",
                        currentStatus === 'AL AIRE' ? 'text-red-500' :
                            currentStatus === 'IDLE' ? 'text-muted' :
                                'text-foreground'
                    )}>
                        {currentStatus}
                    </span>
                </div>

                <AnimatePresence mode="popLayout">
                    {lastAck && (() => {
                        const display = getAckDisplay(lastAck.type);
                        const Icon = display.icon;
                        return (
                            <motion.div
                                key={lastAck.timestamp}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ",
                                    display.bg, display.border
                                )}
                            >
                                <Icon size={14} className={cn("shrink-0", display.color)} />
                                <span className={cn("text-[10px] font-black uppercase  truncate max-w-[100px]", display.color)}>
                                    {display.text}
                                </span>
                            </motion.div>
                        );
                    })()}
                </AnimatePresence>
            </div>
        </div>
    );
};
