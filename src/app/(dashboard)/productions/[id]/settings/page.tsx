'use client';

import { useParams } from 'next/navigation';
import { PeripheralManager } from '@/features/peripherals/components/PeripheralManager';
import { IntegrationsPanel } from '@/features/productions/components/IntegrationsPanel';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, Settings, Cpu } from 'lucide-react';
import Link from 'next/link';
import { Guard } from '@/shared/components/Guard';

export default function SettingsPage() {
  const params = useParams();
  const id = params.id as string;

  useProductionContextInitializer(id);

  return (
    <Guard requiredPermissions={['production:edit']}>
      <div className="max-w-[1800px] mx-auto space-y-8 sm:space-y-10 pb-24 mt-2 sm:mt-6 px-4 sm:px-8 lg:px-12">
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
                <Settings size={14} className="text-indigo-500" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none mb-0.5">
                  Node Configuration
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  Dashboard
                </span>
                <span className="text-muted-foreground/20">/</span>
                <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                  Hardware <span className="text-indigo-600">&</span> System Settings
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 group/status">
            <div className="flex items-center gap-3 px-6 py-3.5 bg-indigo-600/10 dark:bg-indigo-500/5 border border-indigo-500/20 rounded-2xl shadow-xl shadow-indigo-500/5 transition-all group-hover/status:border-indigo-500/40">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-sm rounded-full animate-pulse" />
                <Cpu size={16} className="text-indigo-500 relative z-10" />
              </div>
              <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Hardware Sync Active
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="bg-card-bg/40 backdrop-blur-3xl border border-card-border rounded-[3rem] overflow-hidden shadow-2xl relative group/matrix">
              {/* Visual Scanline Effect */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover/matrix:opacity-100 transition-all duration-700 pointer-events-none z-20" />

              <div className="p-10 pb-2 border-b border-card-border/50 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Hardware Matrix
                  </span>
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">
                  Device <span className="text-indigo-600">Matrix</span>
                </h3>
              </div>
              <div className="px-4 py-6 sm:p-4">
                <PeripheralManager productionId={id} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-card-bg/40 backdrop-blur-3xl border border-card-border rounded-[3rem] overflow-hidden shadow-2xl relative group/integrations">
              {/* Visual Scanline Effect */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover/integrations:opacity-100 transition-all duration-700 pointer-events-none z-20" />

              <div className="p-10 pb-2 border-b border-card-border/50 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Service Layer
                  </span>
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">
                  API <span className="text-indigo-600">&</span> Integrations
                </h3>
              </div>
              <div className="p-4 sm:p-5">
                <IntegrationsPanel productionId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Guard>
  );
}
