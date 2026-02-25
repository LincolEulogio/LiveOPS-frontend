'use client';

import React, { useState, useEffect } from 'react';
import {
    Play, CheckCircle2, RotateCcw,
    Clock, Video,
    AlertTriangle, Tag, Edit2, Trash2,
    Activity, ArrowRight
} from 'lucide-react';
import { TimelineBlock, TimelineStatus } from '../types/timeline.types';
import { cn } from '@/shared/utils/cn';
import { formatDuration } from '@/shared/utils/format';
import { motion, AnimatePresence } from 'framer-motion';

import { useTally } from '@/features/streaming/hooks/useTally';

interface Props {
    productionId: string;
    blocks: TimelineBlock[];
    onStart: (id: string) => void;
    onComplete: (id: string) => void;
    onReset: (id: string) => void;
    onEdit: (block: TimelineBlock) => void;
    onDelete: (id: string) => void;
    canControl?: boolean;
    canEdit?: boolean;
}

export const RundownTable = ({
    productionId,
    blocks,
    onStart,
    onComplete,
    onReset,
    onEdit,
    onDelete,
    canControl = true,
    canEdit = true
}: Props) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { isProgram, isPreview } = useTally(productionId);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const calculateEffective = (block: TimelineBlock) => {
        if (!block.startTime) return 0;
        const start = new Date(block.startTime).getTime();
        const end = block.endTime ? new Date(block.endTime).getTime() : currentTime.getTime();
        return Math.max(0, end - start);
    };

    const totalRemainingMs = blocks
        .filter(b => b.status === TimelineStatus.PENDING)
        .reduce((sum, b) => sum + (b.durationMs || 0), 0);

    return (
        <div className="w-full relative overflow-x-auto no-scrollbar touch-pan-x">
            <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                <thead>
                    <tr className="bg-white/[0.02] border-b border-card-border/50">
                        <th className="pl-8 pr-4 py-6 text-[10px] font-black text-muted uppercase  w-16">#</th>
                        <th className="px-4 py-6 text-[10px] font-black text-muted uppercase ">Segment / Identity</th>
                        <th className="px-4 py-6 text-[10px] font-black text-muted uppercase ">Source Link</th>
                        <th className="px-4 py-6 text-[10px] font-black text-muted uppercase  text-center">Planned</th>
                        <th className="px-4 py-6 text-[10px] font-black text-muted uppercase  text-center">In Air</th>
                        <th className="pl-4 pr-8 py-6 text-right">
                            <div className="inline-flex items-center gap-3 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
                                <Activity size={10} className="text-indigo-400" />
                                <span className="text-[9px] font-black text-muted uppercase ">Est. Remainder:</span>
                                <span className="text-xs font-mono font-black text-indigo-400">{formatDuration(totalRemainingMs)}</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-card-border/30">
                    <AnimatePresence mode="popLayout">
                        {blocks.map((block, index) => {
                            const effective = calculateEffective(block);
                            const isOvertime = block.status === TimelineStatus.ACTIVE &&
                                block.durationMs && block.durationMs > 0 &&
                                effective > block.durationMs;

                            const inProgram = isProgram(block.source);
                            const inPreview = isPreview(block.source);

                            return (
                                <motion.tr
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key={block.id}
                                    className={cn(
                                        "group transition-all duration-300 relative",
                                        block.status === TimelineStatus.ACTIVE ? "bg-indigo-600/[0.03]" : "hover:bg-white/[0.02]",
                                        inProgram && "bg-red-600/[0.05]",
                                        inPreview && "bg-emerald-600/[0.05]"
                                    )}
                                >
                                    {/* Action Indicators */}
                                    {inProgram && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 shadow-[2px_0_15px_rgba(220,38,38,0.5)] z-10" />
                                    )}
                                    {inPreview && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600 shadow-[2px_0_15px_rgba(16,185,129,0.3)] z-10" />
                                    )}
                                    {block.status === TimelineStatus.ACTIVE && !inProgram && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 shadow-[2px_0_15px_rgba(99,102,241,0.3)] z-10" />
                                    )}

                                    <td className="pl-8 pr-4 py-6 text-[11px] font-black font-mono text-muted/50">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </td>

                                    <td className="px-4 py-6">
                                        <div className="flex flex-col gap-1 min-w-[200px]">
                                            <span className={cn(
                                                "font-black text-sm uppercase ",
                                                block.status === TimelineStatus.ACTIVE ? "text-indigo-400" : "text-foreground"
                                            )}>
                                                {block.title}
                                            </span>
                                            {block.description && (
                                                <span className="text-[10px] font-bold text-muted uppercase  line-clamp-1 opacity-60 italic">{block.description}</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-4 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-2.5 h-2.5 rounded-full shadow-inner",
                                                inProgram ? "bg-red-500 animate-pulse shadow-red-500/50" : inPreview ? "bg-emerald-500 shadow-emerald-500/50" : "bg-card-border"
                                            )} />
                                            <div className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase ",
                                                    inProgram ? "text-red-400" : inPreview ? "text-emerald-400" : "text-muted"
                                                )}>
                                                    {block.source || 'DYNAMIC LINK'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-6 text-center">
                                        <span className="text-[11px] font-black font-mono text-muted uppercase ">
                                            {block.durationMs && block.durationMs > 0 ? formatDuration(block.durationMs) : 'MANUAL'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-6 text-center">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px] font-black shadow-inner border transition-colors",
                                            block.status === TimelineStatus.ACTIVE
                                                ? isOvertime
                                                    ? "bg-red-600/10 border-red-500/30 text-red-500 animate-pulse shadow-red-600/10"
                                                    : "bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-indigo-600/10"
                                                : block.status === TimelineStatus.COMPLETED
                                                    ? "bg-white/5 border-transparent text-muted/40"
                                                    : "bg-black/20 border-white/5 text-muted/60"
                                        )}>
                                            <Clock size={12} className={block.status === TimelineStatus.ACTIVE ? "animate-spin-slow" : ""} />
                                            {formatDuration(effective)}
                                            {isOvertime && <AlertTriangle size={12} />}
                                        </div>
                                    </td>

                                    <td className="pl-4 pr-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2.5">
                                            {block.status === TimelineStatus.PENDING && canControl && (
                                                <button
                                                    onClick={() => onStart(block.id)}
                                                    className="p-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/20 active:scale-90 shadow-lg"
                                                    title="Deploy Segment"
                                                >
                                                    <Play size={14} fill="currentColor" />
                                                </button>
                                            )}
                                            {block.status === TimelineStatus.ACTIVE && canControl && (
                                                <button
                                                    onClick={() => onComplete(block.id)}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all active:scale-95 shadow-xl shadow-emerald-600/20 flex items-center gap-2 text-[10px] font-black uppercase "
                                                    title="Secure Segment"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Finalize
                                                </button>
                                            )}
                                            {block.status !== TimelineStatus.PENDING && canControl && (
                                                <button
                                                    onClick={() => onReset(block.id)}
                                                    className="p-3 bg-background border border-card-border text-muted hover:text-orange-400 rounded-xl transition-all active:scale-90 shadow-sm"
                                                    title="Abort / Re-queue"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                            )}

                                            <div className="w-px h-6 bg-card-border/50 mx-2" />

                                            {canEdit && (
                                                <>
                                                    <button
                                                        onClick={() => onEdit(block)}
                                                        className="p-3 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 rounded-xl transition-all active:scale-90"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(block.id)}
                                                        className="p-3 bg-white/5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </tbody>
            </table>

            {blocks.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-muted/30 gap-6">
                    <div className="relative">
                        <Tag size={64} strokeWidth={1} />
                        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black uppercase  text-foreground/40">Empty Protocol Queue</p>
                        <p className="text-[10px] font-bold uppercase  mt-1">No segments initialized for this production</p>
                    </div>
                </div>
            )}
        </div>
    );
};
