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
        <div className="flex flex-col min-[1280px]:grid grid-cols-12 gap-6 items-start min-[1280px]:items-center">
            <div className="flex bg-card-bg/40 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-card-border w-full  min-[1280px]:col-span-8 overflow-x-auto no-scrollbar gap-1 ">
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
                            "flex-1 xl:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase  transition-all relative overflow-hidden",
                            activeTab === tab.id
                                ? "bg-indigo-600 text-white  "
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

            <div className="hidden xl:block h-12 w-[1px] bg-card-border/50" />

            <div className="flex-1 w-full xl:w-auto min-[1280px]:col-span-3 flex items-center justify-between xl:justify-start gap-6">
                <ProductionSelector />

                <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl group cursor-default">
                    <Search size={14} className="text-muted group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[10px] font-black text-muted uppercase ">Global Capture: Cmd+K</span>
                </div>
            </div>
        </div>
    );
};
