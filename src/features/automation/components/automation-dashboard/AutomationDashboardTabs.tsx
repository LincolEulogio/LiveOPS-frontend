import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, History, Settings2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { RuleList } from '../RuleList';
import { ExecutionLogs } from '../ExecutionLogs';
import { HardwareManager } from '../../../hardware/components/HardwareManager';
import { Rule } from '../../types/automation.types';

interface AutomationDashboardTabsProps {
    activeTab: 'rules' | 'history' | 'hardware';
    setActiveTab: (tab: 'rules' | 'history' | 'hardware') => void;
    rules: Rule[];
    logs: any[];
    isLoading: boolean;
    productionId: string;
    onEditRule: (rule: Rule) => void;
    onDeleteRule: (id: string) => void;
    onToggleRule: (id: string, isEnabled: boolean) => void;
}

export const AutomationDashboardTabs: React.FC<AutomationDashboardTabsProps> = ({
    activeTab,
    setActiveTab,
    rules,
    logs,
    isLoading,
    productionId,
    onEditRule,
    onDeleteRule,
    onToggleRule
}) => {
    const tabs = [
        { id: 'rules', label: 'Logic Config', icon: Cpu },
        { id: 'history', label: 'Tactical Log', icon: History, mobileOnly: true },
        { id: 'hardware', label: 'Peripheral Link', icon: Settings2 },
    ];

    return (
        <div className="space-y-8">
            <div className="flex bg-card-bg/40 p-1.5 rounded-[1.5rem] border border-card-border w-full sm:w-fit overflow-x-auto no-scrollbar gap-1">
                {tabs.map((tab) => (
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
                                onEdit={onEditRule}
                                onDelete={onDeleteRule}
                                onToggle={onToggleRule}
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
    );
};
