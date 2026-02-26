import React from 'react';
import { Radio, Zap, Box, History, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { ProductionSelector } from '@/features/productions/components/ProductionSelector';

interface DashboardTabsProps {
    activeTab: 'intercom' | 'automation' | 'multicast' | 'logs' | 'templates';
    setActiveTab: (tab: 'intercom' | 'automation' | 'multicast' | 'logs' | 'templates') => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="bg-white/90 dark:bg-card-bg/40 backdrop-blur-xl rounded-[2rem] border border-black/5 dark:border-card-border/60 p-2 flex flex-col min-[1280px]:flex-row items-center gap-4 transition-all">
            {/* 1. Terminal Tabs - Scrollable on Mobile */}
            <div className="w-full min-[1280px]:w-auto flex bg-gray-50 dark:bg-background/40 p-1.5 rounded-[1.5rem] border border-black/5 dark:border-card-border/40 gap-1 overflow-x-auto no-scrollbar">
                {[
                    { label: 'COMS', id: 'intercom', icon: Radio },
                    { label: 'AUTO', id: 'automation', icon: Zap },
                    { label: 'CAST', id: 'multicast', icon: Box },
                    { label: 'LOGS', id: 'logs', icon: History },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex-1 min-[1280px]:flex-none min-w-[70px] sm:min-w-[100px] flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-[1.2rem] text-[9px] sm:text-[10px] font-black uppercase transition-all relative overflow-hidden",
                            activeTab === tab.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                : "text-muted-foreground/60 dark:text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                    >
                        <tab.icon size={14} className={activeTab === tab.id ? "text-white" : "text-indigo-600 dark:text-indigo-400"} />
                        <span className="whitespace-nowrap tracking-widest">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div layoutId="dash-tab-glow" className="absolute inset-0 bg-white/10" />
                        )}
                    </button>
                ))}
            </div>

            {/* divider */}
            <div className="hidden min-[1280px]:block h-8 w-[1px] bg-black/5 dark:bg-card-border/50 mx-2" />

            {/* 2. System Status & Search */}
            <div className="flex-1 flex items-center justify-between w-full px-4 min-[1280px]:px-0">
                {/* 3. Node Selector */}
                <div className="flex items-center gap-4 w-full justify-center min-[1280px]:justify-start">
                    <ProductionSelector />
                </div>
            </div>
        </div>
    );
};
