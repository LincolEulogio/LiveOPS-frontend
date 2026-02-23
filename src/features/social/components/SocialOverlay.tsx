'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { AnimatePresence, motion } from 'framer-motion';
import { Youtube, Twitch, Facebook, BarChart3 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface SocialMessage {
    id: string;
    platform: string;
    author: string;
    authorAvatar?: string;
    content: string;
    status: string;
}

interface PollOption {
    id: string;
    text: string;
    votes: number;
}

interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    isActive: boolean;
}

interface SocialOverlayProps {
    productionId: string;
}

export const SocialOverlay = ({ productionId }: SocialOverlayProps) => {
    const { socket, isConnected } = useSocket();
    const [activeMessage, setActiveMessage] = useState<SocialMessage | null>(null);
    const [activePoll, setActivePoll] = useState<Poll | null>(null);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('social.message.updated', (msg: SocialMessage) => {
            if (msg.status === 'ON_AIR') {
                setActiveMessage(msg);
                setActivePoll(null); // Clear poll if message is sent to air
            } else if (activeMessage?.id === msg.id) {
                setActiveMessage(null);
            }
        });

        socket.on('graphics.social.hide', () => setActiveMessage(null));

        socket.on('social.poll.updated', (poll: Poll) => {
            if (poll.isActive) {
                setActivePoll(poll);
                setActiveMessage(null); // Clear message if poll is active
            }
        });

        socket.on('social.poll.closed', () => setActivePoll(null));

        return () => {
            socket.off('social.message.updated');
            socket.off('graphics.social.hide');
            socket.off('social.poll.updated');
            socket.off('social.poll.closed');
        };
    }, [socket, isConnected, activeMessage]);

    const totalVotes = activePoll?.options.reduce((sum, opt) => sum + opt.votes, 0) || 0;

    return (
        <div className="fixed inset-0 flex items-end justify-center pb-12 p-8 overflow-hidden pointer-events-none">
            <AnimatePresence mode="wait">
                {activeMessage && (
                    <motion.div
                        key={`msg-${activeMessage.id}`}
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="relative flex items-center max-w-4xl"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]" />
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[34px] opacity-20 blur-sm animate-pulse" />

                        <div className="relative flex items-center p-6 gap-6">
                            <div className="relative flex-shrink-0">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                                    {activeMessage.authorAvatar ? (
                                        <img src={activeMessage.authorAvatar} alt={activeMessage.author} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                                            <span className="text-2xl font-black text-stone-600">
                                                {activeMessage.author.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className={cn(
                                    "absolute -bottom-2 -right-2 p-1.5 rounded-lg shadow-lg border border-white/20",
                                    activeMessage.platform.toLowerCase() === 'youtube' && "bg-red-600",
                                    activeMessage.platform.toLowerCase() === 'twitch' && "bg-purple-600",
                                    activeMessage.platform.toLowerCase() === 'facebook' && "bg-blue-600",
                                )}>
                                    {activeMessage.platform.toLowerCase() === 'youtube' && <Youtube size={14} className="text-white" />}
                                    {activeMessage.platform.toLowerCase() === 'twitch' && <Twitch size={14} className="text-white" />}
                                    {activeMessage.platform.toLowerCase() === 'facebook' && <Facebook size={14} className="text-white" />}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 pr-6">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase">
                                        {activeMessage.author}
                                    </h3>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                </div>
                                <p className="text-2xl font-bold text-stone-200 leading-tight">
                                    {activeMessage.content}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activePoll && (
                    <motion.div
                        key={`poll-${activePoll.id}`}
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="relative flex flex-col max-w-2xl w-full"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]" />

                        <div className="relative p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3 className="text-emerald-500" size={24} />
                                <h3 className="text-2xl font-black text-white tracking-tight uppercase">{activePoll.question}</h3>
                            </div>

                            <div className="space-y-4">
                                {activePoll.options.map((opt) => {
                                    const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                                    return (
                                        <div key={opt.id} className="space-y-2">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span className="text-white">{opt.text}</span>
                                                <span className="text-emerald-400">{Math.round(percentage)}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-center text-xs font-black text-white/30 uppercase tracking-[0.3em]">
                                {totalVotes} TOTAL VOTES RECEIVED
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
