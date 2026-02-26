import React from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { VideoTile } from './VideoTile';

export function SpotlightLayout({ featured, strip, pinnedId, raisedHands, onPin }: {
    featured: TrackReferenceOrPlaceholder | null;
    strip: TrackReferenceOrPlaceholder[];
    pinnedId: string | null;
    raisedHands: Set<string>;
    onPin: (id: string | null) => void;
}) {
    return (
        <div className="flex h-full gap-2 p-2">
            {/* Left thumbnail strip */}
            {strip.length > 0 && (
                <div className="flex flex-col gap-2 w-40 shrink-0 overflow-y-auto">
                    {strip.map(t => (
                        <div key={`${t.participant.identity}:${t.source}`} className="h-[100px] shrink-0">
                            <VideoTile
                                trackRef={t}
                                isPinned={pinnedId === t.participant.identity}
                                isHandRaised={raisedHands.has(t.participant.identity)}
                                onClick={() => onPin(pinnedId === t.participant.identity ? null : t.participant.identity)}
                            />
                        </div>
                    ))}
                </div>
            )}
            {/* Featured */}
            <div className="flex-1 min-w-0 h-full">
                {featured
                    ? <VideoTile
                        trackRef={featured}
                        isPinned={pinnedId === featured.participant.identity}
                        isHandRaised={raisedHands.has(featured.participant.identity)}
                        onClick={() => onPin(pinnedId === featured.participant.identity ? null : featured.participant.identity)}
                    />
                    : <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">Sin participantes</div>
                }
            </div>
        </div>
    );
}
