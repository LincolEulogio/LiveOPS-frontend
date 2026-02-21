'use client';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import { TimelineBlockItem } from '@/features/timeline/components/TimelineBlockItem';
import { TimelineIndicator } from '@/features/timeline/components/TimelineIndicator';
import { Plus, Layout } from 'lucide-react';
import { useState } from 'react';
import { TimelineCRUD } from '@/features/timeline/components/TimelineCRUD';
import { TimelineBlock } from '@/features/timeline/types/timeline.types';
import { TimelineSkeleton } from '@/shared/components/SkeletonLoaders';

interface Props {
    productionId: string;
}

export const TimelineContainer = ({ productionId }: Props) => {
    const {
        blocks,
        isLoading,
        reorderBlocks,
        startBlock,
        completeBlock,
        resetBlock,
        deleteBlock
    } = useTimeline(productionId);

    const [isCRUDOpen, setIsCRUDOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<TimelineBlock | undefined>();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Avoid accidental drags when clicking
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex((b) => b.id === active.id);
            const newIndex = blocks.findIndex((b) => b.id === over.id);

            const newOrder = arrayMove(blocks, oldIndex, newIndex);
            reorderBlocks(newOrder.map(b => b.id));
        }
    };

    const handleCreate = () => {
        setEditingBlock(undefined);
        setIsCRUDOpen(true);
    };

    const handleEdit = (block: TimelineBlock) => {
        setEditingBlock(block);
        setIsCRUDOpen(true);
    };

    if (isLoading) {
        return <TimelineSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Layout size={20} className="text-indigo-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Timeline</h2>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white px-3 py-1.5 rounded-lg border border-stone-800 transition-all text-sm font-medium"
                >
                    <Plus size={16} />
                    Add Block
                </button>
            </div>

            <div className="bg-stone-950/20 rounded-2xl border border-stone-800/50 p-4 min-h-[400px]">
                <TimelineIndicator />

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={blocks.map(b => b.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3 mt-4">
                            {blocks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-stone-700 mb-4">
                                        <Layout size={24} />
                                    </div>
                                    <h3 className="text-stone-400 font-medium">No timeline blocks</h3>
                                    <p className="text-stone-600 text-sm mt-1">Plan your stream by adding content blocks.</p>
                                </div>
                            ) : (
                                blocks.map((block) => (
                                    <TimelineBlockItem
                                        key={block.id}
                                        block={block}
                                        onStart={() => startBlock(block.id)}
                                        onComplete={() => completeBlock(block.id)}
                                        onReset={() => resetBlock(block.id)}
                                        onEdit={() => handleEdit(block)}
                                        onDelete={() => deleteBlock(block.id)}
                                    />
                                ))
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <TimelineCRUD
                productionId={productionId}
                isOpen={isCRUDOpen}
                onClose={() => setIsCRUDOpen(false)}
                editingBlock={editingBlock}
                nextOrder={blocks.length}
            />
        </div>
    );
};
