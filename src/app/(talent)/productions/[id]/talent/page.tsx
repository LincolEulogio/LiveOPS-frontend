'use client';

import { useParams } from 'next/navigation';
import { TalentView } from '@/features/talent/components/TalentView';

export default function TalentPage() {
    const params = useParams();
    const id = params.id as string;

    if (!id) return null;

    return <TalentView productionId={id} />;
}
