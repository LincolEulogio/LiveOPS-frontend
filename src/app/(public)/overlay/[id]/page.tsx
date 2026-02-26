'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { overlayService } from '@/features/overlays/api/overlay.service';
import { OverlayRenderer } from '@/features/overlays/components/OverlayRenderer';
import { Loader2 } from 'lucide-react';
import { useSocket } from '@/shared/socket/socket.provider';

export default function PublicOverlayPage() {
    const params = useParams();
    const productionId = params.id as string;
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const { data: overlays, isLoading, error } = useQuery({
        queryKey: ['public-overlays', productionId],
        queryFn: async () => {
            return overlayService.getOverlays(productionId);
        },
        enabled: !!productionId,
    });

    useEffect(() => {
        if (!socket || !productionId) return;

        socket.emit('production.join', { productionId });

        socket.on('overlay.list_updated', () => {
            queryClient.invalidateQueries({ queryKey: ['public-overlays', productionId] });
        });

        return () => {
            socket.off('overlay.list_updated');
        };
    }, [socket, productionId, queryClient]);

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-transparent">
                <Loader2 className="animate-spin text-white/20" size={48} />
            </div>
        );
    }

    if (error || !overlays) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-red-500/10 text-red-500 font-mono text-xs text-center p-10">
                OVERLAY_ERROR: NO_CONNECTION_OR_INVALID_ID<br />
                ID: {productionId}
            </div>
        );
    }

    const activeOverlays = overlays.filter(o => o.isActive);

    return (
        <div className="w-screen h-screen bg-transparent overflow-hidden relative">
            {activeOverlays.map(overlay => (
                <div key={overlay.id} className="absolute inset-0 pointer-events-none">
                    <OverlayRenderer template={overlay} />
                </div>
            ))}

            {activeOverlays.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black uppercase text-white/5 tracking-[0.6em] italic text-center px-10">
                        Signal Stable. No active overlays for node {productionId.substring(0, 8)}...
                    </span>
                </div>
            )}
        </div>
    );
}
