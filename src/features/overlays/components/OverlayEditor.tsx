'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OverlayTemplate, OverlayLayer, OverlayConfig } from '../types/overlay.types';
import { Layers, Plus, Save, Play, Settings, Type, Image as ImageIcon, Box, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
    initialData?: OverlayTemplate | null;
    onSave: (config: OverlayConfig) => void;
}

export const OverlayEditor = ({ productionId, initialData, onSave }: Props) => {
    const [config, setConfig] = useState<OverlayConfig>(initialData?.config || {
        width: 1920,
        height: 1080,
        layers: []
    });
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(0.4);

    const addLayer = (type: OverlayLayer['type']) => {
        const newLayer: OverlayLayer = {
            id: crypto.randomUUID(),
            type,
            name: `New ${type}`,
            x: 100,
            y: 100,
            width: type === 'text' ? 400 : 200,
            height: type === 'text' ? 80 : 200,
            opacity: 1,
            zIndex: config.layers.length,
            content: type === 'text' ? 'LOWER THIRD TEXT' : (type === 'shape' ? '#6366f1' : 'https://via.placeholder.com/200'),
            style: {
                fontSize: 48,
                color: '#ffffff',
                backgroundColor: '#00000088',
                borderRadius: 8,
                padding: 10,
                fontWeight: 'bold',
                textAlign: 'left',
            }
        };
        setConfig(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
        setSelectedLayerId(newLayer.id);
    };

    const updateLayer = (id: string, updates: Partial<OverlayLayer>) => {
        setConfig(prev => ({
            ...prev,
            layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
        }));
    };

    const deleteLayer = (id: string) => {
        setConfig(prev => ({
            ...prev,
            layers: prev.layers.filter(l => l.id !== id)
        }));
        if (selectedLayerId === id) setSelectedLayerId(null);
    };

    const selectedLayer = config.layers.find(l => l.id === selectedLayerId);

    return (
        <div className="flex h-[800px] w-full bg-black rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
            {/* Toolbar */}
            <div className="w-16 bg-stone-900 border-r border-stone-800 flex flex-col items-center py-6 gap-6">
                <button onClick={() => addLayer('text')} className="p-3 text-stone-400 hover:text-white transition-colors" title="Add Text">
                    <Type size={20} />
                </button>
                <button onClick={() => addLayer('image')} className="p-3 text-stone-400 hover:text-white transition-colors" title="Add Image">
                    <ImageIcon size={20} />
                </button>
                <button onClick={() => addLayer('shape')} className="p-3 text-stone-400 hover:text-white transition-colors" title="Add Shape">
                    <Box size={20} />
                </button>
                <div className="mt-auto flex flex-col gap-4">
                    <button onClick={() => onSave(config)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors">
                        <Save size={20} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-stone-950 flex flex-col relative overflow-hidden">
                <div className="p-4 border-b border-stone-900 flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Viewport (1920x1080)</span>
                    <input
                        type="range" min="0.1" max="1" step="0.1"
                        value={zoom} onChange={e => setZoom(parseFloat(e.target.value))}
                        className="w-32 accent-indigo-500"
                    />
                </div>

                <div className="flex-1 flex items-center justify-center p-20 overflow-auto">
                    <div
                        className="bg-stone-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        style={{
                            width: config.width,
                            height: config.height,
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center'
                        }}
                    >
                        {config.layers.sort((a, b) => a.zIndex - b.zIndex).map(layer => (
                            <div
                                key={layer.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedLayerId(layer.id); }}
                                className={cn(
                                    "absolute cursor-move border",
                                    selectedLayerId === layer.id ? "border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-50" : "border-transparent hover:border-white/20"
                                )}
                                style={{
                                    left: layer.x,
                                    top: layer.y,
                                    width: layer.width,
                                    height: layer.height,
                                    opacity: layer.opacity,
                                    backgroundColor: layer.type === 'shape' ? layer.content : 'transparent',
                                    ...layer.style
                                }}
                            >
                                {layer.type === 'text' && (
                                    <div className="w-full h-full flex items-center">{layer.content}</div>
                                )}
                                {layer.type === 'image' && (
                                    <img src={layer.content} className="w-full h-full object-contain pointer-events-none" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Side Panel (Layers & Properties) */}
            <div className="w-80 bg-stone-900 border-l border-stone-800 flex flex-col h-full">
                {/* Layers Top */}
                <div className="p-4 border-b border-stone-800">
                    <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                        <Layers size={14} /> Layers
                    </h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                        {config.layers.slice().reverse().map(l => (
                            <div
                                key={l.id}
                                onClick={() => setSelectedLayerId(l.id)}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                                    selectedLayerId === l.id ? "bg-indigo-500/20 text-indigo-300" : "text-stone-400 hover:bg-stone-800"
                                )}
                            >
                                {l.type === 'text' ? <Type size={14} /> : l.type === 'image' ? <ImageIcon size={14} /> : <Box size={14} />}
                                <span className="text-xs font-bold truncate flex-1">{l.name}</span>
                                <button onClick={() => deleteLayer(l.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Properties Bottom */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {selectedLayer ? (
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Settings size={14} /> Properties: {selectedLayer.name}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-stone-500 font-bold uppercase">X Pos</label>
                                    <input type="number" value={selectedLayer.x} onChange={e => updateLayer(selectedLayer.id, { x: parseInt(e.target.value) })} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-stone-500 font-bold uppercase">Y Pos</label>
                                    <input type="number" value={selectedLayer.y} onChange={e => updateLayer(selectedLayer.id, { y: parseInt(e.target.value) })} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-stone-500 font-bold uppercase">Content / Data Binding</label>
                                {selectedLayer.type === 'text' ? (
                                    <textarea
                                        value={selectedLayer.content}
                                        onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs h-20"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={selectedLayer.content}
                                        onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-stone-500 font-bold uppercase">Colors</label>
                                <div className="flex gap-2">
                                    <input type="color" value={selectedLayer.style.color} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, color: e.target.value } })} className="w-8 h-8 rounded overflow-hidden" />
                                    <input type="color" value={selectedLayer.style.backgroundColor?.substring(0, 7) || '#000000'} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, backgroundColor: e.target.value + '88' } })} className="w-8 h-8 rounded overflow-hidden" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-stone-800">
                                <label className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Connect to Live Data</label>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-stone-500 font-bold uppercase">Data Source</label>
                                        <select
                                            value={selectedLayer.binding?.source || ''}
                                            onChange={e => updateLayer(selectedLayer.id, {
                                                binding: e.target.value ? { source: e.target.value as any, field: '' } : undefined
                                            })}
                                            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs"
                                        >
                                            <option value="">Static (No Binding)</option>
                                            <option value="rundown">Rundown / Escaleta</option>
                                            <option value="social">Social Media (Latest)</option>
                                            <option value="telemetry">System Telemetry</option>
                                        </select>
                                    </div>

                                    {selectedLayer.binding && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-stone-500 font-bold uppercase">Field</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. active_block_title"
                                                    value={selectedLayer.binding.field}
                                                    onChange={e => updateLayer(selectedLayer.id, {
                                                        binding: { ...selectedLayer.binding!, field: e.target.value }
                                                    })}
                                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-stone-500 font-bold uppercase">Prefix</label>
                                                    <input
                                                        type="text"
                                                        value={selectedLayer.binding.prefix || ''}
                                                        onChange={e => updateLayer(selectedLayer.id, {
                                                            binding: { ...selectedLayer.binding!, prefix: e.target.value }
                                                        })}
                                                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-stone-500 font-bold uppercase">Suffix</label>
                                                    <input
                                                        type="text"
                                                        value={selectedLayer.binding.suffix || ''}
                                                        onChange={e => updateLayer(selectedLayer.id, {
                                                            binding: { ...selectedLayer.binding!, suffix: e.target.value }
                                                        })}
                                                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-stone-800">
                                <button onClick={() => deleteLayer(selectedLayer.id)} className="w-full p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                                    Delete Layer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-600 italic text-center p-10">
                            <Plus size={32} className="mb-4 opacity-10" />
                            <p className="text-xs">Select a layer to edit properties or add a new one from the left.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
