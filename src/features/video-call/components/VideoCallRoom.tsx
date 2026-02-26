'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';
import {
    Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, PhoneOff,
    MessageCircle, Hand, Smile, LayoutGrid, LayoutPanelLeft,
    Copy, Check, Users, X, Send, UserCog,
} from 'lucide-react';
import {
    LiveKitRoom, RoomAudioRenderer,
    useParticipants, useConnectionState, useTracks, VideoTrack,
    useLocalParticipant, useChat, isTrackReference,
} from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';
import '@livekit/components-styles';
import { apiClient } from '@/shared/api/api.client';

/* ─── Minimal LiveKit CSS ──────────────────────────────────────────────── */
const lkBase = `
  .lk-participant-tile { background: #0b0c18 !important; border-radius: 16px !important; overflow: hidden !important; }
  .lk-participant-tile video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
  .lk-participant-placeholder { background: #0b0c18 !important; }
  .lk-participant-metadata { display: none !important; }
`;

const REACTIONS = ['👏', '❤️', '😂', '🔥', '👍', '🎉'];

/* ─── FloatingReaction ──────────────────────────────────────────────────── */
function FloatingReaction({ emoji, id }: { emoji: string; id: number }) {
    return (
        <div
            key={id}
            className="fixed bottom-24 pointer-events-none text-4xl animate-bounce z-50"
            style={{ left: `${20 + (id % 8) * 10}%`, animationDuration: '1s', animationIterationCount: 3 }}
        >
            {emoji}
        </div>
    );
}

