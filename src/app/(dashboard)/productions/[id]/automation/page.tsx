'use client';

import { useParams } from 'next/navigation';
import { AutomationDashboard } from '@/features/automation/components/AutomationDashboard';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Guard } from '@/shared/components/Guard';

export default function AutomationPage() {
  const params = useParams();
  const id = params.id as string;

  // Initialize context for this production
  useProductionContextInitializer(id);

  return (
    <Guard requiredPermissions={['automation:manage']}>
      <div className="max-w-[1800px] mx-auto space-y-6 sm:space-y-8 pb-24 mt-2 sm:mt-6 px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/productions/${id}`}
              className="p-3 bg-card-bg/60 border border-card-border rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-500/30 text-muted-foreground hover:text-indigo-600 transition-all group active:scale-90"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none mb-0.5">
                  Production Control
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  Dashboard
                </span>
                <span className="text-muted-foreground/20">/</span>
                <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                  Logic <span className="text-indigo-600">Engine</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <AutomationDashboard productionId={id} />
      </div>
    </Guard>
  );
}
