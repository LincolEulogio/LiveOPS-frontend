import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, History, Settings2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { RuleList } from '@/features/automation/components/RuleList';
import { ExecutionLogs } from '@/features/automation/components/ExecutionLogs';
import { HardwareManager } from '@/features/hardware/components/HardwareManager';
import { Rule } from '@/features/automation/types/automation.types';

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
  onToggleRule,
}) => {
  const tabs = [
    { id: 'rules', label: 'Logic Config', icon: Cpu },
    { id: 'history', label: 'Tactical Log', icon: History, mobileOnly: true },
    { id: 'hardware', label: 'Peripheral Link', icon: Settings2 },
  ];

  return (
    <div className="space-y-10">
      <div className="flex bg-card-bg/40 backdrop-blur-md p-2 rounded-4xl border border-card-border w-full sm:w-fit overflow-x-auto no-scrollbar gap-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all relative overflow-hidden group/tab',
              activeTab === tab.id
                ? 'text-white shadow-xl'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
              tab.mobileOnly && 'lg:hidden'
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="automation-tab"
                className="absolute inset-0 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon
              size={14}
              className={cn(
                'relative z-10 transition-transform duration-500 group-hover/tab:scale-110',
                activeTab === tab.id ? 'text-white' : 'text-indigo-500'
              )}
            />
            <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-white/10 z-10 pointer-events-none" />
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

            {activeTab === 'hardware' && <HardwareManager productionId={productionId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
