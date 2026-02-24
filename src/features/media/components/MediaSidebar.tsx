'use client';

import React, { useState, useEffect } from 'react';
import {
    FolderOpen, Play, Search,
    Film, Music, Image as ImageIcon,
    MoreVertical, RefreshCw, Plus
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import { apiClient } from '@/shared/api/api.client';

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
        toast.success(`Triggering ${asset.name}`);
        // Future: Call backend to load asset into Engine
    };

    return (
        <div className="flex flex-col h-full bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-card-border bg-card-bg/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FolderOpen size={18} className="text-indigo-400" />
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Asset Manager</h2>
                </div>
                <button
                    onClick={fetchAssets}
                    className={cn("p-1.5 hover:bg-card-border rounded-lg text-muted transition-all hover:text-foreground", isLoading && "animate-spin text-indigo-400")}
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* Search & Tabs */}
            <div className="p-4 space-y-4 border-b border-stone-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={14} />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted outline-none focus:border-indigo-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-1 p-1 bg-background rounded-lg border border-card-border">
                    {(['all', 'video', 'audio', 'image'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 py-1 text-[9px] font-black uppercase tracking-widest rounded transition-all",
                                filter === f ? "bg-card-border text-indigo-400 shadow-sm" : "text-muted hover:text-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
                {filteredAssets.map(asset => (
                    <div
                        key={asset.id}
                        className="group flex items-center gap-3 p-2 bg-background/40 border border-card-border rounded-xl hover:bg-card-bg/50 hover:border-indigo-500/20 transition-all cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-lg bg-card-bg border border-card-border flex items-center justify-center flex-shrink-0 text-muted group-hover:text-indigo-400 transition-colors">
                            {asset.type === 'video' && <Film size={18} />}
                            {asset.type === 'audio' && <Music size={18} />}
                            {asset.type === 'image' && <ImageIcon size={18} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate uppercase tracking-tight">{asset.name}</p>
                            <p className="text-[9px] font-medium text-muted uppercase tracking-widest italic">{asset.extension} • {(asset.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); triggerAsset(asset); }}
                                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                            >
                                <Play size={12} fill="currentColor" />
                            </button>
                            <button className="p-1.5 text-muted hover:text-foreground transition-colors">
                                <MoreVertical size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredAssets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                        <div className="p-4 bg-card-border/50 rounded-full mb-4">
                            <Film size={24} className="text-muted" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">No assets found</p>
                    </div>
                )}
            </div>

            {/* Footer / Upload Stub */}
            <div className="p-4 border-t border-card-border bg-background/50">
                <button className="w-full py-2.5 flex items-center justify-center gap-2 bg-background border border-dashed border-card-border rounded-xl text-[10px] font-black text-muted uppercase tracking-widest hover:border-indigo-500/50 hover:text-indigo-500 transition-all group">
                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                    Import Media
                </button>
            </div>
        </div>
    );
};
