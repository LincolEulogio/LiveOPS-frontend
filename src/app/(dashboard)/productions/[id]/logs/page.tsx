'use client';

import { useParams } from 'next/navigation';
import { LogFeed } from '@/features/analytics/components/LogFeed';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, History, FileSearch, Download } from 'lucide-react';
import Link from 'next/link';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { exportAuditLogPDF } from '@/shared/lib/export-audit-pdf';
import { toast } from 'sonner';
import { Guard } from '@/shared/components/Guard';

export default function LogsPage() {
  const params = useParams();
  const id = params.id as string;

  useProductionContextInitializer(id);
  const { logs, isLoading } = useAnalytics(id);

  return (
    <Guard requiredPermissions={['analytics:view']}>
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
                <History size={14} className="text-indigo-500" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none mb-0.5">
                  Immutable Ledger
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  Dashboard
                </span>
                <span className="text-muted-foreground/20">/</span>
                <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                  Audit <span className="text-indigo-600">Trails</span> & Logs
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative group/search flex-1 sm:w-[300px]">
              <FileSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-indigo-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search log matrix..."
                className="w-full bg-card-bg/60 backdrop-blur-md border border-card-border rounded-xl pl-12 pr-4 py-3.5 text-xs font-black text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all uppercase tracking-widest"
              />
            </div>
            <button
              onClick={() => {
                if (!logs?.length) {
                  toast.error('No hay logs para exportar');
                  return;
                }
                exportAuditLogPDF(logs as any, 'Producción');
                toast.success('PDF generado');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20 border border-indigo-400/30"
            >
              <Download size={16} />
              Export PDF Ledger
            </button>
          </div>
        </div>

        <div className="bg-card-bg/40 backdrop-blur-3xl border border-card-border rounded-[2.5rem] p-1 overflow-hidden min-h-[750px] shadow-2xl relative group/table">
          {/* Visual Scanline Effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover/table:opacity-100 transition-all duration-700 pointer-events-none z-20" />

          <LogFeed logs={logs || []} isLoading={isLoading} />
        </div>
      </div>
    </Guard>
  );
}
