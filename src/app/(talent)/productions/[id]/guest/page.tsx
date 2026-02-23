import { GuestDashboard } from '@/features/guest/components/GuestDashboard';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function GuestPage({ params }: Props) {
    const { id } = await params;
    return <GuestDashboard productionId={id} />;
}
