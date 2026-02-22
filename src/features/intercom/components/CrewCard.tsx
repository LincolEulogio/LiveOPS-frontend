'use client';

import React from 'react';
import { User, Zap, Clock, CheckCircle2, AlertCircle, ExternalLink, Battery, Wifi, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CrewCardProps {
    productionId: string;
    member: {
        userId: string;
        userName: string;
        roleName: string;
        isOnline: boolean;
        lastAck?: {
            message: string;
            timestamp: string;
            type: 'OK' | 'PROBLEMA' | 'CHECK' | 'LISTO' | 'NO_PONCHE';
        };
        currentStatus?: string;
    };
    templates: any[];
    onSendCommand: (template: any) => void;
}

export const CrewCard = ({ productionId, member, templates, onSendCommand }: CrewCardProps) => {
    const isAcked = member.lastAck?.timestamp;

    return (
        <div className={`bg-stone-950 border ${member.isOnline ? 'border-stone-800' : 'border-stone-900 opacity-60'} rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-indigo-500/40 group relative`}>
            {/* Minimal Header with Icons (Battery/Wifi stubs) */}
            <div className="px-4 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
                    <Battery size={10} className="text-white" />
                    <Wifi size={10} className="text-white" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                        <Activity size={10} className="text-indigo-400" />
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">REF+</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${member.isOnline ? 'text-green-500' : 'text-stone-600'}`}>
                        {member.isOnline ? 'IDLE' : 'OFFLINE'}
                    </span>
                    <Link
                        href={`/productions/${productionId}/intercom/member/${member.userId}`}
                        target="_blank"
                        className="text-stone-600 hover:text-white transition-colors"
                    >
                        <ExternalLink size={12} />
                    </Link>
                </div>
            </div>

            {/* User Main Info */}
            <div className="p-4 flex items-center gap-3 pt-2">
                <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900 text-white font-black text-lg border ${member.isOnline ? 'border-indigo-500/50 shadow-inner' : 'border-stone-800'}`}>
                        {member.userName.substring(0, 2).toUpperCase()}
                    </div>
                    {member.isOnline && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-stone-950 rounded-full" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                        {member.userName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded uppercase tracking-widest">
                            {member.roleName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Panel (High visibility) */}
            <div className="mx-3 mb-3 p-3 bg-black/40 rounded-xl border border-stone-800/50 flex flex-col justify-center min-h-[50px]">
                <p className="text-[8px] font-black text-stone-600 uppercase tracking-widest mb-1.5">Estado Actual</p>
                <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-tight ${member.currentStatus === 'AL AIRE' ? 'text-red-500' : 'text-white'}`}>
                        {member.currentStatus || 'LISTO / STANDBY'}
                    </span>
                    {member.lastAck && (
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">OK CONFIRMED</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Command Grid (Switcher style) */}
            <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
                {templates.slice(0, 8).map(t => (
                    <button
                        key={t.id}
                        onClick={() => onSendCommand(t)}
                        disabled={!member.isOnline}
                        className="group/btn relative h-10 rounded-lg bg-stone-900 border border-stone-800 hover:border-stone-700 hover:bg-stone-800 disabled:opacity-20 transition-all flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center">
                            {t.name.toUpperCase().includes('ZOOM') ? (
                                <Zap size={10} className="mb-0.5 opacity-40 group-hover/btn:opacity-100" style={{ color: t.color }} />
                            ) : (
                                <Activity size={10} className="mb-0.5 opacity-40 group-hover/btn:opacity-100" style={{ color: t.color }} />
                            )}
                            <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 group-hover/btn:text-white">
                                {t.name}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
