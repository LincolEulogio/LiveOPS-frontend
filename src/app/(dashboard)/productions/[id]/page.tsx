'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useProduction } from '@/features/productions/hooks/useProductions';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { StreamingDashboard } from '@/features/streaming/components/StreamingDashboard';
import { EngineType } from '@/features/streaming/types/streaming.types';
import { AlertCircle, Server, Settings, Users, Video, Layout, Zap, BarChart3, FileText, Monitor, Share2, Bell, Activity, ExternalLink, ChevronRight } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

export default function ProductionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = React.useState<'overview' | 'streaming' | 'script' | 'social'>('overview');

  // 1. Initialize global context (updates Zustand layout & triggers WebSockets)
  useProductionContextInitializer(id);

  // 2. Fetch Production Details
  const { data: production, isLoading, error } = useProduction(id);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 animate-pulse space-y-8">
        <div className="h-24 bg-card-bg rounded-3xl w-full border border-card-border" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 bg-card-bg rounded-3xl border border-card-border" />
            <div className="h-96 bg-card-bg rounded-3xl border border-card-border" />
          </div>
          <div className="space-y-8">
            <div className="h-96 bg-card-bg rounded-3xl border border-card-border" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !production) {
    return (
      <div className="bg-red-500/10 text-red-400 p-12 rounded-[2.5rem] border border-red-500/20 max-w-2xl mx-auto mt-12 flex flex-col items-center text-center backdrop-blur-xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={48} className="opacity-80" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Production Not Found</h2>
        <p className="mb-8 font-medium opacity-60">
          The production you are looking for does not exist or you lack sufficient access permissions.
        </p>
        <Link
          href="/productions"
          className="px-8 py-3 bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
        >
          Return to Console
        </Link>
      </div>
    );
  }

  const TabButton = ({ id: tabId, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={cn(
        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
        activeTab === tabId
          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30"
          : "text-muted hover:text-foreground hover:bg-card-bg"
      )}
    >
      <Icon size={14} className={cn(activeTab === tabId ? "text-white" : "text-indigo-400")} />
      <span className="hidden sm:inline">{label}</span>
      {activeTab === tabId && (
        <motion.div
          layoutId="tab-active-pill"
          className="absolute inset-0 bg-white/10"
        />
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-[1800px] space-y-6 sm:space-y-8 pb-32 mt-2 sm:mt-6 px-4 sm:px-0">
      {/* Header - Glass Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center bg-card-bg/80 backdrop-blur-2xl border border-card-border p-6 sm:p-8 rounded-[2rem] shadow-2xl gap-6 overflow-hidden">
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
              {production.engineType === EngineType.OBS ? (
                <Video className="text-indigo-400" size={32} />
              ) : (
                <Server className="text-orange-400" size={32} />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-black text-foreground uppercase tracking-tighter leading-none mb-2 truncate">
                {production.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-background border border-card-border rounded-lg text-[10px] font-black uppercase tracking-widest text-muted">
                  {production.engineType}
                </span>
                <div className="w-1 h-1 rounded-full bg-muted/40" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {production.status}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href={`/productions/${id}/talent`}
              target="_blank"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-background border border-card-border text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-card-border transition-all shadow-lg active:scale-95"
            >
              <ExternalLink size={14} className="text-indigo-400" />
              Talent View
            </Link>
            <Link
              href={`/productions/${id}/edit`}
              className="p-3 bg-background border border-card-border rounded-2xl hover:bg-card-border transition-all text-muted hover:text-indigo-400 shadow-lg active:scale-95"
              title="Configuración del Motor"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile-Only Tab Navigation */}
      <div className="lg:hidden flex bg-card-bg/40 backdrop-blur-xl border border-card-border p-1.5 rounded-[1.5rem] shadow-xl overflow-x-auto no-scrollbar gap-1">
        <TabButton id="overview" label="Panel" icon={Layout} />
        <TabButton id="streaming" label="Broadcast" icon={Zap} />
        <TabButton id="script" label="Rundown" icon={FileText} />
        <TabButton id="social" label="Social" icon={Share2} />
      </div>

      <div className="grid grid-cols-1 min-[1280px]:grid-cols-12 gap-8">
        {/* Main Content Area - Bento Protocol Deck */}
        <div className={cn("min-[1280px]:col-span-8 min-[1440px]:col-span-9 space-y-8", activeTab !== 'overview' && 'block min-[1280px]:block')}>

          {/* Section: Streaming Dashboard (Primary) */}
          <section className={cn(activeTab !== 'streaming' && activeTab !== 'overview' && 'hidden lg:block')}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                  <Zap size={16} className="text-indigo-400" />
                </div>
                Broadcast Control
              </h2>
            </div>
            <StreamingDashboard productionId={id} engineType={production.engineType as any} />
          </section>

          {/* Section: Guion Vivo */}
          <section className={cn(activeTab !== 'script' && activeTab !== 'overview' && 'hidden lg:block')}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                  <FileText size={16} className="text-indigo-400" />
                </div>
                Live Rundown Script
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
                <Link
                  href={`/productions/${id}/prompter`}
                  className="flex items-center gap-2 px-4 py-2 bg-background border border-card-border rounded-xl text-[10px] font-black text-foreground uppercase tracking-widest hover:bg-card-border transition-all shadow-sm"
                >
                  <Monitor size={14} className="text-emerald-400" /> Teleprompter
                </Link>
                <Link
                  href={`/productions/${id}/team`}
                  className="flex items-center gap-2 px-4 py-2 bg-background border border-card-border rounded-xl text-[10px] font-black text-foreground uppercase tracking-widest hover:bg-card-border transition-all shadow-sm"
                >
                  <Users size={14} className="text-indigo-400" /> Team Editor
                </Link>
              </div>
            </div>
            <div className="h-[400px] sm:h-[650px] bg-card-bg/30 border border-card-border/50 rounded-[2rem] overflow-hidden shadow-inner">
              <ScriptEditor productionId={id} />
            </div>
          </section>

          {/* Section: Social Feed */}
          <section className={cn(activeTab !== 'social' && activeTab !== 'overview' && 'hidden lg:block')}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                  <Share2 size={16} className="text-pink-500" />
                </div>
                Social Media Manager
              </h2>
            </div>
            <div className="h-[450px] bg-card-bg/30 border border-card-border/50 rounded-[2rem] overflow-hidden shadow-2xl">
              <SocialManager productionId={id} />
            </div>
          </section>

          {/* Detailed Monitors Stacked at Bottom - Bento Intelligence Layer */}
          <div className={cn("grid grid-cols-1 min-[1500px]:grid-cols-2 gap-8", activeTab !== 'overview' && 'hidden min-[1280px]:grid')}>
            <TimelineContainer productionId={id} />
            <HealthMonitor productionId={id} />
          </div>
        </div>

        {/* Sidebar: Utils & Team - Sticky for Desktop (Bento Intelligence Column) */}
        <div className={cn("min-[1280px]:col-span-4 min-[1440px]:col-span-3 space-y-8", activeTab !== 'overview' && 'hidden min-[1280px]:block')}>
          <div className="lg:sticky lg:top-8 space-y-8 pb-20">
            {/* Sidebar Media */}
            <div className="h-[400px] lg:h-[450px]">
              <MediaSidebar />
            </div>

            {/* Intercom Quick Access */}
            <div className="h-[450px]">
              <IntercomPanel productionId={id} />
            </div>

            {/* Hardware/Peripherals */}
            <PeripheralManager productionId={id} />

            {/* Team Snapshot Card */}
            <div className="bg-card-bg/80 backdrop-blur-xl border border-card-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Users size={80} />
              </div>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-xs font-black text-muted uppercase tracking-[0.2em]">Live Team</h2>
                  <p className="text-lg font-black text-foreground uppercase tracking-tight">Active Crew</p>
                </div>
                <div className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  {production.users?.length || 0} Members
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {production.users?.slice(0, 4).map((u: any) => (
                  <div key={u.userId} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl transition-colors cursor-default border border-transparent hover:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-background border border-card-border flex items-center justify-center text-xs font-black text-indigo-400 shadow-inner">
                      {u.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground uppercase tracking-tight truncate">{u.user.name || u.user.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{u.role.name}</p>
                    </div>
                  </div>
                ))}
                {(!production.users || production.users.length === 0) && (
                  <div className="py-6 text-center border-2 border-dashed border-card-border rounded-2xl">
                    <p className="text-xs text-muted font-bold uppercase tracking-widest">No team assigned</p>
                  </div>
                )}
              </div>

              <Guard requiredPermissions={['production:manage']}>
                <Link
                  href={`/productions/${id}/team`}
                  className="flex items-center justify-center w-full px-4 py-4 bg-background border border-card-border text-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-500/50 shadow-lg active:scale-95"
                >
                  Manage Crew Access
                </Link>
              </Guard>
            </div>

            {/* Quick Links / Utility Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <Link href={`/productions/${id}/automation`} className="group">
                <div className="bg-card-bg/60 backdrop-blur-md border border-card-border rounded-[1.5rem] p-5 h-full transition-all hover:bg-card-bg hover:border-indigo-500/30 shadow-xl active:scale-95">
                  <Zap className="text-indigo-400 mb-4 group-hover:animate-pulse" size={20} />
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-1">Automation</h3>
                  <p className="text-[10px] text-muted-foreground font-bold leading-relaxed uppercase tracking-tight">Rules & Macros</p>
                </div>
              </Link>

              <Link href={`/productions/${id}/analytics`} className="group">
                <div className="bg-card-bg/60 backdrop-blur-md border border-card-border rounded-[1.5rem] p-5 h-full transition-all hover:bg-card-bg hover:border-pink-500/30 shadow-xl active:scale-95">
                  <BarChart3 className="text-pink-400 mb-4" size={20} />
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-1">Analytics</h3>
                  <p className="text-[10px] text-muted-foreground font-bold leading-relaxed uppercase tracking-tight">Post-Show Stats</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Chat for Quick Comms */}
      <div className="hidden sm:block">
        <ChatPanel productionId={id} />
      </div>
    </div >
  );
}
