'use client';

import { Rule } from '../types/automation.types';
import { cn } from '@/shared/utils/cn';
import { Edit2, Trash2, Zap, Play, ToggleLeft, ToggleRight, ArrowRight, Activity, Clock } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center py-24 text-muted bg-card-bg/20 rounded-[2.5rem] border-2 border-card-border border-dashed backdrop-blur-sm">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Zap size={32} strokeWidth={1.5} className="opacity-20" />
                </div>
                <h3 className="text-sm font-black text-muted-foreground uppercase  mb-2">Engine Standby</h3>
                <p className="text-[10px] font-bold text-muted uppercase  text-center px-8">No automation rules configured for this production instance.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
                {rules.map((rule) => (
                    <motion.div
                        layout
                        key={rule.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                            "group flex flex-col p-8 bg-card-bg/60 backdrop-blur-xl border border-card-border/60 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden shadow-xl hover:bg-white/[0.04] hover:-translate-y-1",
                            !rule.isEnabled && "opacity-60 grayscale-[0.8] brightness-75"
                        )}
                    >
                        {/* Status Accent Bar */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500",
                            rule.isEnabled ? "bg-indigo-600 shadow-[2px_0_15px_rgba(99,102,241,0.4)]" : "bg-card-border"
                        )} />

                        {/* Interactive Toggle & Header */}
                        <div className="flex items-start justify-between gap-6 mb-6 pl-2">
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-foreground group-hover:text-indigo-400 transition-colors mb-1 truncate uppercase ">
                                    {rule.name}
                                </h3>
                                <p className="text-[10px] font-bold text-muted uppercase  line-clamp-1">{rule.description || 'System automation rule'}</p>
                            </div>
                            <button
                                onClick={() => onToggle(rule.id, !rule.isEnabled)}
                                className={cn(
                                    "p-1.5 rounded-xl transition-all active:scale-90",
                                    rule.isEnabled ? "text-indigo-400 bg-indigo-500/10" : "text-muted bg-card-border/30 hover:bg-card-border"
                                )}
                            >
                                {rule.isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                            </button>
                        </div>

                        {/* Tactical Logic Visualization */}
                        <div className="bg-background/40 backdrop-blur-md rounded-2xl p-4 border border-card-border/50 space-y-4 mb-6 relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="space-y-1 flex-1">
                                    <span className="text-[8px] font-black text-muted uppercase ">Input Stimulus</span>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-black text-amber-500 truncate shadow-inner">
                                        <Activity size={10} />
                                        {rule.triggers[0]?.eventType.replace('.', ' ').toUpperCase() || 'MANUAL'}
                                    </div>
                                </div>

                                <div className="pt-4 shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-card-border/30 flex items-center justify-center">
                                        <ArrowRight size={14} className="text-muted" />
                                    </div>
                                </div>

                                <div className="space-y-1 flex-1">
                                    <span className="text-[8px] font-black text-muted uppercase ">Sequence Output</span>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 truncate shadow-inner">
                                        <Zap size={10} />
                                        {rule.actions.length} ACTIONS
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {rule.actions.slice(0, 3).map((action, idx) => (
                                    <div key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black text-muted uppercase ">
                                        {action.actionType.split('.').pop()}
                                    </div>
                                ))}
                                {rule.actions.length > 3 && (
                                    <div className="px-2 py-0.5 bg-indigo-600/10 text-indigo-400 rounded-lg text-[8px] font-black uppercase ">
                                        +{rule.actions.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Operational Controls */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-card-border/30 pl-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-muted uppercase ">
                                    <Clock size={10} />
                                    {new Date(rule.updatedAt).toLocaleDateString()}
                                </div>
                                {rule.isEnabled && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase ">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                        ARMED
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onEdit(rule)}
                                    className="p-2.5 bg-background border border-card-border text-muted hover:text-indigo-400 hover:border-indigo-500/30 rounded-xl transition-all active:scale-90 shadow-sm"
                                    title="Protocol Edit"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => onDelete(rule.id)}
                                    className="p-2.5 bg-background border border-card-border text-muted hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all active:scale-90 shadow-sm"
                                    title="Decommission"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
