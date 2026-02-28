'use client';

import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import {
  Plus,
  Layout,
  RotateCcw,
  ArrowRight,
  Play,
  CheckCircle2,
  Zap,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/api.client';
import { toast } from 'sonner';
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
    deleteBlock,
  } = useTimeline(productionId);

  const { data: production, isLoading: isProdLoading } = useProduction(productionId);
  const { user } = useAuthStore();

  const [isCRUDOpen, setIsCRUDOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimelineBlock | undefined>();
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAiAdvice = async () => {
    if (!productionId || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const data = await apiClient.get<{ advice: string }>(
        `/productions/${productionId}/timeline/ai-advice`
      );
      setAiAdvice(data.advice);
    } catch (e) {
      console.error('Failed to fetch AI timing advice', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (blocks.length > 0 && !aiAdvice) {
      fetchAiAdvice();
    }
  }, [productionId, blocks.length]);

  // RBAC: Find current user's role in this production
  const currentUserProdRelation = production?.users?.find((u) => u.userId === user?.id);
  const userRole = currentUserProdRelation?.role || user?.globalRole;

  const isAdmin =
    userRole?.name === 'ADMIN' || userRole?.name === 'DIRECTOR' || userRole?.name === 'SUPERADMIN';
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
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#1a1a1a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0f172a',
      color: '#f8fafc',
      customClass: {
        popup: 'rounded-[1.5rem] border border-white/10  backdrop-blur-xl',
      },
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
      color: '#fff',
    });
  };

  const handleSmartNext = async () => {
    const activeBlock = blocks.find((b) => b.status === 'ACTIVE');
    const nextBlock = blocks.find((b) => b.status === 'PENDING');

    if (!nextBlock) {
      MySwal.fire({
        title: 'Fin de Escaleta',
        text: 'No hay más bloques pendientes.',
        icon: 'info',
        background: '#0f172a',
        color: '#f8fafc',
        customClass: { popup: 'rounded-[1.5rem]' },
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
      text: 'Todos los bloques volverán a estado Pendiente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#1a1a1a',
      confirmButtonText: 'Sí, resetear todo',
      background: '#0f172a',
      color: '#f8fafc',
      customClass: { popup: 'rounded-[1.5rem]' },
    });

    if (result.isConfirmed) {
      try {
        const promises = blocks.filter((b) => b.status !== 'PENDING').map((b) => resetBlock(b.id));
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
      const block = blocks.find((b) => b.id === id);
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

  const hasActive = blocks.some((b) => b.status === 'ACTIVE');
  const hasNext = blocks.some((b) => b.status === 'PENDING');

  return (
    <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-4xl sm:rounded-[2.5rem] overflow-hidden  flex flex-col group/timeline h-full shadow-lg">
      {/* Visual Scanline Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover/timeline:opacity-100 transition-all duration-700" />

      {/* Premium Tactical Header */}
      <div className="p-5 sm:p-8 lg:p-10 border-b border-card-border/50 bg-white/5 dark:bg-black/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover/timeline:scale-110 group-hover/timeline:opacity-10 transition-all duration-1000">
          <Layout size={120} />
        </div>

        <div className="relative z-10 flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0">
            <Layout className="text-indigo-600 dark:text-indigo-400 w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={10} className="text-indigo-500 animate-pulse" />
              <h2 className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">
                Operational Protocol
              </h2>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-foreground uppercase italic leading-none tracking-tight truncate">
              Live <span className="text-indigo-600">Rundown</span>
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 mt-1.5 sm:mt-2">
              <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase opacity-60">
                Event Sequence
              </p>
              <div className="w-1 h-1 rounded-full bg-card-border" />
              <button
                onClick={fetchAiAdvice}
                disabled={isAiLoading}
                className={cn(
                  'flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors uppercase tracking-widest',
                  isAiLoading && 'animate-pulse'
                )}
              >
                <Sparkles size={10} className={cn(isAiLoading && 'animate-spin')} />
                AI Insights
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 w-full lg:w-auto">
          {canControl && (
            <div className="flex items-center gap-2 flex-1 lg:flex-none">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSmartNext}
                disabled={!hasNext}
                className={cn(
                  'flex-1 lg:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl transition-all text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-lg ',
                  hasNext
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30'
                    : 'bg-background/50 text-muted border border-card-border cursor-not-allowed opacity-50'
                )}
              >
                <ArrowRight size={16} className={hasNext ? 'animate-pulse' : ''} />
                <span className="whitespace-nowrap">{hasActive ? 'Deploy Next' : 'Engage'}</span>
              </motion.button>

              <button
                onClick={handleResetAll}
                className="p-3.5 sm:p-4 bg-card-bg/80 hover:bg-orange-500/10 text-muted hover:text-orange-500 rounded-xl border border-card-border transition-all active:scale-95"
                title="Reset full sequence"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          )}

          {canEdit && (
            <button
              onClick={handleCreate}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 sm:gap-3 bg-foreground text-background dark:bg-white dark:text-black hover:opacity-90 px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl transition-all text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95"
            >
              <Plus size={16} />
              <span className="whitespace-nowrap">Add Segment</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Advice Banner */}
      <AnimatePresence>
        {aiAdvice && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-600/10 border-b border-indigo-500/20 px-8 py-3 flex items-center justify-between gap-4 overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle size={14} className="text-indigo-400 shrink-0" />
              <p className="text-[10px] font-bold text-indigo-300 truncate uppercase">
                <span className="font-black mr-2 text-indigo-400">[LIVIA]:</span>
                {aiAdvice}
              </p>
            </div>
            <button
              onClick={() => setAiAdvice('')}
              className="text-[9px] font-black text-muted hover:text-indigo-400 uppercase tracking-widest shrink-0"
            >
              Acknowledge
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Rundown Area - Integrated Table */}
      <div className="flex-1 relative min-h-[400px]">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
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
