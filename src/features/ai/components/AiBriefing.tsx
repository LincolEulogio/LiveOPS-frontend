'use client';

import React from 'react';
import { Sparkles, Activity, AlertTriangle, Zap, RefreshCw, Bot } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { aiService } from '@/features/ai/api/ai.service';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/shared/api/api.client';

export const AiBriefing = ({ productionId }: { productionId: string }) => {
    const [briefing, setBriefing] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const generate = async () => {
        setIsLoading(true);
        try {
            // Fetch necessary context for AI
            const [social, telemetry] = await Promise.all([
                apiClient.get<any[]>(`/productions/${productionId}/social/messages`).catch(() => []),
                apiClient.get<any[]>(`/productions/${productionId}/analytics/telemetry?minutes=15`).catch(() => []),
            ]);

            const socialText = social.length > 0
                ? social.slice(0, 10).map((m: any) => `${m.author}: ${m.content} (${m.aiSentiment || 'N/A'})`).join('\n')
                : "No active social engagement detected.";

            const latestTelemetry = telemetry[telemetry.length - 1];
            const telemetryText = latestTelemetry
                ? `FPS: ${latestTelemetry.fps || '60'}, CPU: ${latestTelemetry.cpuUsage || '15'}%, Dropped: ${latestTelemetry.droppedFrames || 0}`
                : "Telemetry node offline.";

            const res = await aiService.generateBriefing({
                social: socialText,
                telemetry: telemetryText,
                script: 'Rundown active'
            });
            setBriefing(res.briefing);
        } catch (error) {
            console.error('LIVIA failed:', error);
            setBriefing("ALERT: Technical synchronization node unreachable. Check engine status.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-[2rem] p-6 space-y-6 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />

            <div className="flex items-center justify-between border-b border-card-border/40 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Bot size={16} />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Livia AI Briefing</h2>
                        <p className="text-[9px] text-muted font-bold uppercase">Real-time Production Analysis</p>
                    </div>
                </div>
                <button
                    onClick={generate}
                    disabled={isLoading}
                    className="p-2 hover:bg-white/5 rounded-xl text-indigo-400 transition-all active:rotate-180 duration-500"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="min-h-[120px] flex flex-col justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [8, 20, 8] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-1 bg-indigo-500 rounded-full"
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter animate-pulse">Scanning production nodes...</span>
                    </div>
                ) : briefing ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-3">
                            {briefing.split('\n').filter(l => l.includes(':')).map((line, i) => {
                                const [key, ...val] = line.split(':');
                                return (
                                    <div key={i} className="bg-background/40 border border-card-border rounded-xl p-3">
                                        <span className="text-[8px] font-black text-indigo-400 uppercase block mb-1">{key}</span>
                                        <p className="text-[10px] text-foreground/90 font-medium leading-relaxed">{val.join(':').trim()}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center py-10 space-y-4">
                        <Sparkles size={24} className="mx-auto text-muted/20" />
                        <p className="text-[10px] text-muted font-bold uppercase max-w-[150px] mx-auto leading-relaxed opacity-60">Ready to analyze social and technical health of your live session.</p>
                        <button
                            onClick={generate}
                            className="px-6 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            Generate Briefing
                        </button>
                    </div>
                )}
            </div>

            <div className="pt-2">
                <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <Activity size={12} className="text-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Alpha Model: Live Intelligence</span>
                </div>
            </div>
        </div>
    );
};
