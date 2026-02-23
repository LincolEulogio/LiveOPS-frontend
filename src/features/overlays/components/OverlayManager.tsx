'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { overlayService } from '../api/overlay.service';
import { Layers, Plus, ExternalLink, Play, Square, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { OverlayEditor } from './OverlayEditor';
import { OverlayTemplate } from '../types/overlay.types';

export const OverlayManager = ({ productionId }: { productionId: string }) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<OverlayTemplate | null>(null);

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['overlays', productionId],
        queryFn: () => overlayService.getOverlays(productionId),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => overlayService.createOverlay(productionId, {
            name,
            config: { width: 1920, height: 1080, layers: [] }
        }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overlays', productionId] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => overlayService.deleteOverlay(productionId, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overlays', productionId] }),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) =>
            overlayService.toggleActive(productionId, id, isActive),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overlays', productionId] }),
    });

    if (isEditing) {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="text-muted hover:text-foreground flex items-center gap-2 text-xs font-bold uppercase"
                    >
                        ← Back to List
                    </button>
                    <h2 className="text-xl font-bold text-foreground">Editing: {selectedTemplate?.name}</h2>
                </div>
                <OverlayEditor
                    productionId={productionId}
                    initialData={selectedTemplate}
                    onSave={async (config) => {
                        if (selectedTemplate) {
                            await overlayService.updateOverlay(productionId, selectedTemplate.id, { config });
                            queryClient.invalidateQueries({ queryKey: ['overlays', productionId] });
                            setIsEditing(false);
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Layers className="text-indigo-400" size={32} />
                        Graphics Constructor
                    </h1>
                    <p className="text-muted text-sm mt-1">Design and manage your production overlays.</p>
                </div>
                <button
                    onClick={() => {
                        const name = prompt('Overlay Name:');
                        if (name) createMutation.mutate(name);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all"
                >
                    <Plus size={20} /> New Overlay
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className={cn(
                            "bg-card-bg border rounded-3xl p-6 transition-all group overflow-hidden relative",
                            template.isActive ? "border-indigo-500 shadow-xl shadow-indigo-500/10" : "border-card-border"
                        )}
                    >
                        {template.isActive && (
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
                                Live on OBS
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-foreground mb-2">{template.name}</h3>
                        <p className="text-xs text-muted mb-6">{template.config.layers.length} Layers</p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setSelectedTemplate(template); setIsEditing(true); }}
                                className="flex items-center justify-center gap-2 bg-background hover:bg-card-border text-muted py-3 rounded-xl text-xs font-bold"
                            >
                                <Edit3 size={14} /> Design
                            </button>
                            <button
                                onClick={() => toggleMutation.mutate({ id: template.id, isActive: !template.isActive })}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
                                    template.isActive ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                )}
                            >
                                {template.isActive ? <Square size={14} /> : <Play size={14} />}
                                {template.isActive ? 'Deactivate' : 'Go Live'}
                            </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-card-border/50 flex justify-between items-center">
                            <a
                                href={`/overlay/${template.id}`}
                                target="_blank"
                                className="text-[10px] text-muted hover:text-indigo-400 flex items-center gap-1 font-bold uppercase tracking-widest"
                            >
                                <ExternalLink size={10} /> Browser Source URL
                            </a>
                            <button
                                onClick={() => confirm('Delete?') && deleteMutation.mutate(template.id)}
                                className="text-muted hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 bg-card-bg/50 border-2 border-dashed border-card-border rounded-3xl flex flex-col items-center justify-center text-muted">
                        <Layers size={48} className="mb-4 opacity-10" />
                        <p className="text-sm font-bold uppercase tracking-widest">No overlays found</p>
                    </div>
                )}
            </div>
        </div>
    );
};
