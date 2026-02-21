'use client';

import { useParams } from 'next/navigation';
import { useProduction } from '@/features/productions/hooks/useProductions';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { AlertCircle, Server, Settings, Users, Video } from 'lucide-react';
import Link from 'next/link';
import { EngineType } from '@/features/productions/types/production.types';
import { Guard } from '@/shared/components/Guard';

export default function ProductionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // 1. Initialize global context (updates Zustand layout & triggers WebSockets)
  useProductionContextInitializer(id);

  // 2. Fetch Production Details
  const { data: production, isLoading, error } = useProduction(id);

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-8 bg-stone-800 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-stone-900 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !production) {
    return (
      <div className="bg-red-500/10 text-red-400 p-6 rounded-xl border border-red-500/20 max-w-2xl mx-auto mt-8 flex flex-col items-center text-center">
        <AlertCircle size={48} className="mb-4 opacity-80" />
        <h2 className="text-xl font-bold mb-2">Production Not Found</h2>
        <p className="mb-6">
          The production you are looking for does not exist or you lack access.
        </p>
        <Link
          href="/productions"
          className="px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
        >
          Return to List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-stone-950 rounded border border-stone-800">
              {production.engineType === EngineType.OBS ? (
                <Video className="text-blue-400" />
              ) : (
                <Server className="text-orange-400" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{production.name}</h1>
          </div>
          <p className="text-stone-400 max-w-2xl">
            {production.description || 'No description provided.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-stone-950 border border-stone-800 rounded-full text-xs font-semibold uppercase tracking-wider text-stone-300">
            {production.engineType}
          </span>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            {production.status}
          </span>
        </div>
      </div>

      {/* Tabs / Sub-navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Overview Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4 text-stone-200">
            <Users className="text-indigo-400" />
            <h2 className="text-lg font-semibold">Team Members</h2>
          </div>
          <p className="text-sm text-stone-400 mb-6">
            Manage operators, producers, and their specific roles for this stream.
          </p>
          <Guard requiredPermissions={['manage_team']}>
            <Link
              href={`/productions/${id}/team`}
              className="inline-block w-full text-center px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Manage Team
            </Link>
          </Guard>
        </div>

        {/* Engine Settings Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4 text-stone-200">
            <Settings className="text-stone-400" />
            <h2 className="text-lg font-semibold">Engine Config</h2>
          </div>
          <p className="text-sm text-stone-400 mb-6">
            Configure connection parameters (IP, Port, Password) for {production.engineType}.
          </p>
          <Guard requiredPermissions={['manage_engine']}>
            <button className="inline-block w-full text-center px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-sm font-medium rounded-lg transition-colors">
              Setup Connection
            </button>
          </Guard>
        </div>
      </div>
    </div>
  );
}
