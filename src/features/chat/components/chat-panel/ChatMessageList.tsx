'use client';

import React from 'react';
import { Hash, Terminal } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface ChatMessageListProps {
    chatHistory: any[];
    isLoading: boolean;
    currentUser: any;
    scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
    chatHistory,
    isLoading,
    currentUser,
    scrollRef
}) => {
    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-card-border"
        >
            {chatHistory.length === 0 && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                    <Hash size={40} className="text-muted/50 mb-2" />
                    <p className="text-[10px] font-black uppercase  text-muted">Sin mensajes aún</p>
                </div>
            )}

            {chatHistory.map((msg) => {
                const isSystem = !msg.userId;
                const isMe = msg.userId === currentUser?.id;

                if (isSystem) {
                    return (
                        <div key={msg.id} className="flex justify-center py-1 animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-card-bg/50 border border-card-border/50 rounded-full px-3 py-1 flex items-center gap-2">
                                <Terminal size={10} className="text-muted" />
                                <span className="text-[10px] font-bold text-muted  italic">
                                    {msg.message}
                                </span>
                            </div>
                        </div>
                    );
                }

                return (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex flex-col max-w-[85%] group animate-in fade-in slide-in-from-right-2 duration-300",
                            isMe ? "ml-auto items-end" : "items-start"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1 px-1">
                            {!isMe && <span className="text-[10px] font-black text-muted uppercase">{msg.user?.name}</span>}
                            <span className="text-[8px] text-muted font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className={cn(
                            "px-3 py-2 rounded-2xl text-sm leading-snug break-words ",
                            isMe
                                ? "bg-indigo-600 text-white rounded-tr-none"
                                : "bg-card-bg text-foreground border border-card-border rounded-tl-none"
                        )}>
                            {msg.message.split(' ').map((word: string, idx: number) => {
                                if (word.startsWith('@') && word.length > 1) {
                                    const name = word.slice(1);
                                    const isMeMentioned = name === currentUser?.name;
                                    return (
                                        <span key={idx} className={cn(
                                            "font-black px-1 rounded",
                                            isMeMentioned ? "bg-yellow-400 text-black " : "text-indigo-300"
                                        )}>
                                            {word}{' '}
                                        </span>
                                    );
                                }
                                return word + ' ';
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
