import { SocialDashboard } from '@/features/social/components/SocialDashboard';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function SocialPage({ params }: Props) {
    const { id } = await params;
    return (
        <div className="h-full">
            <SocialDashboard productionId={id} />
        </div>
    );
}
