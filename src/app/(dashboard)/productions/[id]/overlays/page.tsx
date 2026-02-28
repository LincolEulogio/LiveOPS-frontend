'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { OverlayManager } from '@/features/overlays/components/OverlayManager';

import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, Layers, Zap } from 'lucide-react';
import Link from 'next/link';
import { Guard } from '@/shared/components/Guard';

export default function OverlaysPage() {
  const params = useParams();
  const productionId = params.id as string;

  useProductionContextInitializer(productionId);

  return (
    <Guard requiredPermissions={['production:control']}>
      <div className="max-w-[1800px] mx-auto space-y-6 sm:space-y-8 pb-24 mt-2 sm:mt-6 px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/productions/${productionId}`}
              className="p-3 bg-card-bg/60 border border-card-border rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-500/30 text-muted-foreground hover:text-indigo-600 transition-all group active:scale-90"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none mb-0.5">
                  Visual Pipeline
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  Dashboard
                </span>
                <span className="text-muted-foreground/20">/</span>
                <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                  Graphics <span className="text-indigo-600">&</span> Overlays
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-card-bg/60 backdrop-blur-md border border-card-border rounded-2xl shadow-sm">
            <Zap size={14} className="text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
              Render Node: <span className="text-indigo-500">ACTIVE</span>
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Decorative ambient light */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-indigo-600/5 blur-[100px] pointer-events-none" />

          <div className="bg-card-bg/40 backdrop-blur-3xl border border-card-border rounded-[2.5rem] p-1 overflow-hidden min-h-[700px] shadow-2xl relative z-10">
            <OverlayManager productionId={productionId} />
          </div>
        </div>
      </div>
    </Guard>
  );
}
