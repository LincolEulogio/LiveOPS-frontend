'use client';

import React, { useRef, useEffect } from 'react';

interface PureVideoTileProps {
    userId: string;
    stream: MediaStream;
    name: string;
    isLocal?: boolean;
    isSpeaking?: boolean;
    isHandRaised?: boolean;
    isPinned?: boolean;
    onClick?: () => void;
}

export function PureVideoTile({ 
    userId, 
    stream, 
    name, 
    isLocal = false, 
    isSpeaking = false, 
    isHandRaised = false, 
    isPinned = false,
    onClick 
}: PureVideoTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && videoRef.current.srcObject !== stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const hasVideo = stream.getVideoTracks().some(t => t.enabled);
    const initials = (name || userId || '?')[0].toUpperCase();

    return (
        <div 
            onClick={onClick} 
            className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#0a0b16] border transition-all ${
                onClick ? 'cursor-pointer hover:border-violet-500/50' : ''
            } ${
                isPinned ? 'ring-2 ring-violet-500/60 border-violet-500/40' : 'border-white/5'
            }`}
        >
            {hasVideo ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]">
                    <div className="w-16 h-16 rounded-full bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                        <span className="text-xl font-black text-violet-300">{initials}</span>
                    </div>
                </div>
            )}

            {isHandRaised && (
                <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-bounce">
                    <span className="text-lg">✋</span>
                </div>
            )}

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-linear-to-t from-black/80 via-black/40 to-transparent flex items-center gap-2 z-10">
                <div className="flex flex-col min-w-0">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest truncate">
                        {name || 'Participant'} {isLocal && '(Tú)'}
                    </span>
                </div>
                {isSpeaking && (
                    <div className="ml-auto flex items-center gap-1">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full animate-[pulse_1s_infinite]" />
                        <div className="w-1 h-2 bg-emerald-500 rounded-full animate-[pulse_1.2s_infinite]" />
                        <div className="w-1 h-3 bg-emerald-500 rounded-full animate-[pulse_0.8s_infinite]" />
                    </div>
                )}
            </div>
        </div>
    );
}