/* ─── ChatPanel ─────────────────────────────────────────────────────────── */
function ChatPanel({ onClose }: { onClose: () => void }) {
    const { chatMessages, send, isSending } = useChat();
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        await send(input.trim()); setInput('');
    };
    return (
        <div className="flex flex-col w-[300px] shrink-0 bg-[#0b0c18] border-l border-violet-500/10">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-violet-500/10 bg-[#0e0f1e] shrink-0">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                <span className="text-violet-300/70 text-[10px] font-black uppercase tracking-[0.15em]">Chat</span>
                <button onClick={onClose} className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                    <X size={11} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
                {chatMessages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-white/15 text-xs text-center leading-relaxed">El chat está vacío.<br />Di hola 👋</p>
                    </div>
                )}
                {chatMessages.map((msg: any) => {
                    const isOwn = msg.from?.isLocal ?? false;
                    return (
                        <div key={msg.id ?? msg.timestamp} className={`flex flex-col max-w-[85%] gap-0.5 ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}>
                            {!isOwn && <span className="text-violet-300/60 text-[9px] font-black uppercase tracking-widest px-1">{msg.from?.name || msg.from?.identity}</span>}
                            <div className={`px-3 py-2 ${isOwn ? 'bg-violet-600/85 rounded-2xl rounded-tr-sm' : 'bg-white/7 border border-white/8 rounded-2xl rounded-tl-sm'}`}>
                                <p className="text-white/88 text-[13px] leading-snug break-words">{msg.message}</p>
                                <time className="text-white/25 text-[9px] block text-right mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </time>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
            <div className="px-3 py-3 border-t border-violet-500/10 bg-[#0e0f1e] flex gap-2 items-end shrink-0">
                <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-white/5 border border-violet-500/15 rounded-[20px] px-4 py-2.5 text-[13px] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:bg-violet-500/6 transition-colors" />
                <button onClick={handleSend} disabled={isSending || !input.trim()}
                    className="w-10 h-10 min-w-[40px] rounded-full bg-gradient-to-br from-violet-700 to-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/25 disabled:opacity-40 transition-opacity">
                    <Send size={14} className="text-white" />
                </button>
            </div>
        </div>
    );
}

/* ─── VideoTile ─────────────────────────────────────────────────────────── */
function VideoTile({ trackRef, onClick, isPinned, isHandRaised }: {
    trackRef: TrackReferenceOrPlaceholder;
    onClick?: () => void;
    isPinned?: boolean;
    isHandRaised?: boolean;
}) {
    const p = trackRef.participant;
    const hasVideo = isTrackReference(trackRef) && !trackRef.publication.isMuted;
    const initials = (p.name || p.identity || '?')[0].toUpperCase();
    return (
        <div onClick={onClick} className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#0b0c18] ${onClick ? 'cursor-pointer' : ''} ${isPinned ? 'ring-2 ring-violet-500/60' : 'border border-violet-500/10'}`}>
            {hasVideo
                ? <VideoTrack trackRef={trackRef as any} className="absolute inset-0 w-full h-full object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]">
                    <div className="w-16 h-16 rounded-full bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                        <span className="text-xl font-black text-violet-300">{initials}</span>
                    </div>
                </div>
            }
            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1.5">
                {isHandRaised && <span className="text-sm">✋</span>}
                <span className="text-white text-[11px] font-bold truncate">{p.name || p.identity}</span>
                {p.isSpeaking && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            </div>
        </div>
    );
}

/* ─── SpotlightLayout ───────────────────────────────────────────────────── */
function SpotlightLayout({ featured, strip, pinnedId, raisedHands, onPin }: {
    featured: TrackReferenceOrPlaceholder | null;
    strip: TrackReferenceOrPlaceholder[];
    pinnedId: string | null;
    raisedHands: Set<string>;
    onPin: (id: string | null) => void;
}) {
    return (
        <div className="flex h-full gap-2 p-2">
            {strip.length > 0 && (
                <div className="flex flex-col gap-2 w-40 shrink-0 overflow-y-auto">
                    {strip.map(t => (
                        <div key={`${t.participant.identity}:${t.source}`} className="h-[100px] shrink-0">
                            <VideoTile trackRef={t} isPinned={pinnedId === t.participant.identity}
                                isHandRaised={raisedHands.has(t.participant.identity)}
                                onClick={() => onPin(pinnedId === t.participant.identity ? null : t.participant.identity)} />
                        </div>
                    ))}
                </div>
            )}
            <div className="flex-1 min-w-0 h-full">
                {featured
                    ? <VideoTile trackRef={featured} isPinned={pinnedId === featured.participant.identity}
                        isHandRaised={raisedHands.has(featured.participant.identity)}
                        onClick={() => onPin(pinnedId === featured.participant.identity ? null : featured.participant.identity)} />
                    : <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">Sin participantes</div>
                }
            </div>
        </div>
    );
}

/* ─── GridLayout ────────────────────────────────────────────────────────── */
function GridLayout({ tracks, pinnedId, raisedHands, onPin }: {
    tracks: TrackReferenceOrPlaceholder[];
    pinnedId: string | null;
    raisedHands: Set<string>;
    onPin: (id: string | null) => void;
}) {
    const n = tracks.length;
    const cols = n <= 1 ? 'grid-cols-1' : n <= 4 ? 'grid-cols-2' : 'grid-cols-3';
    const seen = new Set<string>();
    const unique = tracks.filter(t => { const k = `${t.participant.identity}:${t.source}`; if (seen.has(k)) return false; seen.add(k); return true; });
    return (
        <div className={`grid ${cols} gap-2 p-2 h-full`} style={{ gridAutoRows: '1fr' }}>
            {unique.map(t => (
                <VideoTile key={`${t.participant.identity}:${t.source}`} trackRef={t}
                    isPinned={pinnedId === t.participant.identity}
                    isHandRaised={raisedHands.has(t.participant.identity)}
                    onClick={() => onPin(pinnedId === t.participant.identity ? null : t.participant.identity)} />
            ))}
        </div>
    );
}

/* ─── InviteButton ────────────────────────────────────────────────────────  */
function InviteButton({ roomId }: { roomId: string }) {
    const [copied, setCopied] = useState(false);
    const link = typeof window !== 'undefined' ? `${window.location.origin}/call/${roomId}` : '';
    const copy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Link copiado al portapapeles');
        setTimeout(() => setCopied(false), 2500);
    };
    return (
        <button onClick={copy}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/8 text-white/50 hover:bg-violet-500/12 hover:border-violet-500/30 hover:text-violet-200/90 transition-colors">
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copiado!' : 'Invitar'}</span>
        </button>
    );
}

/* ─── VideoCallInner ──────────────────────────────────────────────────────- */
const VideoCallInner = ({ roomId, userName, onLeave }: { roomId: string; userName: string; onLeave: () => void }) => {
    const participants = useParticipants();
    const connectionState = useConnectionState();
    const isConnected = connectionState === ConnectionState.Connected;
    const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();

    const [pinnedId, setPinnedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'spotlight' | 'grid'>('spotlight');
    const [chatOpen, setChatOpen] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
    const [showReactions, setShowReactions] = useState(false);
    const [activeReactions, setActiveReactions] = useState<{ emoji: string; id: number }[]>([]);

    const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
    const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], { onlySubscribed: false });

    // Sync hand raise via metadata — only when fully connected
    useEffect(() => {
        if (!isConnected) return;
        localParticipant.setMetadata(JSON.stringify({ handRaised })).catch(() => {
            // silently ignore if room is disconnecting
        });
    }, [handRaised, isConnected]);

    // Read others' hand raise from metadata
    useEffect(() => {
        const raised = new Set<string>();
        participants.forEach(p => {
            try {
                const meta = JSON.parse(p.metadata || '{}');
                if (meta.handRaised) raised.add(p.identity);
            } catch { }
        });
        setRaisedHands(raised);
    }, [participants]);

    const sendReaction = (emoji: string) => {
        const id = Date.now();
        setActiveReactions(prev => [...prev, { emoji, id }]);
        setTimeout(() => setActiveReactions(prev => prev.filter(r => r.id !== id)), 3500);
        setShowReactions(false);
    };

    const activeSpeakerId = useMemo(() => {
        const sp = participants.filter(p => p.isSpeaking);
        return sp.length > 0 ? sp[0].identity : null;
    }, [participants]);

    const featuredTrack = useMemo(() => {
        if (screenTracks.length > 0) return screenTracks[0];
        if (pinnedId) { const t = cameraTracks.find(t => t.participant.identity === pinnedId); if (t) return t; }
        if (activeSpeakerId) { const t = cameraTracks.find(t => t.participant.identity === activeSpeakerId); if (t) return t; }
        return cameraTracks[0] ?? null;
    }, [cameraTracks, screenTracks, pinnedId, activeSpeakerId]);

    const stripTracks = useMemo(() =>
        featuredTrack ? cameraTracks.filter(t => t.participant.identity !== featuredTrack.participant.identity) : cameraTracks
        , [cameraTracks, featuredTrack]);

    return (
        <div className="flex flex-col h-full bg-[#08090f]">
            {/* Floating reactions */}
            {activeReactions.map(r => <FloatingReaction key={r.id} emoji={r.emoji} id={r.id} />)}

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-violet-500/10 bg-[#08090f]/90 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center">
                            <Video size={14} className="text-violet-400" />
                        </div>
                        {isConnected && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#08090f] animate-pulse" />}
                    </div>
                    <div>
                        <h1 className="text-[11px] font-black text-white uppercase tracking-widest">Video Call</h1>
                        <p className="text-[9px] text-violet-400/60 font-bold uppercase tracking-wider">{userName}</p>
                    </div>
                </div>

                {/* Room ID badge */}
                <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/6 border border-violet-500/12 rounded-full">
                    <span className="text-[9px] text-violet-300/50 font-mono uppercase tracking-widest">{(roomId ?? '').slice(0, 8).toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/3 border border-white/7">
                        <Users size={9} className="text-white/30" />
                        <span className="text-[9px] text-white/40 font-bold">{participants.length}</span>
                    </div>
                    {raisedHands.size > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                            <span className="text-[10px]">✋</span>
                            <span className="text-[9px] font-black text-amber-400">{raisedHands.size}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 min-w-0 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/4 rounded-full blur-[120px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/4 rounded-full blur-[100px]" />
                    </div>
                    <div className="relative z-10 h-full">
                        {viewMode === 'grid'
                            ? <GridLayout tracks={[...cameraTracks, ...screenTracks]} pinnedId={pinnedId} raisedHands={raisedHands} onPin={setPinnedId} />
                            : <SpotlightLayout featured={featuredTrack} strip={stripTracks} pinnedId={pinnedId} raisedHands={raisedHands} onPin={setPinnedId} />
                        }
                    </div>
                </div>
                {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
            </div>

            {/* Control bar */}
            <div className="flex items-center justify-center flex-wrap gap-2 px-6 py-3 bg-[#04050a] border-t border-violet-500/10 shrink-0 relative">
                {/* Reactions picker */}
                {showReactions && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-2 bg-[#0e0f1e] border border-violet-500/15 rounded-2xl px-3 py-2 shadow-xl">
                        {REACTIONS.map(e => (
                            <button key={e} onClick={() => sendReaction(e)}
                                className="text-xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                    </div>
                )}

                {/* Mic */}
                <button onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isMicrophoneEnabled ? 'bg-violet-600/90 border border-violet-500/50 text-white' : 'bg-red-500/8 border border-red-500/20 text-red-300/75 hover:bg-red-500/15'}`}>
                    {isMicrophoneEnabled ? <Mic size={13} /> : <MicOff size={13} />}
                    <span>Mic</span>
                </button>

                {/* Camera */}
                <button onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isCameraEnabled ? 'bg-violet-600/90 border border-violet-500/50 text-white' : 'bg-red-500/8 border border-red-500/20 text-red-300/75 hover:bg-red-500/15'}`}>
                    {isCameraEnabled ? <Video size={13} /> : <VideoOff size={13} />}
                    <span>Cámara</span>
                </button>

                {/* Screen share */}
                <button onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isScreenShareEnabled ? 'bg-red-500/85 border border-red-400/50 text-white' : 'bg-white/5 border border-white/8 text-white/50 hover:bg-violet-500/12 hover:border-violet-500/30 hover:text-violet-200/90'}`}>
                    {isScreenShareEnabled ? <MonitorOff size={13} /> : <Monitor size={13} />}
                    <span>{isScreenShareEnabled ? 'Stop Share' : 'Compartir'}</span>
                </button>

                {/* Hand raise */}
                <button onClick={() => setHandRaised(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${handRaised ? 'bg-amber-500/90 border border-amber-400/50 text-white' : 'bg-white/5 border border-white/8 text-white/50 hover:bg-amber-500/12 hover:border-amber-500/30 hover:text-amber-200/90'}`}>
                    <Hand size={13} />
                    <span>{handRaised ? 'Bajar' : 'Levantar'}</span>
                </button>

                {/* Reactions */}
                <button onClick={() => setShowReactions(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/8 text-white/50 hover:bg-violet-500/12 hover:border-violet-500/30 hover:text-violet-200/90 transition-colors">
                    <Smile size={13} />
                    <span>Reaccionar</span>
                </button>

                {/* View */}
                <button onClick={() => setViewMode(v => v === 'grid' ? 'spotlight' : 'grid')}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/8 text-white/50 hover:bg-violet-500/12 hover:border-violet-500/30 hover:text-violet-200/90 transition-colors">
                    {viewMode === 'spotlight' ? <LayoutGrid size={13} /> : <LayoutPanelLeft size={13} />}
                    <span>{viewMode === 'spotlight' ? 'Grid' : 'Focus'}</span>
                </button>

                {/* Chat */}
                <button onClick={() => setChatOpen(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${chatOpen ? 'bg-violet-600/90 border border-violet-500/50 text-white' : 'bg-white/5 border border-white/8 text-white/50 hover:bg-violet-500/12 hover:border-violet-500/30 hover:text-violet-200/90'}`}>
                    <MessageCircle size={13} />
                    <span>Chat</span>
                </button>

                {/* Invite */}
                <InviteButton roomId={roomId} />

                {/* Leave */}
                <button onClick={onLeave}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/8 border border-red-500/20 text-red-300/75 hover:bg-red-500/15 hover:border-red-500/35 hover:text-red-300 transition-colors">
                    <PhoneOff size={13} />
                    <span>Salir</span>
                </button>
            </div>

            <RoomAudioRenderer />
        </div>
    );
};

/* ─── Main VideoCallRoom ────────────────────────────────────────────────── */
export const VideoCallRoom = ({ roomId }: { roomId: string }) => {
    // ── All hooks FIRST — no early returns before this block ──────────────
    const { user, isHydrated } = useAuthStore();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [lkUrl, setLkUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef(false);

    // Derived constants (not hooks — safe to compute early)
    const TOKEN_KEY = `vc_token_${roomId ?? ''}`;
    const URL_KEY = `vc_url_${roomId ?? ''}`;
    const clearCache = () => { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(URL_KEY); };

    // Redirect if unauthenticated (via effect, not during render)
    useEffect(() => {
        if (isHydrated && !user) router.replace('/login');
    }, [isHydrated, user]);

    // Fetch / restore token
    useEffect(() => {
        if (!roomId || !isHydrated || !user) return;
        const ct = sessionStorage.getItem(TOKEN_KEY);
        const cu = sessionStorage.getItem(URL_KEY);
        if (ct && cu) { setToken(ct); setLkUrl(cu); return; }
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        (async () => {
            try {
                const data: any = await apiClient.post(`/video-call/rooms/${roomId}/join`, {
                    name: user.name || 'Participant',
                    isHost: false,
                });
                sessionStorage.setItem(TOKEN_KEY, data.token);
                sessionStorage.setItem(URL_KEY, data.url);
                setToken(data.token);
                setLkUrl(data.url);
            } catch (e: any) {
                clearCache();
                setError(e.message || 'No se pudo unir a la videollamada');
                toast.error('Error al unirse');
            }
        })();
    }, [roomId, isHydrated, user]);

    const handleLeave = () => { clearCache(); router.back(); };
    const handleError = (err: Error) => {
        const m = err.message || '';
        const isMedia = ['AbortError', 'NotAllowedError', 'NotFoundError'].includes(err.name)
            || m.includes('getUserMedia') || m.includes('Timeout');
        if (isMedia) { toast.error('Verifica permisos de cámara/micrófono', { duration: 5000 }); return; }
        clearCache(); setError(m);
    };

    // ── Early returns AFTER all hooks ─────────────────────────────────────
    if (!roomId || !isHydrated || !user) return (
        <div className="fixed inset-0 bg-[#08090f] flex items-center justify-center">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
                <div className="w-14 h-14 rounded-full border-t-2 border-violet-500 animate-spin" />
                <div className="absolute inset-3 flex items-center justify-center"><Video size={14} className="text-violet-400" /></div>
            </div>
        </div>
    );

    if (!token || !lkUrl) return (
        <div className="fixed inset-0 bg-[#08090f] flex items-center justify-center">
            {error
                ? <div className="max-w-sm w-full bg-white/3 border border-white/8 rounded-3xl p-8 text-center">
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                    <button onClick={() => router.back()} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest">Volver</button>
                </div>
                : <div className="flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
                        <div className="w-14 h-14 rounded-full border-t-2 border-violet-500 animate-spin" />
                        <div className="absolute inset-3 flex items-center justify-center"><Video size={14} className="text-violet-400" /></div>
                    </div>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Conectando...</p>
                </div>
            }
        </div>
    );

    return (
        <>
            <style>{lkBase}</style>
            <div className="fixed inset-0 overflow-hidden">
                <LiveKitRoom video={false} audio={false} token={token} serverUrl={lkUrl} connect
                    onDisconnected={handleLeave} onError={handleError}
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <VideoCallInner roomId={roomId} userName={user?.name || 'Participant'} onLeave={handleLeave} />
                </LiveKitRoom>
            </div>
        </>
    );
};
