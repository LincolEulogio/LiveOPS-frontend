'use client';

import { useChat } from '../hooks/useChat';
import { MessageSquare, Send, User, Clock, Hash, ChevronRight, ChevronLeft, Terminal, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSocket } from '@/shared/socket/socket.provider';

interface Props {
    productionId: string;
}

export const ChatPanel = ({ productionId }: Props) => {
    const { socket } = useSocket();
    const {
        chatHistory,
        sendChatMessage,
        isConnected,
        isLoading,
        unreadCount,
        resetUnread,
        typingUsers,
        setTyping,
        members
    } = useChat(productionId);
    const currentUser = useAuthStore((state) => state.user);
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<{ type: 'user' | 'command', id: string, name: string }[] | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset unread when opened
    useEffect(() => {
        if (isOpen && unreadCount > 0) {
            resetUnread();
        }
    }, [isOpen, unreadCount, resetUnread]);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setMessage(val);

        if (!socket || !isConnected) return;

        // --- Suggestions Logic ---
        const lastChar = val[val.length - 1];
        const lastWord = val.split(' ').pop() || '';

        if (lastWord.startsWith('@')) {
            const query = lastWord.slice(1).toLowerCase();
            const matchingUsers = members
                .filter(m => m.userId !== currentUser?.id && m.userName.toLowerCase().includes(query))
                .map(m => ({ type: 'user' as const, id: m.userId, name: m.userName }));
            setSuggestions(matchingUsers.length > 0 ? matchingUsers : null);
            setSelectedIndex(0);
        } else if (lastWord.startsWith('/')) {
            const query = lastWord.slice(1).toLowerCase();
            const commands = [
                { type: 'command' as const, id: 'alert', name: '/alert <mensaje>' },
                { type: 'command' as const, id: 'clear', name: '/clear' },
            ].filter(c => c.id.includes(query));
            setSuggestions(commands.length > 0 ? commands : null);
            setSelectedIndex(0);
        } else {
            setSuggestions(null);
        }

        // --- Typing Indicator ---
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 2000);
    };

    const applySuggestion = (suggestion: { type: 'user' | 'command', id: string, name: string }) => {
        const words = message.split(' ');
        words.pop();
        const replacement = suggestion.type === 'user' ? `@${suggestion.name} ` : `${suggestion.name.split(' ')[0]} `;
        setMessage(words.join(' ') + (words.length > 0 ? ' ' : '') + replacement);
        setSuggestions(null);
    };

    const handleSend = () => {
        if (!message.trim()) return;
        sendChatMessage(message.trim());
        setMessage('');
        setTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                applySuggestion(suggestions[selectedIndex]);
            } else if (e.key === 'Escape') {
                setSuggestions(null);
            }
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message === '/clear') {
                // Special local command
                // Note: We'd need to update useChat to allow clearing locally
                // For now just empty state if we had it, but history comes from queryClient
                setMessage('');
                return;
            }
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
                    "absolute left-[-32px] top-1/2 -translate-y-1/2 w-8 h-16 bg-card-bg border-l border-y border-card-border rounded-l-xl flex items-center justify-center text-muted hover:text-foreground transition-colors group ",
                    !isOpen && "left-[-40px] opacity-100"
                )}
            >
                {isOpen ? <ChevronRight size={16} className="group-hover:scale-125 transition-transform" /> : <ChevronLeft size={16} className="group-hover:scale-125 transition-transform" />}

                {/* Unread Badge */}
                {!isOpen && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                        <span className="text-[9px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </div>
                )}
            </button>

            <div className="flex-1 bg-background/90 backdrop-blur-2xl border-l border-card-border flex flex-col ">
                {/* Header */}
                <div className="p-4 border-b border-card-border/50 bg-card-bg/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <MessageSquare size={18} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-foreground uppercase ">Team Chat</h3>
                            <p className="text-[9px] text-muted font-bold uppercase er flex items-center gap-1">
                                <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500" : "bg-red-500")} />
                                {isConnected ? "En línea" : "Desconectado"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
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

                    {chatHistory.map((msg, i) => {
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
                                    {msg.message.split(' ').map((word, idx) => {
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

                {/* Input Area */}
                <div className="p-4 bg-card-bg/40 border-t border-card-border/50 relative">
                    {/* Typing Indicator */}
                    {Object.keys(typingUsers).length > 0 && (
                        <div className="absolute top-[-24px] left-4 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                            </div>
                            <span className="text-[9px] font-bold text-muted italic">
                                {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'está escribiendo...' : 'están escribiendo...'}
                            </span>
                        </div>
                    )}

                    {/* Suggestions Popup */}
                    {suggestions && (
                        <div className="absolute bottom-full left-4 w-[calc(100%-32px)] bg-card-bg border border-card-border rounded-xl overflow-hidden  mb-2 animate-in slide-in-from-bottom-2 duration-200 z-50">
                            {suggestions.map((s, i) => (
                                <button
                                    key={s.id}
                                    onClick={() => applySuggestion(s)}
                                    className={cn(
                                        "w-full px-4 py-2 flex items-center gap-3 text-left transition-colors",
                                        i === selectedIndex ? "bg-indigo-600 text-white" : "text-muted hover:bg-card-border"
                                    )}
                                >
                                    {s.type === 'user' ? <User size={14} /> : <Terminal size={14} />}
                                    <span className="text-xs font-bold">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <textarea
                            value={message}
                            onChange={handleMessageChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 pr-12 text-xs text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none min-h-[45px] max-h-[150px]"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className={cn(
                                "absolute right-2 bottom-2 p-2 rounded-xl transition-all",
                                message.trim()
                                    ? "bg-indigo-600 text-white   hover:scale-105 active:scale-95"
                                    : "text-muted/50 cursor-not-allowed"
                            )}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 px-1">
                        <p className="text-[8px] text-muted font-bold uppercase ">Internal Comms Only</p>
                        <p className="text-[8px] text-muted font-bold italic er">Enter to send</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
