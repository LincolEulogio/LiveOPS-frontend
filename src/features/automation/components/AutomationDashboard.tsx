'use client';

import { useAutomation } from '../hooks/useAutomation';
import { RuleList } from './RuleList';
import { ExecutionLogs } from './ExecutionLogs';
import { RuleEditor } from './RuleEditor';
import { HardwareManager } from '../../hardware/components/HardwareManager';
import { useState } from 'react';
import { Rule } from '../types/automation.types';
import { Zap, History, Plus, Ghost, Play, Cpu, ArrowRight, Settings2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

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
        deleteRule,
        triggerRule,
    } = useAutomation(productionId);

    const manualMacros = rules.filter(r =>
        r.isEnabled && r.triggers.some(t => t.eventType === 'manual.trigger')
    );

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | undefined>();
    const [activeTab, setActiveTab] = useState<'rules' | 'history' | 'hardware'>('rules');

    const handleCreate = () => {
        setEditingRule(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (rule: Rule) => {
        setEditingRule(rule);
        setIsEditorOpen(true);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Tactical Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card-bg/60 backdrop-blur-2xl border border-card-border p-6 sm:p-10 rounded-[2.5rem]  overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-700">
                    <Zap size={180} />
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 ">
                        <Zap className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-black text-foreground uppercase er leading-none mb-3">
                            Automation Engine
                        </h1>
                        <p className="text-muted text-[10px] sm:text-xs font-bold uppercase  max-w-md leading-loose">
                            Orchestrate complex sequences. Event-driven logic for high-performance production workflows.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    className="relative z-10 flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase  text-xs transition-all   group active:scale-95"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                    Initialize New Rule
                </button>
            </div>

            {/* Quick Macro Control Surface */}
            {manualMacros.length > 0 && (
                <div className="bg-card-bg/40 backdrop-blur-xl border border-card-border rounded-3xl p-3 sm:p-4 flex items-center gap-4 overflow-x-auto no-scrollbar  group">
                    <div className="flex items-center gap-3 pr-6 border-r border-card-border shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Zap size={14} fill="currentColor" />
                        </div>
                        <span className="text-[10px] font-black text-muted uppercase  whitespace-nowrap hidden sm:block">Tactical Macros</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {manualMacros.map(macro => (
                            <button
                                key={macro.id}
                                onClick={() => triggerRule(macro)}
                                className="flex items-center gap-3 bg-background/50 hover:bg-card-bg text-foreground px-5 py-2.5 rounded-xl text-[10px] font-black uppercase  transition-all border border-card-border whitespace-nowrap active:scale-95 group/macro relative overflow-hidden"
                            >
                                <Play size={10} className="text-indigo-400 group-hover/macro:scale-125 transition-transform" fill="currentColor" />
                                {macro.name}
                                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/macro:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Tabs Surface */}
            <div className="grid grid-cols-1 min-[1200px]:grid-cols-12 gap-8 items-start">
                <div className="min-[1200px]:col-span-8 min-[1440px]:col-span-9 space-y-8">
                    {/* Premium Tab Swiper */}
                    <div className="flex bg-card-bg/40 p-1.5 rounded-[1.5rem] border border-card-border w-full sm:w-fit overflow-x-auto no-scrollbar gap-1">
                        {[
                            { id: 'rules', label: 'Logic Config', icon: Cpu },
                            { id: 'history', label: 'Tactical Log', icon: History, mobileOnly: true },
                            { id: 'hardware', label: 'Peripheral Link', icon: Settings2 },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase  transition-all relative overflow-hidden",
                                    activeTab === tab.id
                                        ? "bg-indigo-600 text-white  "
                                        : "text-muted hover:text-foreground hover:bg-white/5",
                                    tab.mobileOnly && "lg:hidden"
                                )}
                            >
                                <tab.icon size={14} className={activeTab === tab.id ? "text-white" : "text-indigo-400"} />
                                <span className="whitespace-nowrap">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="automation-tab" className="absolute inset-0 bg-white/10" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'rules' && (
                                    <RuleList
                                        rules={rules}
                                        onEdit={handleEdit}
                                        onDelete={deleteRule}
                                        onToggle={(id, isEnabled) => toggleRule({ id, isEnabled })}
                                    />
                                )}

                                {activeTab === 'history' && (
                                    <div className="bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-[2.5rem] p-6 lg:p-10  h-[700px] flex flex-col">
                                        <ExecutionLogs logs={logs} isLoading={isLoading} />
                                    </div>
                                )}

                                {activeTab === 'hardware' && (
                                    <HardwareManager productionId={productionId} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Desktop-Only Sidebar History */}
                <div className="hidden min-[1200px]:block min-[1200px]:col-span-4 min-[1440px]:col-span-3 space-y-8">
                    <div className="bg-card-bg/80 backdrop-blur-2xl border border-card-border rounded-[2.5rem] p-8  relative overflow-hidden flex flex-col h-[800px]">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                            <History size={150} />
                        </div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="space-y-1">
                                <h2 className="text-[10px] font-black text-indigo-400 uppercase ">Operational</h2>
                                <p className="text-lg font-black text-foreground uppercase ">System Logs</p>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse "></div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 relative z-10">
                            <ExecutionLogs logs={logs} isLoading={isLoading} />
                        </div>

                        <div className="pt-6 border-t border-card-border/50 relative z-10">
                            <button className="w-full flex items-center justify-center gap-3 p-4 bg-background/50 hover:bg-indigo-600 rounded-2xl text-[10px] font-black text-muted hover:text-white uppercase  transition-all group active:scale-95 ">
                                Master Activity Grid <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
