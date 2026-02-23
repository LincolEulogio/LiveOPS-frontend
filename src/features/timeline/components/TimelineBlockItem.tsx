import { TimelineBlock, TimelineStatus } from '../types/timeline.types';
import { Play, CheckCircle, RotateCcw, Clock, Trash2, Edit2 } from 'lucide-react';

interface TimelineBlockItemProps {
    block: TimelineBlock;
    onStart: (id: string) => void;
    onComplete: (id: string) => void;
    onReset: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (block: TimelineBlock) => void;
    isMutating: boolean;
}

export const TimelineBlockItem = ({
    block,
    onStart,
    onComplete,
    onReset,
    onDelete,
    onEdit,
    isMutating
}: TimelineBlockItemProps) => {
    const formatDuration = (ms?: number) => {
        if (!ms) return '--:--';
        const totalSeconds = Math.floor(intervalToSeconds(ms));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    function intervalToSeconds(ms: number) {
        return ms / 1000;
    }

    const getStatusColor = () => {
        switch (block.status) {
            case TimelineStatus.ACTIVE: return 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]';
            case TimelineStatus.COMPLETED: return 'border-emerald-500/50 bg-emerald-500/5 opacity-60';
            default: return 'border-card-border bg-card-bg/40';
        }
    };

    return (
        <div className={`relative group border rounded-xl p-4 transition-all duration-300 ${getStatusColor()}`}>
            {block.status === TimelineStatus.ACTIVE && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-indigo-500 rounded-full blur-[2px]" />
            )}

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                            #{(block.order + 1).toString().padStart(2, '0')}
                        </span>
                        <h4 className="text-sm font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => onEdit(block)}>
                            {block.title}
                        </h4>
                    </div>
                    {block.description && (
                        <p className="text-xs text-muted line-clamp-1 mb-2">
                            {block.description}
                        </p>
                    )}

                    <div className="flex items-center gap-3 mt-auto">
                        <div className="flex items-center gap-1.5 text-muted">
                            <Clock size={12} className="text-muted" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">
                                {formatDuration(block.durationMs)}
                            </span>
                        </div>
                        {block.linkedScene && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border border-card-border">
                                <span className="text-[9px] font-bold text-muted uppercase tracking-widest">
                                    Scene: {block.linkedScene}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {block.status === TimelineStatus.PENDING && (
                        <button
                            onClick={() => onStart(block.id)}
                            disabled={isMutating}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                            title="Start Block"
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    )}

                    {block.status === TimelineStatus.ACTIVE && (
                        <button
                            onClick={() => onComplete(block.id)}
                            disabled={isMutating}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                            title="Complete Block"
                        >
                            <CheckCircle size={16} />
                        </button>
                    )}

                    {(block.status === TimelineStatus.COMPLETED || block.status === TimelineStatus.ACTIVE) && (
                        <button
                            onClick={() => onReset(block.id)}
                            disabled={isMutating}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-background hover:bg-card-bg text-muted hover:text-foreground border border-card-border transition-all disabled:opacity-50"
                            title="Reset Block"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(block)}
                            disabled={isMutating}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-indigo-400 hover:bg-indigo-400/10 transition-all disabled:opacity-50"
                            title="Edit Block"
                        >
                            <Edit2 size={16} />
                        </button>

                        {block.status === TimelineStatus.PENDING && (
                            <button
                                onClick={() => onDelete(block.id)}
                                disabled={isMutating}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                                title="Delete Block"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
