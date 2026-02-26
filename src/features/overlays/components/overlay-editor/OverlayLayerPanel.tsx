'use client';

import React from 'react';
import { Layers, Type, Image as ImageIcon, Box, Trash2, Settings, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { showConfirm } from '@/shared/utils/swal';
import { OverlayLayer, OverlayConfig } from '@/features/overlays/types/overlay.types';

interface OverlayLayerPanelProps {
    config: OverlayConfig;
    selectedLayerId: string | null;
    setSelectedLayerId: (id: string | null) => void;
    onDeleteLayer: (id: string) => void;
    onUpdateLayer: (id: string, updates: Partial<OverlayLayer>) => void;
}

export const OverlayLayerPanel: React.FC<OverlayLayerPanelProps> = ({
    config,
    selectedLayerId,
    setSelectedLayerId,
    onDeleteLayer,
    onUpdateLayer
}) => {
    const selectedLayer = config.layers.find(l => l.id === selectedLayerId);

    return (
        <div className="w-full md:w-80 bg-card-bg border-t md:border-t-0 md:border-l border-card-border flex flex-col h-auto md:h-full">
            {/* Layers Top */}
            <div className="p-4 border-b border-card-border">
                <h3 className="text-[10px] font-black text-muted uppercase  flex items-center gap-2 mb-4">
                    <Layers size={14} /> Layers
                </h3>
                <div className="space-y-1 max-h-48 md:max-h-64 overflow-y-auto custom-scrollbar">
                    {config.layers.slice().reverse().map(l => (
                        <div
                            key={l.id}
                            onClick={() => setSelectedLayerId(l.id)}
                            className={cn(
                                "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border group",
                                selectedLayerId === l.id
                                    ? "bg-indigo-600 border-indigo-500 text-white"
                                    : "text-muted hover:bg-white/5 border-transparent"
                            )}
                        >
                            {l.type === 'text' ? <Type size={14} /> : l.type === 'image' ? <ImageIcon size={14} /> : <Box size={14} />}
                            <span className="text-[11px] font-black uppercase  truncate flex-1">{l.name}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteLayer(l.id); }}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    selectedLayerId === l.id ? "hover:bg-white/20 text-white/60" : "opacity-0 group-hover:opacity-100 hover:text-red-400"
                                )}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {config.layers.length === 0 && (
                        <div className="py-8 flex flex-col items-center justify-center opacity-20">
                            <Layers size={24} />
                            <p className="text-[9px] font-black uppercase mt-2">No layers yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Properties Bottom */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6 bg-background/30">
                {selectedLayer ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-foreground uppercase  flex items-center gap-2">
                                <Settings size={14} className="text-indigo-400" /> Layer Matrix
                            </h3>
                            <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase">
                                {selectedLayer.type}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-muted font-black uppercase ">X Position</label>
                                <input type="number" value={selectedLayer.x} onChange={e => onUpdateLayer(selectedLayer.id, { x: parseInt(e.target.value) })} className="w-full bg-background border border-card-border rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-muted font-black uppercase ">Y Position</label>
                                <input type="number" value={selectedLayer.y} onChange={e => onUpdateLayer(selectedLayer.id, { y: parseInt(e.target.value) })} className="w-full bg-background border border-card-border rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-muted font-black uppercase ">Width</label>
                                <input type="number" value={selectedLayer.width} onChange={e => onUpdateLayer(selectedLayer.id, { width: parseInt(e.target.value) })} className="w-full bg-background border border-card-border rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-muted font-black uppercase ">Height</label>
                                <input type="number" value={selectedLayer.height} onChange={e => onUpdateLayer(selectedLayer.id, { height: parseInt(e.target.value) })} className="w-full bg-background border border-card-border rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onUpdateLayer(selectedLayer.id, { zIndex: selectedLayer.zIndex + 1 })}
                                className="flex-1 p-2.5 bg-card-bg border border-card-border rounded-xl text-[9px] font-black uppercase  flex items-center justify-center gap-2 hover:bg-card-border transition-colors"
                            >
                                <ChevronUp size={12} /> Up
                            </button>
                            <button
                                onClick={() => onUpdateLayer(selectedLayer.id, { zIndex: Math.max(0, selectedLayer.zIndex - 1) })}
                                className="flex-1 p-2.5 bg-card-bg border border-card-border rounded-xl text-[9px] font-black uppercase  flex items-center justify-center gap-2 hover:bg-card-border transition-colors"
                            >
                                <ChevronDown size={12} /> Down
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] text-muted font-black uppercase ">Content Mapping</label>
                            {selectedLayer.type === 'text' ? (
                                <textarea
                                    value={selectedLayer.content}
                                    onChange={e => onUpdateLayer(selectedLayer.id, { content: e.target.value })}
                                    className="w-full bg-background border border-card-border rounded-xl p-3 text-xs font-bold h-24 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={selectedLayer.content}
                                    onChange={e => onUpdateLayer(selectedLayer.id, { content: e.target.value })}
                                    className="w-full bg-background border border-card-border rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] text-muted font-black uppercase ">Aesthetics</label>
                            <div className="flex items-center gap-4 p-3 bg-background/50 rounded-xl border border-card-border">
                                <div className="flex-1 space-y-1">
                                    <p className="text-[8px] font-black text-muted uppercase">Foreground</p>
                                    <input type="color" value={selectedLayer.style.color} onChange={e => onUpdateLayer(selectedLayer.id, { style: { ...selectedLayer.style, color: e.target.value } })} className="w-full h-8 rounded-lg overflow-hidden bg-transparent cursor-pointer" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-[8px] font-black text-muted uppercase">Background</p>
                                    <input type="color" value={selectedLayer.style.backgroundColor?.substring(0, 7) || '#000000'} onChange={e => onUpdateLayer(selectedLayer.id, { style: { ...selectedLayer.style, backgroundColor: e.target.value + '88' } })} className="w-full h-8 rounded-lg overflow-hidden bg-transparent cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-card-border">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <label className="text-[9px] text-indigo-400 font-black uppercase ">Signal Coupling</label>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] text-muted font-black uppercase ">Source Module</label>
                                    <select
                                        value={selectedLayer.binding?.source || ''}
                                        onChange={e => onUpdateLayer(selectedLayer.id, {
                                            binding: e.target.value ? { source: e.target.value as any, field: '' } : undefined
                                        })}
                                        className="w-full bg-background border border-card-border rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="">STATIC_IDLE</option>
                                        <option value="rundown">CORE_RUNDOWN</option>
                                        <option value="social">SOCIAL_STREAM</option>
                                        <option value="telemetry">SYS_TELEMETRY</option>
                                    </select>
                                </div>

                                {selectedLayer.binding && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] text-muted font-black uppercase ">Field ID</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. active_block_title"
                                                value={selectedLayer.binding.field}
                                                onChange={e => onUpdateLayer(selectedLayer.id, {
                                                    binding: { ...selectedLayer.binding!, field: e.target.value }
                                                })}
                                                className="w-full bg-background border border-card-border rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] text-muted font-black uppercase ">Prefix</label>
                                                <input
                                                    type="text"
                                                    value={selectedLayer.binding.prefix || ''}
                                                    onChange={e => onUpdateLayer(selectedLayer.id, {
                                                        binding: { ...selectedLayer.binding!, prefix: e.target.value }
                                                    })}
                                                    className="w-full bg-background border border-card-border rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] text-muted font-black uppercase ">Suffix</label>
                                                <input
                                                    type="text"
                                                    value={selectedLayer.binding.suffix || ''}
                                                    onChange={e => onUpdateLayer(selectedLayer.id, {
                                                        binding: { ...selectedLayer.binding!, suffix: e.target.value }
                                                    })}
                                                    className="w-full bg-background border border-card-border rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-card-border/50">
                            <button
                                onClick={async () => {
                                    const result = await showConfirm(
                                        '¿Eliminar esta capa?',
                                        `La capa "${selectedLayer.name}" será eliminada permanentemente.`,
                                        'Sí, eliminar'
                                    );
                                    if (result.isConfirmed) onDeleteLayer(selectedLayer.id);
                                }}
                                className="w-full p-4 bg-red-500/5 text-red-500 border border-red-500/10 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase   "
                            >
                                Deconstruct Layer
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted italic text-center p-10 opacity-40">
                        <Plus size={32} strokeWidth={1} className="mb-4" />
                        <p className="text-[10px] uppercase font-black  leading-loose">Select a layer to initialize matrix controls</p>
                    </div>
                )}
            </div>
        </div>
    );
};
