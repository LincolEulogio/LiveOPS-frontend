import { AnalyticsDashboard } from '@/features/analytics/components/AnalyticsDashboard';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AnalyticsPage({ params }: Props) {
    const { id } = await params;
    return <AnalyticsDashboard productionId={id} />;
}
