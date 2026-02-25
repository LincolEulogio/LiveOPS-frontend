'use client';

import { useState } from 'react';
import { useProductions } from '@/features/productions/hooks/useProductions';
import { Guard } from '@/shared/components/Guard';
import Link from 'next/link';
import { Plus, Server, Video, AlertCircle, Trash2, Search, Edit2, Activity, Filter, ArrowRight, Zap, Globe } from 'lucide-react';
import { EngineType, ProductionStatus } from '@/features/productions/types/production.types';
import { useDeleteProduction } from '@/features/productions/hooks/useProductions';
import { showConfirm, showAlert } from '@/shared/utils/swal';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductionsListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useProductions({
    page,
    limit: 12, // Increased for a nice grid on larger screens
    status: statusFilter || undefined,
    search: searchTerm || undefined
  });

  const { mutateAsync: deleteProduction, isPending: isDeleting } = useDeleteProduction();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await showConfirm(
      '¿Eliminar producción?',
      'Esta acción ocultará la producción de la lista. Podrá ser recuperada por un administrador.',
      'Sí, eliminar'
    );

    if (result.isConfirmed) {
      try {
        await deleteProduction(id);
        showAlert('¡Eliminado!', 'La producción ha sido eliminada correctamente.', 'success');
      } catch (err: any) {
        showAlert('Error', err.message || 'No se pudo eliminar la producción.', 'error');
      }
    }
  };

  const getStatusStyle = (status: ProductionStatus) => {
    switch (status) {
      case ProductionStatus.ACTIVE:
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case ProductionStatus.SETUP:
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case ProductionStatus.ARCHIVED:
        return 'text-muted border-card-border/50 bg-white/5';
      default:
        return 'text-muted border-card-border/50 bg-white/5';
    }
  };

  const getEngineIcon = (engine: EngineType) => {
    if (engine === EngineType.OBS) return <Video size={20} className="text-blue-400" />;
    return <Server size={20} className="text-orange-400" />;
  };

  return (
    <div className="w-full space-y-10 p-4">

      {/* Tactical Page Header */}
      <div className="flex flex-col min-[1100px]:flex-row justify-between items-start min-[1100px]:items-center gap-8 bg-card-bg/60 backdrop-blur-3xl border border-card-border p-8 md:p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Globe size={180} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] border border-indigo-400/20 group-hover:rotate-6 transition-transform">
            <Zap size={32} className="text-white" fill="currentColor" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-none mb-3 text-slate-900 dark:text-white">Productions Hub</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow-inner flex items-center gap-2">
                <Activity size={10} className="animate-pulse" /> Global Control Surface
              </span>
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] flex items-center gap-2 opacity-60">
                Multi-Tenant Infrastructure Enabled
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full lg:w-auto">
          <Guard requiredPermissions={['production:create']}>
            <Link
              href="/productions/new"
              className="flex items-center justify-center gap-4 bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.03] active:scale-95 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              Initialize Node
            </Link>
          </Guard>
        </div>
      </div>

      {/* Advanced Filter Matrix */}
      <div className="flex flex-col xl:flex-row gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] shadow-inner">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search production matrix by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full bg-background/50 border border-card-border/60 rounded-2xl py-4.5 pl-14 pr-6 text-sm font-bold text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all uppercase tracking-tight shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-background/40 rounded-2xl border border-card-border/60 shadow-inner">
          <div className="px-4 py-2 flex items-center gap-3 border-r border-card-border/50 mr-2">
            <Filter size={14} className="text-muted" />
            <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Filter:</span>
          </div>
          {['', 'SETUP', 'ACTIVE', 'ARCHIVED'].map((status) => (
            <button
              key={status || 'ALL'}
              onClick={() => {
                setPage(1);
                setStatusFilter(status);
              }}
              className={cn(
                "px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all whitespace-nowrap border relative overflow-hidden group",
                statusFilter === status
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)]'
                  : 'bg-transparent border-transparent text-muted hover:text-foreground hover:bg-white/5'
              )}
            >
              <span className="relative z-10">{status || 'ALL SECTORS'}</span>
              {statusFilter === status && (
                <motion.div layoutId="status-bg" className="absolute inset-0 bg-white/10" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Workspace */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-[280px] bg-card-bg/40 border border-card-border rounded-[2.5rem] animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 text-red-400 p-10 rounded-[3rem] border border-red-500/20 flex flex-col items-center justify-center gap-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black uppercase tracking-widest mb-2">Downlink Failed</h3>
            <p className="text-xs font-bold opacity-60">Failed to establish secure connection with production registry.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {(() => {
              const productions = Array.isArray(data) ? data : (data?.data || []);
              if (productions.length === 0) {
                return (
                  <div className="col-span-full py-40 flex flex-col items-center text-center gap-10 bg-card-bg/20 backdrop-blur-xl border border-dashed border-card-border rounded-[4rem]">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600/5 flex items-center justify-center border border-white/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:blur-3xl transition-all" />
                      <Plus size={48} className="text-indigo-400 relative z-10" strokeWidth={1} />
                    </div>
                    <div className="space-y-4 max-w-md">
                      <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">No Productions Initialized</h3>
                      <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] leading-loose px-6 opacity-60">
                        {statusFilter
                          ? `The specified sector filter "${statusFilter.toLowerCase()}" returned no active nodes in current registry.`
                          : "Your multi-tenant workspace is currently unpopulated. Secure a new production node to begin operations."}
                      </p>
                    </div>
                    {!statusFilter && (
                      <Link
                        href="/productions/new"
                        className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.05] active:scale-95"
                      >
                        <Zap size={16} fill="currentColor" />
                        Initialize Sequence
                      </Link>
                    )}
                  </div>
                );
              }
              return productions.map((production: any) => (
                <Link
                  key={production.id}
                  href={`/productions/${production.id}`}
                  className="group relative h-[300px] flex flex-col bg-card-bg/60 backdrop-blur-2xl border border-card-border/60 rounded-[2.5rem] p-8 hover:bg-white/[0.04] hover:border-indigo-500/30 hover:-translate-y-2 transition-all duration-500 shadow-xl overflow-hidden"
                >
                  {/* Dynamic Corner Badge */}
                  <div className="absolute top-0 right-0 p-4">
                    <span className={cn(
                      "px-3 py-1.5 text-[9px] font-black rounded-xl border uppercase tracking-[0.1em] transition-all",
                      getStatusStyle(production.status)
                    )}>
                      {production.status}
                    </span>
                  </div>

                  <div className="flex-1 space-y-6 flex flex-col justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/20 transition-all duration-500">
                      {getEngineIcon(production.engineType)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tighter group-hover:text-indigo-400 transition-colors leading-none mb-2">
                        {production.name}
                      </h3>
                      <p className="text-[11px] font-bold text-muted uppercase tracking-widest line-clamp-2 leading-relaxed opacity-60">
                        {production.description || 'System node initialized with default operational parameters.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-card-border/40 mt-auto">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-background border-2 border-card-bg flex items-center justify-center text-[8px] font-black text-muted uppercase tracking-tighter shadow-xl">U</div>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-card-bg flex items-center justify-center text-[8px] font-black text-white uppercase tracking-tighter shadow-xl">+5</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Guard requiredPermissions={['production:manage']}>
                        <button
                          onClick={(e) => handleDelete(production.id, e)}
                          disabled={isDeleting}
                          className="p-3 bg-white/5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
                          title="Decommission Node"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Guard>
                      <div className="p-3 bg-white/5 text-muted group-hover:text-indigo-400 transition-colors">
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Scanline Glow */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ));
            })()}
          </div>

          {/* Tactical Pagination Hub */}
          {data && !Array.isArray(data) && data.meta?.lastPage > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] shadow-inner">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-full sm:w-auto px-8 py-3 bg-background border border-card-border rounded-xl text-[10px] font-black text-muted hover:text-indigo-400 hover:border-indigo-500/50 transition-all uppercase tracking-[0.2em] disabled:opacity-20 active:scale-95"
              >
                Previous Sector
              </button>
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-card-border/50" />
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">
                  Registry Frame <span className="text-foreground">{data.meta.page}</span> / <span className="text-foreground">{data.meta.lastPage}</span>
                </span>
                <div className="h-px w-8 bg-card-border/50" />
              </div>
              <button
                disabled={page === data.meta.lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-20 active:scale-95"
              >
                Next Sector
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
