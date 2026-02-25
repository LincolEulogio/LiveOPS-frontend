'use client';

import React from 'react';
import { Send, User, Terminal } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface ChatInputProps {
    message: string;
    handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleSend: () => void;
    typingUsers: Record<string, string>;
    suggestions: any[] | null;
    selectedIndex: number;
    applySuggestion: (suggestion: any) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    message,
    handleMessageChange,
    handleKeyDown,
    handleSend,
    typingUsers,
    suggestions,
    selectedIndex,
    applySuggestion
}) => {
    return (
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
    );
};
