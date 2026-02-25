'use client';

import React from 'react';
import { useProductions } from '../hooks/useProductions';
import { useAppStore } from '@/shared/store/app.store';
import { ChevronDown, Server, Loader2, Check, Zap, Globe, Shield } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';

export const ProductionSelector = () => {
    const { activeProductionId, setActiveProductionId } = useAppStore();
    const { data: productionsResult, isLoading } = useProductions({ limit: 100 });
    const productions = productionsResult?.data || [];

    const activeProduction = productions.find(p => p.id === activeProductionId);

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl animate-pulse">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Matrix Sync...</span>
            </div>
        );
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3.5 bg-background shadow-inner hover:bg-white/[0.02] border border-card-border/60 rounded-[1.25rem] transition-all group min-w-[200px] sm:min-w-[240px] flex-1 sm:flex-initial justify-between relative overflow-hidden active:scale-95">
                    {/* Hover Glow */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3 sm:gap-4 relative z-10 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:bg-indigo-600/20 transition-all shrink-0">
                            <Server size={16} className="text-indigo-400 sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-[8px] sm:text-[9px] font-black text-muted uppercase tracking-[0.3em] leading-none mb-1 sm:mb-1.5 opacity-60 truncate">Production Node</p>
                            <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-tight truncate italic">
                                {activeProduction?.name || 'SELECT SECTOR...'}
                            </h3>
                        </div>
                    </div>
                    <ChevronDown size={18} className="text-muted group-hover:text-indigo-400 transition-all transform group-data-[state=open]:rotate-180 shrink-0" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="z-50 min-w-[280px] bg-card-bg/95 backdrop-blur-3xl border border-card-border/60 rounded-[2rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300 relative overflow-hidden"
                    align="start"
                    sideOffset={12}
                >
                    {/* Background Texture */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Globe size={180} />
                    </div>

                    <div className="px-5 py-4 mb-2 flex items-center justify-between border-b border-card-border/40 relative z-10">
                        <div className="flex items-center gap-3">
                            <Shield size={14} className="text-indigo-400" />
                            <p className="text-[10px] font-black text-foreground uppercase tracking-[0.3em]">Identity Matrix</p>
                        </div>
                        <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{productions.length} Nodes</span>
                    </div>

                    <div className="space-y-1.5 relative z-10 max-h-[400px] overflow-y-auto no-scrollbar py-1">
                        {productions.map((prod) => (
                            <DropdownMenu.Item
                                key={prod.id}
                                onSelect={() => setActiveProductionId(prod.id)}
                                className={cn(
                                    "flex items-center justify-between px-5 py-4 rounded-2xl cursor-default outline-none transition-all group/item relative overflow-hidden active:scale-[0.98]",
                                    activeProductionId === prod.id
                                        ? 'bg-indigo-600 shadow-xl shadow-indigo-600/30'
                                        : 'text-muted hover:bg-white/5 hover:text-foreground border border-transparent hover:border-white/5'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]",
                                        prod.status === 'ACTIVE' ? "bg-emerald-500 shadow-emerald-500/50" : "bg-amber-500 shadow-amber-500/50",
                                        activeProductionId === prod.id && "bg-white shadow-white/50"
                                    )} />
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-tight italic transition-colors",
                                            activeProductionId === prod.id ? "text-white" : "text-foreground"
                                        )}>
                                            {prod.name}
                                        </span>
                                        <span className={cn(
                                            "text-[8px] font-bold uppercase tracking-widest mt-1 opacity-60",
                                            activeProductionId === prod.id ? "text-white/80" : "text-muted"
                                        )}>
                                            {prod.status} • {prod.engineType}
                                        </span>
                                    </div>
                                </div>
                                {activeProductionId === prod.id && (
                                    <Check size={18} className="text-white relative z-10" />
                                )}
                                {activeProductionId === prod.id && (
                                    <motion.div layoutId="sel-bg" className="absolute inset-0 bg-white/10" />
                                )}
                            </DropdownMenu.Item>
                        ))}

                        {productions.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center opacity-40">
                                <Zap size={32} strokeWidth={1} className="text-muted mb-4" />
                                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-10 text-center">No authorized nodes detected</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 p-1 border-t border-card-border/40">
                        <div className="px-4 py-3 flex items-center justify-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-muted/40 uppercase tracking-[0.4em]">Secure Session Active</span>
                        </div>
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
