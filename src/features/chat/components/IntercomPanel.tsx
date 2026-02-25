'use client';

import { useChat } from '../hooks/useChat';
import { CommandItem } from './CommandItem';
import { TemplateManager } from '@/features/intercom/components/TemplateManager';
import { MessageSquare, Send, AlertCircle, Zap, ShieldAlert, History, Settings, Laptop, Smartphone } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

import { IntercomSkeleton } from '@/shared/components/SkeletonLoaders';

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
        createTemplate,
        deleteTemplate,
        isConnected
    } = useChat(productionId);

    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [history]);

    const handleSend = () => {
        if (!message.trim() || isSending) return;

        setIsSending(true);
        sendCommand(message.trim());
        setMessage('');

        setTimeout(() => setIsSending(false), 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            {/* Tactical Header */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-5 border-b border-card-border/50 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-red-500"
                        )} />
                        <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full pointer-events-none" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-foreground uppercase tracking-[0.2em] leading-none mb-1">Crew Intercom</h2>
                        <p className="text-[9px] font-black text-muted uppercase tracking-widest leading-none">Security Channel 0-Alpha</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <TemplateManager productionId={productionId} />
                    <div className="bg-background/50 border border-card-border px-2.5 py-1 rounded-lg">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                            SYNC: {history.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Tactical Templates Bar */}
            {templates.length > 0 && (
                <div className="p-3 bg-indigo-600/5 border-b border-card-border/30 flex gap-2 overflow-x-auto no-scrollbar shadow-inner">
                    <AnimatePresence>
                        {templates.map((t) => (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={t.id}
                                onClick={() => sendCommand(t.name, { templateId: t.id })}
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-background hover:bg-card-bg border border-card-border rounded-[1rem] transition-all active:scale-95 group shadow-sm"
                            >
                                <Zap size={12} className="text-amber-500 group-hover:scale-110 transition-transform" fill="currentColor" />
                                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{t.name}</span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Tactical History Grid */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar-premium bg-gradient-to-b from-transparent to-black/10"
            >
                {isLoading ? (
                    <IntercomSkeleton />
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-muted/40 gap-4">
                        <div className="relative">
                            <MessageSquare size={48} strokeWidth={1} />
                            <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">Communications Offline</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Ready for primary broadcast</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {history.map((cmd) => (
                            <CommandItem
                                key={cmd.id}
                                command={cmd}
                                onAck={ackCommand}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Tactical Input Area */}
            <div className="p-5 border-t border-card-border/50 bg-white/5 backdrop-blur-3xl">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative px-1 pt-1">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type tactical command..."
                            className="w-full bg-background border border-card-border rounded-2xl pl-5 pr-14 py-4 text-sm text-foreground placeholder:text-muted/50 focus:border-indigo-500 outline-none transition-all resize-none min-h-[55px] max-h-[150px] font-bold uppercase tracking-tight shadow-inner"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || isSending}
                            className={cn(
                                "absolute right-3.5 top-3.5 p-3 rounded-xl transition-all active:scale-90",
                                message.trim()
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 hover:bg-indigo-500"
                                    : "text-muted/20 bg-card-bg/50 cursor-not-allowed"
                            )}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 px-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md">
                            <ShieldAlert size={10} className="text-red-500" />
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Broadcast All</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Smartphone size={10} className="text-muted/40" />
                        <span className="text-[8px] text-muted/40 font-black uppercase tracking-widest">
                            {isSending ? 'Transmitting...' : 'Link Standby'}
                        </span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar-premium::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-premium::-webkit-scrollbar-track { bg: transparent; }
                .custom-scrollbar-premium::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar-premium:hover::-webkit-scrollbar-thumb {
                    background: rgba(99,102,241,0.2);
                }
            `}</style>
        </div>
    );
};
