'use client';

import { Rule } from '../types/automation.types';
import { cn } from '@/shared/utils/cn';
import { Edit2, Trash2, Zap, Play, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';

interface Props {
    rules: Rule[];
    onEdit: (rule: Rule) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, isEnabled: boolean) => void;
}

export const RuleList = ({ rules, onEdit, onDelete, onToggle }: Props) => {
    if (rules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted bg-card-bg/20 rounded-2xl border border-card-border border-dashed">
                <Zap size={48} strokeWidth={1} className="mb-4 opacity-10" />
                <h3 className="text-sm font-bold text-muted uppercase tracking-widest">No Automation Rules</h3>
                <p className="text-xs text-muted mt-2">Automate your workflow by creating rules.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
                <div
                    key={rule.id}
                    className={cn(
                        "group flex flex-col p-5 bg-card-bg border border-card-border rounded-2xl transition-all relative overflow-hidden",
                        !rule.isEnabled && "opacity-60 grayscale-[0.5]"
                    )}
                >
                    {/* Status Bar */}
                    <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                        rule.isEnabled ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-card-border"
                    )}></div>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4 pl-2">
                        <div>
                            <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors mb-1">
                                {rule.name}
                            </h3>
                            <p className="text-xs text-muted line-clamp-1">{rule.description || 'No description'}</p>
                        </div>
                        <button
                            onClick={() => onToggle(rule.id, !rule.isEnabled)}
                            className={cn(
                                "p-1 rounded-lg transition-all",
                                rule.isEnabled ? "text-indigo-400 hover:bg-indigo-500/10" : "text-muted hover:bg-card-border"
                            )}
                        >
                            {rule.isEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        </button>
                    </div>

                    {/* Logic Preview */}
                    <div className="flex items-center gap-3 mb-6 bg-background/50 p-2.5 rounded-xl border border-card-border/50">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">Trigger</span>
                            <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-bold text-amber-500 truncate max-w-[80px]">
                                {rule.triggers[0]?.eventType.split('.').pop() || 'None'}
                            </div>
                        </div>

                        <ArrowRight size={14} className="text-muted/50 shrink-0" />

                        <div className="flex flex-col items-center gap-1 flex-1 overflow-hidden">
                            <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">Actions ({rule.actions.length})</span>
                            <div className="flex gap-1 overflow-hidden w-full">
                                {rule.actions.slice(0, 2).map((action, idx) => (
                                    <div key={idx} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-bold text-indigo-400 truncate flex-1">
                                        {action.actionType.split('.').pop()}
                                    </div>
                                ))}
                                {rule.actions.length > 2 && (
                                    <div className="px-1 py-1 bg-card-border border border-card-border/50 rounded text-[8px] font-bold text-muted shrink-0">
                                        +{rule.actions.length - 2}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-muted font-mono">
                            MODIFIED {new Date(rule.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onEdit(rule)}
                                className="p-2 text-muted hover:text-foreground hover:bg-card-border rounded-lg transition-all"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(rule.id)}
                                className="p-2 text-muted hover:text-red-400 hover:bg-card-border rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
