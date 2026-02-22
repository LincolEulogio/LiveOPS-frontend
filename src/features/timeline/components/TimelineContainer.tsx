'use client';

import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import { Plus, Layout, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { TimelineCRUD } from '@/features/timeline/components/TimelineCRUD';
import { TimelineBlock } from '@/features/timeline/types/timeline.types';
import { TimelineSkeleton } from '@/shared/components/SkeletonLoaders';
import { RundownTable } from '@/features/timeline/components/RundownTable';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useProduction } from '@/features/productions/hooks/useProductions';

interface Props {
    productionId: string;
}

export const TimelineContainer = ({ productionId }: Props) => {
    const {
        blocks,
        isLoading: isTimelineLoading,
        startBlock,
        completeBlock,
        resetBlock,
        deleteBlock
    } = useTimeline(productionId);

    const { data: production, isLoading: isProdLoading } = useProduction(productionId);
    const { user } = useAuthStore();

    const [isCRUDOpen, setIsCRUDOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<TimelineBlock | undefined>();

    // RBAC: Find current user's role in this production
    const currentUserProdRelation = production?.users?.find(u => u.userId === user?.id);
    const userRole = currentUserProdRelation?.role || user?.globalRole;

    // Simple permission resolution for Phase 2
    const isAdmin = userRole?.name === 'ADMIN' || userRole?.name === 'DIRECTOR';
    const isOperator = userRole?.name === 'OPERATOR' || isAdmin;

    const canControl = isOperator;
    const canEdit = isAdmin;

    const handleCreate = () => {
        setEditingBlock(undefined);
        setIsCRUDOpen(true);
    };

    const handleEdit = (block: TimelineBlock) => {
        setEditingBlock(block);
        setIsCRUDOpen(true);
    };

    if (isTimelineLoading || isProdLoading) {
        return <TimelineSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Layout size={20} className="text-indigo-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Escaleta / Rundown</h2>
                </div>
                <div className="flex items-center gap-2">
                    {canControl && (
                        <button
                            onClick={() => {
                                if (confirm('¿Resetear todos los bloques a Pendiente?')) {
                                    blocks.forEach(b => {
                                        if (b.status !== 'PENDING') resetBlock(b.id);
                                    });
                                }
                            }}
                            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-orange-400 px-3 py-1.5 rounded-lg border border-stone-800 transition-all text-sm font-medium"
                            title="Reset all blocks"
                        >
                            <RotateCcw size={16} />
                            Reset All
                        </button>
                    )}
                    {canEdit && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-all text-sm font-bold shadow-lg shadow-indigo-600/20"
                        >
                            <Plus size={16} />
                            Añadir Bloque
                        </button>
                    )}
                </div>
            </div>

            <RundownTable
                blocks={blocks}
                onStart={startBlock}
                onComplete={completeBlock}
                onReset={resetBlock}
                onEdit={handleEdit}
                onDelete={deleteBlock}
                canControl={canControl}
                canEdit={canEdit}
            />

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
