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
    <div className="bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-4xl p-6  space-y-6">
      <div className="flex items-center gap-3 border-b border-card-border/40 pb-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Share2 size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none mb-1">
            External Links
          </h2>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tight">
            Bitfocus Companion / API Protocol
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep, i) => (
          <div
            key={i}
            className="group relative bg-background/40 border border-card-border rounded-2xl p-4 transition-all hover:bg-background/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                {ep.name}
              </span>
              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 text-[8px] font-black rounded">
                {ep.method}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background/80 dark:bg-black/40 px-3 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-mono text-foreground/70 dark:text-muted truncate border border-card-border/50">
                {ep.url}
              </code>
              <button
                onClick={() => copyToClipboard(ep.url, ep.name)}
                className="p-2.5 bg-background border border-card-border rounded-xl text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-white dark:hover:bg-indigo-500/10 transition-all active:scale-95 shadow-sm"
              >
                {copied === ep.name ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <a
          href="https://bitfocus.io/companion"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all "
        >
          <ExternalLink size={14} /> Documentation & Companion
        </a>
      </div>
    </div>
  );
};
