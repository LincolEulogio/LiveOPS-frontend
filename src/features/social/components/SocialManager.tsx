'use client';

import React, { useState } from 'react';
import {
    MessageSquare, Share2, Youtube,
    Twitch, Facebook, Trash2,
    Eye, EyeOff, Filter, Activity, Zap
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocial, SocialMessage } from '../hooks/useSocial';
import { apiClient } from '@/shared/api/api.client';

interface SocialManagerProps {
    productionId: string;
}

export const SocialManager = ({ productionId }: SocialManagerProps) => {
    const { messages, activePoll, updateStatus, onAirMessage, isLoading } = useSocial(productionId);
    const [filter, setFilter] = useState<string>('');

    const handleUpdateStatus = async (messageId: string, status: SocialMessage['status']) => {
        try {
            await updateStatus({ id: messageId, status });
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const clearActive = async () => {
        if (!onAirMessage) return;
        await handleUpdateStatus(onAirMessage.id, 'APPROVED');
    };

    const handleSimulate = async () => {
        const platforms = ['twitch', 'youtube', 'facebook'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const users = ['Ninja', 'Auronplay', 'Ibai', 'Rubius', 'RandomFan99'];
        const msgs = ['¡Increíble directo!', 'Saludos desde México 🇲🇽', 'This is awesome!', '¿A qué hora empieza el show?', 'Jajajaja buenísimo'];

        try {
            await apiClient.post(`/productions/${productionId}/social/messages`, {
                platform,
                author: users[Math.floor(Math.random() * users.length)],
                content: msgs[Math.floor(Math.random() * msgs.length)]
            });
        } catch (err) {
            console.error('Error simulating message', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card-bg/60 rounded-[2.5rem] overflow-hidden relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row gap-5 items-center justify-between px-6 py-5 border-b border-card-border/50 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                        <Share2 size={18} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-foreground uppercase  leading-none mb-1">Social Inbox</h2>
                        <p className="text-[9px] font-black text-muted uppercase  leading-none">Unified Moderation</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSimulate}
                        className="p-2.5 bg-background border border-card-border rounded-xl hover:bg-card-border transition-all active:scale-95 text-indigo-400"
                        title="Simulate Event"
                    >
                        <Zap size={16} />
                    </button>

                    <div className="relative flex items-center">
                        <Filter size={14} className="absolute left-3 text-muted pointer-events-none" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-background border border-card-border rounded-xl pl-9 pr-4 py-2 text-[10px] font-black text-foreground uppercase  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none min-w-[120px] transition-all cursor-pointer"
                        >
                            <option value="">Full Stream</option>
                            <option value="PENDING">Queued</option>
                            <option value="APPROVED">Verified</option>
                            <option value="ON_AIR">Active Air</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tactical Live Air Indicator */}
            <div className="px-6 py-4 bg-red-600/5 border-b border-card-border/30 flex items-center justify-between relative group ">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase ">Alpha Output:</span>
                    <div className="flex items-center gap-2">
                        {onAirMessage ? (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-xs font-black text-red-500 uppercase er truncate max-w-[200px]">
                                    Sending: {onAirMessage.author}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-ping shadow-[0_0_12px_rgba(220,38,38,0.8)]" />
                            </motion.div>
                        ) : (
                            <span className="text-[10px] font-black text-muted/40 uppercase  flex items-center gap-2">
                                <Activity size={12} className="opacity-20" /> Device Staged
                            </span>
                        )}
                    </div>
                </div>

                {onAirMessage && (
                    <button
                        onClick={clearActive}
                        className="px-4 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase  rounded-lg transition-all active:scale-95 shadow-lg shadow-red-600/20 cursor-pointer text-xs"
                    >
                        Kill Feed
                    </button>
                )}

                {/* Visual Scanner Bar */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse" />
            </div>

            {/* Unified Communication Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {messages.filter((m: SocialMessage) => !filter || m.status === filter).map((msg: SocialMessage) => (
                        <motion.div
                            layout
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={cn(
                                "group relative overflow-hidden p-4 rounded-3xl border transition-all duration-300",
                                msg.status === 'ON_AIR'
                                    ? "bg-red-500/5 border-red-500/50 shadow-2xl scale-[1.02] z-10"
                                    : "bg-background/40 border-card-border/50 hover:bg-background/60 hover:border-indigo-500/30"
                            )}
                        >
                            <div className="flex gap-4">
                                <div className="relative shrink-0 flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-[1.25rem] overflow-hidden bg-card-bg border border-card-border shadow-inner">
                                        {msg.authorAvatar ? (
                                            <img src={msg.authorAvatar} alt={msg.author} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-indigo-400 text-sm bg-indigo-500/5">
                                                {msg.author.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-lg border flex items-center justify-center transition-colors",
                                        msg.platform.toLowerCase() === 'youtube' && "bg-red-600 border-red-500 shadow-lg shadow-red-600/20",
                                        msg.platform.toLowerCase() === 'twitch' && "bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/20",
                                        msg.platform.toLowerCase() === 'facebook' && "bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20",
                                    )}>
                                        {msg.platform.toLowerCase() === 'youtube' && <Youtube size={10} className="text-white" />}
                                        {msg.platform.toLowerCase() === 'twitch' && <Twitch size={10} className="text-white" />}
                                        {msg.platform.toLowerCase() === 'facebook' && <Facebook size={10} className="text-white" />}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col py-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-black text-foreground uppercase  truncate pr-4">{msg.author}</span>
                                        <span className="text-[9px] font-bold text-muted uppercase ">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-foreground/80 leading-snug font-medium italic">
                                        "{msg.content}"
                                    </p>
                                </div>

                                {/* Tactical Moderation Sidebar (Slide in on Desktop, Always on Mobile) */}
                                <div className="flex flex-col gap-2 shrink-0 self-center">
                                    {msg.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleUpdateStatus(msg.id, 'APPROVED')}
                                            className="p-3 bg-white/5 border border-card-border hover:border-emerald-500/50 text-emerald-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-90 shadow-sm"
                                            title="Validate User"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    )}
                                    {(msg.status === 'PENDING' || msg.status === 'APPROVED') && (
                                        <button
                                            onClick={() => handleUpdateStatus(msg.id, 'ON_AIR')}
                                            className="p-3 bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90 shadow-lg"
                                            title="Push to Air"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                    )}
                                    {msg.status === 'ON_AIR' && (
                                        <button
                                            onClick={() => handleUpdateStatus(msg.id, 'APPROVED')}
                                            className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-500 transition-all active:scale-90 shadow-xl shadow-red-600/20"
                                            title="Retirar"
                                        >
                                            <EyeOff size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Decorative Air Wave for Active Message */}
                            {msg.status === 'ON_AIR' && (
                                <div className="absolute bottom-0 right-0 w-24 h-24 -mr-12 -mb-12 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!isLoading && messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center gap-6 opacity-40">
                        <div className="relative">
                            <MessageSquare size={48} className="text-muted" />
                            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase  text-foreground">Waiting for Fan Interaction</p>
                            <p className="text-[10px] font-bold text-muted uppercase ">Connect your live streams to start polling</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
