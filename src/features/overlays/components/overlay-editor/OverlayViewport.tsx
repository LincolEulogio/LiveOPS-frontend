'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';
import { OverlayConfig, OverlayLayer } from '../../types/overlay.types';

interface OverlayViewportProps {
    config: OverlayConfig;
    zoom: number;
    setZoom: (zoom: number) => void;
    previewMode: boolean;
    setPreviewMode: (mode: boolean) => void;
    selectedLayerId: string | null;
    onLayerMouseDown: (e: React.MouseEvent, layer: OverlayLayer) => void;
    onResizeStart: (e: React.MouseEvent, id: string, handle: string) => void;
    sampleData: any;
}

export const OverlayViewport: React.FC<OverlayViewportProps> = ({
    config,
    zoom,
    setZoom,
    previewMode,
    setPreviewMode,
    selectedLayerId,
    onLayerMouseDown,
    onResizeStart,
    sampleData
}) => {
    return (
        <div className="flex-1 bg-background flex flex-col relative overflow-hidden min-h-[400px] md:min-h-0">
            <div className="p-3 sm:p-4 border-b border-card-border flex justify-between items-center bg-card-bg/50 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-[10px] sm:text-xs font-black text-muted uppercase  hidden sm:block">Viewport (1920x1080)</span>
                    <div className="h-4 w-px bg-card-border hidden sm:block" />
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={cn(
                            "text-[9px] sm:text-[10px] font-black uppercase  px-3 py-1.5 rounded-full border transition-all whitespace-nowrap",
                            previewMode ? "bg-indigo-500 text-white border-indigo-400" : "bg-card-border/50 text-muted border-card-border hover:text-foreground"
                        )}
                    >
                        {previewMode ? 'Live Preview: ON' : 'Preview Bindings'}
                    </button>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 pr-4 sm:pr-0">
                    <span className="text-[10px] text-muted font-black ">{Math.round(zoom * 100)}%</span>
                    <input
                        type="range" min="0.1" max="1" step="0.1"
                        value={zoom} onChange={e => setZoom(parseFloat(e.target.value))}
                        className="w-20 sm:w-32 accent-indigo-500 cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 sm:p-10 md:p-20 overflow-auto bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] no-scrollbar">
                <div
                    className="bg-card-bg relative overflow-hidden"
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
                            onMouseDown={(e) => onLayerMouseDown(e, layer)}
                            className={cn(
                                "absolute border group transition-shadow",
                                selectedLayerId === layer.id ? "border-indigo-500 z-50" : "border-transparent hover:border-white/20 select-none"
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
                                    <div onMouseDown={(e) => onResizeStart(e, layer.id, 'nw')} className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-nw-resize z-50 hover:scale-125 transition-transform" />
                                    <div onMouseDown={(e) => onResizeStart(e, layer.id, 'ne')} className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-ne-resize z-50 hover:scale-125 transition-transform" />
                                    <div onMouseDown={(e) => onResizeStart(e, layer.id, 'sw')} className="absolute -left-1.5 -bottom-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-sw-resize z-50 hover:scale-125 transition-transform" />
                                    <div onMouseDown={(e) => onResizeStart(e, layer.id, 'se')} className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-50 hover:scale-125 transition-transform" />

                                    <div onMouseDown={(e) => onResizeStart(e, layer.id, 'n')} className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-n-resize z-50 hover:scale-125 transition-transform" />
                                    <div onMouseDown={(e) => onResizeStart(e, layer.id, 's')} className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-s-resize z-50 hover:scale-125 transition-transform" />
                                    <div onMouseDown={(e) => onResizeStart(e, layer.id, 'e')} className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-e-resize z-50 hover:scale-125 transition-transform" />
                                    <div onMouseDown={(e) => onResizeStart(e, layer.id, 'w')} className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-w-resize z-50 hover:scale-125 transition-transform" />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
