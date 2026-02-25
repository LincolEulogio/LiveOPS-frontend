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
    Radio,
    ShieldCheck,
    ChevronRight,
    MessageSquare,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { IntercomTemplate, CrewMember } from '../types/intercom.types';
import { cn } from '@/shared/utils/cn';
import { useIntercomStore } from '../store/intercom.store';

interface CrewCardProps {
    productionId: string;
    member: CrewMember;
    templates: IntercomTemplate[];
    onSendCommand: (template: IntercomTemplate) => void;
}

const getAckDisplay = (type: string) => {
    const t = type.toUpperCase().trim();
    if (t === 'PROBLEMA') return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'CRITICAL ALERT' };
    if (t === 'PONCHE NO' || t.includes('PONCHE')) return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'PONCHE NO' };
    if (t === 'CHECK') return { icon: Eye, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'EYE ON' };
    if (t === 'LISTO' || t === 'CONFIRMADO' || t === 'OK') return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'PROCESSED' };
    if (t.startsWith('MENSAJE:')) return { icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: t.substring(0, 15) };

    return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: type.substring(0, 12) };
};

const getIconForTemplate = (name: string, color: string) => {
    const n = name.toUpperCase();
    const props = { size: 16, style: { color } };

    if (n.includes('ZOOM') && n.includes('MÁS')) return <ZoomIn {...props} />;
    if (n.includes('ZOOM') && n.includes('MENOS')) return <ZoomOut {...props} />;
    if (n.includes('AL AIRE')) return <Radio className="text-red-500 animate-pulse" size={16} />;
    if (n.includes('PREVENIDO')) return <Clock {...props} />;
    if (n.includes('LIBRE') || n.includes('READY')) return <CheckCircle2 {...props} />;
    if (n.includes('PLANO') || n.includes('GENERAL')) return <Video {...props} />;
    if (n.includes('CLOSE') || n.includes('FOCO')) return <Zap {...props} />;

    return <Activity {...props} />;
};

