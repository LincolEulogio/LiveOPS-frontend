'use client';

import { useParams } from 'next/navigation';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { WebhookManager } from '@/features/notifications/components/WebhookManager';
import { Bell, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
    const params = useParams();
    const id = params.id as string;

    useProductionContextInitializer(id);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/productions/${id}`}
                        className="p-2 hover:bg-stone-800 rounded-lg text-stone-400 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Bell className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white ">Notification Settings</h1>
                    </div>
                </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-xl">
                <WebhookManager productionId={id} />
            </div>
        </div>
    );
}
