'use client';

import React, { useState, useEffect } from 'react';
import {
    FolderOpen, Play, Search,
    Film, Music, Image as ImageIcon,
    MoreVertical, RefreshCw, Plus
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import axios from 'axios';

interface MediaAsset {
    id: string;
    name: string;
    type: 'video' | 'audio' | 'image';
    path: string;
    size: number;
    extension: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const MediaSidebar = () => {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all');

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const resp = await axios.get(`${API_BASE_URL}/media/assets`);
            setAssets(resp.data);
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
        <div className="flex flex-col h-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-stone-800 bg-stone-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FolderOpen size={18} className="text-indigo-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Asset Manager</h2>
                </div>
                <button
                    onClick={fetchAssets}
                    className={cn("p-1.5 hover:bg-stone-800 rounded-lg text-stone-500 transition-all", isLoading && "animate-spin text-indigo-400")}
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
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-300 outline-none focus:border-indigo-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-lg border border-stone-800">
                    {(['all', 'video', 'audio', 'image'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 py-1 text-[9px] font-black uppercase tracking-widest rounded transition-all",
                                filter === f ? "bg-stone-800 text-indigo-400 shadow-sm" : "text-stone-600 hover:text-stone-400"
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
                        className="group flex items-center gap-3 p-2 bg-stone-950/40 border border-stone-800 rounded-xl hover:bg-stone-800/50 hover:border-stone-700 transition-all cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center flex-shrink-0 text-stone-600 group-hover:text-indigo-400 transition-colors">
                            {asset.type === 'video' && <Film size={18} />}
                            {asset.type === 'audio' && <Music size={18} />}
                            {asset.type === 'image' && <ImageIcon size={18} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-stone-300 truncate uppercase tracking-tight">{asset.name}</p>
                            <p className="text-[9px] font-medium text-stone-600 uppercase tracking-widest italic">{asset.extension} • {(asset.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); triggerAsset(asset); }}
                                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                            >
                                <Play size={12} fill="currentColor" />
                            </button>
                            <button className="p-1.5 text-stone-600 hover:text-white transition-colors">
                                <MoreVertical size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredAssets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                        <div className="p-4 bg-stone-800/50 rounded-full mb-4">
                            <Film size={24} className="text-stone-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-600">No assets found</p>
                    </div>
                )}
            </div>

            {/* Footer / Upload Stub */}
            <div className="p-4 border-t border-stone-800 bg-stone-950/50">
                <button className="w-full py-2.5 flex items-center justify-center gap-2 bg-stone-950 border border-dashed border-stone-700 rounded-xl text-[10px] font-black text-stone-500 uppercase tracking-widest hover:border-indigo-500/50 hover:text-indigo-400 transition-all group">
                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                    Import Media
                </button>
            </div>
        </div>
    );
};
