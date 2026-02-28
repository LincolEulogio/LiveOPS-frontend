'use client';

import React from 'react';
import { useStreamHealth, HealthStats } from '@/features/health/hooks/useStreamHealth';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Activity, Cpu, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface Props {
  productionId: string;
}

export const HealthMonitor = ({ productionId }: Props) => {
  const { lastStats, history, isHealthy } = useStreamHealth(productionId);

  if (!lastStats && history.length === 0) {
    return (
      <div className="p-20 bg-card-bg/40 backdrop-blur-3xl border border-card-border rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 bg-indigo-500/2 pointer-events-none" />
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-3xl flex items-center justify-center shadow-2xl">
            <Activity size={48} strokeWidth={1} className="text-indigo-500/50 animate-pulse" />
          </div>
        </div>
        <div className="relative z-10 max-w-sm">
          <h3 className="text-lg font-black uppercase text-foreground/60 tracking-[.25em] mb-2 text-center">
            Scanning Signal Matrix
          </h3>
          <p className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/40 leading-relaxed text-center">
            Awaiting telemetry downlink from production engine core. Synchronizing data manifest...
          </p>
        </div>
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute top-0 bottom-0 w-1/2 bg-indigo-600/40"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] overflow-hidden flex flex-col relative group/monitor shadow-2xl">
      {/* Visual Scanline Effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover/monitor:opacity-100 transition-all duration-700 pointer-events-none" />

      {/* Header */}
      <div className="p-8 sm:p-10 border-b border-card-border/50 bg-white/5 dark:bg-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover/monitor:scale-110 group-hover/monitor:opacity-10 transition-all duration-1000">
          <Activity size={120} />
        </div>

        <div className="relative z-10 flex items-center gap-5">
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-inner',
              isHealthy
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse'
            )}
          >
            <Activity size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap
                size={10}
                className={isHealthy ? 'text-emerald-500' : 'text-red-500 animate-pulse'}
              />
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">
                GFX Matrix Node
              </h2>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic leading-none tracking-tight">
              Stream <span className="text-indigo-600">Integrity</span>
            </h1>
            <div className="flex items-center gap-3 mt-1.5 text-[9px] font-black uppercase tracking-widest opacity-60">
              <div
                className={cn(
                  'w-2 h-2 rounded-full shadow-[0_0_8px]',
                  isHealthy
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-red-500 shadow-red-500/50 animate-ping'
                )}
              />
              Real-time Telemetry Uplink · {isHealthy ? 'Nominal' : 'Warning'}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'relative z-10 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all shadow-lg',
            isHealthy
              ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/30'
              : 'bg-red-600 text-white border-red-500 animate-pulse'
          )}
        >
          {isHealthy ? 'System Operational' : 'Protocol Degraded'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Panel: Metrics Grid */}
        <div className="lg:col-span-5 p-8 sm:p-10 space-y-6 border-b lg:border-b-0 lg:border-r border-card-border/50">
          <div className="bg-background/40 backdrop-blur-md border border-card-border/60 p-8 rounded-4xl relative overflow-hidden group/m">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <Cpu size={16} className="text-indigo-500" />
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  CPU Payload
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20 group-hover/m:bg-indigo-500 transition-colors shadow-sm" />
            </div>
            <p className="text-5xl font-black text-foreground uppercase italic tracking-tighter relative z-10">
              {lastStats?.cpuUsage !== undefined ? lastStats.cpuUsage.toFixed(1) : '--'}
              <span className="text-xl font-black text-muted-foreground/30 ml-2">%</span>
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600/5 group-hover/m:bg-indigo-600/20 transition-all duration-700" />
          </div>

          <div className="bg-background/40 backdrop-blur-md border border-card-border/60 p-8 rounded-4xl relative overflow-hidden group/m">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-amber-500" />
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  Effective Cadence
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20 group-hover/m:bg-amber-500 transition-colors shadow-sm" />
            </div>
            <p className="text-5xl font-black text-foreground uppercase italic tracking-tighter relative z-10">
              {lastStats?.fps !== undefined ? lastStats.fps.toFixed(0) : '--'}
              <span className="text-xl font-black text-muted-foreground/30 ml-2">FPS</span>
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-600/5 group-hover/m:bg-amber-600/20 transition-all duration-700" />
          </div>
        </div>

        {/* Right Panel: Chart Surface */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white/2 dark:bg-transparent relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity size={12} className="text-indigo-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Historical Flux Analysis
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 bg-indigo-500/40 rounded-full" />
              <div className="w-4 h-0.5 bg-indigo-500 rounded-full" />
              <div className="w-2 h-0.5 bg-indigo-500/40 rounded-full" />
            </div>
          </div>

          <div className="h-[280px] w-full rounded-4xl border border-card-border p-6 bg-black/10 dark:bg-black/20 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
              <Activity size={40} />
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(5, 5, 8, 0.95)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '16px',
                    fontSize: '10px',
                    backdropFilter: 'blur(20px)',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  }}
                  itemStyle={{ color: '#818cf8', fontWeight: '900' }}
                />
                <Area
                  type="monotone"
                  dataKey="cpuUsage"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCpu)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Urgent Alerts Hub */}
      {lastStats && lastStats.skippedFrames > 0 && (
        <div className="mx-8 sm:mx-10 mb-8 p-6 bg-red-600/10 border border-red-500/40 rounded-4xl flex items-center gap-6 animate-pulse relative overflow-hidden group/alert">
          <div className="absolute top-0 right-0 p-6 text-red-600/10 group-hover/alert:scale-110 transition-transform">
            <AlertCircle size={60} />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-[13px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight leading-none mb-1.5">
              Packet Loss Detected
            </p>
            <p className="text-[10px] font-black text-red-600/60 dark:text-red-400/60 uppercase tracking-widest">
              {lastStats.skippedFrames} frames dropped in current data cycle manifest.
            </p>
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="p-5 border-t border-card-border/30 bg-black/5 dark:bg-black/10 flex justify-center items-center gap-3">
        <div className="flex items-center gap-2.5 opacity-40 group cursor-default transition-opacity hover:opacity-100">
          <ShieldCheck
            size={14}
            className="text-indigo-500 group-hover:rotate-12 transition-transform"
          />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
            Encrypted Uplink Protocol Certified
          </span>
        </div>
      </div>
    </div>
  );
};
