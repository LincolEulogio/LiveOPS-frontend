import { useTimeline } from '../hooks/useTimeline';
import { TimelineBlockItem } from './TimelineBlockItem';
import { Plus, ListTree, Loader2, PlayCircle } from 'lucide-react';
import { useAppStore } from '@/shared/store/app.store';

export const TimelineView = () => {
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const {
        blocks,
        isLoading,
        isMutating,
        createBlock,
        startBlock,
        completeBlock,
        resetBlock,
        deleteBlock
    } = useTimeline(activeProductionId || undefined);

    const handleAddBlock = async () => {
        const title = prompt('Enter block title:');
        if (title) {
            await createBlock({
                title,
                durationMs: 300000, // Default 5 mins
                order: blocks.length
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-stone-500">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Escaleta...</p>
            </div>
        );
    }

    const activeBlock = blocks.find(b => b.status === 'ACTIVE');

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-stone-800/50 bg-stone-900/20">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <ListTree size={18} className="text-indigo-400" />
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Escaleta</h2>
                    </div>
                </div>
                <p className="text-[10px] text-stone-500 font-medium leading-relaxed">
                    Track your show segments and trigger automated actions.
                </p>

                {/* Global Show Control */}
                <div className="mt-6">
                    {activeBlock ? (
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">On Air Now</span>
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            </div>
                            <h3 className="text-sm font-bold text-white truncate">{activeBlock.title}</h3>
                        </div>
                    ) : (
                        <button
                            onClick={() => blocks.length > 0 && startBlock(blocks[0].id)}
                            disabled={blocks.length === 0 || isMutating}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                            <PlayCircle size={16} />
                            Start Show
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">
                {blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600 mb-4">
                            <ListTree size={24} />
                        </div>
                        <p className="text-sm font-bold text-stone-400 mb-1">No blocks yet</p>
                        <p className="text-[10px] text-stone-600 uppercase font-bold tracking-tight">
                            Build your show rundown to stay organized.
                        </p>
                    </div>
                ) : (
                    blocks.map((block) => (
                        <TimelineBlockItem
                            key={block.id}
                            block={block}
                            onStart={startBlock}
                            onComplete={completeBlock}
                            onReset={resetBlock}
                            onDelete={deleteBlock}
                            isMutating={isMutating}
                        />
                    ))
                )}
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-stone-800/50 bg-stone-900/20">
                <button
                    onClick={handleAddBlock}
                    disabled={isMutating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 font-bold text-xs uppercase tracking-widest"
                >
                    <Plus size={16} />
                    Add Segment
                </button>
            </div>
        </div>
    );
};
