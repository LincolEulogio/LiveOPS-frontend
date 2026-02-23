'use client';

import React, { useState } from 'react';
import {
    MessageSquare, Share2, Youtube,
    Twitch, Facebook, Trash2,
    Eye, EyeOff, Filter
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
        <div className="flex flex-col h-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/50">
                <div className="flex items-center gap-2">
                    <Share2 size={18} className="text-indigo-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Moderation</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSimulate}
                        className="text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-stone-400 px-3 py-1.5 rounded-lg border border-stone-700 transition-all"
                    >
                        SIMULATE
                    </button>
                    <div className="relative group/filter">
                        <Filter size={14} className="text-stone-500 group-hover/filter:text-stone-300 transition-colors" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        >
                            <option value="">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="ON_AIR">On Air</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* active overlay status */}
            <div className="px-5 py-3 bg-indigo-500/5 border-b border-stone-800 flex items-center justify-between min-h-[48px]">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">On Air Graphics</span>
                {onAirMessage ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-400 truncate max-w-[120px]">{onAirMessage.author}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                        <button onClick={clearActive} className="p-1 hover:text-red-400 transition-colors">
                            <EyeOff size={12} />
                        </button>
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">Overlay Idle</span>
                )}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.filter((m: SocialMessage) => !filter || m.status === filter).map((msg: SocialMessage) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={cn(
                                "group relative p-3 rounded-xl border transition-all",
                                msg.status === 'ON_AIR'
                                    ? "bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5"
                                    : msg.status === 'APPROVED' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-stone-950 border-stone-800 hover:border-stone-700"
                            )}
                        >
                            <div className="flex gap-3">
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-800 border border-stone-700">
                                        {msg.authorAvatar ? (
                                            <img src={msg.authorAvatar} alt={msg.author} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-stone-500 text-xs">
                                                {msg.author.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 p-0.5 rounded border border-stone-900 shadow-sm transition-colors",
                                        msg.platform.toLowerCase() === 'youtube' && "bg-red-600",
                                        msg.platform.toLowerCase() === 'twitch' && "bg-purple-600",
                                        msg.platform.toLowerCase() === 'facebook' && "bg-blue-600",
                                    )}>
                                        {msg.platform.toLowerCase() === 'youtube' && <Youtube size={8} className="text-white" />}
                                        {msg.platform.toLowerCase() === 'twitch' && <Twitch size={8} className="text-white" />}
                                        {msg.platform.toLowerCase() === 'facebook' && <Facebook size={8} className="text-white" />}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-stone-200 truncate">{msg.author}</span>
                                        <span className="text-[9px] font-medium text-stone-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {msg.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleUpdateStatus(msg.id, 'APPROVED')}
                                            className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                            title="Approve"
                                        >
                                            <Eye size={12} />
                                        </button>
                                    )}
                                    {(msg.status === 'PENDING' || msg.status === 'APPROVED') && (
                                        <button
                                            onClick={() => handleUpdateStatus(msg.id, 'ON_AIR')}
                                            className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
                                            title="Send to Air"
                                        >
                                            <Share2 size={12} />
                                        </button>
                                    )}
                                    {msg.status === 'ON_AIR' && (
                                        <button
                                            onClick={() => handleUpdateStatus(msg.id, 'APPROVED')}
                                            className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                            title="Remove from Air"
                                        >
                                            <EyeOff size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!isLoading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-40">
                        <div className="p-4 bg-stone-800/50 rounded-full">
                            <MessageSquare size={24} className="text-stone-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-600">
                            No messages received
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
