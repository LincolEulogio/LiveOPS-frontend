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
                <History size={14} className="text-indigo-400" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  Immutable Ledger
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground/60">Dashboard</span>
                <span className="text-white/20">/</span>
                <span className="text-sm font-black text-white uppercase italic">
                  Audit Trails & Logs
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative group/search">
              <FileSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within/search:text-indigo-400 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search log matrix..."
                className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-white placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all uppercase w-[240px]"
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
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <Download size={14} />
              Export PDF
            </button>
          </div>
        </div>

        <div className="bg-[#050508]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1 overflow-hidden min-h-[700px]">
          <LogFeed logs={logs} isLoading={isLoading} />
        </div>
      </div>
    </Guard>
  );
}
