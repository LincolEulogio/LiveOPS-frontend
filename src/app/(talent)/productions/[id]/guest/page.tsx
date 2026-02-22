'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { GuestRoom } from '@/features/streaming/components/GuestRoom';

export default function GuestPage() {
    const params = useParams();
    const id = params.id as string;

    if (!id) return null;

    return (
        <div className="fixed inset-0 bg-stone-950">
            <GuestRoom productionId={id} />
        </div>
    );
}
