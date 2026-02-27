import React from 'react';
import { List, Clock, History, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '@/shared/api/api.client';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { TimelineView } from '@/features/timeline/components/TimelineView';
import { HealthMonitor } from '@/features/health/components/HealthMonitor';

interface DashboardSidebarProps {
    productionId: string;
    history: any[];
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ productionId, history }) => {
    const [aiSummary, setAiSummary] = React.useState<string>('');
    const [isAiLoading, setIsAiLoading] = React.useState(false);

    const fetchSummary = async () => {
        if (!productionId || isAiLoading) return;
        setIsAiLoading(true);
        try {
            const data = await apiClient.get<{ summary: string }>(`/productions/${productionId}/intercom/ai-summary`);
            setAiSummary(data.summary);
        } catch (e) {
            console.error('Failed to fetch AI summary', e);
        } finally {
            setIsAiLoading(false);
        }
    };

    React.useEffect(() => {
        if (history.length > 0 && !aiSummary) {
            fetchSummary();
        }
    }, [productionId, history.length]);

    return (
        <div className="min-[1280px]:col-span-4 min-[1440px]:col-span-3 space-y-8 flex flex-col h-fit min-[1280px]:sticky min-[1280px]:top-8 pb-10">

            {/* LIVIA AI Summary Card */}
            <div className="bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-transparent backdrop-blur-3xl border border-indigo-500/30 rounded-[3rem] p-6 shadow-2xl shadow-indigo-500/5 overflow-hidden group/ai relative">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl transition-all duration-700 group-hover/ai:bg-indigo-500/40" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner">
                                <Sparkles size={14} className="text-indigo-400 group-hover/ai:animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">LIVIA Summary</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[7px] font-bold text-muted uppercase">Intelligence Layer Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={fetchSummary}
                            disabled={isAiLoading}
                            className={cn(
                                "p-2 hover:bg-white/5 rounded-full transition-all text-muted/40 hover:text-indigo-400",
                                isAiLoading && "animate-spin"
                            )}
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>

                    <div className="min-h-[80px]">
                        {isAiLoading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-1.5 bg-white/5 rounded w-full" />
                                <div className="h-1.5 bg-white/5 rounded w-[90%]" />
                                <div className="h-1.5 bg-white/5 rounded w-[95%]" />
                            </div>
                        ) : aiSummary ? (
                            <p className="text-[10px] font-bold text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                {aiSummary}
                            </p>
                        ) : (
                            <p className="text-center py-6 text-[9px] font-black text-muted uppercase italic opacity-30">
                                Sin actividad reciente para resumir
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Rundown Protocol Card */}
            <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[3rem] overflow-hidden  flex flex-col h-[450px] sm:h-[500px] group/rundown relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover/rundown:scale-110 transition-transform duration-1000">
                    <List size={120} />
                </div>
                <TimelineView />
            </div>

            {/* Operational Feed Log - Scaled for Bento */}
            <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[3rem] flex flex-col  overflow-hidden h-[400px] min-[1440px]:h-[450px] relative">
                <div className="p-6 border-b border-card-border/50 bg-white/4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock size={16} className="text-indigo-400" />
                        <h2 className="text-[10px] font-black text-foreground uppercase ">Operational Flux</h2>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse " />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar no-scrollbar bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[24px_24px]">
                    <AnimatePresence initial={false} mode="popLayout">
                        {history.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted/30 text-center space-y-4">
                                <History size={32} strokeWidth={1} />
                                <p className="text-[9px] font-black uppercase  italic">No active telemetry</p>
                            </div>
                        ) : (
                            history.slice(0, 30).map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-background/60 border border-card-border/60 p-4 rounded-2xl group/log relative overflow-hidden transition-all hover:border-indigo-500/20"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[8px] font-black text-muted uppercase  opacity-40">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-indigo-500/20 group-hover/log:bg-indigo-500 transition-colors" />
                                    </div>
                                    <h4 className="text-[10px] font-bold text-foreground/90 uppercase  leading-relaxed">{item.message}</h4>
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1 opacity-40"
                                        style={{ backgroundColor: item.color }}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-4 bg-white/5 border-t border-card-border/30 flex justify-center">
                    <div className="flex items-center gap-2 opacity-30">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        <span className="text-[8px] font-black uppercase ">Encrypted Log Stream</span>
                    </div>
                </div>
            </div>

            {/* Telemetry Integrity Monads */}
            <div className="hover:scale-[1.02] transition-transform duration-500  rounded-[3rem]">
                <HealthMonitor productionId={productionId} />
            </div>
        </div>
    );
};
