'use client';

import React from 'react';
import { useProductions } from '@/features/productions/hooks/useProductions';
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
                <span className="text-[10px] font-black text-muted uppercase ">Matrix Sync...</span>
            </div>
        );
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 bg-background/50 hover:bg-white/[0.04] border border-card-border/60 rounded-[1.2rem] transition-all group min-w-[180px] sm:min-w-[220px] flex-1 sm:flex-initial justify-between relative overflow-hidden active:scale-95">
                    {/* Hover Glow */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                            <Server size={14} className="text-indigo-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-[7px] sm:text-[8px] font-black text-muted uppercase leading-none mb-1 opacity-60 truncate tracking-tighter">Production Node</p>
                            <h3 className="text-[10px] sm:text-[11px] font-black text-foreground uppercase truncate italic">
                                {activeProduction?.name || 'SELECT SECTOR...'}
                            </h3>
                        </div>
                    </div>
                    <ChevronDown size={14} className="text-muted group-hover:text-indigo-400 transition-all transform group-data-[state=open]:rotate-180 shrink-0" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="z-[9999] min-w-[280px] bg-white/95 dark:bg-card-bg/95 backdrop-blur-3xl border border-black/10 dark:border-card-border/60 rounded-[2rem] p-4 shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden"
                    align="center"
                    sideOffset={12}
                >
                    {/* Background Texture */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Globe size={180} />
                    </div>

                    <div className="px-5 py-4 mb-2 flex items-center justify-between border-b border-card-border/40 relative z-10">
                        <div className="flex items-center gap-3">
                            <Shield size={14} className="text-indigo-400" />
                            <p className="text-[10px] font-black text-foreground uppercase ">Identity Matrix</p>
                        </div>
                        <span className="text-[9px] font-bold text-muted uppercase ">{productions.length} Nodes</span>
                    </div>

                    <div className="space-y-1.5 relative z-10 max-h-[400px] overflow-y-auto no-scrollbar py-1">
                        {productions.map((prod) => (
                            <DropdownMenu.Item
                                key={prod.id}
                                onSelect={() => setActiveProductionId(prod.id)}
                                className={cn(
                                    "flex items-center justify-between px-5 py-4 rounded-2xl cursor-default outline-none transition-all group/item relative overflow-hidden active:scale-[0.98]",
                                    activeProductionId === prod.id
                                        ? 'bg-indigo-600  '
                                        : 'text-muted hover:bg-white/5 hover:text-foreground border border-transparent hover:border-white/5'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full",
                                        prod.status === 'ACTIVE' ? "bg-emerald-500 " : "bg-amber-500 ",
                                        activeProductionId === prod.id && "bg-white"
                                    )} />
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-xs font-black uppercase  italic transition-colors",
                                            activeProductionId === prod.id ? "text-white" : "text-foreground"
                                        )}>
                                            {prod.name}
                                        </span>
                                        <span className={cn(
                                            "text-[8px] font-bold uppercase  mt-1 opacity-60",
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
                                <p className="text-[10px] font-black text-muted uppercase  px-10 text-center">No authorized nodes detected</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 p-1 border-t border-card-border/40">
                        <div className="px-4 py-3 flex items-center justify-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-muted/40 uppercase ">Secure Session Active</span>
                        </div>
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
