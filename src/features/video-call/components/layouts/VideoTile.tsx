import React from 'react';
import { VideoTrack, isTrackReference } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';

export function VideoTile({ trackRef, onClick, isPinned, isHandRaised }: {
    trackRef: TrackReferenceOrPlaceholder;
    onClick?: () => void;
    isPinned?: boolean;
    isHandRaised?: boolean;
}) {
    const p = trackRef.participant;
    const hasVideo = isTrackReference(trackRef) && !trackRef.publication.isMuted;
    const initials = (p.name || p.identity || '?')[0].toUpperCase();
    return (
        <div onClick={onClick} className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#0b0c18] ${onClick ? 'cursor-pointer' : ''} ${isPinned ? 'ring-2 ring-violet-500/60' : 'border border-violet-500/10'}`}>
            {hasVideo
                ? <VideoTrack trackRef={trackRef as any} className="absolute inset-0 w-full h-full object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]">
                    <div className="w-16 h-16 rounded-full bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                        <span className="text-xl font-black text-violet-300">{initials}</span>
                    </div>
                </div>
            }
            {/* Top right hand raise indicator */}
            {isHandRaised && (
                <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-bounce">
                    <span className="text-lg">✋</span>
                </div>
            )}
            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1.5 z-10">
                <span className="text-white text-[11px] font-bold truncate">{p.name || p.identity}</span>
                {p.isSpeaking && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            </div>
        </div>
    );
}
