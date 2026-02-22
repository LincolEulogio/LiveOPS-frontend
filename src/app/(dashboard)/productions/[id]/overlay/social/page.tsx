'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { SocialOverlay } from '@/features/social/components/SocialOverlay';

export default function SocialOverlayPage() {
    const params = useParams();
    const id = params.id as string;

    if (!id) return null;

    return (
        <div className="fixed inset-0 bg-transparent">
            <SocialOverlay productionId={id} />
        </div>
    );
}
