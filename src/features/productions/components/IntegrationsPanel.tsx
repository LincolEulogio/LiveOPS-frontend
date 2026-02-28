'use client';

import React from 'react';
import { Share2, Terminal, Code, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export const IntegrationsPanel = ({ productionId }: { productionId: string }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const apiBase = `${baseUrl.replace('3000', '3001')}/productions/${productionId}`;

  const endpoints = [
    {
      name: 'Manual Trigger (Macros)',
      method: 'POST',
      url: `${apiBase}/automation/rules/{RULE_ID}/trigger`,
    },
    { name: 'Instant Highlight (HIT)', method: 'POST', url: `${apiBase}/automation/instant-clip` },
    { name: 'Overlay Data Inject', method: 'POST', url: `${apiBase}/overlay/data` },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-transparent space-y-8 p-4 sm:p-5">
      <div className="flex items-center gap-4 border-b border-card-border/40 pb-6 relative">
        <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-500 shadow-lg shadow-indigo-500/5">
          <Share2 size={24} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest leading-none mb-1">
            External Links
          </h2>
          <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
            Protocol Isolation Layer Enabled
          </p>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20">
          <Code size={40} className="text-muted-foreground/20" />
        </div>
      </div>

      <div className="space-y-6">
        {endpoints.map((ep, i) => (
          <div
            key={i}
            className="group/endpoint relative bg-background/40 dark:bg-black/20 border border-card-border rounded-3xl p-5 transition-all duration-300 hover:border-indigo-500/40 hover:bg-background/60 shadow-inner"
          >
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                  {ep.name}
                </span>
              </div>
              <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black rounded-lg tracking-widest">
                {ep.method}
              </span>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex-1 relative group/code overflow-hidden">
                <code className="block w-full bg-black/5 dark:bg-black/40 px-4 py-3.5 rounded-2xl text-[10px] font-bold font-mono text-muted-foreground/70 dark:text-muted/40 truncate border border-card-border/50 group-hover/endpoint:border-indigo-500/20 transition-colors">
                  {ep.url}
                </code>
                <div className="absolute inset-y-0 right-0 w-8 bg-linear-to-l from-black/5 dark:from-black/40 to-transparent pointer-events-none" />
              </div>
              <button
                onClick={() => copyToClipboard(ep.url, ep.name)}
                className={cn(
                  'p-3.5 rounded-2xl transition-all active:scale-95 shadow-lg',
                  copied === ep.name
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 border border-indigo-400/30'
                )}
              >
                {copied === ep.name ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <a
          href="https://bitfocus.io/companion"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white border border-indigo-500/20 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all group/doc active:scale-95 shadow-xl shadow-indigo-600/5"
        >
          <ExternalLink size={16} className="group-hover/doc:scale-110 transition-transform" />
          Access Companion Documentation
        </a>
      </div>
    </div>
  );
};
