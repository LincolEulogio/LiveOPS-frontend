'use client';

import React, { useState, useEffect } from 'react';
import {
    Play, CheckCircle2, RotateCcw,
    Clock, Video,
    AlertTriangle, Tag, Edit2, Trash2
} from 'lucide-react';
import { TimelineBlock, TimelineStatus } from '../types/timeline.types';
import { cn } from '@/shared/utils/cn';
import { formatDuration } from '@/shared/utils/format';

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

    return (
        <div className="w-full overflow-hidden rounded-xl border border-stone-800 bg-stone-950/40 backdrop-blur-md">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-stone-900/50 border-b border-stone-800">
                        <th className="px-4 py-3 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] w-12">#</th>
                        <th className="px-4 py-3 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Bloque / Título</th>
                        <th className="px-4 py-3 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Fuente</th>
                        <th className="px-4 py-3 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] text-center">Planif.</th>
                        <th className="px-4 py-3 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] text-center">Efectivo</th>
                        <th className="px-4 py-3 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] text-right">Estado / Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                    {blocks.map((block, index) => {
                        const effective = calculateEffective(block);
                        const isOvertime = block.status === TimelineStatus.ACTIVE &&
                            block.durationMs && block.durationMs > 0 &&
                            effective > block.durationMs;

                        const inProgram = isProgram(block.source);
                        const inPreview = isPreview(block.source);

                        return (
                            <tr
                                key={block.id}
                                className={cn(
                                    "group transition-colors relative",
                                    block.status === TimelineStatus.ACTIVE ? "bg-indigo-500/5" : "hover:bg-white/[0.02]",
                                    inProgram && "bg-red-500/10",
                                    inPreview && "bg-emerald-500/10"
                                )}
                            >
                                {/* Tally Indicator Border */}
                                {inProgram && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[2px_0_10px_rgba(220,38,38,0.5)]" />}
                                {inPreview && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />}
                                <td className="px-4 py-4 text-xs font-mono text-stone-600">
                                    {(index + 1).toString().padStart(2, '0')}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "font-bold text-sm tracking-tight",
                                            block.status === TimelineStatus.ACTIVE ? "text-indigo-400" : "text-stone-200"
                                        )}>
                                            {block.title}
                                        </span>
                                        {block.description && (
                                            <span className="text-[10px] text-stone-500 line-clamp-1">{block.description}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            inProgram ? "bg-red-500 animate-pulse" : inPreview ? "bg-emerald-500" : "bg-stone-700"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-bold uppercase",
                                            inProgram ? "text-red-400" : inPreview ? "text-emerald-400" : "text-stone-400"
                                        )}>
                                            {block.source || '---'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="text-xs font-mono text-stone-500">
                                        {block.durationMs && block.durationMs > 0 ? formatDuration(block.durationMs) : 'MANUAL'}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-xs font-bold",
                                        block.status === TimelineStatus.ACTIVE
                                            ? isOvertime ? "bg-red-500/20 text-red-400" : "bg-indigo-500/20 text-indigo-400"
                                            : block.status === TimelineStatus.COMPLETED ? "text-stone-400" : "text-stone-700"
                                    )}>
                                        <Clock size={10} />
                                        {formatDuration(effective)}
                                        {isOvertime && <AlertTriangle size={10} className="animate-pulse" />}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {block.status === TimelineStatus.PENDING && canControl && (
                                            <button
                                                onClick={() => onStart(block.id)}
                                                className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-all border border-indigo-500/20"
                                                title="Iniciar Bloque"
                                            >
                                                <Play size={14} fill="currentColor" />
                                            </button>
                                        )}
                                        {block.status === TimelineStatus.ACTIVE && canControl && (
                                            <button
                                                onClick={() => onComplete(block.id)}
                                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-all border border-emerald-500/20 animate-pulse"
                                                title="Completar Bloque"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                        )}
                                        {block.status !== TimelineStatus.PENDING && canControl && (
                                            <button
                                                onClick={() => onReset(block.id)}
                                                className="p-2 bg-stone-900 border border-stone-800 text-stone-500 hover:text-orange-400 rounded-lg transition-all"
                                                title="Resetear"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        )}
                                        <div className="w-px h-4 bg-stone-800 mx-1" />
                                        {canEdit && (
                                            <>
                                                <button
                                                    onClick={() => onEdit(block)}
                                                    className="p-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(block.id)}
                                                    className="p-2 text-stone-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {blocks.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-stone-600">
                    <Tag size={40} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay bloques en la escaleta</p>
                </div>
            )}
        </div>
    );
};
