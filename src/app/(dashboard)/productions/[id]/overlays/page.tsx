'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { OverlayManager } from '@/features/overlays/components/OverlayManager';

export default function OverlaysPage() {
    const params = useParams();
    const productionId = params.id as string;

    return (
        <div className="h-full bg-background overflow-y-auto">
            <OverlayManager productionId={productionId} />
        </div>
    );
}
