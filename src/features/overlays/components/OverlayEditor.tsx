'use client';

import React, { useState, useEffect } from 'react';
import { OverlayTemplate, OverlayLayer, OverlayConfig } from '@/features/overlays/types/overlay.types';

// New Sub-components
import { OverlayToolbar } from '@/features/overlays/components/overlay-editor/OverlayToolbar';
import { OverlayViewport } from '@/features/overlays/components/overlay-editor/OverlayViewport';
import { OverlayLayerPanel } from '@/features/overlays/components/overlay-editor/OverlayLayerPanel';

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
            if (draggingId) {
                const deltaX = (e.clientX - dragStart.x) / zoom;
                const deltaY = (e.clientY - dragStart.y) / zoom;
                updateLayer(draggingId, {
                    x: snapToGrid(dragStart.layerX + deltaX),
                    y: snapToGrid(dragStart.layerY + deltaY)
                });
            } else if (resizingId) {
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

    return (
        <div className="flex flex-col md:flex-row h-auto md:h-[800px] w-full bg-background rounded-3xl overflow-hidden border border-card-border mb-5">
            <OverlayToolbar
                onAddLayer={addLayer}
                onSave={() => onSave(config)}
            />

            <OverlayViewport
                config={config}
                zoom={zoom}
                setZoom={setZoom}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                selectedLayerId={selectedLayerId}
                onLayerMouseDown={handleLayerMouseDown}
                onResizeStart={handleResizeStart}
                sampleData={sampleData}
            />

            <OverlayLayerPanel
                config={config}
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                onDeleteLayer={deleteLayer}
                onUpdateLayer={updateLayer}
            />
        </div>
    );
};
