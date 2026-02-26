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
        <div className="bg-card-bg/40 backdrop-blur-xl rounded-[2rem] border border-card-border/60 p-2 flex flex-col min-[1280px]:flex-row items-center gap-4">
            {/* 1. Terminal Tabs */}
            <div className="flex bg-background/40 p-1 rounded-[1.4rem] border border-card-border/40 gap-1 min-w-fit">
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
                            "flex items-center justify-center gap-3 px-6 py-2.5 rounded-[1.1rem] text-[10px] font-black uppercase transition-all relative overflow-hidden",
                            activeTab === tab.id
                                ? "bg-indigo-600 text-white"
                                : "text-muted hover:text-foreground hover:bg-white/5"
                        )}
                    >
                        <tab.icon size={14} className={activeTab === tab.id ? "text-white" : "text-indigo-400"} />
                        <span className="whitespace-nowrap">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div layoutId="dash-tab-glow" className="absolute inset-0 bg-white/10" />
                        )}
                    </button>
                ))}
            </div>

            {/* divider */}
            <div className="hidden min-[1280px]:block h-8 w-[1px] bg-card-border/50 mx-2" />

            {/* 2. System Status & Search */}
            <div className="flex-1 flex items-center justify-between w-full">

                {/* 3. Node Selector */}
                <div className="flex items-center gap-4">
                    <ProductionSelector />
                </div>
            </div>
        </div>
    );
};
