import React from 'react';
import { Wifi, WifiOff, Shield, MessageCircle, Send, Bell, ChevronRight, CheckCircle, Volume2, Headset, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useWebRTC } from '@/features/intercom/hooks/useWebRTC';

interface DeviceIdleViewProps {
    productionId: string;
    isConnected: boolean;
    activeRole: string;
    activeBlock: any;
    userHistory: any[];
    user: any;
    customMessage: string;
    setCustomMessage: (val: string) => void;
    onSendCustomMessage: (e: React.FormEvent) => void;
    onSubscribePush: () => void;
}

export const DeviceIdleView: React.FC<DeviceIdleViewProps> = ({
    isConnected,
    activeRole,
    activeBlock,
    userHistory,
    user,
    customMessage,
    setCustomMessage,
    onSendCustomMessage,
    onSubscribePush,
    productionId
}) => {
    const { startTalking, stopTalking, isTalking, audioLevel, talkingUsers, talkingInfo } = useWebRTC({
        productionId,
        userId: user?.id || 'guest',
        roleName: activeRole,
        isHost: false,
    });

    // Instant Host Detection using real-time event data
    const isHostTalking = talkingInfo?.senderRoleName?.toLowerCase().includes('director') ||
        talkingInfo?.senderRoleName?.toLowerCase().includes('admin');

    const isPrivateComms = isHostTalking && talkingInfo?.targetUserId === user?.id;
    const activeScale = 1 + (audioLevel / 255) * 0.5;

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] text-center p-6 bg-background safe-area-inset-bottom relative overflow-hidden">
            {/* Real-time Atmospheric Glow */}
            <AnimatePresence>
                {isHostTalking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "absolute inset-0 pointer-events-none z-0 transition-colors duration-300",
                            isPrivateComms
                                ? "bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_70%)]"
                                : "bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15)_0%,transparent_70%)]"
                        )}
                    />
                )}
            </AnimatePresence>

            {/* Floating Status Bar - Top */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-xl">
                    <div className="relative">
                        {isConnected ? (
                            <>
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                                <Wifi size={14} className="text-green-500 relative" />
                            </>
                        ) : (
                            <WifiOff size={14} className="text-red-500" />
                        )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                        {isConnected ? 'NODE CONNECTED' : 'SIGNAL LOST'}
                    </span>
                </div>
            </div>

            {/* Main Central Workspace */}
            <div className="w-full max-w-sm flex flex-col items-center justify-center gap-12 relative z-10 transition-all duration-500">

                {/* Identity & Mission Status */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-8 bg-indigo-500/30" />
                        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">Tactical Hub</span>
                        <div className="h-px w-8 bg-indigo-500/30" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                        {activeRole}
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                        Operational Status: Online
                    </p>
                </motion.div>

                {/* Command Message Buffer (Chat) */}
                <div className="w-full bg-card-bg/20 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex flex-col h-[280px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse gap-3 custom-scrollbar">
                        {userHistory.length > 0 ? (
                            [...userHistory].map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.senderId === user?.id ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={cn("flex flex-col", msg.senderId === user?.id ? "items-end" : "items-start")}
                                >
                                    <div className={cn(
                                        "max-w-[90%] px-4 py-3 rounded-2xl text-[12px] font-bold leading-relaxed shadow-sm",
                                        msg.senderId === user?.id
                                            ? "bg-indigo-600/90 text-white rounded-tr-none border border-indigo-500/30"
                                            : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none backdrop-blur-md"
                                    )}>
                                        {msg.message.replace('Mensaje:', '').trim()}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-10">
                                <MessageCircle size={40} className="mb-4" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Encrypted Buffer Empty</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-black/40 border-t border-white/5">
                        <form onSubmit={onSendCustomMessage} className="relative group flex items-center gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="COMMAND INPUT..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-4 pr-4 py-3 text-[11px] focus:outline-none focus:border-indigo-500/50 transition-all font-black uppercase tracking-wider text-white"
                                />
                            </div>
                            <button type="submit" className="p-3 rounded-2xl bg-indigo-600 text-white active:scale-95 transition-all shadow-lg hover:bg-indigo-500">
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* THE CORE: PTT & INCOMING INDICATOR (ALWAYS CENTERED) */}
                <div className="relative flex flex-col items-center justify-center w-full py-8">

                    {/* Atmospheric Pulsing for Host Talking */}
                    <AnimatePresence>
                        {isHostTalking && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center -z-10"
                            >
                                <motion.div
                                    animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                    className={cn("absolute w-56 h-56 rounded-full border-2", isPrivateComms ? "border-amber-500" : "border-red-500")}
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                                    className={cn("absolute w-56 h-56 rounded-full border border-current opacity-20", isPrivateComms ? "text-amber-400" : "text-red-400")}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative flex items-center justify-center gap-16">

                        {/* Speaker Indicator (Symmetric Left Float) */}
                        <div className="absolute -left-24 sm:-left-32 flex flex-col items-center">
                            <AnimatePresence mode="wait">
                                {isHostTalking ? (
                                    <motion.div
                                        key="host-speaking"
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 45 }}
                                        className={cn(
                                            "flex flex-col items-center gap-1",
                                            isPrivateComms ? "text-amber-500" : "text-red-500"
                                        )}
                                    >
                                        <div className="p-4 rounded-3xl bg-current/10 border border-current/20 backdrop-blur-xl animate-bounce">
                                            <Volume2 size={32} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter drop-shadow-lg">
                                            {isPrivateComms ? 'DIRECTOR' : 'BROADCAST'}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <div className="p-4 rounded-3xl border border-white/5 opacity-5">
                                        <Volume2 size={32} />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Push-To-Talk Center Button */}
                        <button
                            onPointerDown={(e) => { e.preventDefault(); startTalking(); }}
                            onPointerUp={(e) => { e.preventDefault(); stopTalking(); }}
                            onPointerLeave={() => stopTalking()}
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ transform: `scale(${isTalking ? activeScale : 1})` }}
                            className={cn(
                                "relative z-20 flex flex-col items-center justify-center w-52 h-52 rounded-full transition-all duration-150 select-none touch-none shadow-[0_0_80px_rgba(0,0,0,0.5)]",
                                isTalking
                                    ? "bg-red-600 ring-[15px] ring-red-500/20 text-white"
                                    : "bg-indigo-600 hover:bg-indigo-500 ring-[10px] ring-indigo-500/10 text-white"
                            )}
                        >
                            <Mic size={64} className={cn("mb-2 transition-transform duration-75", isTalking && "scale-110")} />
                            <div className="text-center">
                                <p className="text-[12px] font-black uppercase tracking-[0.2em] leading-tight">
                                    {isTalking ? 'TALKING' : 'PRESS'}
                                </p>
                                <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1">
                                    {isTalking ? 'ON AIR' : 'TRANSCEIVER'}
                                </p>
                            </div>

                            {/* Ping Wave for local talk */}
                            {isTalking && (
                                <div className="absolute -inset-8 rounded-full border-2 border-red-500/40 animate-ping" />
                            )}
                        </button>

                        {/* Right Decorative Status (Symmetric Balance) */}
                        <div className="absolute -right-24 sm:-right-32 opacity-5 blur-[2px]">
                            <Shield size={48} />
                        </div>
                    </div>
                </div>

                {/* Tactical Footer */}
                <div className="w-full mt-4 space-y-8">
                    <button
                        onClick={onSubscribePush}
                        className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl group active:scale-[0.98] transition-all backdrop-blur-md"
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                <Bell size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-tight">Active Push Protocol</p>
                                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Real-time alert synchronization</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/80">Active Transceiver</span>
                        </div>
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] italic">
                            Keep device active for operational alerts
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
