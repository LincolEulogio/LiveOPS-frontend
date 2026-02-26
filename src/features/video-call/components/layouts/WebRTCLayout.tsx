'use client';

import React, { useState, useMemo } from 'react';
import { PureVideoTile } from './PureVideoTile';

interface WebRTCLayoutProps {
    participants: Map<string, { userId: string, stream: MediaStream, name: string }>;
    localUserId: string;
}

export function WebRTCLayout({ participants, localUserId }: WebRTCLayoutProps) {
    const [pinnedId, setPinnedId] = useState<string | null>(null);
    
    const participantList = useMemo(() => Array.from(participants.values()), [participants]);
    
    const featuredParticipant = useMemo(() => {
        if (pinnedId && participants.has(pinnedId)) return participants.get(pinnedId);
        // Default to first remote participant or local if alone
        return participantList.find(p => p.userId !== localUserId) || participantList[0];
    }, [participants, pinnedId, participantList, localUserId]);

    const stripParticipants = useMemo(() => {
        if (!featuredParticipant) return [];
        return participantList.filter(p => p.userId !== featuredParticipant.userId);
    }, [participantList, featuredParticipant]);

    if (participantList.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                Esperando participantes...
            </div>
        );
    }

    // Grid mode if more than 4 participants and no pin
    const useGrid = participantList.length > 4 && !pinnedId;

    if (useGrid) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 h-full">
                {participantList.map(p => (
                    <div key={p.userId} className="aspect-video">
                        <PureVideoTile 
                            {...p} 
                            isLocal={p.userId === localUserId}
                            isPinned={pinnedId === p.userId}
                            onClick={() => setPinnedId(pinnedId === p.userId ? null : p.userId)}
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex h-full gap-4 p-4">
            <div className="flex-1 min-w-0 h-full">
                {featuredParticipant && (
                    <PureVideoTile 
                        {...featuredParticipant} 
                        isLocal={featuredParticipant.userId === localUserId}
                        isPinned={true}
                        onClick={() => setPinnedId(null)}
                    />
                )}
            </div>
            
            {stripParticipants.length > 0 && (
                <div className="flex flex-col gap-4 w-60 shrink-0 overflow-y-auto pr-2 custom-scrollbar">
                    {stripParticipants.map(p => (
                        <div key={p.userId} className="h-40 shrink-0">
                            <PureVideoTile 
                                {...p} 
                                isLocal={p.userId === localUserId}
                                onClick={() => setPinnedId(p.userId)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
