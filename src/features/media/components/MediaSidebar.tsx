'use client';

import React, { useState, useEffect } from 'react';
import {
    FolderOpen, Play, Search,
    Film, Music, Image as ImageIcon,
    MoreVertical, RefreshCw, Plus,
    Activity, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import { apiClient } from '@/shared/api/api.client';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaAsset {
    id: string;
    name: string;
    type: 'video' | 'audio' | 'image';
    path: string;
    size: number;
    extension: string;
}

export const MediaSidebar = () => {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all');

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.get<MediaAsset[]>('/media/assets');
            setAssets(data);
        } catch (err) {
            console.error('Failed to fetch assets:', err);
            toast.error('Could not load media assets');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || a.type === filter;
        return matchesSearch && matchesFilter;
    });

    const triggerAsset = (asset: MediaAsset) => {
        toast.success(`Broadcasting ${asset.name}`);
        // Future: Call backend to load asset into Engine
    };

    return (
        <div className="flex flex-col h-full bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
            {/* Tactical Scanline */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse" />

            {/* Header */}
            <div className="p-6 border-b border-card-border/50 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                        <FolderOpen size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-foreground uppercase  leading-none mb-1.5">Asset Protocol</h2>
                        <span className="text-[9px] font-black text-muted uppercase  flex items-center gap-2">
                            <Activity size={10} className="text-emerald-500" />
                            Cloud Linked
                        </span>
                    </div>
                </div>
                <button
                    onClick={fetchAssets}
                    disabled={isLoading}
                    className={cn(
                        "p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-muted transition-all hover:text-indigo-400 active:scale-90",
                        isLoading && "animate-spin text-indigo-400"
                    )}
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* Tactical Search & Matrix Filter */}
            <div className="p-6 space-y-5 border-b border-card-border/30 bg-black/10">
                <div className="relative group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within/search:text-indigo-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search media matrix..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background/50 border border-card-border rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-foreground placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-inner uppercase "
                    />
                </div>

                <div className="flex items-center gap-1 p-1 bg-background/40 rounded-xl border border-card-border shadow-inner">
                    {(['all', 'video', 'audio', 'image'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 py-2 text-[9px] font-black uppercase  rounded-lg transition-all relative overflow-hidden",
                                filter === f
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                    : "text-muted hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            <span className="relative z-10">{f}</span>
                            {filter === f && (
                                <motion.div layoutId="media-filter" className="absolute inset-0 bg-white/10" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asset Grid / List */}
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-3 relative">
                <AnimatePresence mode="popLayout">
                    {filteredAssets.map(asset => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={asset.id}
                            className="group flex items-center gap-4 p-3 bg-white/[0.03] border border-white/5 rounded-[1.25rem] hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-background/60 border border-card-border flex items-center justify-center flex-shrink-0 text-muted group-hover:text-indigo-400 transition-all shadow-inner">
                                {asset.type === 'video' && <Film size={20} />}
                                {asset.type === 'audio' && <Music size={20} />}
                                {asset.type === 'image' && <ImageIcon size={20} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-foreground truncate uppercase  group-hover:text-indigo-400 transition-colors leading-none mb-1.5">{asset.name}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-indigo-400 uppercase  bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{asset.extension}</span>
                                    <span className="text-[9px] font-bold text-muted uppercase  opacity-60">{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); triggerAsset(asset); }}
                                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 active:scale-90"
                                >
                                    <Play size={14} fill="currentColor" />
                                </button>
                                <button className="p-2 text-muted hover:text-foreground hover:bg-white/10 rounded-xl transition-all">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredAssets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 gap-6">
                        <div className="p-6 bg-white/5 rounded-full border border-white/5 animate-pulse">
                            <Film size={32} className="text-muted" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase  text-muted mb-1">Matrix Empty</p>
                            <p className="text-[9px] font-bold uppercase  text-muted/60 leading-relaxed">No assets matching signature</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tactical Footer / Import Hub */}
            <div className="p-6 border-t border-card-border/30 bg-black/20">
                <button className="w-full py-4 flex items-center justify-center gap-3 bg-indigo-600/10 border border-dashed border-indigo-500/30 rounded-2xl text-[10px] font-black text-indigo-400 uppercase  hover:bg-indigo-600 hover:text-white hover:border-solid hover:border-indigo-500 transition-all group shadow-xl hover:shadow-indigo-600/20 active:scale-95">
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                    Initialize Node
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
            </div>
        </div>
    );
};
