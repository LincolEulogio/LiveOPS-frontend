import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface CrewCardChatFeedProps {
    directHistory: any[];
    memberUserId: string;
    memberUserName: string;
}

export const CrewCardChatFeed: React.FC<CrewCardChatFeedProps> = ({ directHistory, memberUserId, memberUserName }) => {
    if (directHistory.length === 0) return null;

    return (
        <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 bg-white/[0.01] dark:bg-background/60 backdrop-blur-md border border-black/5 dark:border-card-border/60 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col h-[320px] ">
            <div className="px-5 sm:px-6 py-4 bg-black/5 dark:bg-white/[0.04] border-b border-black/5 dark:border-card-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400"><MessageSquare size={14} /></span>
                    <span className="text-[10px] font-black text-muted-foreground dark:text-muted uppercase ">Telemetry Chat</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-50" />
                    <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-20" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar flex flex-col-reverse">
                {[...directHistory].map((msg, i) => {
                    const isMine = msg.senderId !== memberUserId;
                    return (
                        <div key={i} className={cn("flex w-full", isMine ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                                "max-w-[90%] p-4 rounded-2xl text-[11px] font-bold leading-relaxed border ",
                                isMine
                                    ? 'bg-indigo-600 border-indigo-500 text-white rounded-br-none '
                                    : 'bg-background/80 border-card-border text-foreground rounded-bl-none '
                            )}>
                                <div className={cn(
                                    "text-[8px] font-black uppercase  mb-2 opacity-60",
                                    isMine ? 'text-white' : 'text-indigo-400'
                                )}>
                                    {isMine ? 'COMMS OPERATOR' : (msg.senderName || memberUserName)}
                                </div>
                                {msg.message.replace('Mensaje:', '').trim()}
                                <div className={cn(
                                    "text-[7px] font-black mt-3 flex justify-end items-center gap-1 opacity-50 uppercase ",
                                    isMine ? 'text-white' : 'text-muted'
                                )}>
                                    <Clock size={8} /> {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
