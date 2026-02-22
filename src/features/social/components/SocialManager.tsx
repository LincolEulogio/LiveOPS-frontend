'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import {
    MessageSquare, Share2, Youtube,
    Twitch, Facebook, Trash2, Zap,
    Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialComment {
    id: string;
    platform: 'youtube' | 'twitch' | 'facebook';
    author: string;
    avatar?: string;
    message: string;
    timestamp: string;
}

interface SocialManagerProps {
    productionId: string;
}

export const SocialManager = ({ productionId }: SocialManagerProps) => {
    const { socket, isConnected } = useSocket();
    const [comments, setComments] = useState<SocialComment[]>([]);
    const [activeComment, setActiveComment] = useState<SocialComment | null>(null);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleComment = (data: { comment: SocialComment }) => {
            setComments(prev => [data.comment, ...prev].slice(0, 50));
        };

        const handleOverlayUpdate = (data: { comment: SocialComment | null }) => {
            setActiveComment(data.comment);
        };

        socket.on('social.comment_received', handleComment);
        socket.on('social.overlay_update', handleOverlayUpdate);

        return () => {
            socket.off('social.comment_received');
            socket.off('social.overlay_update');
        };
    }, [socket, isConnected]);

    const toggleOverlay = (comment: SocialComment) => {
        const isCurrentlyActive = activeComment?.id === comment.id;
        const newTarget = isCurrentlyActive ? null : comment;

        socket?.emit('social.overlay', {
            productionId,
            comment: newTarget
        });
    };

    const clearOverlay = () => {
        socket?.emit('social.overlay', {
            productionId,
            comment: null
        });
    };

    const clearList = () => setComments([]);

    return (
        <div className="flex flex-col h-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/50">
                <div className="flex items-center gap-2">
                    <Share2 size={18} className="text-indigo-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Social Connect</h2>
                </div>
                <div className="flex items-center gap-2">
                    {activeComment && (
                        <button
                            onClick={clearOverlay}
                            className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-400 group hover:bg-red-500 hover:text-white transition-all"
                        >
                            <EyeOff size={12} />
                            CLEAR OVERLAY
                        </button>
                    )}
                    <button
                        onClick={clearList}
                        className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-500 hover:text-stone-300 transition-colors"
                        title="Clear List"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* active overlay status */}
            <div className="px-5 py-3 bg-indigo-500/5 border-b border-stone-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">On Air Overlay</span>
                {activeComment ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-400 truncate max-w-[120px]">{activeComment.author}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-stone-600">NONE</span>
                )}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={cn(
                                "group relative p-3 rounded-xl border transition-all cursor-pointer",
                                activeComment?.id === comment.id
                                    ? "bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5"
                                    : "bg-stone-950 border-stone-800 hover:border-stone-700"
                            )}
                            onClick={() => toggleOverlay(comment)}
                        >
                            <div className="flex gap-3">
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-800 border border-stone-700">
                                        {comment.avatar ? (
                                            <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-stone-500 text-xs">
                                                {comment.author.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 p-0.5 rounded border border-stone-900 shadow-sm",
                                        comment.platform === 'youtube' && "bg-red-600",
                                        comment.platform === 'twitch' && "bg-purple-600",
                                        comment.platform === 'facebook' && "bg-blue-600",
                                    )}>
                                        {comment.platform === 'youtube' && <Youtube size={8} className="text-white" />}
                                        {comment.platform === 'twitch' && <Twitch size={8} className="text-white" />}
                                        {comment.platform === 'facebook' && <Facebook size={8} className="text-white" />}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-stone-200 truncate">{comment.author}</span>
                                        <span className="text-[9px] font-medium text-stone-600">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                                        {comment.message}
                                    </p>
                                </div>

                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-all",
                                        activeComment?.id === comment.id ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                                    )}>
                                        {activeComment?.id === comment.id ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {comments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-40">
                        <div className="p-4 bg-stone-800/50 rounded-full">
                            <MessageSquare size={24} className="text-stone-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-600 decoration-indigo-500 underline-offset-4 decoration-2">
                            Waiting for incoming comments...
                        </p>
                    </div>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-stone-800 bg-stone-950/50">
                <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-stone-900 border border-stone-800 rounded-lg">
                        <span className="text-[10px] font-bold text-stone-600 uppercase block mb-1">Overlay Link</span>
                        <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/productions/${productionId}/overlay/social`}
                            className="w-full bg-transparent text-[10px] font-mono text-indigo-400 outline-none select-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
