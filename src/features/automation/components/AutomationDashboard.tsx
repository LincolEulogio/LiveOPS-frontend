'use client';

import { useAutomation } from '../hooks/useAutomation';
import { RuleList } from './RuleList';
import { ExecutionLogs } from './ExecutionLogs';
import { RuleEditor } from './RuleEditor';
import { useState } from 'react';
import { Rule } from '../types/automation.types';
import { Zap, History, Plus, Ghost } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
}

export const AutomationDashboard = ({ productionId }: Props) => {
    const {
        rules,
        logs,
        isLoading,
        createRule,
        updateRule,
        toggleRule,
        deleteRule
    } = useAutomation(productionId);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | undefined>();
    const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules');

    const handleCreate = () => {
        setEditingRule(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (rule: Rule) => {
        setEditingRule(rule);
        setIsEditorOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Zap className="text-indigo-400" size={28} />
                        </div>
                        Automation Engine
                    </h1>
                    <p className="text-stone-400 text-sm mt-2 max-w-lg leading-relaxed">
                        Trigger complex sequences based on production events. Sync logic across all connected clients.
                    </p>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Create Rule
                </button>
            </div>

            {/* Main Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-6 border-b border-stone-800 pb-px">
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={cn(
                                "pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative",
                                activeTab === 'rules' ? "text-indigo-400" : "text-stone-500 hover:text-stone-300"
                            )}
                        >
                            Configured Rules
                            {activeTab === 'rules' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={cn(
                                "pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative lg:hidden",
                                activeTab === 'history' ? "text-indigo-400" : "text-stone-500 hover:text-stone-300"
                            )}
                        >
                            Activity History
                            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>}
                        </button>
                    </div>

                    <div className={cn("space-y-6", activeTab !== 'rules' && "hidden lg:block")}>
                        <RuleList
                            rules={rules}
                            onEdit={handleEdit}
                            onDelete={deleteRule}
                            onToggle={(id, isEnabled) => toggleRule({ id, isEnabled })}
                        />
                    </div>
                </div>

                {/* Floating Sidebar for Logs */}
                <div className={cn("space-y-6", activeTab !== 'history' && "hidden lg:block")}>
                    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden h-[600px] flex flex-col">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                            <History size={120} />
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-bold text-stone-200 uppercase tracking-widest flex items-center gap-2">
                                <History size={14} className="text-indigo-400" />
                                Live Activity
                            </h2>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
                            <ExecutionLogs logs={logs} isLoading={isLoading} />
                        </div>

                        <div className="mt-4 pt-4 border-t border-stone-800 flex justify-center">
                            <button className="text-[10px] font-bold text-stone-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                                View Full Logs <ArrowRight size={10} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <RuleEditor
                productionId={productionId}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={async (dto) => {
                    if (editingRule) {
                        await updateRule({ id: editingRule.id, dto });
                    } else {
                        await createRule(dto);
                    }
                    setIsEditorOpen(false);
                }}
                editingRule={editingRule}
            />
        </div>
    );
};

const ArrowRight = ({ size, className }: { size: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);
