import React from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { VideoTile } from './VideoTile';

export function GridLayout({ tracks, pinnedId, raisedHands, onPin }: {
    tracks: TrackReferenceOrPlaceholder[];
    pinnedId: string | null;
    raisedHands: Set<string>;
    onPin: (id: string | null) => void;
}) {
    const n = tracks.length;
    const cols = n <= 1 ? 'grid-cols-1' : n <= 4 ? 'grid-cols-2' : 'grid-cols-3';
    const seen = new Set<string>();
    const unique = tracks.filter(t => { const k = `${t.participant.identity}:${t.source}`; if (seen.has(k)) return false; seen.add(k); return true; });
    return (
        <div className={`grid ${cols} gap-2 p-2 h-full`} style={{ gridAutoRows: '1fr' }}>
            {unique.map(t => (
                <VideoTile key={`${t.participant.identity}:${t.source}`} trackRef={t}
                    isPinned={pinnedId === t.participant.identity}
                    isHandRaised={raisedHands.has(t.participant.identity)}
                    onClick={() => onPin(pinnedId === t.participant.identity ? null : t.participant.identity)} />
            ))}
        </div>
    );
}
