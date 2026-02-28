'use client';

import { useParams } from 'next/navigation';
import { MediaSidebar } from '@/features/media/components/MediaSidebar';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, FolderOpen, Upload } from 'lucide-react';
import Link from 'next/link';

export default function MediaPage() {
  const params = useParams();
  const id = params.id as string;

  useProductionContextInitializer(id);

  return (
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
                Cloud Assets
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                Dashboard
              </span>
              <span className="text-muted-foreground/20">/</span>
              <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                Media <span className="text-indigo-600">&</span> Storage
              </h1>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20 border border-indigo-400/30">
          <Upload size={18} />
          Engage Upload
        </button>
      </div>

      <div className="relative">
        {/* Decorative ambient light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-indigo-600/5 blur-[100px] pointer-events-none" />

        <div className="bg-card-bg/40 backdrop-blur-3xl border border-card-border rounded-[2.5rem] p-1 overflow-hidden min-h-[700px] shadow-2xl relative z-10">
          <MediaSidebar productionId={id} />
        </div>
      </div>
    </div>
  );
}
