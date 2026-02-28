'use client';

import { useParams } from 'next/navigation';
import { HealthMonitor } from '@/features/health/components/HealthMonitor';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { Guard } from '@/shared/components/Guard';

export default function HealthPage() {
  const params = useParams();
  const id = params.id as string;

  useProductionContextInitializer(id);

  return (
    <Guard requiredPermissions={['production:control']}>
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
                  System Integrity
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  Dashboard
                </span>
                <span className="text-muted-foreground/20">/</span>
                <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                  Telemetry <span className="text-indigo-600">&</span> Health
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-card-bg/60 backdrop-blur-md border border-card-border rounded-2xl shadow-sm">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
              Systems: <span className="text-emerald-500">OPERATIONAL</span>
            </span>
          </div>
        </div>

        <div className="relative group/monitor">
          {/* Decorative ambient light */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-indigo-600/5 blur-[100px] pointer-events-none group-hover/monitor:bg-indigo-600/10 transition-colors duration-700" />

          <div className="transition-transform duration-700 hover:scale-[1.005]">
            <HealthMonitor productionId={id} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              label: 'Uptime',
              value: '4d 12h 32m',
              sub: 'Last restart: 25 Feb',
              color: 'text-indigo-600',
            },
            {
              label: 'Network Latency',
              value: '12ms',
              sub: 'Stable Stream',
              color: 'text-emerald-500',
            },
            {
              label: 'Stream Dropped Frames',
              value: '0',
              sub: '100% Delivery Rate',
              color: 'text-sky-500',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card-bg/40 backdrop-blur-3xl border border-card-border p-8 rounded-[2.5rem] relative overflow-hidden group/stat transition-all hover:bg-card-bg/60"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/stat:opacity-[0.08] transition-opacity">
                <Activity size={80} />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[.25em] mb-4">
                {stat.label}
              </p>
              <p className="text-3xl lg:text-4xl font-black text-foreground uppercase italic mb-2 tracking-tighter">
                {stat.value}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full animate-pulse',
                    stat.color.replace('text-', 'bg-')
                  )}
                />
                <p
                  className={cn(
                    'text-[9px] font-black uppercase tracking-widest opacity-60',
                    stat.color
                  )}
                >
                  {stat.sub}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-indigo-600/10 group-hover/stat:w-full transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </Guard>
  );
}
