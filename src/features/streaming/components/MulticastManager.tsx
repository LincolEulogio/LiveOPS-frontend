import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    ExternalLink,
    Settings2,
    Youtube,
    Twitch,
    Facebook,
    Globe,
    Play,
    Square,
    AlertCircle
} from 'lucide-react';
import { useStreamingDestinations } from '../hooks/useStreamingDestinations';
import { StreamingDestination } from '../types/streaming.types';

interface MulticastManagerProps {
    productionId: string;
}

export const MulticastManager: React.FC<MulticastManagerProps> = ({ productionId }) => {
    const {
        destinations,
        isLoading,
        createDestination,
        updateDestination,
        deleteDestination
    } = useStreamingDestinations(productionId);

    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState({
        name: '',
        platform: 'YOUTUBE',
        rtmpUrl: '',
        streamKey: '',
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createDestination(newData);
            setIsAdding(false);
            setNewData({ name: '', platform: 'YOUTUBE', rtmpUrl: '', streamKey: '' });
        } catch (err) {
            // Error handled in hook
        }
    };

    const toggleEnabled = (dest: StreamingDestination) => {
        updateDestination({ id: dest.id, data: { isEnabled: !dest.isEnabled } });
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform.toUpperCase()) {
            case 'YOUTUBE': return <Youtube className="text-red-500" size={18} />;
            case 'TWITCH': return <Twitch className="text-purple-500" size={18} />;
            case 'FACEBOOK': return <Facebook className="text-blue-500" size={18} />;
            default: return <Globe size={18} />;
        }
    };

    if (isLoading) return <div className="p-4 text-stone-500">Loading destinations...</div>;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Multicasting Destinos</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-white transition-colors flex items-center gap-2 text-xs font-bold"
                >
                    <Plus size={14} /> Add Target
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-stone-500 uppercase">Name</label>
                            <input
                                required
                                value={newData.name}
                                onChange={e => setNewData({ ...newData, name: e.target.value })}
                                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                placeholder="My Youtube Channel"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-stone-500 uppercase">Platform</label>
                            <select
                                value={newData.platform}
                                onChange={e => setNewData({ ...newData, platform: e.target.value })}
                                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="YOUTUBE">YouTube</option>
                                <option value="TWITCH">Twitch</option>
                                <option value="FACEBOOK">Facebook</option>
                                <option value="CUSTOM">Custom RTMP</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-500 uppercase">RTMP URL</label>
                        <input
                            required
                            value={newData.rtmpUrl}
                            onChange={e => setNewData({ ...newData, rtmpUrl: e.target.value })}
                            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            placeholder="rtmp://..."
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-500 uppercase">Stream Key</label>
                        <input
                            required
                            type="password"
                            value={newData.streamKey}
                            onChange={e => setNewData({ ...newData, streamKey: e.target.value })}
                            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            placeholder="****-****-****"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs transition-all">
                            Save Destination
                        </button>
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold py-2 rounded-lg text-xs transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {destinations.length === 0 && !isAdding && (
                    <div className="p-8 border-2 border-dashed border-stone-800 rounded-2xl flex flex-col items-center justify-center text-stone-600 gap-2">
                        <AlertCircle size={24} />
                        <span className="text-xs font-medium">No multicast targets configured</span>
                    </div>
                )}
                {destinations.map(dest => (
                    <div key={dest.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${dest.isActive ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-stone-900/40 border-stone-800 hover:border-stone-700'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dest.isActive ? 'bg-indigo-500/20' : 'bg-stone-800'}`}>
                                {getPlatformIcon(dest.platform)}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    {dest.name}
                                    {dest.isActive && (
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    )}
                                </h4>
                                <p className="text-[10px] text-stone-500 font-mono truncate max-w-[150px]">{dest.rtmpUrl}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleEnabled(dest)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${dest.isEnabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-stone-800 text-stone-500 border border-stone-700'}`}
                            >
                                {dest.isEnabled ? 'ENABLED' : 'DISABLED'}
                            </button>
                            <button
                                onClick={() => deleteDestination(dest.id)}
                                className="p-2 text-stone-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
