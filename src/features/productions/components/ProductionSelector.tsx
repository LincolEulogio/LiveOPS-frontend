'use client';

import React from 'react';
import { useProductions } from '../hooks/useProductions';
import { useAppStore } from '@/shared/store/app.store';
import { ChevronDown, Server, Loader2, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const ProductionSelector = () => {
    const { activeProductionId, setActiveProductionId } = useAppStore();
    const { data: productionsResult, isLoading } = useProductions({ limit: 100 });
    const productions = productionsResult?.data || [];

    const activeProduction = productions.find(p => p.id === activeProductionId);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-800 rounded-2xl">
                <Loader2 size={16} className="animate-spin text-stone-600" />
                <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Cargando...</span>
            </div>
        );
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-3 px-4 py-2.5 bg-stone-950 hover:bg-stone-900 border border-stone-800 rounded-2xl transition-all group min-w-[200px] justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                            <Server size={16} className="text-indigo-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest leading-none mb-0.5">Producción Activa</p>
                            <h3 className="text-sm font-bold text-white truncate max-w-[120px]">
                                {activeProduction?.name || 'Seleccionar...'}
                            </h3>
                        </div>
                    </div>
                    <ChevronDown size={16} className="text-stone-600 group-hover:text-stone-400 transition-colors" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="z-50 min-w-[240px] bg-stone-900 border border-stone-800 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in duration-200"
                    align="end"
                    sideOffset={8}
                >
                    <div className="px-3 py-2 mb-1">
                        <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest">Tus Producciones</p>
                    </div>

                    {productions.map((prod) => (
                        <DropdownMenu.Item
                            key={prod.id}
                            onSelect={() => setActiveProductionId(prod.id)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-default outline-none transition-colors ${activeProductionId === prod.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${prod.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                <span className="text-sm font-bold">{prod.name}</span>
                            </div>
                            {activeProductionId === prod.id && <Check size={16} />}
                        </DropdownMenu.Item>
                    ))}

                    {productions.length === 0 && (
                        <div className="p-4 text-center">
                            <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">No hay producciones</p>
                        </div>
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
