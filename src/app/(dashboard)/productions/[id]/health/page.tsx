'use client';

import { useParams } from 'next/navigation';
import { HealthMonitor } from '@/features/health/components/HealthMonitor';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Guard } from '@/shared/components/Guard';

export default function HealthPage() {
  const params = useParams();
  const id = params.id as string;

  useProductionContextInitializer(id);

  return (
    <Guard requiredPermissions={['production:control']}>
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
                <Activity size={14} className="text-indigo-400" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  System Integrity
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground/60">Dashboard</span>
                <span className="text-white/20">/</span>
                <span className="text-sm font-black text-white uppercase italic">
                  Telemetry & Health
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase ">
              All Systems Operational
            </span>
          </div>
        </div>

        <div className="hover:scale-[1.01] transition-transform duration-700">
          <HealthMonitor productionId={id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Uptime', value: '4d 12h 32m', sub: 'Last restart: 25 Feb' },
            { label: 'Network Latency', value: '12ms', sub: 'Stable' },
            { label: 'Stream Dropped Frames', value: '0', sub: '100% Delivery' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#050508]/40 backdrop-blur-3xl border border-white/5 p-6 rounded-4xl"
            >
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-white italic mb-1">{stat.value}</p>
              <p className="text-[9px] font-bold text-indigo-400 uppercase">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </Guard>
  );
}
