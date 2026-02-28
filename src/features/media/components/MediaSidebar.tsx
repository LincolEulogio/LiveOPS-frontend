'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FolderOpen,
  Play,
  Search,
  Film,
  Music,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Activity,
  ArrowUpRight,
  Upload,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import { showConfirm, showAlert } from '@/shared/utils/swal';
import { apiClient } from '@/shared/api/api.client';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadThing } from '@/shared/hooks/useUploadThing';

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT';
  size: number;
  mimeType: string;
  productionId: string;
  createdAt: string;
  aiMetadata?: {
    tags: string[];
    description: string;
    colors?: string[];
  };
}

const TYPE_ICON = {
  VIDEO: Film,
  AUDIO: Music,
  IMAGE: ImageIcon,
  DOCUMENT: FolderOpen,
};

const TYPE_COLOR = {
  VIDEO: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  AUDIO: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  IMAGE: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  DOCUMENT: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function mimeToAssetType(mime: string): 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' {
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime.startsWith('audio/')) return 'AUDIO';
  if (mime.startsWith('image/')) return 'IMAGE';
  return 'DOCUMENT';
}

export const MediaSidebar = ({ productionId }: { productionId?: string }) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'VIDEO' | 'AUDIO' | 'IMAGE'>('all');
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const pid = productionId ?? '';

  const { startUpload } = useUploadThing('assetUploader', {
    onUploadBegin() {
      setUploading(true);
      toast.loading('Subiendo archivos...', { id: 'ut-upload' });
    },
    async onClientUploadComplete(res) {
      toast.dismiss('ut-upload');
      if (!res?.length || !pid) {
        setUploading(false);
        return;
      }
      try {
        for (const file of res) {
          const assetType = mimeToAssetType(file.type ?? '');
          await apiClient.post<MediaAsset>(`/media/assets/${pid}`, {
            name: file.name,
            url: file.url,
            type: assetType,
            size: file.size,
            mimeType: file.type ?? 'application/octet-stream',
          });
        }
        toast.success(`${res.length} archivo(s) subido(s) ✓`);
        fetchAssets();
      } catch {
        toast.error('Error guardando en la base de datos');
      } finally {
        setUploading(false);
      }
    },
    onUploadError(err: Error) {
      toast.dismiss('ut-upload');
      toast.error(`Error al subir: ${err.message}`);
      setUploading(false);
    },
  });

  // Manual drag-and-drop
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragActive(false), []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      if (!pid) {
        toast.error('Sin producción seleccionada');
        return;
      }
      const files = Array.from(e.dataTransfer.files).filter(
        (f) =>
          f.type.startsWith('image/') || f.type.startsWith('video/') || f.type.startsWith('audio/')
      );
      if (files.length) startUpload(files);
    },
    [pid, startUpload]
  );

  const fetchAssets = async () => {
    if (!pid) return;
    setIsLoading(true);
    try {
      const data = await apiClient.get<MediaAsset[]>(`/media/assets/${pid}`);
      setAssets(data);
    } catch {
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [pid]);

  const handleDelete = async (id: string) => {
    const asset = assets.find((a) => a.id === id);
    const result = await showConfirm(
      `¿Eliminar "${asset?.name ?? 'asset'}"?`,
      'Este archivo será eliminado del sistema de medios permanentemente.',
      'Sí, eliminar'
    );
    if (!result.isConfirmed) return;
    try {
      await apiClient.delete(`/media/assets/${pid}/${id}`);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      showAlert('Eliminado', 'Asset eliminado correctamente.', 'success');
    } catch {
      showAlert('Error', 'No se pudo eliminar el asset.', 'error');
    }
  };

  const handleBrowseClick = () => {
    if (!pid) {
      toast.error('Selecciona una producción primero');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,audio/*';
    input.onchange = () => {
      if (input.files?.length) startUpload(Array.from(input.files));
    };
    input.click();
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div
      ref={dropRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'flex flex-col h-full bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] overflow-hidden relative group/sidebar transition-all shadow-xl',
        isDragActive &&
          'ring-2 ring-indigo-500/60 border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_50px_rgba(79,70,229,0.1)]'
      )}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-indigo-900/40 dark:bg-indigo-950/80 backdrop-blur-md rounded-[2.5rem] pointer-events-none"
          >
            <div className="w-24 h-24 rounded-3xl bg-indigo-500/20 border-2 border-dashed border-indigo-500/40 flex items-center justify-center shadow-2xl">
              <Upload size={40} className="text-indigo-600 dark:text-indigo-400 animate-bounce" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-[.25em]">
                Initialize Transfer
              </p>
              <p className="text-[10px] font-bold text-indigo-600/60 dark:text-indigo-300/40 uppercase mt-1">
                Release to broadcast files to cloud storage
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Scanline Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover/sidebar:opacity-100 transition-all duration-700" />

      {/* Premium Tactical Header */}
      <div className="p-6 sm:p-8 border-b border-card-border/50 bg-white/5 dark:bg-black/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover/sidebar:scale-110 group-hover/sidebar:opacity-10 transition-all duration-1000">
          <FolderOpen size={120} />
        </div>

        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <FolderOpen className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={10} className="text-indigo-500 animate-pulse" />
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">
                Resource Node
              </h2>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic leading-none tracking-tight">
              Asset <span className="text-indigo-600">Protocol</span>
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-widest leading-none">
                Cloud linked · {assets.length} items manifest
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchAssets}
          disabled={isLoading}
          className={cn(
            'relative z-10 p-4 bg-card-bg/80 border border-card-border rounded-xl text-muted-foreground hover:bg-indigo-600/10 hover:text-indigo-600 transition-all active:scale-90',
            isLoading && 'animate-spin text-indigo-600'
          )}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Enhanced Search & Tactical Filter */}
      <div className="p-6 space-y-4 border-b border-card-border/30 bg-black/5 dark:bg-black/10 shrink-0">
        <div className="relative group/search">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within/search:text-indigo-500 transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search resource matrix..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background/50 border border-card-border rounded-xl pl-12 pr-4 py-3.5 text-xs font-black tracking-widest text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all uppercase"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-background/40 rounded-2xl border border-card-border shadow-inner">
          {(['all', 'VIDEO', 'AUDIO', 'IMAGE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all relative overflow-hidden',
                filter === f
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              {f === 'all' ? 'Universal' : f}
              {filter === f && (
                <motion.div
                  layoutId="filter-active"
                  className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent pointer-events-none"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Asset Manifest */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-3 relative min-h-0 bg-white/5 dark:bg-transparent">
        <AnimatePresence mode="popLayout">
          {filteredAssets.map((asset) => {
            const Icon = TYPE_ICON[asset.type] ?? Film;
            const colorClass = TYPE_COLOR[asset.type] ?? '';
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key={asset.id}
                className="group/item flex items-center gap-4 p-4 bg-card-bg/40 border border-card-border/50 rounded-2xl hover:bg-indigo-600/4 hover:border-indigo-500/30 transition-all duration-300 shadow-sm"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all group-hover/item:scale-110',
                    colorClass,
                    'dark:bg-opacity-10 bg-opacity-20'
                  )}
                >
                  <Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-black text-foreground truncate uppercase tracking-tight group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors leading-none">
                      {asset.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border leading-none shadow-xs',
                        colorClass
                      )}
                    >
                      {asset.type}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-card-border" />
                    <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      {formatBytes(asset.size)}
                    </span>
                    {asset.aiMetadata?.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-lg uppercase leading-none"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {asset.aiMetadata?.description && (
                    <p className="text-[10px] text-muted-foreground/50 mt-2 italic leading-relaxed line-clamp-1 border-l border-card-border pl-2">
                      // {asset.aiMetadata.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 translate-x-4 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-300">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 active:scale-90 transition-all shadow-lg"
                    title="Play / View Resource"
                  >
                    <Play size={14} fill="currentColor" />
                  </a>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-3 bg-red-600/10 text-red-600 dark:text-red-400/60 hover:text-white dark:hover:text-white hover:bg-red-600 rounded-xl transition-all border border-red-500/20 active:scale-95"
                    title="Eliminate Node"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAssets.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/2 pointer-events-none" />
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative w-24 h-24 bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-3xl flex items-center justify-center shadow-2xl">
                <Film
                  size={48}
                  strokeWidth={1}
                  className="text-muted-foreground opacity-40 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="text-center relative z-10 max-w-sm px-6">
              <h3 className="text-lg font-black uppercase text-foreground/60 tracking-widest mb-2">
                Matrix Manifest Empty
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/40 leading-relaxed">
                Awaiting data stream. Drag and drop files here or initialize the manual upload
                protocol.
              </p>
            </div>
            <button
              className="px-8 py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-lg"
              onClick={handleBrowseClick}
            >
              Open Local Uplink
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/40">
            <RefreshCw className="w-10 h-10 animate-spin text-indigo-500/50 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[.3em]">Scanning Archives...</p>
          </div>
        )}
      </div>

      {/* Tactical Upload Footer */}
      <div className="p-6 border-t border-card-border/30 bg-black/5 dark:bg-black/10 shrink-0">
        <button
          onClick={handleBrowseClick}
          disabled={uploading || !pid}
          className={cn(
            'w-full py-5 flex items-center justify-center gap-3 border-2 border-dashed rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all group active:scale-[0.98] shadow-inner',
            uploading
              ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 cursor-wait animate-pulse'
              : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-solid hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20'
          )}
        >
          {uploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Transferring Packets...
            </>
          ) : (
            <>
              <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
              Initialize Manual Uplink
              <ArrowUpRight
                size={14}
                className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
