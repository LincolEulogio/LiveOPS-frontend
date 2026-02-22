'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { MemberPersonalView } from '@/features/intercom/components/MemberPersonalView';

export default function MemberPage() {
    const params = useParams();
    const productionId = params.id as string;
    const userId = params.userId as string;

    if (!productionId || !userId) return null;

    return <MemberPersonalView userId={userId} productionId={productionId} />;
}
