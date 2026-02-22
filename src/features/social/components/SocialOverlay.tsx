'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { AnimatePresence, motion } from 'framer-motion';
import { Youtube, Twitch, Facebook } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface SocialComment {
    id: string;
    platform: 'youtube' | 'twitch' | 'facebook';
    author: string;
    avatar?: string;
    message: string;
    timestamp: string;
}

interface SocialOverlayProps {
    productionId: string;
}

export const SocialOverlay = ({ productionId }: SocialOverlayProps) => {
    const { socket, isConnected } = useSocket();
    const [activeComment, setActiveComment] = useState<SocialComment | null>(null);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('social.overlay_update', (data: { comment: SocialComment | null }) => {
            setActiveComment(data.comment);
        });

        return () => {
            socket.off('social.overlay_update');
        };
    }, [socket, isConnected]);

    if (!activeComment) return null;

    const PlatformIcon = {
        youtube: Youtube,
        twitch: Twitch,
        facebook: Facebook,
    }[activeComment.platform];

    return (
        <div className="fixed inset-0 flex items-end justify-center pb-12 p-8 overflow-hidden">
            <AnimatePresence mode="wait">
                {activeComment && (
                    <motion.div
                        key={activeComment.id}
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="relative flex items-center max-w-4xl"
                    >
                        {/* Glossy Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]" />

                        {/* Animated Border Gradient */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[34px] opacity-20 blur-sm animate-pulse" />

                        <div className="relative flex items-center p-6 gap-6">
                            {/* Avatar Section */}
                            <div className="relative flex-shrink-0">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                                    {activeComment.avatar ? (
                                        <img src={activeComment.avatar} alt={activeComment.author} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                                            <span className="text-2xl font-black text-stone-600">
                                                {activeComment.author.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Platform Badge */}
                                <div className={cn(
                                    "absolute -bottom-2 -right-2 p-1.5 rounded-lg shadow-lg border border-white/20",
                                    activeComment.platform === 'youtube' && "bg-red-600",
                                    activeComment.platform === 'twitch' && "bg-purple-600",
                                    activeComment.platform === 'facebook' && "bg-blue-600",
                                )}>
                                    <PlatformIcon size={14} className="text-white" />
                                </div>
                            </div>

                            {/* Text Section */}
                            <div className="flex flex-col gap-1 pr-6">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase">
                                        {activeComment.author}
                                    </h3>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                </div>
                                <p className="text-2xl font-bold text-stone-200 leading-tight">
                                    {activeComment.message}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
