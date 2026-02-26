import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CrewCardIdentityProps {
    userName: string;
    roleName: string;
    isOnline: boolean;
    onTalkStart?: () => void;
    onTalkStop?: () => void;
    isTalkingLocal?: boolean;
}

export const CrewCardIdentity: React.FC<CrewCardIdentityProps> = ({
    userName,
    roleName,
    isOnline,
    onTalkStart,
    onTalkStop,
    isTalkingLocal
}) => {
    return (
        <div className="p-6 sm:p-8 pb-4 flex items-center gap-4 sm:gap-6 relative z-10 w-full overflow-hidden">
            {/* Background highlight when talking locally */}
            <AnimatePresence>
                {isTalkingLocal && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 bg-red-600/5 -z-10 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="relative group/avatar shrink-0 select-none">
                <div className={cn(
                    "w-14 h-14 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center bg-black/20 dark:bg-background/60 text-foreground font-black text-lg sm:text-2xl border transition-all duration-500 group-hover/avatar:scale-105 relative",
                    isOnline ? "border-indigo-500/30 text-indigo-600 dark:text-indigo-400" : "border-card-border text-muted"
                )}>
                    {userName.substring(0, 2).toUpperCase()}

                    {/* Ring when talking locally */}
                    {isTalkingLocal && (
                        <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-[ping_1.5s_infinite]" />
                    )}
                </div>
                {isOnline && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-2 sm:border-4 border-white dark:border-card-bg rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                        {roleName}
                    </span>
                </div>
                <h3 className="text-xl font-black text-foreground uppercase truncate italic leading-none group-hover:text-indigo-400 transition-colors">
                    {userName}
                </h3>
            </div>

            {onTalkStart && onTalkStop && isOnline && (
                <div className="flex items-center ml-auto">
                    <button
                        onPointerDown={(e) => { e.preventDefault(); onTalkStart(); }}
                        onPointerUp={(e) => { e.preventDefault(); onTalkStop(); }}
                        onPointerLeave={() => onTalkStop()}
                        onContextMenu={(e) => e.preventDefault()}
                        className={cn(
                            "group/talk relative p-3 sm:p-4 rounded-[1.2rem] border transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5 select-none touch-none overflow-hidden",
                            isTalkingLocal
                                ? "bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                : "bg-background/40 border-card-border text-muted-foreground hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400"
                        )}
                    >
                        <div className="relative">
                            {isTalkingLocal ? (
                                <Mic size={20} className="relative z-10 animate-bounce" />
                            ) : (
                                <MicOff size={20} className="relative z-10 opacity-40 group-hover/talk:opacity-100" />
                            )}
                            {isTalkingLocal && (
                                <div className="absolute inset-0 bg-white rounded-full blur-md opacity-20 animate-pulse" />
                            )}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tighter">
                            {isTalkingLocal ? 'DIRECT' : 'TALK'}
                        </span>

                        {/* Glossy overlay on button */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/talk:opacity-100 pointer-events-none" />
                    </button>
                </div>
            )}
        </div>
    );
};
