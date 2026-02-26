'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FolderOpen, Play, Search,
    Film, Music, Image as ImageIcon,
    RefreshCw, Trash2,
    Activity, ArrowUpRight, Upload,
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
            if (!res?.length || !pid) { setUploading(false); return; }
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
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (!pid) { toast.error('Sin producción seleccionada'); return; }
        const files = Array.from(e.dataTransfer.files).filter(
            f => f.type.startsWith('image/') || f.type.startsWith('video/') || f.type.startsWith('audio/')
        );
        if (files.length) startUpload(files);
    }, [pid, startUpload]);

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

    useEffect(() => { fetchAssets(); }, [pid]);

    const handleDelete = async (id: string) => {
        const asset = assets.find(a => a.id === id);
        const result = await showConfirm(
            `¿Eliminar "${asset?.name ?? 'asset'}"?`,
            'Este archivo será eliminado del sistema de medios permanentemente.',
            'Sí, eliminar'
        );
        if (!result.isConfirmed) return;
        try {
            await apiClient.delete(`/media/assets/${pid}/${id}`);
            setAssets(prev => prev.filter(a => a.id !== id));
            showAlert('Eliminado', 'Asset eliminado correctamente.', 'success');
        } catch {
            showAlert('Error', 'No se pudo eliminar el asset.', 'error');
        }
    };

    const handleBrowseClick = () => {
        if (!pid) { toast.error('Selecciona una producción primero'); return; }
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,video/*,audio/*';
        input.onchange = () => { if (input.files?.length) startUpload(Array.from(input.files)); };
        input.click();
    };

    const filteredAssets = assets.filter(a => {
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
                "flex flex-col h-full bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] overflow-hidden relative group transition-all",
                isDragActive && "ring-2 ring-indigo-500/60 border-indigo-500/40 bg-indigo-500/5"
            )}
        >
            {/* Drag overlay */}
            <AnimatePresence>
                {isDragActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-indigo-950/80 backdrop-blur-md rounded-[2.5rem] pointer-events-none"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                            <Upload size={36} className="text-indigo-400 animate-bounce" />
                        </div>
                        <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Suelta los archivos aquí</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanline */}
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse" />

            {/* Header */}
            <div className="p-5 border-b border-card-border/50 bg-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                        <FolderOpen size={18} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-foreground uppercase leading-none mb-1">Asset Protocol</h2>
                        <span className="text-[9px] font-black text-muted uppercase flex items-center gap-1.5">
                            <Activity size={9} className="text-emerald-500" />
                            Cloud Linked · {assets.length} assets
                        </span>
                    </div>
                </div>
                <button
                    onClick={fetchAssets}
                    disabled={isLoading}
                    className={cn(
                        "p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-muted transition-all hover:text-indigo-400 active:scale-90",
                        isLoading && "animate-spin text-indigo-400"
                    )}
                >
                    <RefreshCw size={13} />
                </button>
            </div>

            {/* Search & Filter */}
            <div className="p-4 space-y-3 border-b border-card-border/30 bg-black/10 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                    <input
                        type="text"
                        placeholder="Search media matrix..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background/50 border border-card-border rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-foreground placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all uppercase"
                    />
                </div>

                <div className="flex items-center gap-1 p-1 bg-background/40 rounded-xl border border-card-border">
                    {(['all', 'VIDEO', 'AUDIO', 'IMAGE'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all",
                                filter === f ? "bg-indigo-600 text-white" : "text-muted hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-2 relative min-h-0">
                <AnimatePresence mode="popLayout">
                    {filteredAssets.map(asset => {
                        const Icon = TYPE_ICON[asset.type] ?? Film;
                        const colorClass = TYPE_COLOR[asset.type] ?? '';
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={asset.id}
                                className="group flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-2xl hover:bg-white/7 hover:border-indigo-500/20 transition-all"
                            >
                                <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", colorClass)}>
                                    <Icon size={14} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-foreground truncate uppercase group-hover:text-indigo-400 transition-colors leading-none mb-1">
                                        {asset.name}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[8px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                            {asset.type}
                                        </span>
                                        <span className="text-[8px] font-bold text-muted/60">{formatBytes(asset.size)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <a
                                        href={asset.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-90 transition-all"
                                    >
                                        <Play size={11} fill="currentColor" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAssets.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-4 opacity-40">
                        <div className="p-5 bg-white/5 rounded-full border border-white/5">
                            <Film size={26} className="text-muted" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted mb-1">Matrix Empty</p>
                            <p className="text-[9px] font-bold uppercase text-muted/60">Arrastra archivos o usa Upload</p>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Upload Footer */}
            <div className="p-4 border-t border-card-border/30 bg-black/20 shrink-0">
                <button
                    onClick={handleBrowseClick}
                    disabled={uploading || !pid}
                    className={cn(
                        "w-full py-4 flex items-center justify-center gap-3 border border-dashed rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all group active:scale-95",
                        uploading
                            ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400 cursor-wait"
                            : "bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-solid hover:border-indigo-500"
                    )}
                >
                    {uploading ? (
                        <>
                            <div className="w-3 h-3 rounded-full border-2 border-indigo-300/30 border-t-indigo-300 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload size={14} className="group-hover:scale-110 transition-transform" />
                            + Upload Asset
                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
