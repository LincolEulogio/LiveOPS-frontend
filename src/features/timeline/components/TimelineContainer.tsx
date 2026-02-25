'use client';

import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import { Plus, Layout, RotateCcw, ArrowRight, Play, CheckCircle2, Zap } from 'lucide-react';
import { useState } from 'react';
import { TimelineCRUD } from '@/features/timeline/components/TimelineCRUD';
import { TimelineBlock } from '@/features/timeline/types/timeline.types';
import { TimelineSkeleton } from '@/shared/components/SkeletonLoaders';
import { RundownTable } from '@/features/timeline/components/RundownTable';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useProduction } from '@/features/productions/hooks/useProductions';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
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
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#1a1a1a',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#0f172a',
            color: '#f8fafc',
            customClass: {
                popup: 'rounded-[1.5rem] border border-white/10  backdrop-blur-xl'
            }
        });

        if (result.isConfirmed) {
            try {
                await deleteBlock(id);
                toastSuccess('Segmento eliminado con éxito');
            } catch (err) {
                MySwal.fire('Error', 'No se pudo eliminar el bloque', 'error');
            }
        }
    };

    const toastSuccess = (msg: string) => {
        MySwal.fire({
            title: msg,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            background: '#6366f1',
            color: '#fff'
        });
    };

    const handleSmartNext = async () => {
        const activeBlock = blocks.find(b => b.status === 'ACTIVE');
        const nextBlock = blocks.find(b => b.status === 'PENDING');

        if (!nextBlock) {
            MySwal.fire({
                title: 'Fin de Escaleta',
                text: 'No hay más bloques pendientes.',
                icon: 'info',
                background: '#0f172a',
                color: '#f8fafc',
                customClass: { popup: 'rounded-[1.5rem]' }
            });
            return;
        }

        try {
            if (activeBlock) {
                await completeBlock(activeBlock.id);
            }
            await startBlock(nextBlock.id);
            toastSuccess(`En el aire: ${nextBlock.title}`);
        } catch (err) {
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
            cancelButtonColor: '#1a1a1a',
            confirmButtonText: 'Sí, resetear todo',
            background: '#0f172a',
            color: '#f8fafc',
            customClass: { popup: 'rounded-[1.5rem]' }
        });

        if (result.isConfirmed) {
            try {
                const promises = blocks
                    .filter(b => b.status !== 'PENDING')
                    .map(b => resetBlock(b.id));
                await Promise.all(promises);
                toastSuccess('Escaleta reiniciada');
            } catch (err) {
                MySwal.fire('Error', 'Fallo al resetear la escaleta', 'error');
            }
        }
    };

    const handleStart = async (id: string) => {
        try {
            await startBlock(id);
            const block = blocks.find(b => b.id === id);
            toastSuccess(`${block?.title || 'Segmento'} está ahora en vivo`);
        } catch (err) {
            MySwal.fire('Error', 'No se pudo iniciar el bloque', 'error');
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await completeBlock(id);
            toastSuccess('Segmento completado');
        } catch (err) {
            MySwal.fire('Error', 'No se pudo completar el bloque', 'error');
        }
    };

    const handleReset = async (id: string) => {
        try {
            await resetBlock(id);
            toastSuccess('Segmento en standby');
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
        <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] overflow-hidden  flex flex-col group/timeline h-full">
            {/* Visual Scanline */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover/timeline:opacity-100 transition-opacity" />

            {/* Premium Tactical Header - Integrated */}
            <div className="p-6 sm:p-8 border-b border-card-border/50 bg-white/[0.04] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover/timeline:scale-110 transition-transform duration-1000">
                    <Layout size={100} />
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 ">
                        <Layout className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-foreground uppercase  italic leading-none mb-1.5">
                            Operational Rundown
                        </h2>
                        <p className="text-[9px] font-black text-muted uppercase ">Scalable Event Sequence</p>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    {canControl && (
                        <>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSmartNext}
                                disabled={!hasNext}
                                className={cn(
                                    "flex-1 lg:flex-none flex items-center justify-center gap-3 px-5 py-3 rounded-xl transition-all text-[10px] font-black uppercase  ",
                                    hasNext
                                        ? "bg-indigo-600 hover:bg-indigo-500 text-white "
                                        : "bg-background/50 text-muted border border-card-border cursor-not-allowed"
                                )}
                            >
                                <ArrowRight size={16} className={hasNext ? "animate-pulse" : ""} />
                                {hasActive ? 'Next Segment' : 'Engage'}
                            </motion.button>

                            <button
                                onClick={handleResetAll}
                                className="flex items-center gap-2 bg-background/50 hover:bg-card-bg text-[9px] font-black text-muted hover:text-orange-400 px-3 py-3 rounded-xl border border-card-border transition-all uppercase "
                                title="Reset all"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </>
                    )}

                    {canEdit && (
                        <button
                            onClick={handleCreate}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-foreground px-5 py-3 rounded-xl border border-card-border transition-all text-[10px] font-black uppercase "
                        >
                            <Plus size={16} />
                            Init Node
                        </button>
                    )}
                </div>
            </div>

            {/* Main Rundown Area - Integrated Table */}
            <div className="flex-1 relative min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
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
