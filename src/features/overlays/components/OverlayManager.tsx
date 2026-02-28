'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { overlayService } from '@/features/overlays/api/overlay.service';
import {
  Layers,
  Plus,
  ExternalLink,
  Play,
  Square,
  Edit3,
  Trash2,
  X,
  ChevronLeft,
} from 'lucide-react';
import { showConfirm, showAlert } from '@/shared/utils/swal';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { OverlayEditor } from '@/features/overlays/components/OverlayEditor';
import { OverlayTemplate } from '@/features/overlays/types/overlay.types';

export const OverlayManager = ({ productionId }: { productionId: string }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OverlayTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOverlayName, setNewOverlayName] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['overlays', productionId],
    queryFn: () => overlayService.getOverlays(productionId),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      overlayService.createOverlay(productionId, {
        name,
        config: { width: 1920, height: 1080, layers: [] },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overlays', productionId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => overlayService.deleteOverlay(productionId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overlays', productionId] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      overlayService.toggleActive(productionId, id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overlays', productionId] }),
  });

  if (isEditing) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="text-muted hover:text-foreground flex items-center gap-2 text-[10px] font-black uppercase  w-fit"
          >
            <ChevronLeft size={16} /> Back to List
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase  truncate max-w-full sm:max-w-[60%] italic">
            Editing: <span className="text-indigo-400">{selectedTemplate?.name}</span>
          </h2>
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
    <div className="flex flex-col h-full bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] overflow-hidden relative group/sidebar transition-all shadow-xl">
      {/* Visual Scanline Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover/sidebar:opacity-100 transition-all duration-700" />

      {/* Premium Tactical Header */}
      <div className="p-6 sm:p-10 border-b border-card-border/50 bg-white/5 dark:bg-black/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover/sidebar:scale-110 group-hover/sidebar:opacity-10 transition-all duration-1000">
          <Layers size={120} />
        </div>

        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <Layers className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plus size={10} className="text-indigo-500 animate-pulse" />
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">
                GFX Matrix Node
              </h2>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic leading-none tracking-tight">
              Graphics <span className="text-indigo-600">Constructor</span>
            </h1>
            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 mt-1.5 tracking-widest leading-none">
              Design and engage production overlays in real-time
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="relative z-10 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20 border border-indigo-400/30"
        >
          <Plus size={18} />
          New Overlay Node
        </button>
      </div>

      {/* Overlay Grid */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar min-h-0 bg-white/5 dark:bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {templates.map((template) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={template.id}
                className={cn(
                  'bg-card-bg/40 border-2 rounded-4xl p-8 transition-all duration-300 group/item overflow-hidden relative shadow-sm',
                  template.isActive
                    ? 'border-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.15)] bg-indigo-600/3'
                    : 'border-card-border/50 hover:border-indigo-500/30 hover:bg-white/5 dark:hover:bg-black/20'
                )}
              >
                {template.isActive && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest animate-pulse shadow-lg z-10">
                    Live in Stream
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-foreground uppercase tracking-tight group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors leading-tight mb-2 truncate">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Layers size={10} className="text-muted-foreground/60" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-widest">
                          {template.config.layers.length} Layers Manifested
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsEditing(true);
                      }}
                      className="flex items-center justify-center gap-2.5 bg-background/80 hover:bg-card-border border border-card-border text-foreground py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                    >
                      <Edit3 size={14} /> Design
                    </button>
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: template.id, isActive: !template.isActive })
                      }
                      className={cn(
                        'flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg',
                        template.isActive
                          ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/20'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
                      )}
                    >
                      {template.isActive ? (
                        <Square size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )}
                      {template.isActive ? 'Suspend' : 'Engage'}
                    </button>
                  </div>

                  <div className="pt-6 border-t border-card-border/50 flex justify-between items-center">
                    <a
                      href={`/overlay/${template.id}`}
                      target="_blank"
                      className="text-[9px] font-black text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 uppercase tracking-widest transition-all group/link"
                    >
                      <ExternalLink
                        size={12}
                        className="group-hover/link:scale-110 transition-transform"
                      />
                      Browser Uplink
                    </a>
                    <button
                      onClick={async () => {
                        const result = await showConfirm(
                          `¿Eliminar overlay "${template.name}"?`,
                          'Esta acción no se puede deshacer.',
                          'Sí, eliminar'
                        );
                        if (result.isConfirmed) {
                          deleteMutation.mutate(template.id, {
                            onSuccess: () =>
                              showAlert('Eliminado', 'El overlay fue eliminado.', 'success'),
                            onError: () =>
                              showAlert('Error', 'No se pudo eliminar el overlay.', 'error'),
                          });
                        }
                      }}
                      className="p-2 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {templates.length === 0 && !isLoading && (
          <div className="py-40 flex flex-col items-center justify-center text-muted-foreground/30 gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/2 pointer-events-none" />
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative w-24 h-24 bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-3xl flex items-center justify-center shadow-2xl">
                <Layers
                  size={48}
                  strokeWidth={1}
                  className="text-muted-foreground opacity-40 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="text-center relative z-10 max-w-sm px-6">
              <h3 className="text-lg font-black uppercase text-foreground/60 tracking-widest mb-2">
                GFX Pipeline Empty
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/40 leading-relaxed">
                No graphics nodes detected in the constructor. Initialize a new overlay to begin
                design manifest.
              </p>
            </div>
            <button
              className="px-8 py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-lg"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Initialize GFX Node
            </button>
          </div>
        )}
      </div>

      {/* Create Overlay Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card-bg border border-card-border rounded-[2.5rem] p-10 w-full max-w-md overflow-hidden relative shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-6">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewOverlayName('');
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                <Plus size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground uppercase italic tracking-tight leading-none mb-1">
                  New <span className="text-indigo-600">Overlay</span>
                </h2>
                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-[0.2em]">
                  Initialize GFX Node
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newOverlayName.trim()) {
                  createMutation.mutate(newOverlayName.trim());
                  setIsCreateModalOpen(false);
                  setNewOverlayName('');
                }
              }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Identity Tag
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newOverlayName}
                  onChange={(e) => setNewOverlayName(e.target.value)}
                  className="w-full bg-background/50 border border-card-border rounded-2xl px-5 py-4 text-xs font-black tracking-widest text-foreground placeholder:text-muted-foreground/20 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all uppercase shadow-inner"
                  placeholder="e.g., PRIMARY_LOWER_THIRD"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || !newOverlayName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 active:scale-[0.98] border border-indigo-400/30"
              >
                {createMutation.isPending ? 'Processing Transfer...' : 'Manifest Overlay'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
