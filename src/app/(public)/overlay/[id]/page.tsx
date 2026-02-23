'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { overlayService } from '@/features/overlays/api/overlay.service';
import { OverlayRenderer } from '@/features/overlays/components/OverlayRenderer';
import { Loader2 } from 'lucide-react';

export default function PublicOverlayPage() {
    const params = useParams();
    const id = params.id as string;
    const productionId = "PUBLIC"; // The backend should allow fetching by ID without explicit productionId for public routes

    const { data: template, isLoading, error } = useQuery({
        queryKey: ['public-overlay', id],
        queryFn: async () => {
            // We'll use a direct fetch or a specific endpoint for public overlays
            // For now, let's assume we can fetch it if we have the ID
            return overlayService.getOverlay("all", id);
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-transparent">
                <Loader2 className="animate-spin text-white/20" size={48} />
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-red-500/10 text-red-500 font-mono text-xs">
                OVERLAY_NOT_FOUND_OR_ERROR: {id}
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-transparent overflow-hidden">
            <OverlayRenderer template={template} />
        </div>
    );
}
