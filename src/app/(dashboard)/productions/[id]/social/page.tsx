import { SocialDashboard } from '@/features/social/components/SocialDashboard';

interface Props {
    params: {
        id: string;
    }
}

export default function SocialPage({ params }: Props) {
    return (
        <div className="h-full">
            <SocialDashboard productionId={params.id} />
        </div>
    );
}
