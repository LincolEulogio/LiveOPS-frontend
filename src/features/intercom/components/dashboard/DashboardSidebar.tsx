import React from 'react';
import { List, Clock, History, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimelineView } from '../../../timeline/components/TimelineView';
import { HealthMonitor } from '../../../health/components/HealthMonitor';

interface DashboardSidebarProps {
    productionId: string;
    history: any[];
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ productionId, history }) => {
    return (
        <div className="min-[1280px]:col-span-4 min-[1440px]:col-span-3 space-y-8 flex flex-col h-fit min-[1280px]:sticky min-[1280px]:top-8 pb-10">

            {/* Rundown Protocol Card */}
            <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[3rem] overflow-hidden  flex flex-col h-[450px] sm:h-[500px] group/rundown relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover/rundown:scale-110 transition-transform duration-1000">
                    <List size={120} />
                </div>
                <TimelineView />
            </div>

            {/* Operational Feed Log - Scaled for Bento */}
            <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[3rem] flex flex-col  overflow-hidden h-[400px] min-[1440px]:h-[450px] relative">
                <div className="p-6 border-b border-card-border/50 bg-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock size={16} className="text-indigo-400" />
                        <h2 className="text-[10px] font-black text-foreground uppercase ">Operational Flux</h2>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse " />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar no-scrollbar bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:24px_24px]">
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
