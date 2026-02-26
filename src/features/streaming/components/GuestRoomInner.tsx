import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
    Radio, Users, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff,
    Hand, Smile, LayoutGrid, LayoutPanelLeft, MessageCircle
} from 'lucide-react';
import {
    useParticipants, useConnectionState, useTracks, useLocalParticipant,
    RoomAudioRenderer, useRoomContext
} from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';

import { FloatingReaction } from './FloatingReaction';
import { ChatPanel } from './ChatPanel';
import { SpotlightLayout } from './layouts/SpotlightLayout';
import { GridLayout } from './layouts/GridLayout';
import { apiClient } from '@/shared/api/api.client';

const REACTIONS = ['👏', '❤️', '😂', '🔥', '👍', '🎉'];

export const GuestRoomInner = ({ productionId, userName, onLeave }: { productionId: string; userName: string; onLeave: () => void }) => {
    const room = useRoomContext();
    const participants = useParticipants();
    const connectionState = useConnectionState();
    const isConnected = connectionState === ConnectionState.Connected;
    const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();

    const [pinnedId, setPinnedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'spotlight' | 'grid'>('spotlight');
    const [chatOpen, setChatOpen] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
    const [fastRaisedHands, setFastRaisedHands] = useState<Record<string, boolean>>({});

    const [showReactions, setShowReactions] = useState(false);
    const [activeReactions, setActiveReactions] = useState<{ emoji: string; id: number; senderName?: string }[]>([]);

    const chatKey = `chat_hist_prod_${productionId}`;
    const [chatMessages, setChatMessages] = useState<any[]>(() => {
        if (typeof window !== 'undefined') {
            try { const saved = localStorage.getItem(chatKey); if (saved) return JSON.parse(saved); } catch { }
        }
        return [];
    });
    useEffect(() => { localStorage.setItem(chatKey, JSON.stringify(chatMessages)); }, [chatMessages, chatKey]);

    const [unreadCount, setUnreadCount] = useState(0);
    const isChatOpenRef = useRef(chatOpen);
    useEffect(() => {
        isChatOpenRef.current = chatOpen;
        if (chatOpen) setUnreadCount(0);
    }, [chatOpen]);

    const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
    const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], { onlySubscribed: false });

    // Raised Hands computation
    const finalRaisedHands = useMemo(() => {
        const result = new Set<string>();
        if (handRaised && localParticipant?.identity) result.add(localParticipant.identity);
        participants.forEach(p => {
            if (p.isLocal) return;
            if (fastRaisedHands[p.identity] !== undefined) {
                if (fastRaisedHands[p.identity]) result.add(p.identity);
            } else {
                try {
                    const meta = JSON.parse(p.metadata || '{}');
                    if (meta.handRaised) result.add(p.identity);
                } catch { }
            }
        });
        return result;
    }, [participants, handRaised, fastRaisedHands, localParticipant]);

    // DataChannel Handling
    useEffect(() => {
        const handleData = (payload: Uint8Array, participant?: any) => {
            try {
                const str = new TextDecoder().decode(payload);
                const data = JSON.parse(str);
                if (data.type === 'reaction') {
                    setActiveReactions(prev => [...prev, { emoji: data.emoji, id: data.id, senderName: data.senderName }]);
                    setTimeout(() => setActiveReactions(prev => prev.filter(r => r.id !== data.id)), 3500);
                } else if (data.type === 'hand') {
                    setFastRaisedHands(prev => ({ ...prev, [data.identity]: data.state }));
                } else if (data.type === 'chat') {
                    setChatMessages(prev => [...prev, { id: data.id, message: data.text, timestamp: data.timestamp, from: { name: data.senderName, isLocal: false } }]);
                    if (!isChatOpenRef.current) {
                        setUnreadCount(prev => prev + 1);
                        toast('💬 ' + data.senderName, { description: data.text, position: 'top-right' });
                        try {
                            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            if (ctx.state === 'running') {
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.type = 'sine';
                                osc.frequency.setValueAtTime(800, ctx.currentTime);
                                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
                                gain.gain.setValueAtTime(0, ctx.currentTime);
                                gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
                                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                osc.start();
                                osc.stop(ctx.currentTime + 0.1);
                            }
                        } catch { }
                    }
                } else if (data.type === 'room_ended') {
                    toast.error('La videollamada ha sido terminada por el anfitrión');
                    onLeave();
                }
            } catch { }
        };
        room.on('dataReceived', handleData);
        return () => { room.off('dataReceived', handleData); };
    }, [room, onLeave]);

    useEffect(() => {
        if (!isConnected) return;
        localParticipant.setMetadata(JSON.stringify({ handRaised })).catch(() => { });
    }, [handRaised, isConnected, localParticipant]);


    const sendReaction = (emoji: string) => {
        const id = Date.now();
        const senderName = localParticipant.name || localParticipant.identity || '';
        try {
            const str = JSON.stringify({ type: 'reaction', emoji, id, senderName });
            localParticipant.publishData(new TextEncoder().encode(str), { reliable: true });
        } catch { }
        setActiveReactions(prev => [...prev, { emoji, id, senderName }]);
        setTimeout(() => setActiveReactions(prev => prev.filter(r => r.id !== id)), 3500);
        setShowReactions(false);
    };

    const handleSendChat = (text: string) => {
        const timestamp = Date.now();
        const id = timestamp + Math.random();
        const msg = { id, message: text, timestamp, from: { name: userName, isLocal: true } };
        setChatMessages(prev => [...prev, msg]);
        try {
            const str = JSON.stringify({ type: 'chat', id, text, senderName: userName, timestamp });
            localParticipant.publishData(new TextEncoder().encode(str), { reliable: true });
        } catch { }
    };

    const activeSpeakerId = useMemo(() => {
        const sp = participants.filter(p => p.isSpeaking);
        return sp.length > 0 ? sp[0].identity : null;
    }, [participants]);

    const featuredTrack = useMemo(() => {
        if (screenTracks.length > 0) return screenTracks[0];
        if (pinnedId) {
            const t = cameraTracks.find(t => t.participant.identity === pinnedId);
            if (t) return t;
        }
        if (activeSpeakerId) {
            const t = cameraTracks.find(t => t.participant.identity === activeSpeakerId);
            if (t) return t;
        }
        return cameraTracks[0] ?? null;
    }, [cameraTracks, screenTracks, pinnedId, activeSpeakerId]);

    const stripTracks = useMemo(() =>
        featuredTrack ? cameraTracks.filter(t => t.participant.identity !== featuredTrack.participant.identity) : cameraTracks
        , [cameraTracks, featuredTrack]);

    return (
        <div className="flex flex-col h-full bg-[#07080f]">
            {/* Floating Reactions */}
            {activeReactions.map(r => <FloatingReaction key={r.id} emoji={r.emoji} id={r.id} senderName={r.senderName} />)}

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-indigo-500/10 bg-[#07080f]/90 backdrop-blur-xl shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center">
                            <Radio size={14} className="text-indigo-400" />
                        </div>
                        {isConnected && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#07080f] animate-pulse" />}
                    </div>
                    <div>
                        <h1 className="text-[11px] font-black text-white uppercase tracking-widest">Green Room</h1>
                        <p className="text-[9px] text-indigo-400/60 font-bold uppercase tracking-wider">{userName}</p>
                    </div>
                </div>
                <span className="hidden sm:block text-[9px] text-indigo-300/40 font-mono uppercase tracking-widest px-3 py-1 bg-indigo-500/6 border border-indigo-500/12 rounded-full">
                    PROD · {productionId.split('-')[0].toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/3 border border-white/7">
                        <Users size={9} className="text-white/30" />
                        <span className="text-[9px] text-white/40 font-bold">{participants.length}</span>
                    </div>
                    {finalRaisedHands.size > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                            <span className="text-[10px]">✋</span>
                            <span className="text-[9px] font-black text-amber-400">{finalRaisedHands.size}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Video area */}
                <div className="flex-1 min-w-0 relative overflow-hidden">
                    {/* Ambient glow */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/4 rounded-full blur-[120px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/4 rounded-full blur-[100px]" />
                    </div>
                    <div className="relative z-10 h-full">
                        {viewMode === 'grid'
                            ? <GridLayout tracks={[...cameraTracks, ...screenTracks]} pinnedId={pinnedId} raisedHands={finalRaisedHands} onPin={setPinnedId} />
                            : <SpotlightLayout featured={featuredTrack} strip={stripTracks} pinnedId={pinnedId} raisedHands={finalRaisedHands} onPin={setPinnedId} />
                        }
                    </div>
                </div>
                {/* Chat sidebar */}
                {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} messages={chatMessages} onSend={handleSendChat} />}
            </div>

            {/* Control bar */}
            <div className="flex items-center justify-center flex-wrap gap-2 px-6 py-3 bg-[#03040a] border-t border-indigo-500/10 backdrop-blur-xl shrink-0 relative z-[999]">
                {/* Reactions picker */}
                {showReactions && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-2 bg-[#0d0e1c] border border-indigo-500/15 rounded-2xl px-3 py-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-[99999]">
                        {REACTIONS.map(e => (
                            <button key={e} onClick={() => sendReaction(e)}
                                className="text-2xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                    </div>
                )}

                {/* Mic */}
                <button onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isMicrophoneEnabled ? 'bg-indigo-600/90 border border-indigo-500/50 text-white' : 'bg-red-500/8 border border-red-500/20 text-red-300/75 hover:bg-red-500/15'}`}>
                    {isMicrophoneEnabled ? <Mic size={13} /> : <MicOff size={13} />}
                    <span>Mic</span>
                </button>

                {/* Camera */}
                <button onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isCameraEnabled ? 'bg-indigo-600/90 border border-indigo-500/50 text-white' : 'bg-red-500/8 border border-red-500/20 text-red-300/75 hover:bg-red-500/15'}`}>
                    {isCameraEnabled ? <Video size={13} /> : <VideoOff size={13} />}
                    <span>Cámara</span>
                </button>

                {/* Screen share */}
                <button onClick={async () => {
                    try {
                        await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, { audio: true });
                    } catch (err: any) {
                        toast.error(err.message || 'Error al compartir pantalla');
                    }
                }}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isScreenShareEnabled ? 'bg-red-500/85 border border-red-400/50 text-white' : 'bg-white/5 border border-white/8 text-white/50 hover:bg-indigo-500/12 hover:border-indigo-500/30 hover:text-indigo-200/90'}`}>
                    {isScreenShareEnabled ? <MonitorOff size={13} /> : <Monitor size={13} />}
                    <span>{isScreenShareEnabled ? 'Stop Share' : 'Compartir'}</span>
                </button>

                {/* Hand raise */}
                <button onClick={() => {
                    const next = !handRaised;
                    setHandRaised(next);
                    try {
                        const str = JSON.stringify({ type: 'hand', state: next, identity: localParticipant.identity });
                        localParticipant.publishData(new TextEncoder().encode(str), { reliable: true });
                    } catch { }
                }}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${handRaised ? 'bg-amber-500/90 border border-amber-400/50 text-white' : 'bg-white/5 border border-white/8 text-white/50 hover:bg-amber-500/12 hover:border-amber-500/30 hover:text-amber-200/90'}`}>
                    <Hand size={13} />
                    <span>{handRaised ? 'Bajar' : 'Levantar'}</span>
                </button>

                {/* Reactions */}
                <button onClick={() => setShowReactions(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/8 text-white/50 hover:bg-indigo-500/12 hover:border-indigo-500/30 hover:text-indigo-200/90 transition-colors">
                    <Smile size={13} />
                    <span>Reaccionar</span>
                </button>

                {/* View */}
                <button onClick={() => setViewMode(v => v === 'grid' ? 'spotlight' : 'grid')}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/8 text-white/50 hover:bg-indigo-500/12 hover:border-indigo-500/30 hover:text-indigo-200/90 transition-colors">
                    {viewMode === 'spotlight' ? <LayoutGrid size={13} /> : <LayoutPanelLeft size={13} />}
                    <span>{viewMode === 'spotlight' ? 'Grid' : 'Focus'}</span>
                </button>

                {/* Chat */}
                <button onClick={() => setChatOpen(v => !v)}
                    className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${chatOpen ? 'bg-indigo-600/90 border border-indigo-500/50 text-white' : 'bg-white/5 border border-white/8 text-white/50 hover:bg-indigo-500/12 hover:border-indigo-500/30 hover:text-indigo-200/90'}`}>
                    <MessageCircle size={13} />
                    <span>Chat</span>
                    {unreadCount > 0 && !chatOpen && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-[9px] text-white flex items-center justify-center font-bold shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-bounce">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Leave */}
                <button onClick={() => onLeave()}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/8 border border-red-500/20 text-red-300/75 hover:bg-red-500/15 hover:border-red-500/35 hover:text-red-300 transition-colors">
                    <PhoneOff size={13} />
                    <span>Salir</span>
                </button>
            </div>

            <RoomAudioRenderer />
        </div>
    );
};
