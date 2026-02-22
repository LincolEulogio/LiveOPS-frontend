'use client';

import { useState } from 'react';
import { useProductions } from '@/features/productions/hooks/useProductions';
import { Guard } from '@/shared/components/Guard';
import Link from 'next/link';
import { Plus, Server, Video, AlertCircle, Trash2, Search, Edit2 } from 'lucide-react';
import { EngineType, ProductionStatus } from '@/features/productions/types/production.types';
import { useDeleteProduction } from '@/features/productions/hooks/useProductions';
import { showConfirm, showAlert } from '@/shared/utils/swal';

export default function ProductionsListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useProductions({
    page,
    limit: 10,
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

        <Guard requiredPermissions={['production:create']}>
          <Link
            href="/productions/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            <span>New Production</span>
          </Link>
        </Guard>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {['', 'SETUP', 'ACTIVE', 'ARCHIVED'].map((status) => (
            <button
              key={status || 'ALL'}
              onClick={() => {
                setPage(1);
                setStatusFilter(status);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-stone-900/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
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
                return (
                  <li className="p-16 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-stone-800/50 flex items-center justify-center text-stone-600">
                      <Plus size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-white font-medium">No productions found</h3>
                      <p className="text-stone-500 text-sm max-w-xs">
                        {statusFilter
                          ? `No productions matching the "${statusFilter.toLowerCase()}" status.`
                          : "Get started by creating your first live production."}
                      </p>
                    </div>
                    {!statusFilter && (
                      <Link
                        href="/productions/new"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-medium transition-all hover:scale-105"
                      >
                        Create Production
                      </Link>
                    )}
                  </li>
                );
              }
              return productions.map((production: any) => (
                <li key={production.id}>
                  <div className="flex items-center justify-between p-4 hover:bg-stone-800/50 transition-colors group">
                    <Link
                      href={`/productions/${production.id}`}
                      className="flex gap-4 items-center flex-1 min-w-0"
                    >
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
                    </Link>

                    <div className="flex items-center gap-4 ml-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(production.status)}`}
                      >
                        {production.status}
                      </span>

                      <Guard requiredPermissions={['production:manage']}>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/productions/${production.id}/edit`}
                            className="p-2 text-stone-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                            title="Edit Production"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(production.id, e)}
                            disabled={isDeleting}
                            className="p-2 text-stone-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete Production"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </Guard>
                    </div>
                  </div>
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
