import { GuestDashboard } from '@/features/guest/components/GuestDashboard';

interface Props {
    params: {
        id: string;
    }
}

export default function GuestPage({ params }: Props) {
    return <GuestDashboard productionId={params.id} />;
}
