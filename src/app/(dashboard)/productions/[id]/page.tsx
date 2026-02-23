'use client';

import { useParams } from 'next/navigation';
import { useProduction } from '@/features/productions/hooks/useProductions';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { StreamingDashboard } from '@/features/streaming/components/StreamingDashboard';
import { EngineType } from '@/features/streaming/types/streaming.types';
import { AlertCircle, Server, Settings, Users, Video, Layout, Zap, BarChart3, FileText, Monitor, Share2, Bell, Activity, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Guard } from '@/shared/components/Guard';
import { TimelineContainer } from '@/features/timeline/components/TimelineContainer';
import { IntercomPanel } from '@/features/chat/components/IntercomPanel';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { ScriptEditor } from '@/features/script/components/ScriptEditor';
import { SocialManager } from '@/features/social/components/SocialManager';
import { PeripheralManager } from '@/features/peripherals/components/PeripheralManager';
import { HealthMonitor } from '@/features/streaming/components/HealthMonitor';
import { MediaSidebar } from '@/features/media/components/MediaSidebar';

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-indigo-400" />
                Guion Vivo
              </h2>
              <div className="flex items-center gap-2">
                <Link
                  href={`/productions/${id}/script`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-[10px] font-bold text-stone-300 uppercase tracking-widest hover:bg-stone-800 hover:border-indigo-500/30 transition-all shadow-lg"
                >
                  <FileText size={14} className="text-indigo-400" />
                  Preparar Guion
                </Link>
                <Link
                  href={`/productions/${id}/prompter`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-[10px] font-bold text-stone-300 uppercase tracking-widest hover:bg-stone-800 hover:border-emerald-500/30 transition-all shadow-lg"
                >
                  <Monitor size={14} className="text-emerald-400" />
                  Teleprompter
                </Link>
                <Link
                  href={`/productions/${id}/room`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                >
                  <Users size={14} />
                  Green Room
                </Link>
              </div>
            </div>
            <div className="h-[600px]">
              <ScriptEditor productionId={id} />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 size={20} className="text-indigo-400" />
                Social Media Feed
              </h2>
            </div>
            <div className="h-[400px]">
              <SocialManager productionId={id} />
            </div>
          </section>

          <section>
            <TimelineContainer productionId={id} />
          </section>

          <section>
            <HealthMonitor productionId={id} />
          </section>
        </div>

        {/* Sidebar: Utils & Team */}
        <div className="space-y-8 h-full">
          <section className="h-[500px]">
            <MediaSidebar />
          </section>

          <section className="h-[500px]">
            <IntercomPanel productionId={id} />
          </section>

          <section>
            <PeripheralManager productionId={id} />
          </section>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-stone-200">
                <Users className="text-indigo-400" size={20} />
                <h2 className="text-lg font-semibold">Team Management</h2>
              </div>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400">
                {production.users?.length || 0} MEMBERS
              </span>
            </div>

            <div className="space-y-4 mb-8">
              {production.users?.slice(0, 3).map((u: any) => (
                <div key={u.userId} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-500 group-hover:border-indigo-500/50 transition-colors">
                    {u.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-200 truncate">{u.user.name || u.user.email}</p>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">{u.role.name}</p>
                  </div>
                </div>
              ))}
              {(!production.users || production.users.length === 0) && (
                <p className="text-xs text-stone-600 italic">No members assigned yet.</p>
              )}
              {production.users && production.users.length > 3 && (
                <p className="text-[10px] text-stone-500 font-medium pl-11">
                  + {production.users.length - 3} more members
                </p>
              )}
            </div>

            <Guard requiredPermissions={['production:manage']}>
              <Link
                href={`/productions/${id}/team`}
                className="block w-full text-center px-4 py-2.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all hover:border-indigo-500/30"
              >
                Manage Team
              </Link>
            </Guard>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-stone-200">
              <Zap className="text-indigo-400" size={20} />
              <h2 className="text-lg font-semibold">Automation</h2>
            </div>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Create rules to trigger actions automatically on specific events.
            </p>
            <Link
              href={`/productions/${id}/automation`}
              className="block w-full text-center px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Open Engine
            </Link>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-stone-200">
              <Share2 className="text-pink-500" size={20} />
              <h2 className="text-lg font-semibold">Social & Moderation</h2>
            </div>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Moderate live chats and inject fan comments directly to on-air graphics.
            </p>
            <Link
              href={`/productions/${id}/social`}
              className="block w-full text-center px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Open Social Inbox
            </Link>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-stone-200">
              <BarChart3 className="text-indigo-400" size={20} />
              <h2 className="text-lg font-semibold">Analytics</h2>
            </div>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Generate post-show reports and review livestream telemetry.
            </p>
            <Link
              href={`/productions/${id}/analytics`}
              className="block w-full text-center px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-sm font-semibold rounded-lg transition-all"
            >
              View Dashboards
            </Link>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-stone-200">
              <Bell className="text-emerald-400" size={20} />
              <h2 className="text-lg font-semibold">Notifications & Alerts</h2>
            </div>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Connect external platforms like Slack or Discord to receive critical health alerts.
            </p>
            <Link
              href={`/productions/${id}/notifications`}
              className="block w-full text-center px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Configure Webhooks
            </Link>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-stone-200">
              <Settings className="text-stone-400" size={20} />
              <h2 className="text-lg font-semibold">Engine Config</h2>
            </div>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Configure connection parameters for {production.engineType}.
            </p>
            <Guard requiredPermissions={['production:manage']}>
              <Link
                href={`/productions/${id}/edit`}
                className="block w-full text-center px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-white text-sm font-semibold rounded-lg transition-all"
              >
                Settings
              </Link>
            </Guard>
          </div>
        </div>
      </div>
      <ChatPanel productionId={id} />
    </div >
  );
}
