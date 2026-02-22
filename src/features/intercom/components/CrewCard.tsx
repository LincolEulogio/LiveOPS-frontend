'use client';

import React from 'react';
import {
    User,
    Zap,
    Clock,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Battery,
    Wifi,
    Activity,
    ZoomIn,
    ZoomOut,
    Video,
    Mic,
    MessageCircle,
    Square,
    Play,
    Eye,
    Radio
} from 'lucide-react';
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

const getIconForTemplate = (name: string, color: string) => {
    const n = name.toUpperCase();
    const props = { size: 14, style: { color } };

    if (n.includes('ZOOM') && n.includes('MÁS')) return <ZoomIn {...props} />;
    if (n.includes('ZOOM') && n.includes('MENOS')) return <ZoomOut {...props} />;
    if (n.includes('AL AIRE')) return <Radio size={14} className="text-red-500 animate-pulse" />;
    if (n.includes('PREVENIDO')) return <Clock {...props} />;
    if (n.includes('LIBRE') || n.includes('READY')) return <CheckCircle2 {...props} />;
    if (n.includes('PLANO') || n.includes('GENERAL')) return <Video {...props} />;
    if (n.includes('CLOSE') || n.includes('FOCO')) return <Zap {...props} />;

    return <Activity {...props} />;
};

export const CrewCard = ({ productionId, member, templates, onSendCommand }: CrewCardProps) => {
    const isAcked = member.lastAck?.timestamp;
    const currentStatus = (member.currentStatus || 'IDLE').toUpperCase();

    return (
        <div className={`bg-stone-950 border ${member.isOnline ? 'border-stone-800' : 'border-stone-900 opacity-60'} rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-indigo-500/40 group relative`}>
            {/* Minimal Header with Icons (Battery/Wifi stubs) */}
            <div className="px-5 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-20 group-hover:opacity-50 transition-opacity">
                    <Battery size={10} className="text-white" />
                    <Wifi size={10} className="text-white" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        <Activity size={10} className="text-indigo-400" />
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">LIVE+</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${member.isOnline ? 'text-green-500' : 'text-stone-600'}`}>
                        {member.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <Link
                        href={`/productions/${productionId}/intercom/member/${member.userId}`}
                        target="_blank"
                        className="p-1 px-1.5 bg-stone-900 rounded-lg text-stone-600 hover:text-white transition-all border border-stone-800 hover:border-indigo-500/50"
                    >
                        <ExternalLink size={10} />
                    </Link>
                </div>
            </div>

            {/* User Main Info */}
            <div className="p-5 flex items-center gap-4 pt-3">
                <div className="relative">
                    <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900 text-white font-black text-xl border ${member.isOnline ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-stone-800'}`}>
                        {member.userName.substring(0, 2).toUpperCase()}
                    </div>
                    {member.isOnline && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-4 border-stone-950 rounded-full" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-white uppercase tracking-tight truncate leading-none mb-1">
                        {member.userName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-stone-900 text-stone-400 px-2 py-0.5 rounded-md border border-stone-800 uppercase tracking-widest">
                            {member.roleName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Panel (High visibility) */}
            <div className="mx-4 mb-4 p-4 bg-black/40 rounded-2xl border border-stone-800/50 flex flex-col justify-center min-h-[56px] relative overflow-hidden">
                <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-2">Estado Actual</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${currentStatus === 'AL AIRE' ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : currentStatus === 'IDLE' ? 'bg-stone-700' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} />
                        <span className={`text-[12px] font-black uppercase tracking-tight ${currentStatus === 'AL AIRE' ? 'text-red-500' : currentStatus === 'IDLE' ? 'text-stone-500' : 'text-white'}`}>
                            {currentStatus}
                        </span>
                    </div>
                    {member.lastAck && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20"
                        >
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">CONFIRMADO</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Command Grid (Professional Switcher Style) */}
            <div className="px-4 pb-5 grid grid-cols-2 gap-2 min-h-[160px]">
                {templates.slice(0, 8).map(t => {
                    const isPending = member.isOnline && currentStatus === t.name.toUpperCase();

                    return (
                        <button
                            key={t.id}
                            onClick={() => onSendCommand(t)}
                            disabled={!member.isOnline}
                            className={`
                                group/btn relative p-3 rounded-xl border transition-all active:scale-95
                                ${member.isOnline
                                    ? 'bg-stone-900/50 border-stone-800 hover:border-indigo-500/50 hover:bg-stone-800'
                                    : 'bg-stone-950/20 border-transparent cursor-not-allowed opacity-40'}
                                ${isPending ? 'ring-2 ring-indigo-500/50 border-indigo-500/50 bg-indigo-500/5' : ''}
                            `}
                        >
                            {/* Inner Highlight for professional feel */}
                            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover/btn:opacity-10 transition-opacity pointer-events-none ${isPending ? 'opacity-20' : ''}`} style={{ backgroundColor: t.color }} />

                            <div className="flex flex-col items-center relative z-10 pointer-events-none">
                                <div className="mb-1 transition-transform group-hover/btn:scale-110 duration-300">
                                    {getIconForTemplate(t.name, t.color)}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isPending ? 'text-indigo-400' : 'text-stone-500 group-hover/btn:text-white'}`}>
                                    {t.name}
                                </span>
                            </div>

                            {/* Status Indicator Dot */}
                            {isPending && (
                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.8)]" />
                            )}
                        </button>
                    );
                })}
                {templates.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-8 opacity-30 border border-dashed border-stone-800 rounded-2xl">
                        <Zap size={16} className="text-stone-700 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-700">Sin Plantillas</span>
                    </div>
                )}
            </div>
        </div>
    );
};
