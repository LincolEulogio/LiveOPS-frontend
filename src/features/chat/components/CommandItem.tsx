'use client';

import { Command, CommandStatus } from '../types/chat.types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { cn } from '@/shared/utils/cn';
import {
    CheckCircle2,
    MessageSquare,
    User as UserIcon,
    Clock,
    ShieldCheck,
    Reply,
    AlertCircle,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    command: Command;
    onAck: (commandId: string, response: string) => void;
}

export const CommandItem = ({ command, onAck }: Props) => {
    const currentUser = useAuthStore((state) => state.user);
    const isFromMe = command.senderId === currentUser?.id;

    const hasIAcknowledged = command.responses?.some(r => r.responderId === currentUser?.id);
    const totalAcks = command.responses?.length || 0;

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group flex flex-col gap-3 p-4 rounded-3xl border transition-all relative overflow-hidden shadow-lg",
                isFromMe
                    ? "bg-indigo-600/5 border-indigo-500/30 ml-4"
                    : "bg-background/40 border-card-border/50 mr-4 backdrop-blur-md"
            )}
        >
            {/* Context Sidebar Line */}
            <div className={cn(
                "absolute top-0 bottom-0 w-1",
                isFromMe ? "right-0 bg-indigo-500/40" : "left-0 bg-card-border"
            )} />

            {/* Header Identity Bar */}
            <div className={cn(
                "flex items-center justify-between gap-3 px-1",
                isFromMe && "flex-row-reverse"
            )}>
                <div className={cn(
                    "flex items-center gap-2 overflow-hidden",
                    isFromMe && "flex-row-reverse"
                )}>
                    <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center border shadow-inner",
                        isFromMe
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-background border-card-border text-muted"
                    )}>
                        <UserIcon size={14} />
                    </div>
                    <div className={isFromMe ? "text-right" : "text-left"}>
                        <p className={cn(
                            "text-[10px] font-black uppercase  truncate leading-none mb-1",
                            isFromMe ? "text-indigo-400" : "text-foreground"
                        )}>
                            {isFromMe ? 'Current Operator' : command.sender?.name || 'External Link'}
                        </p>
                        {command.targetRole && (
                            <div className="flex items-center gap-1 text-[8px] font-black text-muted/60 uppercase  leading-none">
                                <ShieldCheck size={10} className="text-indigo-500/50" />
                                {command.targetRole.name}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-black/10 px-2 py-0.5 rounded-lg border border-white/5 shrink-0">
                    <span className="text-[9px] text-muted/60 font-black font-mono">
                        {formatTime(command.createdAt)}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className={cn(
                "flex flex-col gap-3 px-1",
                isFromMe ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "relative max-w-full p-4 rounded-2xl text-[13px] font-semibold leading-relaxed shadow-inner",
                    isFromMe
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-background/60 text-foreground border border-card-border/30 rounded-tl-none font-bold"
                )}>
                    {command.message}
                </div>

                {command.requiresAck && (
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black  uppercase transition-all shadow-lg",
                        totalAcks > 0
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-amber-500/5"
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", totalAcks > 0 ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                        {totalAcks > 0 ? `${totalAcks} CONFIRMED` : 'WAITING FOR ACK'}
                    </div>
                )}
            </div>

            {/* Tactical Responses Feed */}
            {command.responses && command.responses.length > 0 && (
                <div className="mt-2 space-y-2 px-1 border-t border-card-border/20 pt-3">
                    {command.responses.map((resp) => (
                        <div key={resp.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                            <Reply size={12} className="text-muted/40 rotate-180 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-black text-foreground/80 uppercase  truncate">{resp.responder?.name}</span>
                                    <span className={cn(
                                        "text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none uppercase ",
                                        resp.response === 'ROGER' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {resp.response}
                                    </span>
                                </div>
                                {resp.note && (
                                    <p className="text-[10px] text-muted italic font-medium leading-none">
                                        "{resp.note}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tactical Action Area for Mobile Operators */}
            {!isFromMe && command.requiresAck && !hasIAcknowledged && (
                <div className="mt-2 flex gap-2">
                    <button
                        onClick={() => onAck(command.id, 'ROGER')}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-xl transition-all uppercase  shadow-xl shadow-emerald-600/20 active:scale-95 border border-emerald-500/50"
                    >
                        Confirm Roger
                    </button>
                    <button
                        onClick={() => onAck(command.id, 'UNABLE')}
                        className="flex-1 py-3 px-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-[10px] font-black rounded-xl transition-all uppercase  active:scale-95"
                    >
                        Unable
                    </button>
                </div>
            )}

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        </motion.div>
    );
};
