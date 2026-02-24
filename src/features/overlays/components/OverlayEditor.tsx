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
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<{ id: string, handle: string } | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, layerX: 0, layerY: 0, width: 0, height: 0 });
    const [previewMode, setPreviewMode] = useState(false);
    const [sampleData] = useState({
        active_block_title: 'ENTREVISTA CON GUEST_NAME',
        active_block_notes: 'Tema: Impacto de la IA en producción en vivo',
        guest_name: 'Dr. Jane Smith',
        system_cpu: '15%',
    });

    const snapToGrid = (val: number) => Math.round(val / 10) * 10;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingId && canvasRef.current) {
                const deltaX = (e.clientX - dragStart.x) / zoom;
                const deltaY = (e.clientY - dragStart.y) / zoom;
                updateLayer(draggingId, {
                    x: snapToGrid(dragStart.layerX + deltaX),
                    y: snapToGrid(dragStart.layerY + deltaY)
                });
            } else if (resizingId && canvasRef.current) {
                const deltaX = (e.clientX - dragStart.x) / zoom;
                const deltaY = (e.clientY - dragStart.y) / zoom;
                const { handle } = resizingId;
                const updates: Partial<OverlayLayer> = {};

                if (handle.includes('e')) updates.width = snapToGrid(Math.max(20, dragStart.width + deltaX));
                if (handle.includes('s')) updates.height = snapToGrid(Math.max(20, dragStart.height + deltaY));
                if (handle.includes('w')) {
                    const newWidth = snapToGrid(Math.max(20, dragStart.width - deltaX));
                    updates.width = newWidth;
                    updates.x = dragStart.layerX + (dragStart.width - newWidth);
                }
                if (handle.includes('n')) {
                    const newHeight = snapToGrid(Math.max(20, dragStart.height - deltaY));
                    updates.height = newHeight;
                    updates.y = dragStart.layerY + (dragStart.height - newHeight);
                }

                updateLayer(resizingId.id, updates);
            }
        };

        const handleMouseUp = () => {
            setDraggingId(null);
            setResizingId(null);
        };

        if (draggingId || resizingId) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, resizingId, dragStart, zoom]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedLayerId) return;
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            const moveStep = e.shiftKey ? 50 : 10;
            const layer = config.layers.find(l => l.id === selectedLayerId)!;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteLayer(selectedLayerId);
            } else if (e.key === 'ArrowLeft') {
                updateLayer(selectedLayerId, { x: layer.x - moveStep });
            } else if (e.key === 'ArrowRight') {
                updateLayer(selectedLayerId, { x: layer.x + moveStep });
            } else if (e.key === 'ArrowUp') {
                updateLayer(selectedLayerId, { y: layer.y - moveStep });
            } else if (e.key === 'ArrowDown') {
                updateLayer(selectedLayerId, { y: layer.y + moveStep });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedLayerId, config.layers]);

    const handleLayerMouseDown = (e: React.MouseEvent, layer: OverlayLayer) => {
        e.stopPropagation();
        setSelectedLayerId(layer.id);
        setDraggingId(layer.id);
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            layerX: layer.x,
            layerY: layer.y,
            width: layer.width,
            height: layer.height
        });
    };

    const handleResizeStart = (e: React.MouseEvent, id: string, handle: string) => {
        e.stopPropagation();
        const layer = config.layers.find(l => l.id === id)!;
        setResizingId({ id, handle });
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            layerX: layer.x,
            layerY: layer.y,
            width: layer.width,
            height: layer.height
        });
    };

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
        <div className="flex h-[800px] w-full bg-background rounded-3xl overflow-hidden border border-card-border shadow-2xl mb-5">
            {/* Toolbar */}
            <div className="w-16 bg-card-bg border-r border-card-border flex flex-col items-center py-6 gap-6">
                <button onClick={() => addLayer('text')} className="p-3 text-muted hover:text-foreground transition-colors" title="Add Text">
                    <Type size={20} />
                </button>
                <button onClick={() => addLayer('image')} className="p-3 text-muted hover:text-foreground transition-colors" title="Add Image">
                    <ImageIcon size={20} />
                </button>
                <button onClick={() => addLayer('shape')} className="p-3 text-muted hover:text-foreground transition-colors" title="Add Shape">
                    <Box size={20} />
                </button>
                <div className="mt-auto flex flex-col gap-4">
                    <button onClick={() => onSave(config)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors">
                        <Save size={20} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-background flex flex-col relative overflow-hidden">
                <div className="p-4 border-b border-card-border flex justify-between items-center bg-card-bg/50">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-muted uppercase tracking-widest">Viewport (1920x1080)</span>
                        <div className="h-4 w-px bg-card-border" />
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all",
                                previewMode ? "bg-indigo-500 text-white border-indigo-400" : "bg-card-border/50 text-muted border-card-border hover:text-foreground"
                            )}
                        >
                            {previewMode ? 'Live Preview: ON' : 'Preview Bindings'}
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-muted font-bold">{Math.round(zoom * 100)}%</span>
                        <input
                            type="range" min="0.1" max="1" step="0.1"
                            value={zoom} onChange={e => setZoom(parseFloat(e.target.value))}
                            className="w-32 accent-indigo-500 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-20 overflow-auto bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px]">
                    <div
                        className="bg-card-bg shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden"
                        style={{
                            width: config.width,
                            height: config.height,
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center',
                            backgroundImage: 'linear-gradient(45deg, #161b22 25%, transparent 25%), linear-gradient(-45deg, #161b22 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #161b22 75%), linear-gradient(-45deg, transparent 75%, #161b22 75%)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        }}
                    >
                        {config.layers.sort((a, b) => a.zIndex - b.zIndex).map(layer => (
                            <div
                                key={layer.id}
                                onMouseDown={(e) => handleLayerMouseDown(e, layer)}
                                className={cn(
                                    "absolute border group transition-shadow",
                                    selectedLayerId === layer.id ? "border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] z-50" : "border-transparent hover:border-white/20 select-none"
                                )}
                                style={{
                                    left: layer.x,
                                    top: layer.y,
                                    width: layer.width,
                                    height: layer.height,
                                    opacity: layer.opacity,
                                    backgroundColor: layer.type === 'shape' ? layer.content : 'transparent',
                                    zIndex: layer.zIndex,
                                    ...layer.style
                                }}
                            >
                                {layer.type === 'text' && (
                                    <div className="w-full h-full flex items-center overflow-hidden">
                                        {previewMode && layer.binding
                                            ? `${layer.binding.prefix || ''}${sampleData[layer.binding.field as keyof typeof sampleData] || layer.binding.field}${layer.binding.suffix || ''}`
                                            : layer.content}
                                    </div>
                                )}
                                {layer.type === 'image' && (
                                    <img src={layer.content} className="w-full h-full object-contain pointer-events-none" />
                                )}

                                {/* Resize Handles */}
                                {selectedLayerId === layer.id && (
                                    <>
                                        <div onMouseDown={(e) => handleResizeStart(e, layer.id, 'nw')} className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-nw-resize z-50 hover:scale-125 transition-transform" />
                                        <div onMouseDown={(e) => handleResizeStart(e, layer.id, 'ne')} className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-ne-resize z-50 hover:scale-125 transition-transform" />
                                        <div onMouseDown={(e) => handleResizeStart(e, layer.id, 'sw')} className="absolute -left-1.5 -bottom-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-sw-resize z-50 hover:scale-125 transition-transform" />
                                        <div onMouseDown={(e) => handleResizeStart(e, layer.id, 'se')} className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-50 hover:scale-125 transition-transform" />

                                        <div onMouseDown={(e) => handleResizeStart(e, layer.id, 'n')} className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-n-resize z-50 hover:scale-125 transition-transform" />
                                        <div onMouseDown={(e) => handleResizeStart(e, layer.id, 's')} className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-s-resize z-50 hover:scale-125 transition-transform" />
                                        <div onMouseDown={(e) => handleResizeStart(e, layer.id, 'e')} className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-e-resize z-50 hover:scale-125 transition-transform" />
                                        <div onMouseDown={(e) => handleResizeStart(e, layer.id, 'w')} className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-w-resize z-50 hover:scale-125 transition-transform" />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Side Panel (Layers & Properties) */}
            <div className="w-80 bg-card-bg border-l border-card-border flex flex-col h-full">
                {/* Layers Top */}
                <div className="p-4 border-b border-card-border">
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                        <Layers size={14} /> Layers
                    </h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                        {config.layers.slice().reverse().map(l => (
                            <div
                                key={l.id}
                                onClick={() => setSelectedLayerId(l.id)}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                                    selectedLayerId === l.id ? "bg-indigo-500/20 text-indigo-300" : "text-muted hover:bg-card-border"
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
                            <h3 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Settings size={14} /> Properties: {selectedLayer.name}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-muted font-bold uppercase">X Pos</label>
                                    <input type="number" value={selectedLayer.x} onChange={e => updateLayer(selectedLayer.id, { x: parseInt(e.target.value) })} className="w-full bg-background border border-card-border rounded-lg p-2 text-xs" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-muted font-bold uppercase">Y Pos</label>
                                    <input type="number" value={selectedLayer.y} onChange={e => updateLayer(selectedLayer.id, { y: parseInt(e.target.value) })} className="w-full bg-background border border-card-border rounded-lg p-2 text-xs" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-muted font-bold uppercase">Width</label>
                                    <input type="number" value={selectedLayer.width} onChange={e => updateLayer(selectedLayer.id, { width: parseInt(e.target.value) })} className="w-full bg-background border border-card-border rounded-lg p-2 text-xs" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-muted font-bold uppercase">Height</label>
                                    <input type="number" value={selectedLayer.height} onChange={e => updateLayer(selectedLayer.id, { height: parseInt(e.target.value) })} className="w-full bg-background border border-card-border rounded-lg p-2 text-xs" />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateLayer(selectedLayer.id, { zIndex: selectedLayer.zIndex + 1 })}
                                    className="flex-1 p-2 bg-background border border-card-border rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-card-border"
                                >
                                    <ChevronUp size={12} /> Bring Forward
                                </button>
                                <button
                                    onClick={() => updateLayer(selectedLayer.id, { zIndex: Math.max(0, selectedLayer.zIndex - 1) })}
                                    className="flex-1 p-2 bg-background border border-card-border rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-card-border"
                                >
                                    <ChevronDown size={12} /> Send Backward
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-muted font-bold uppercase">Content / Data Binding</label>
                                {selectedLayer.type === 'text' ? (
                                    <textarea
                                        value={selectedLayer.content}
                                        onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
                                        className="w-full bg-background border border-card-border rounded-lg p-2 text-xs h-20"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={selectedLayer.content}
                                        onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
                                        className="w-full bg-background border border-card-border rounded-lg p-2 text-xs"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-muted font-bold uppercase">Colors</label>
                                <div className="flex gap-2">
                                    <input type="color" value={selectedLayer.style.color} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, color: e.target.value } })} className="w-8 h-8 rounded overflow-hidden" />
                                    <input type="color" value={selectedLayer.style.backgroundColor?.substring(0, 7) || '#000000'} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, backgroundColor: e.target.value + '88' } })} className="w-8 h-8 rounded overflow-hidden" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-card-border">
                                <label className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Connect to Live Data</label>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-muted font-bold uppercase">Data Source</label>
                                        <select
                                            value={selectedLayer.binding?.source || ''}
                                            onChange={e => updateLayer(selectedLayer.id, {
                                                binding: e.target.value ? { source: e.target.value as any, field: '' } : undefined
                                            })}
                                            className="w-full bg-background border border-card-border rounded-lg p-2 text-xs"
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
                                                <label className="text-[9px] text-muted font-bold uppercase">Field</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. active_block_title"
                                                    value={selectedLayer.binding.field}
                                                    onChange={e => updateLayer(selectedLayer.id, {
                                                        binding: { ...selectedLayer.binding!, field: e.target.value }
                                                    })}
                                                    className="w-full bg-background border border-card-border rounded-lg p-2 text-xs"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-muted font-bold uppercase">Prefix</label>
                                                    <input
                                                        type="text"
                                                        value={selectedLayer.binding.prefix || ''}
                                                        onChange={e => updateLayer(selectedLayer.id, {
                                                            binding: { ...selectedLayer.binding!, prefix: e.target.value }
                                                        })}
                                                        className="w-full bg-background border border-card-border rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-muted font-bold uppercase">Suffix</label>
                                                    <input
                                                        type="text"
                                                        value={selectedLayer.binding.suffix || ''}
                                                        onChange={e => updateLayer(selectedLayer.id, {
                                                            binding: { ...selectedLayer.binding!, suffix: e.target.value }
                                                        })}
                                                        className="w-full bg-background border border-card-border rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-card-border">
                                <button onClick={() => deleteLayer(selectedLayer.id)} className="w-full p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                                    Delete Layer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted italic text-center p-10">
                            <Plus size={32} className="mb-4 opacity-10" />
                            <p className="text-xs">Select a layer to edit properties or add a new one from the left.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
