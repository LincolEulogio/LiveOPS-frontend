'use client';

import React from 'react';
import { Users, Monitor, VideoOff, MicOff, Signal } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface GuestStream {
    userId: string;
    userName: string;
    stream?: MediaStream;
    isAudioEnabled?: boolean;
    isVideoEnabled?: boolean;
    latency?: number;
}

interface Props {
    guests: GuestStream[];
}

export const GuestMonitor = ({ guests }: Props) => {
    return (
        <div className="flex flex-col h-full bg-stone-900/50 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-400" />
                    <h3 className="text-sm font-bold uppercase  text-stone-200">Remote Guests</h3>
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                    <span className="text-[10px] font-black text-emerald-500 uppercase">{guests.length} ACTIVE</span>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {guests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-stone-600 gap-4 opacity-50">
                        <Monitor size={48} />
                        <p className="text-xs font-bold uppercase er">No remote guests connected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {guests.map((guest) => (
                            <div key={guest.userId} className="relative aspect-video bg-black rounded-xl overflow-hidden border border-stone-700 group">
                                {guest.stream ? (
                                    <VideoPreview stream={guest.stream} muted={false} />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-stone-800">
                                        <VideoOff className="text-stone-600" size={32} />
                                    </div>
                                )}

                                {/* Info Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white uppercase ">{guest.userName}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex gap-0.5">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", guest.isAudioEnabled !== false ? "bg-emerald-500" : "bg-red-500")} />
                                                <div className={cn("w-1.5 h-1.5 rounded-full", guest.isVideoEnabled !== false ? "bg-emerald-500" : "bg-red-500")} />
                                            </div>
                                            <span className="text-[9px] font-mono text-stone-400">~{guest.latency || 45}ms</span>
                                        </div>
                                    </div>

                                    <button className="p-2 bg-stone-900/80 hover:bg-stone-800 rounded-lg border border-white/10 transition-colors opacity-0 group-hover:opacity-100">
                                        <Signal size={14} className="text-stone-300" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const VideoPreview = ({ stream, muted }: { stream: MediaStream; muted: boolean }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className="w-full h-full object-cover"
        />
    );
};
