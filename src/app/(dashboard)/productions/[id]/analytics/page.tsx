'use client';

import { useParams } from 'next/navigation';
import { AnalyticsDashboard } from '@/features/analytics/components/AnalyticsDashboard';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
    const params = useParams();
    const id = params.id as string;

    // Initialize context for this production
    useProductionContextInitializer(id);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Breadcrumbs / Back */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/productions/${id}`}
                    className="p-2 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-all shadow-lg"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Production Control</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-300">Dashboard</span>
                        <span className="text-stone-700">/</span>
                        <span className="text-sm font-bold text-white">Insights & Analytics</span>
                    </div>
                </div>
            </div>

            <AnalyticsDashboard productionId={id} />
        </div>
    );
}
