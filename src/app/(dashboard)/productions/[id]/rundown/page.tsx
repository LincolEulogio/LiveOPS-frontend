'use client';

import { useParams } from 'next/navigation';
import { TimelineContainer } from '@/features/timeline/components/TimelineContainer';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, List } from 'lucide-react';
import Link from 'next/link';
import { Guard } from '@/shared/components/Guard';

export default function RundownPage() {
  const params = useParams();
  const id = params.id as string;

  useProductionContextInitializer(id);

  return (
    <Guard requiredPermissions={['script:view']}>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 mt-4 px-4 sm:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/productions/${id}`}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 text-muted-foreground hover:text-white transition-all group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <List size={14} className="text-indigo-400" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  Global Escaleta
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground/60">Dashboard</span>
                <span className="text-white/20">/</span>
                <span className="text-sm font-black text-white uppercase italic">
                  Escaleta & Rundown
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-300 uppercase ">
              Live Protocol Sync Active
            </span>
          </div>
        </div>

        <div className="bg-[#050508]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1 overflow-hidden min-h-[700px]">
          <TimelineContainer productionId={id} />
        </div>
      </div>
    </Guard>
  );
}
