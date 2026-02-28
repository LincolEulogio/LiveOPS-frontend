'use client';

import { ProductionLog } from '@/features/analytics/types/analytics.types';
import { cn } from '@/shared/utils/cn';
import { Terminal, Search, Filter, History } from 'lucide-react';
import { useState } from 'react';

interface Props {
  logs: ProductionLog[];
  isLoading: boolean;
}

export const LogFeed = ({ logs, isLoading }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.3rem] overflow-hidden flex flex-col h-[600px] sm:h-[750px] shadow-inner">
      {/* Search Header */}
      <div className="p-4 sm:p-6 border-b border-card-border bg-card-bg/40 backdrop-blur-md flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-500 shadow-lg shadow-indigo-500/5">
            <Terminal size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <h2 className="text-[12px] sm:text-sm font-black text-foreground uppercase tracking-widest leading-none mb-1">
              Event Feed
            </h2>
            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
              Real-time log stream initialized
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64 lg:w-80 group/input">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within/input:text-indigo-500 transition-colors"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter entry parameters..."
              className="w-full bg-background/40 border border-card-border rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-[10px] sm:text-[11px] font-black text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all uppercase tracking-widest shadow-inner"
            />
          </div>

          <select
            className="w-full sm:w-auto bg-background/40 border border-card-border rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:bg-background/60 shadow-inner appearance-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1em',
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'system') {
                setSearchTerm('production.user|device');
              } else {
                setSearchTerm(val === 'all' ? '' : val);
              }
            }}
          >
            <option value="all">Global Matrix</option>
            <option value="obs">OBS Stream</option>
            <option value="vmix">vMix Core</option>
            <option value="timeline">Sequencer</option>
            <option value="system">Engine Core</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar relative custom-scrollbar">
        <table className="w-full border-separate border-spacing-0 min-w-[1000px] lg:min-w-0">
          <thead className="sticky top-0 bg-card-bg/95 backdrop-blur-xl border-b border-card-border z-20 shadow-sm">
            <tr className="text-[10px] sm:text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              <th className="text-left py-4 sm:py-5 px-6 sm:px-8 border-b border-card-border">
                Temporal Stamp
              </th>
              <th className="text-left py-4 sm:py-5 px-6 sm:px-8 border-b border-card-border">
                Origin Operator
              </th>
              <th className="text-left py-4 sm:py-5 px-6 sm:px-8 border-b border-card-border">
                Event Classification
              </th>
              <th className="text-left py-4 sm:py-5 px-6 sm:px-8 border-b border-card-border">
                Source Payload
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/30">
            {isLoading && logs.length === 0 ? (
              Array(12)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-5 sm:py-6 px-6 sm:px-8">
                      <div className="h-4 w-24 bg-card-bg/40 rounded-lg"></div>
                    </td>
                    <td className="py-5 sm:py-6 px-6 sm:px-8">
                      <div className="h-4 w-32 bg-card-bg/40 rounded-lg"></div>
                    </td>
                    <td className="py-5 sm:py-6 px-6 sm:px-8">
                      <div className="h-4 w-40 bg-card-bg/40 rounded-lg"></div>
                    </td>
                    <td className="py-5 sm:py-6 px-6 sm:px-8">
                      <div className="h-4 w-full bg-card-bg/40 rounded-lg"></div>
                    </td>
                  </tr>
                ))
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-32 text-center text-muted-foreground flex-1">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                      <History
                        size={64}
                        strokeWidth={1}
                        className="text-indigo-500/20 relative z-10"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-foreground/40 mb-2">
                        Matrix Isolation
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                        No telemetry data detected
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={cn(
                    'hover:bg-indigo-500/3 dark:hover:bg-white/2 transition-all duration-300 group cursor-default border-l-4',
                    log.eventType.includes('error') || log.eventType.includes('fail')
                      ? 'border-red-500 bg-red-500/5 shadow-[inset_4px_0_10px_rgba(239,68,68,0.05)]'
                      : log.eventType.includes('warn')
                        ? 'border-amber-500 bg-amber-500/5 shadow-[inset_4px_0_10px_rgba(245,158,11,0.05)]'
                        : 'border-transparent'
                  )}
                >
                  <td className="py-5 sm:py-6 px-6 sm:px-8 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] sm:text-[11px] font-black font-mono text-foreground tracking-tighter shadow-sm">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <div className="text-[8px] sm:text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-card-border" />
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 sm:py-6 px-6 sm:px-8 whitespace-nowrap">
                    {log.user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase shadow-sm shrink-0">
                          {log.user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-[11px] font-black text-foreground uppercase tracking-tight truncate">
                            {log.user.name}
                          </p>
                          <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter italic">
                            Auth Level 1
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 opacity-60">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-muted-foreground/10 border border-muted-foreground/20 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase shadow-sm shrink-0">
                          S
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase italic tracking-widest truncate">
                            System Engine
                          </span>
                          <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                            Automated
                          </p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-5 sm:py-6 px-6 sm:px-8">
                    <span
                      className={cn(
                        'text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-1.5 rounded-2xl border uppercase tracking-[0.15em] shadow-sm flex items-center gap-2 w-fit whitespace-nowrap',
                        log.eventType.includes('obs')
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                          : log.eventType.includes('vmix')
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                            : log.eventType.includes('production') ||
                                log.eventType.includes('INTERCOM')
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted-foreground/5 border-muted-foreground/10 text-muted-foreground'
                      )}
                    >
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full shadow-[0_0_8px]',
                          log.eventType.includes('obs')
                            ? 'bg-indigo-500'
                            : log.eventType.includes('vmix')
                              ? 'bg-amber-500'
                              : log.eventType.includes('production')
                                ? 'bg-emerald-500'
                                : 'bg-muted-foreground'
                        )}
                      />
                      {log.eventType.replace('API_', '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-5 sm:py-6 px-6 sm:px-8">
                    <div className="max-w-xl">
                      <div className="relative group/payload">
                        <pre className="text-[9px] sm:text-[10px] font-bold font-mono text-muted-foreground/60 dark:text-muted-foreground/40 bg-black/5 dark:bg-black/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-card-border/50 overflow-hidden text-ellipsis transition-all max-h-[80px] sm:max-h-[100px] hover:max-h-[300px] hover:overflow-y-auto custom-scrollbar group-hover/payload:border-indigo-500/30 shadow-inner leading-relaxed">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                        <div className="absolute top-2 right-2 opacity-0 group-hover/payload:opacity-100 transition-opacity">
                          <div className="p-1 px-2 bg-indigo-600 text-[8px] font-black text-white rounded-lg uppercase tracking-tighter shadow-lg">
                            Raw JSON
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-5 border-t border-card-border bg-card-bg/60 backdrop-blur-md flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center text-[10px] sm:text-[11px] font-black text-muted-foreground/50 uppercase tracking-widest relative z-10 shadow-2xl">
        <span className="flex items-center gap-3 pl-0 sm:pl-3 w-full sm:w-auto">
          <Filter size={14} className="text-indigo-500 shrink-0" />
          <span>
            Telemetría <span className="text-foreground">{filteredLogs.length}</span> /{' '}
            <span className="text-foreground">{logs.length}</span> Entries
          </span>
        </span>
        <span className="flex items-center gap-3 pr-0 sm:pr-3 w-full sm:w-auto justify-end">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          Real-time synchronized
        </span>
      </div>
    </div>
  );
};
