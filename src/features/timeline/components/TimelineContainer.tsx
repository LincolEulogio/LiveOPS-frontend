'use client';

import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import { Plus, Layout, RotateCcw, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { TimelineCRUD } from '@/features/timeline/components/TimelineCRUD';
import { TimelineBlock } from '@/features/timeline/types/timeline.types';
import { TimelineSkeleton } from '@/shared/components/SkeletonLoaders';
import { RundownTable } from '@/features/timeline/components/RundownTable';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useProduction } from '@/features/productions/hooks/useProductions';
import { cn } from '@/shared/utils/cn';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

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
    const isAdmin = userRole?.name === 'ADMIN' || userRole?.name === 'DIRECTOR' || userRole?.name === 'SUPERADMIN';
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

    const handleDelete = async (id: string) => {
        const result = await MySwal.fire({
            title: '¿Eliminar bloque?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#1c1917',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1c1917',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await deleteBlock(id);
                MySwal.fire({
                    title: '¡Eliminado!',
                    text: 'El bloque ha sido borrado.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#1c1917',
                    color: '#fff'
                });
            } catch (err) {
                MySwal.fire('Error', 'No se pudo eliminar el bloque', 'error');
            }
        }
    };

    const handleSmartNext = async () => {
        const activeBlock = blocks.find(b => b.status === 'ACTIVE');
        const nextBlock = blocks.find(b => b.status === 'PENDING');

        if (!nextBlock) {
            MySwal.fire({
                title: 'Fin de Escaleta',
                text: 'No hay más bloques pendientes.',
                icon: 'info',
                background: '#1c1917',
                color: '#fff'
            });
            return;
        }

        try {
            if (activeBlock) {
                await completeBlock(activeBlock.id);
            }
            await startBlock(nextBlock.id);
            MySwal.fire({
                title: 'Siguiente bloque',
                text: `Ahora en el aire: ${nextBlock.title}`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                background: '#1c1917',
                color: '#fff'
            });
        } catch (err) {
            console.error('Smart Next failed:', err);
            MySwal.fire('Error', 'Fallo al cambiar de bloque', 'error');
        }
    };

    const handleResetAll = async () => {
        const result = await MySwal.fire({
            title: '¿Resetear escaleta?',
            text: "Todos los bloques volverán a estado Pendiente.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#1c1917',
            confirmButtonText: 'Sí, resetear todo',
            background: '#1c1917',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const promises = blocks
                    .filter(b => b.status !== 'PENDING')
                    .map(b => resetBlock(b.id));
                await Promise.all(promises);

                MySwal.fire({
                    title: '¡Reseteado!',
                    text: 'La escaleta ha sido reiniciada.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#1c1917',
                    color: '#fff'
                });
            } catch (err) {
                MySwal.fire('Error', 'Fallo al resetear la escaleta', 'error');
            }
        }
    };

    const handleStart = async (id: string) => {
        try {
            await startBlock(id);
            const block = blocks.find(b => b.id === id);
            MySwal.fire({
                title: 'Bloque iniciado',
                text: `${block?.title || 'Segmento'} está ahora en vivo`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#1c1917',
                color: '#fff'
            });
        } catch (err) {
            MySwal.fire('Error', 'No se pudo iniciar el bloque', 'error');
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await completeBlock(id);
            MySwal.fire({
                title: 'Bloque completado',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#1c1917',
                color: '#fff'
            });
        } catch (err) {
            MySwal.fire('Error', 'No se pudo completar el bloque', 'error');
        }
    };

    const handleReset = async (id: string) => {
        try {
            await resetBlock(id);
            MySwal.fire({
                title: 'Bloque reseteado',
                icon: 'info',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#1c1917',
                color: '#fff'
            });
        } catch (err) {
            MySwal.fire('Error', 'No se pudo resetear el bloque', 'error');
        }
    };

    if (isTimelineLoading || isProdLoading) {
        return <TimelineSkeleton />;
    }

    const hasActive = blocks.some(b => b.status === 'ACTIVE');
    const hasNext = blocks.some(b => b.status === 'PENDING');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Layout size={20} className="text-indigo-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Escaleta / Rundown</h2>
                </div>
                <div className="flex items-center gap-2">
                    {canControl && (
                        <>
                            <button
                                onClick={handleSmartNext}
                                disabled={!hasNext}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all text-sm font-bold shadow-lg",
                                    hasNext
                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                                        : "bg-stone-800 text-stone-500 cursor-not-allowed"
                                )}
                            >
                                <ArrowRight size={16} />
                                {hasActive ? 'Siguiente Bloque' : 'Iniciar Producción'}
                            </button>
                            <button
                                onClick={handleResetAll}
                                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-orange-400 px-3 py-1.5 rounded-lg border border-stone-800 transition-all text-sm font-medium"
                                title="Reset all blocks"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        </>
                    )}
                    {canEdit && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-lg border border-stone-700 transition-all text-sm font-bold"
                        >
                            <Plus size={16} />
                            Añadir
                        </button>
                    )}
                </div>
            </div>

            <RundownTable
                productionId={productionId}
                blocks={blocks}
                onStart={handleStart}
                onComplete={handleComplete}
                onReset={handleReset}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
