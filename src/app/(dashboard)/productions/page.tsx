'use client';

import { useState } from 'react';
import { useProductions } from '@/features/productions/hooks/useProductions';
import { Guard } from '@/shared/components/Guard';
import Link from 'next/link';
import { Plus, Server, Video, AlertCircle } from 'lucide-react';
import { EngineType, ProductionStatus } from '@/features/productions/types/production.types';

export default function ProductionsListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useProductions({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const getStatusColor = (status: ProductionStatus) => {
    switch (status) {
      case ProductionStatus.ACTIVE:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case ProductionStatus.SETUP:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case ProductionStatus.ARCHIVED:
        return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
      default:
        return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
    }
  };

  const getEngineIcon = (engine: EngineType) => {
    if (engine === EngineType.OBS) return <Video size={16} className="text-blue-400" />;
    return <Server size={16} className="text-orange-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Productions</h1>
          <p className="text-stone-400 text-sm mt-1">Manage all multi-tenant live streams</p>
        </div>

        <Guard requiredPermissions={['manage_productions']}>
          <Link
            href="/productions/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            <span>New Production</span>
          </Link>
        </Guard>
      </div>

      <div className="mb-6 flex gap-2">
        {['', 'SETUP', 'ACTIVE', 'ARCHIVED'].map((status) => (
          <button
            key={status || 'ALL'}
            onClick={() => {
              setPage(1);
              setStatusFilter(status);
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === status
              ? 'bg-stone-800 text-white'
              : 'bg-stone-900/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-stone-900 rounded-xl w-full"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 flex gap-3">
          <AlertCircle className="shrink-0" />
          <p>Failed to load productions.</p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
          <ul className="divide-y divide-stone-800/50">
            {(() => {
              const productions = Array.isArray(data) ? data : (data?.data || []);
              if (productions.length === 0) {
                return <li className="p-8 text-center text-stone-500">No productions found.</li>;
              }
              return productions.map((production: any) => (
                <li key={production.id}>
                  <Link
                    href={`/productions/${production.id}`}
                    className="flex items-center justify-between p-4 hover:bg-stone-800/50 transition-colors group"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-lg bg-stone-950 flex items-center justify-center border border-stone-800">
                        {getEngineIcon(production.engineType)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                          {production.name}
                        </h3>
                        <p className="text-sm text-stone-500 truncate max-w-[200px] sm:max-w-sm">
                          {production.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(production.status)}`}
                      >
                        {production.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ));
            })()}
          </ul>

          {/* Pagination Controls */}
          {data && !Array.isArray(data) && data.meta?.lastPage > 1 && (
            <div className="p-4 border-t border-stone-800 flex justify-between items-center text-sm">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-stone-950 rounded border border-stone-800 disabled:opacity-50 hover:bg-stone-800 transition-colors"
              >
                Previous
              </button>
              <span className="text-stone-400">
                Page {data.meta.page} of {data.meta.lastPage}
              </span>
              <button
                disabled={page === data.meta.lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-stone-950 rounded border border-stone-800 disabled:opacity-50 hover:bg-stone-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
