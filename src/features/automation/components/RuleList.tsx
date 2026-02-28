'use client';

import { Rule } from '@/features/automation/types/automation.types';
import { cn } from '@/shared/utils/cn';
import {
  Edit2,
  Trash2,
  Zap,
  Play,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Activity,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  rules: Rule[];
  onEdit: (rule: Rule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isEnabled: boolean) => void;
}

export const RuleList = ({ rules, onEdit, onDelete, onToggle }: Props) => {
  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-card-bg/40 backdrop-blur-3xl rounded-[3rem] border-2 border-card-border border-dashed relative overflow-hidden group/empty transition-all hover:bg-card-bg/60">
        <div className="absolute inset-0 bg-indigo-500/2 pointer-events-none" />
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-3xl flex items-center justify-center shadow-2xl group-hover/empty:scale-110 transition-transform duration-700">
            <Zap size={48} strokeWidth={1} className="text-indigo-500/50" />
          </div>
        </div>
        <div className="relative z-10 max-w-sm">
          <h3 className="text-xl font-black uppercase text-foreground/80 tracking-[.25em] mb-3">
            Engine Standby
          </h3>
          <p className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/40 leading-relaxed">
            No automation rules configured for this production instance. Initialize a new protocol
            to begin orchestrating logic sequences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
      <AnimatePresence mode="popLayout">
        {rules.map((rule) => (
          <motion.div
            layout
            key={rule.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              'group flex flex-col p-6 sm:p-10 bg-card-bg/40 backdrop-blur-3xl border border-card-border rounded-3xl sm:rounded-4xl transition-all duration-700 relative overflow-hidden hover:bg-card-bg/70 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2',
              !rule.isEnabled && 'opacity-60 grayscale-[0.5] brightness-90 bg-card-bg/20'
            )}
          >
            {/* Visual Scanline Effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

            {/* Status Accent Bar */}
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 transition-all duration-700',
                rule.isEnabled
                  ? 'bg-indigo-600 shadow-[2px_0_10px_rgba(79,70,229,0.5)]'
                  : 'bg-card-border/50'
              )}
            />

            {/* Header Section */}
            <div className="flex items-start justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pl-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      rule.isEnabled ? 'bg-indigo-500 animate-pulse' : 'bg-muted-foreground/30'
                    )}
                  />
                  <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Protocol Node
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 sm:mb-2 truncate uppercase italic tracking-tighter">
                  {rule.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground/50 uppercase tracking-tight line-clamp-1">
                  {rule.description || 'System automation rule'}
                </p>
              </div>
              <button
                onClick={() => onToggle(rule.id, !rule.isEnabled)}
                className={cn(
                  'p-1 sm:p-1.5 rounded-xl sm:rounded-2xl transition-all active:scale-95 shadow-inner shrink-0',
                  rule.isEnabled
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-600/10 border border-indigo-500/20'
                    : 'text-muted-foreground/40 bg-card-border/20 border border-card-border/30 hover:bg-card-border/40'
                )}
              >
                {rule.isEnabled ? (
                  <ToggleRight strokeWidth={1.5} className="w-8 h-8 sm:w-10 sm:h-10" />
                ) : (
                  <ToggleLeft strokeWidth={1.5} className="w-8 h-8 sm:w-10 sm:h-10" />
                )}
              </button>
            </div>

            {/* Tactical Logic Visualization */}
            <div className="bg-background/40 dark:bg-black/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-card-border/50 space-y-4 sm:space-y-6 mb-6 sm:mb-8 relative overflow-hidden group/logic shadow-inner">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/logic:opacity-[0.08] transition-opacity">
                <Zap className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 relative z-10">
                <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                  <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Input Stimulus
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black text-amber-600 dark:text-amber-500 truncate shadow-sm">
                    <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
                    {rule.triggers[0]?.eventType.replace('.', ' ').toUpperCase() || 'MANUAL'}
                  </div>
                </div>

                <div className="hidden sm:flex pt-5 shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card-border/30 dark:bg-white/5 border border-card-border/50 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
                    <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                  <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Sequence Out
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 truncate shadow-sm">
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {rule.actions.length} {rule.actions.length === 1 ? 'ACTION' : 'ACTIONS'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                {rule.actions.slice(0, 3).map((action, idx) => (
                  <div
                    key={idx}
                    className="px-2 sm:px-3 py-1 bg-white/5 dark:bg-white/3 border border-card-border/50 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    {action.actionType.split('.').pop()}
                  </div>
                ))}
                {rule.actions.length > 3 && (
                  <div className="px-2 sm:px-3 py-1 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                    +{rule.actions.length - 3} MORE
                  </div>
                )}
              </div>
            </div>

            {/* Footer Operational Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-6 border-t border-card-border/30 pl-2 gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                  <Clock size={12} />
                  {new Date(rule.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                {rule.isEnabled && (
                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    LOGIC ARMED
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onEdit(rule)}
                  className="p-3 bg-background/40 hover:bg-indigo-600 border border-card-border text-muted-foreground hover:text-white rounded-2xl transition-all active:scale-90 shadow-sm"
                  title="Protocol reconfiguration"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(rule.id)}
                  className="p-3 bg-background/40 hover:bg-red-600 border border-card-border text-muted-foreground hover:text-white rounded-2xl transition-all active:scale-90 shadow-sm"
                  title="Decommission protocol"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
