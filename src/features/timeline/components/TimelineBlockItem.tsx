'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimelineBlock, TimelineBlockStatus } from '../types/timeline.types';
import {
    GripVertical,
    Play,
    CheckCircle2,
    RotateCcw,
    Clock,
    MoreVertical,
    Trash2,
    Edit2,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    block: TimelineBlock;
    onStart: () => void;
    onComplete: () => void;
    onReset: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const TimelineBlockItem = ({
    block,
    onStart,
    onComplete,
    onReset,
    onEdit,
    onDelete
}: Props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isActive = block.status === TimelineBlockStatus.ACTIVE;
    const isCompleted = block.status === TimelineBlockStatus.COMPLETED;

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatTime = (isoString: string | null) => {
        if (!isoString) return '--:--:--';
        return new Date(isoString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative flex items-center gap-4 p-4 rounded-xl border transition-all",
                "bg-stone-900 border-stone-800",
                isActive && "border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-500/5",
                isCompleted && "opacity-70 grayscale-[0.5] bg-stone-950",
                isDragging && "z-50 shadow-2xl scale-[1.02] border-indigo-400 bg-stone-800 cursor-grabbing"
            )}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="text-stone-600 hover:text-stone-400 cursor-grab active:cursor-grabbing p-1"
            >
                <GripVertical size={20} />
            </button>

            {/* Status Icon */}
            <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2",
                isActive ? "border-indigo-500 text-indigo-500 bg-indigo-500/10 animate-pulse" :
                    isCompleted ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" :
                        "border-stone-800 text-stone-600 bg-stone-950"
            )}>
                {isCompleted ? <CheckCircle2 size={20} /> : <Clock size={20} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-white font-semibold truncate text-sm">
                        {block.title}
                    </h3>
                    {block.linkedScene && (
                        <span className="text-[10px] font-bold bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700 uppercase tracking-tight">
                            {block.linkedScene}
                        </span>
                    )}
                    {block.intercomTemplateId && (
                        <div className="flex items-center gap-1 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tight" title="Linked Intercom Template">
                            <MessageSquare size={10} />
                            Auto
                        </div>
                    )}
                </div>
                {block.description && (
                    <p className="text-stone-500 text-xs truncate">
                        {block.description}
                    </p>
                )}
            </div>

            {/* Duration & Times */}
            <div className="flex flex-col items-end gap-1 px-4 border-r border-stone-800/50">
                <span className="text-stone-300 font-mono text-xs font-bold">
                    {formatDuration(block.durationMs)}
                </span>
                <div className="flex gap-2 text-[10px] font-mono text-stone-500">
                    <span>{formatTime(block.startTime)}</span>
                    <span>-</span>
                    <span>{formatTime(block.endTime)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                {!isActive && !isCompleted && (
                    <button
                        onClick={onStart}
                        className="p-2 text-stone-400 hover:text-indigo-400 hover:bg-stone-800 rounded-lg transition-colors"
                        title="Start Block"
                    >
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                    </button>
                )}
                {isActive && (
                    <button
                        onClick={onComplete}
                        className="p-2 text-indigo-400 hover:text-emerald-400 hover:bg-stone-800 rounded-lg transition-colors"
                        title="Complete Block"
                    >
                        <CheckCircle2 size={18} />
                    </button>
                )}
                {(isActive || isCompleted) && (
                    <button
                        onClick={onReset}
                        className="p-2 text-stone-400 hover:text-orange-400 hover:bg-stone-800 rounded-lg transition-colors"
                        title="Reset Block"
                    >
                        <RotateCcw size={18} />
                    </button>
                )}

                <div className="w-px h-6 bg-stone-800 mx-1"></div>

                <button
                    onClick={onEdit}
                    className="p-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
