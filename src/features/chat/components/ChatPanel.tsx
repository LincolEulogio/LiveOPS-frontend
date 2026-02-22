'use client';

import { useChat } from '../hooks/useChat';
import { MessageSquare, Send, User, Clock, Hash, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface Props {
    productionId: string;
}

export const ChatPanel = ({ productionId }: Props) => {
    const { chatHistory, sendChatMessage, isConnected, isLoading } = useChat(productionId);
    const currentUser = useAuthStore((state) => state.user);
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen]);

    const handleSend = () => {
        if (!message.trim()) return;
        sendChatMessage(message.trim());
        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={cn(
            "fixed right-0 top-0 h-screen transition-all duration-500 ease-in-out z-40 flex",
            isOpen ? "w-80" : "w-0"
        )}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "absolute left-[-32px] top-1/2 -translate-y-1/2 w-8 h-16 bg-stone-900 border-l border-y border-stone-800 rounded-l-xl flex items-center justify-center text-stone-500 hover:text-white transition-colors group shadow-2xl",
                    !isOpen && "left-[-40px] opacity-100"
                )}
            >
                {isOpen ? <ChevronRight size={16} className="group-hover:scale-125 transition-transform" /> : <ChevronLeft size={16} className="group-hover:scale-125 transition-transform" />}
            </button>

            <div className="flex-1 bg-stone-950/90 backdrop-blur-2xl border-l border-stone-800 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="p-4 border-b border-stone-800/50 bg-stone-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <MessageSquare size={18} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Team Chat</h3>
                            <p className="text-[9px] text-stone-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500" : "bg-red-500")} />
                                {isConnected ? "En línea" : "Desconectado"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-stone-800"
                >
                    {chatHistory.length === 0 && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                            <Hash size={40} className="text-stone-700 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Sin mensajes aún</p>
                        </div>
                    )}

                    {chatHistory.map((msg, i) => {
                        const isMe = msg.userId === currentUser?.id;
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex flex-col max-w-[85%] group animate-in fade-in slide-in-from-right-2 duration-300",
                                    isMe ? "ml-auto items-end" : "items-start"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    {!isMe && <span className="text-[10px] font-black text-stone-500 uppercase">{msg.user?.name}</span>}
                                    <span className="text-[8px] text-stone-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={cn(
                                    "px-3 py-2 rounded-2xl text-sm leading-snug break-words shadow-sm",
                                    isMe
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-stone-900 text-stone-200 border border-stone-800 rounded-tl-none"
                                )}>
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-stone-900/40 border-t border-stone-800/50">
                    <div className="relative">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 pr-12 text-xs text-white placeholder:text-stone-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none min-h-[45px] max-h-[150px]"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className={cn(
                                "absolute right-2 bottom-2 p-2 rounded-xl transition-all",
                                message.trim()
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95"
                                    : "text-stone-700 cursor-not-allowed"
                            )}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 px-1">
                        <p className="text-[8px] text-stone-600 font-bold uppercase tracking-widest">Internal Comms Only</p>
                        <p className="text-[8px] text-stone-600 font-bold italic tracking-tighter">Enter to send</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
