import { AnalyticsDashboard } from '@/features/analytics/components/AnalyticsDashboard';

interface Props {
    params: { id: string };
}

export default function AnalyticsPage({ params }: Props) {
    return <AnalyticsDashboard productionId={params.id} />;
}
