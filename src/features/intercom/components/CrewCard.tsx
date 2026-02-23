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
            type: string;
        };
        currentStatus?: string;
    };
    templates: any[];
    onSendCommand: (template: any) => void;
}

const getAckDisplay = (type: string) => {
    const t = type.toUpperCase().trim();
    if (t === 'PROBLEMA') return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'PROBLEMA' };
    if (t === 'PONCHE NO' || t.includes('PONCHE')) return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'PONCHE NO' };
    if (t === 'CHECK') return { icon: Eye, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'CHECK' };
    if (t === 'LISTO' || t === 'CONFIRMADO' || t === 'OK') return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'CONFIRMADO' };
    if (t.startsWith('MENSAJE:')) return { icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: t.substring(0, 15) + (t.length > 15 ? '...' : '') };

    return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', text: type.substring(0, 12) };
};

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

import { useIntercomStore } from '../store/intercom.store';

export const CrewCard = ({ productionId, member, templates, onSendCommand }: CrewCardProps) => {
    const isAcked = member.lastAck?.timestamp;
    const currentStatus = (member.currentStatus || 'IDLE').toUpperCase();
    const [chatMsg, setChatMsg] = React.useState('');
    const history = useIntercomStore(state => state.history);

    // Filter chat history for this specific user
    const directHistory = history.filter(h => {
        const isMsg = h.message?.startsWith('Mensaje:');
        if (!isMsg) return false;

        // Either I sent it to them, or they sent it to me
        const iSent = h.targetUserId === member.userId;
        const theySent = h.senderId === member.userId;

        return iSent || theySent;
    }).slice(0, 50);

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
                    {member.lastAck && (() => {
                        const display = getAckDisplay(member.lastAck.type);
                        const Icon = display.icon;
                        return (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center gap-1.5 ${display.bg} px-2 py-1 rounded-lg border ${display.border} max-w-[120px]`}
                            >
                                <Icon size={12} className={`shrink-0 ${display.color}`} />
                                <span className={`text-[9px] font-black ${display.color} uppercase tracking-widest truncate`} title={member.lastAck.type}>
                                    {display.text}
                                </span>
                            </motion.div>
                        );
                    })()}
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

            {/* Direct History / Messages Panel */}
            {directHistory.length > 0 && (
                <div className="mx-4 mb-4 bg-stone-900 border border-stone-800/50 rounded-2xl overflow-hidden flex flex-col max-h-[140px]">
                    <div className="px-3 py-1.5 bg-stone-800/30 border-b border-stone-800/50 flex items-center gap-2">
                        <MessageCircle size={10} className="text-indigo-400" />
                        <span className="text-[9px] uppercase font-black text-stone-400 tracking-widest">Chat Reciente</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {[...directHistory].reverse().map((msg, i) => {
                            const isMine = msg.senderId !== member.userId;
                            return (
                                <div key={i} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[10px] font-medium leading-tight ${isMine ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30 rounded-br-none' : 'bg-stone-800 text-stone-200 border border-stone-700 rounded-bl-none'}`}>
                                        {msg.message.replace('Mensaje:', '').trim()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Direct Chat / Commands */}
            <div className="px-4 pb-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (chatMsg.trim()) {
                            onSendCommand({
                                name: `Mensaje: ${chatMsg.trim()}`,
                                id: 'chat',
                                color: '#6366f1',
                                isChat: true,
                                targetUserId: member.userId // Pass it up so it records in local history
                            });
                            setChatMsg('');
                        }
                    }}
                    className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl p-2 focus-within:border-indigo-500/50 transition-colors"
                >
                    <input
                        type="text"
                        value={chatMsg}
                        onChange={(e) => setChatMsg(e.target.value)}
                        placeholder={`Enviar mensaje a ${member.userName.split(' ')[0]}...`}
                        className="flex-1 bg-transparent px-2 text-[10px] text-white focus:outline-none placeholder:text-stone-600 font-bold"
                    />
                    <button
                        type="submit"
                        disabled={!chatMsg.trim() || !member.isOnline}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-stone-800 disabled:text-stone-500 text-white p-1.5 rounded-lg transition-colors active:scale-95"
                    >
                        <MessageCircle size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
};