export const CrewCard = ({ productionId, member, templates, onSendCommand }: CrewCardProps) => {
    const currentStatus = (member.currentStatus || 'IDLE').toUpperCase();
    const [chatMsg, setChatMsg] = React.useState('');
    const history = useIntercomStore(state => state.history);

    // Filter chat history for this specific user
    const directHistory = history.filter(h => {
        const isMsg = h.message?.startsWith('Mensaje:');
        if (!isMsg) return false;
        const iSent = h.targetUserId === member.userId;
        const theySent = h.senderId === member.userId;
        return iSent || theySent;
    }).slice(0, 50);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "bg-card-bg/60 backdrop-blur-2xl border rounded-[2.5rem] overflow-hidden  transition-all duration-500 relative flex flex-col group",
                member.isOnline ? "border-card-border/60 hover:border-indigo-500/40" : "border-card-border/30 opacity-60 grayscale-[0.5]"
            )}
        >
            {/* Tactical Scanline */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Premium Header */}
            <div className="px-8 pt-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <Battery size={10} className="text-muted" />
                        <Wifi size={10} className="text-muted" />
                        <div className="w-[1px] h-2 bg-card-border mx-1" />
                        <span className="text-[8px] font-black text-muted uppercase ">{member.isOnline ? 'Active Link' : 'Dark Node'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/productions/${productionId}/intercom/member/${member.userId}`}
                        target="_blank"
                        className="p-2.5 bg-background/50 backdrop-blur-md rounded-xl text-muted hover:text-indigo-400 transition-all border border-card-border hover:border-indigo-500/50 active:scale-90"
                    >
                        <ExternalLink size={14} />
                    </Link>
                </div>
            </div>

            {/* Identity Surface */}
            <div className="p-8 pb-4 flex items-center gap-6 relative z-10">
                <div className="relative group/avatar">
                    <div className={cn(
                        "w-20 h-20 rounded-[2.5rem] flex items-center justify-center bg-background/60 text-foreground font-black text-2xl border  transition-all duration-500 group-hover/avatar:scale-110",
                        member.isOnline ? "border-indigo-500/30 text-indigo-400" : "border-card-border text-muted"
                    )}>
                        {member.userName.substring(0, 2).toUpperCase()}
                    </div>
                    {member.isOnline && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-card-bg rounded-full  animate-pulse" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 uppercase ">
                            {member.roleName}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-foreground uppercase er truncate italic leading-none group-hover:text-indigo-400 transition-colors">
                        {member.userName}
                    </h3>
                </div>
            </div>

            {/* Dynamic Status Module */}
            <div className="mx-6 mb-6 p-6 bg-background/40 backdrop-blur-md rounded-[2rem] border border-card-border/60  flex flex-col justify-center relative overflow-hidden group/status">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-muted uppercase ">Operational Phase</p>
                    <p className="text-[8px] font-black text-muted/40 uppercase ">Live Feedback</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all duration-500 ",
                            currentStatus === 'AL AIRE' ? 'bg-red-500 animate-pulse ' :
                                currentStatus === 'IDLE' ? 'bg-muted/40' :
                                    'bg-indigo-500 '
                        )} />
                        <span className={cn(
                            "text-base font-black uppercase  italic transition-colors",
                            currentStatus === 'AL AIRE' ? 'text-red-500' :
                                currentStatus === 'IDLE' ? 'text-muted' :
                                    'text-foreground'
                        )}>
                            {currentStatus}
                        </span>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {member.lastAck && (() => {
                            const display = getAckDisplay(member.lastAck.type);
                            const Icon = display.icon;
                            return (
                                <motion.div
                                    key={member.lastAck.timestamp}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ",
                                        display.bg, display.border
                                    )}
                                >
                                    <Icon size={14} className={cn("shrink-0", display.color)} />
                                    <span className={cn("text-[10px] font-black uppercase  truncate max-w-[100px]", display.color)}>
                                        {display.text}
                                    </span>
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tactical Command Grid */}
            <div className="px-6 pb-6 grid grid-cols-2 gap-3 min-h-[180px]">
                {templates.slice(0, 8).map(t => {
                    const isPending = member.isOnline && currentStatus === t.name.toUpperCase();

                    return (
                        <button
                            key={t.id}
                            onClick={() => onSendCommand(t)}
                            disabled={!member.isOnline}
                            className={cn(
                                "group/btn relative p-4 rounded-2xl border transition-all active:scale-95 flex flex-col items-center justify-center gap-2 overflow-hidden",
                                member.isOnline
                                    ? 'bg-background/40 border-card-border hover:border-indigo-500/50 hover:bg-indigo-500/5'
                                    : 'bg-background/20 border-white/5 cursor-not-allowed grayscale'
                            )}
                        >
                            {/* Visual Glow */}
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />

                            <div className="relative z-10 transition-transform group-hover/btn:scale-125 duration-500">
                                {getIconForTemplate(t.name, t.color || '#6366f1')}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase  relative z-10 transition-colors",
                                isPending ? 'text-indigo-400' : 'text-muted/80 group-hover/btn:text-foreground'
                            )}>
                                {t.name}
                            </span>

                            {isPending && (
                                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse " />
                            )}
                        </button>
                    );
                })}
                {templates.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-10 opacity-30 border-2 border-dashed border-card-border/60 rounded-[2rem] gap-4">
                        <Radio size={32} strokeWidth={1} className="text-muted" />
                        <span className="text-[10px] font-black uppercase  text-muted">Protocols Null</span>
                    </div>
                )}
            </div>

            {/* Advanced Chat Feed */}
            {directHistory.length > 0 && (
                <div className="mx-6 mb-6 bg-background/60 backdrop-blur-md border border-card-border/60 rounded-[2rem] overflow-hidden flex flex-col h-[320px] ">
                    <div className="px-6 py-4 bg-white/[0.04] border-b border-card-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquare size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-muted uppercase ">Telemetry Chat</span>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-indigo-500" />
                            <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-50" />
                            <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-20" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar flex flex-col-reverse">
                        {[...directHistory].map((msg, i) => {
                            const isMine = msg.senderId !== member.userId;
                            return (
                                <div key={i} className={cn("flex w-full", isMine ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        "max-w-[90%] p-4 rounded-2xl text-[11px] font-bold leading-relaxed border ",
                                        isMine
                                            ? 'bg-indigo-600 border-indigo-500 text-white rounded-br-none '
                                            : 'bg-background/80 border-card-border text-foreground rounded-bl-none '
                                    )}>
                                        <div className={cn(
                                            "text-[8px] font-black uppercase  mb-2 opacity-60",
                                            isMine ? 'text-white' : 'text-indigo-400'
                                        )}>
                                            {isMine ? 'COMMS OPERATOR' : (msg.senderName || member.userName)}
                                        </div>
                                        {msg.message.replace('Mensaje:', '').trim()}
                                        <div className={cn(
                                            "text-[7px] font-black mt-3 flex justify-end items-center gap-1 opacity-50 uppercase ",
                                            isMine ? 'text-white' : 'text-muted'
                                        )}>
                                            <Clock size={8} /> {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Response Intercept Input */}
            <div className="px-6 pb-6 mt-auto">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (chatMsg.trim()) {
                            onSendCommand({
                                name: `Mensaje: ${chatMsg.trim()}`,
                                id: 'chat',
                                color: '#6366f1',
                                isChat: true,
                                targetUserId: member.userId
                            });
                            setChatMsg('');
                        }
                    }}
                    className="group/form relative flex items-center bg-background border border-card-border rounded-2xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all "
                >
                    <input
                        type="text"
                        value={chatMsg}
                        onChange={(e) => setChatMsg(e.target.value)}
                        placeholder={`SND MSG TO ${member.userName.split(' ')[0].toUpperCase()}...`}
                        className="flex-1 bg-transparent px-6 py-4 text-[10px] font-black text-foreground uppercase placeholder:text-muted/40 focus:outline-none "
                    />
                    <button
                        type="submit"
                        disabled={!chatMsg.trim() || !member.isOnline}
                        className="mr-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl  transition-all active:scale-90 disabled:opacity-20 disabled:scale-100"
                    >
                        <Send size={16} className="group-hover/form:translate-x-0.5 group-hover/form:-translate-y-0.5 transition-transform" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
};
