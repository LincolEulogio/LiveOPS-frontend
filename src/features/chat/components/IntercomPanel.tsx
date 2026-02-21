'use client';

import { useChat } from '../hooks/useChat';
import { CommandItem } from './CommandItem';
import { MessageSquare, Send, AlertCircle, Zap, ShieldAlert, History } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
}

export const IntercomPanel = ({ productionId }: Props) => {
    const {
        history,
        templates,
        isLoading,
        sendCommand,
        ackCommand,
        isConnected
    } = useChat(productionId);

    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom only if we are already near bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0; // We show reversed or we should scroll to bottom?
            // In this design, let's keep latest at top for "Intercom" feel or bottom for "Chat" feel.
            // History is sorted desc in backend, so latest is index 0.
        }
    }, [history]);

    const handleSend = () => {
        if (!message.trim() || isSending) return;

        setIsSending(true);
        sendCommand(message.trim());
        setMessage('');

        // Tiny delay to prevent spam
        setTimeout(() => setIsSending(false), 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900/50">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
                    )}></div>
                    <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                        <MessageSquare size={16} className="text-indigo-400" />
                        Intercom
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-800 px-2 py-0.5 rounded uppercase tracking-tighter">
                        Active: {history.length}
                    </span>
                </div>
            </div>

            {/* Templates / Quick Actions */}
            {templates.length > 0 && (
                <div className="p-3 border-b border-stone-800 bg-stone-900/20 flex gap-2 overflow-x-auto no-scrollbar">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => sendCommand(t.name, { templateId: t.id })}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition-all group"
                        >
                            <Zap size={12} className="text-yellow-500 group-hover:scale-125 transition-transform" />
                            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">{t.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* History */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse gap-4">
                        <History size={48} />
                        <span className="text-xs uppercase tracking-[0.2em]">Synchronizing...</span>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-stone-600 gap-3">
                        <MessageSquare size={32} strokeWidth={1} />
                        <p className="text-[10px] uppercase tracking-widest font-bold">No communications</p>
                    </div>
                ) : (
                    history.map((cmd) => (
                        <CommandItem
                            key={cmd.id}
                            command={cmd}
                            onAck={ackCommand}
                        />
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-stone-800 bg-stone-900/80 backdrop-blur-xl">
                <div className="relative group">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send command..."
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-stone-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none min-h-[45px] max-h-[120px]"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || isSending}
                        className={cn(
                            "absolute right-2 top-1.5 p-2 rounded-lg transition-all",
                            message.trim()
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105"
                                : "text-stone-700 cursor-not-allowed"
                        )}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center gap-3">
                        <button className="text-[10px] font-bold text-stone-500 hover:text-stone-300 transition-colors uppercase flex items-center gap-1.5">
                            <ShieldAlert size={12} />
                            All
                        </button>
                    </div>
                    <div className="text-[9px] text-stone-600 font-mono italic">
                        Press Enter to broadcast
                    </div>
                </div>
            </div>
        </div>
    );
};
