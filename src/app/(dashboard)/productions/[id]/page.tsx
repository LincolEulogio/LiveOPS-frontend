'use client';

import { useParams } from 'next/navigation';
import { useProduction } from '@/features/productions/hooks/useProductions';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { StreamingDashboard } from '@/features/streaming/components/StreamingDashboard';
import { EngineType } from '@/features/streaming/types/streaming.types';
import { AlertCircle, Server, Settings, Users, Video, Layout } from 'lucide-react';
import Link from 'next/link';
import { Guard } from '@/shared/components/Guard';
import { TimelineContainer } from '@/features/timeline/components/TimelineContainer';
import { IntercomPanel } from '@/features/chat/components/IntercomPanel';

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
          className="px-4 py-2 bg-stone-950 text-white rounded hover:bg-stone-800 transition-colors"
        >
          Return to List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-stone-950 rounded border border-stone-800">
              {production.engineType === EngineType.OBS ? (
                <Video className="text-blue-400" size={24} />
              ) : (
                <Server className="text-orange-400" size={24} />
              )}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{production.name}</h1>
          </div>
          <p className="text-stone-400 max-w-2xl text-sm">
            {production.description || 'No description provided.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/productions/${id}/edit`}
            className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl hover:bg-stone-800 transition-all text-stone-400 hover:text-white"
            title="Edit Production"
          >
            <Settings size={20} />
          </Link>
          <span className="px-3 py-1 bg-stone-950 border border-stone-800 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-300">
            {production.engineType}
          </span>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {production.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content: Dashboard */}
        <div className="xl:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layout size={20} className="text-indigo-400" />
                Live Dashboard
              </h2>
            </div>

            <StreamingDashboard productionId={id} engineType={production.engineType as any} />
          </section>

          <section>
            <TimelineContainer productionId={id} />
          </section>
        </div>

        {/* Sidebar: Utils & Team */}
        <div className="space-y-8 h-full">
          <section className="h-[500px]">
            <IntercomPanel productionId={id} />
          </section>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-stone-200">
              <Users className="text-indigo-400" size={20} />
              <h2 className="text-lg font-semibold">Team Management</h2>
            </div>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Manage operators and producers assigned to this environment.
            </p>
            <Guard requiredPermissions={['manage_team']}>
              <Link
                href={`/productions/${id}/team`}
                className="block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-600/10"
              >
                Open Team Manager
              </Link>
            </Guard>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-stone-200">
              <Settings className="text-stone-400" size={20} />
              <h2 className="text-lg font-semibold">Engine Config</h2>
            </div>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Configure connection parameters for {production.engineType}.
            </p>
            <Guard requiredPermissions={['manage_engine']}>
              <button className="w-full text-center px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-sm font-semibold rounded-lg transition-all">
                Settings
              </button>
            </Guard>
          </div>
        </div>
      </div>
    </div>
  );
}
