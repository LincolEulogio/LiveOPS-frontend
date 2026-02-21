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
    Reply
} from 'lucide-react';

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
        <div className={cn(
            "flex flex-col gap-2 p-3 rounded-xl border transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
            isFromMe ? "bg-indigo-500/5 border-indigo-500/20" : "bg-stone-900 border-stone-800"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className={cn(
                        "p-1.5 rounded-lg",
                        isFromMe ? "bg-indigo-500/10 text-indigo-400" : "bg-stone-800 text-stone-400"
                    )}>
                        <UserIcon size={14} />
                    </div>
                    <span className={cn(
                        "text-xs font-bold truncate",
                        isFromMe ? "text-indigo-400" : "text-stone-300"
                    )}>
                        {isFromMe ? 'You' : command.sender?.name || 'Unknown'}
                    </span>
                    {command.targetRole && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-950 border border-stone-800 rounded text-[10px] font-bold text-stone-500 uppercase tracking-tight">
                            <ShieldCheck size={10} />
                            {command.targetRole.name}
                        </div>
                    )}
                </div>
                <span className="text-[10px] text-stone-600 font-mono whitespace-nowrap">
                    {formatTime(command.createdAt)}
                </span>
            </div>

            {/* Message Content */}
            <div className="flex items-start gap-3">
                <div className="flex-1 text-sm text-stone-200 leading-relaxed break-words">
                    {command.message}
                </div>
                {command.requiresAck && (
                    <div className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-tight uppercase transition-colors",
                        totalAcks > 0
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                    )}>
                        <CheckCircle2 size={10} />
                        {totalAcks > 0 ? `${totalAcks} ACK` : 'PENDING'}
                    </div>
                )}
            </div>

            {/* Responses Section */}
            {command.responses && command.responses.length > 0 && (
                <div className="mt-1 space-y-1.5 border-t border-stone-800/50 pt-2">
                    {command.responses.map((resp) => (
                        <div key={resp.id} className="flex items-center gap-2 text-[11px]">
                            <Reply size={12} className="text-stone-600 rotate-180" />
                            <span className="text-stone-400 font-bold">{resp.responder?.name}:</span>
                            <span className="text-emerald-400 bg-emerald-500/5 px-1.5 rounded border border-emerald-500/10 leading-none py-0.5">
                                {resp.response}
                            </span>
                            {resp.note && <span className="text-stone-500 italic">"{resp.note}"</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons for recipients */}
            {!isFromMe && command.requiresAck && !hasIAcknowledged && (
                <div className="mt-2 flex gap-2">
                    <button
                        onClick={() => onAck(command.id, 'ROGER')}
                        className="flex-1 py-1 px-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider"
                    >
                        Roger
                    </button>
                    <button
                        onClick={() => onAck(command.id, 'UNABLE')}
                        className="flex-1 py-1 px-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider"
                    >
                        Unable
                    </button>
                </div>
            )}
        </div>
    );
};
