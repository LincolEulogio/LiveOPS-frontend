'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  RotateCcw,
  Clock,
  Video,
  AlertTriangle,
  Tag,
  Edit2,
  Trash2,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { TimelineBlock, TimelineStatus } from '@/features/timeline/types/timeline.types';
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
  canEdit = true,
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
    .filter((b) => b.status === TimelineStatus.PENDING)
    .reduce((sum, b) => sum + (b.durationMs || 0), 0);

  return (
    <div className="w-full relative overflow-x-auto no-scrollbar touch-pan-x">
      <table className="w-full text-left border-separate border-spacing-0 min-w-[900px] lg:min-w-0">
        <thead>
          <tr className="bg-white/5 dark:bg-black/20">
            <th className="pl-6 sm:pl-10 pr-4 py-4 sm:py-6 text-[10px] sm:text-[11px] font-black text-foreground dark:text-muted-foreground uppercase tracking-[0.2em] border-b border-card-border/50 shrink-0">
              #
            </th>
            <th className="px-4 sm:px-6 py-4 sm:py-6 text-[10px] sm:text-[11px] font-black text-foreground dark:text-muted-foreground uppercase tracking-[0.2em] border-b border-card-border/50">
              Segment / Identity
            </th>
            <th className="px-4 sm:px-6 py-4 sm:py-6 text-[10px] sm:text-[11px] font-black text-foreground dark:text-muted-foreground uppercase tracking-[0.2em] border-b border-card-border/50">
              Source Node
            </th>
            <th className="px-4 sm:px-6 py-4 sm:py-6 text-[10px] sm:text-[11px] font-black text-foreground dark:text-muted-foreground uppercase tracking-[0.2em] border-b border-card-border/50 text-center">
              Duration
            </th>
            <th className="px-4 sm:px-6 py-4 sm:py-6 text-[10px] sm:text-[11px] font-black text-foreground dark:text-muted-foreground uppercase tracking-[0.2em] border-b border-card-border/50 text-center">
              Active Timer
            </th>
            <th className="pl-4 sm:pl-6 pr-6 sm:pr-10 py-4 sm:py-6 text-right border-b border-card-border/50">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-indigo-600/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-indigo-500/20 shadow-sm">
                <Activity className="text-indigo-600 dark:text-indigo-400 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">
                  Left:
                </span>
                <span className="text-[11px] sm:text-[13px] font-mono font-black text-indigo-600 dark:text-indigo-400 leading-none">
                  {formatDuration(totalRemainingMs)}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="">
          <AnimatePresence mode="popLayout">
            {blocks.map((block, index) => {
              const effective = calculateEffective(block);
              const isOvertime =
                block.status === TimelineStatus.ACTIVE &&
                block.durationMs &&
                block.durationMs > 0 &&
                effective > block.durationMs;

              const inProgram = isProgram(block.source);
              const inPreview = isPreview(block.source);

              return (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={block.id}
                  className={cn(
                    'group transition-all duration-300 relative border-b border-card-border/20 last:border-0',
                    block.status === TimelineStatus.ACTIVE
                      ? 'bg-indigo-600/8 dark:bg-indigo-600/4'
                      : 'hover:bg-card-bg/50',
                    inProgram && 'bg-red-600/8 dark:bg-red-600/4',
                    inPreview && 'bg-emerald-600/8 dark:bg-emerald-600/4'
                  )}
                >
                  <td className="pl-6 sm:pl-10 pr-4 sm:pr-6 py-5 sm:py-7 text-[11px] sm:text-[12px] font-black font-mono text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity">
                    {/* Tally State Markers */}
                    {inProgram && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 sm:w-1.5 bg-red-600 rounded-r-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] z-10" />
                    )}
                    {inPreview && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 sm:w-1.5 bg-emerald-600 rounded-r-lg shadow-[0_0_15px_rgba(5,150,105,0.5)] z-10" />
                    )}
                    {block.status === TimelineStatus.ACTIVE && !inProgram && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 sm:w-1.5 bg-indigo-600 rounded-r-lg shadow-[0_0_15px_rgba(79,70,229,0.5)] z-10" />
                    )}
                    {(index + 1).toString().padStart(2, '0')}
                  </td>

                  <td className="px-4 sm:px-6 py-5 sm:py-7">
                    <div className="flex flex-col gap-1 min-w-[180px] sm:min-w-[250px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-black text-[13px] sm:text-[15px] uppercase tracking-tight transition-colors',
                            block.status === TimelineStatus.ACTIVE
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-foreground'
                          )}
                        >
                          {block.title}
                        </span>
                        {block.status === TimelineStatus.ACTIVE && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                        )}
                      </div>
                      {block.description && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider line-clamp-1 opacity-50 group-hover:opacity-80 transition-opacity italic">
                          // {block.description}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-5 sm:py-7">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={cn(
                          'w-2 h-2 sm:w-3 sm:h-3 rounded-full border sm:border-2 ',
                          inProgram
                            ? 'bg-red-500 border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
                            : inPreview
                              ? 'bg-emerald-500 border-emerald-400/50'
                              : 'bg-background border-card-border'
                        )}
                      />
                      <div className="px-2.5 sm:px-4 py-1 sm:py-1.5 bg-background/50 border border-card-border/50 rounded-lg sm:rounded-xl group-hover:border-card-border transition-colors">
                        <span
                          className={cn(
                            'text-[9px] sm:text-[10px] font-black uppercase tracking-widest',
                            inProgram
                              ? 'text-red-600 dark:text-red-400'
                              : inPreview
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-muted-foreground/60'
                          )}
                        >
                          {block.source || 'EXTERNAL'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-5 sm:py-7 text-center">
                    <span className="text-[11px] sm:text-[12px] font-black font-mono text-foreground/70 dark:text-muted-foreground uppercase ">
                      {block.durationMs && block.durationMs > 0
                        ? formatDuration(block.durationMs)
                        : '— M —'}
                    </span>
                  </td>

                  <td className="px-4 sm:px-6 py-5 sm:py-7 text-center">
                    <div
                      className={cn(
                        'inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-mono text-[11px] sm:text-[12px] font-black border transition-all shadow-sm',
                        block.status === TimelineStatus.ACTIVE
                          ? isOvertime
                            ? 'bg-red-600/20 border-red-500/40 text-red-600 dark:text-red-400 animate-pulse '
                            : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 '
                          : block.status === TimelineStatus.COMPLETED
                            ? 'bg-background/40 border-transparent text-muted-foreground/30 grayscale'
                            : 'bg-background/20 border-card-border text-muted-foreground/50'
                      )}
                    >
                      <Clock
                        size={12}
                        className={
                          block.status === TimelineStatus.ACTIVE ? 'animate-spin-slow' : ''
                        }
                      />
                      {formatDuration(effective)}
                      {isOvertime && (
                        <AlertTriangle size={12} className="text-red-500 animate-bounce" />
                      )}
                    </div>
                  </td>

                  <td className="pl-4 sm:pl-6 pr-6 sm:pr-10 py-5 sm:py-7 text-right">
                    <div className="flex items-center justify-end gap-2 sm:gap-3 translate-x-2 sm:translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      {block.status === TimelineStatus.PENDING && canControl && (
                        <button
                          onClick={() => onStart(block.id)}
                          className="p-2.5 sm:p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg sm:rounded-xl transition-all shadow-lg active:scale-90 "
                          title="Deploy"
                        >
                          <Play size={14} fill="currentColor" />
                        </button>
                      )}
                      {block.status === TimelineStatus.ACTIVE && canControl && (
                        <button
                          onClick={() => onComplete(block.id)}
                          className="px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg sm:rounded-xl transition-all active:scale-95 shadow-lg flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
                          title="Secure"
                        >
                          <CheckCircle2 size={14} />
                          Finalize
                        </button>
                      )}
                      {block.status !== TimelineStatus.PENDING && canControl && (
                        <button
                          onClick={() => onReset(block.id)}
                          className="p-2.5 sm:p-3.5 bg-background border border-card-border text-muted-foreground hover:text-orange-500 hover:border-orange-500/50 rounded-lg sm:rounded-xl transition-all active:scale-90 shadow-sm"
                          title="Abort"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}

                      <div className="w-px h-6 sm:h-8 bg-card-border/50 mx-0.5 sm:mx-1" />

                      {canEdit && (
                        <>
                          <button
                            onClick={() => onEdit(block)}
                            className="p-2.5 sm:p-3.5 bg-card-bg border border-card-border text-muted-foreground hover:text-foreground hover:border-foreground rounded-lg sm:rounded-xl transition-all active:scale-90"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(block.id)}
                            className="p-2.5 sm:p-3.5 bg-card-bg border border-card-border text-muted-foreground hover:text-red-500 hover:border-red-500/50 rounded-lg sm:rounded-xl transition-all active:scale-90"
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
        <div className="py-40 flex flex-col items-center justify-center text-muted-foreground/30 gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/2 pointer-events-none" />
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-24 h-24 bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-3xl flex items-center justify-center shadow-2xl">
              <Tag
                size={48}
                strokeWidth={1}
                className="text-muted-foreground opacity-40 group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="text-center relative z-10 max-w-sm">
            <h3 className="text-lg font-black uppercase text-foreground/60 tracking-widest mb-2">
              Protocol Queue Empty
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/40 leading-relaxed px-6">
              Awaiting initialization. Start adding segments to your rundown to begin the tactical
              broadcast sequence.
            </p>
          </div>
          <button
            className="px-8 py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            onClick={() => {
              const addBtn = document.querySelector(
                'button:contains("Add Segment")'
              ) as HTMLButtonElement;
              if (addBtn) addBtn.click();
            }}
          >
            Initialize First Node
          </button>
        </div>
      )}
    </div>
  );
};
