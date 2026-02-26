'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';
import {
    Radio, WifiOff, ShieldAlert, MessageCircle, Send,
    Pin, PinOff, LayoutGrid, LayoutPanelLeft,
    Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff, X, Users,
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

/* ─── Minimal CSS — only LiveKit internals we can't reach with Tailwind ─── */
const lkBase = `
  .lk-participant-tile { background: #0c0d1a !important; border-radius: 16px !important; overflow: hidden !important; }
  .lk-participant-tile video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
  .lk-participant-placeholder { background: #0c0d1a !important; display:flex; align-items:center; justify-content:center; }
  .lk-participant-metadata { display: none !important; }
  [data-lk-theme] { --lk-bg: #07080f; }
`;

/* ─── ChatPanel ─────────────────────────────────────────────────────────── */
function ChatPanel({ onClose }: { onClose: () => void }) {
    const { chatMessages, send, isSending } = useChat();
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        await send(input.trim());
        setInput('');
    };

    return (
        <div className="flex flex-col w-[300px] shrink-0 bg-[#0a0b14] border-l border-indigo-500/10">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-indigo-500/10 bg-[#0d0e1c] shrink-0">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                <span className="text-indigo-300/70 text-[10px] font-black uppercase tracking-[0.15em]">Messages</span>
                <button onClick={onClose} className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-white/30 hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 transition-colors">
                    <X size={11} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
                {chatMessages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-white/15 text-xs text-center leading-relaxed">No hay mensajes aún.<br />Sé el primero en escribir.</p>
                    </div>
                )}
                {chatMessages.map((msg: any) => {
                    const isOwn = msg.from?.isLocal ?? false;
                    const name = msg.from?.name || msg.from?.identity || 'Unknown';
                    return (
                        <div key={msg.id ?? msg.timestamp} className={`flex flex-col max-w-[85%] gap-0.5 ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}>
                            {!isOwn && (
                                <span className="text-indigo-300/60 text-[9px] font-black uppercase tracking-widest px-1">{name}</span>
                            )}
                            <div className={`px-3 py-2 ${isOwn ? 'bg-indigo-600/85 rounded-2xl rounded-tr-sm' : 'bg-white/7 border border-white/8 rounded-2xl rounded-tl-sm'}`}>
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

            {/* Input */}
            <div className="px-3 py-3 border-t border-indigo-500/10 bg-[#0d0e1c] flex gap-2 items-end shrink-0">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-white/5 border border-indigo-500/15 rounded-[20px] px-4 py-2.5 text-[13px] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-indigo-500/6 transition-colors resize-none"
                />
                <button
                    onClick={handleSend}
                    disabled={isSending || !input.trim()}
                    className="w-10 h-10 min-w-[40px] rounded-full bg-gradient-to-br from-indigo-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                    <Send size={14} className="text-white" />
                </button>
            </div>
        </div>
    );
}

/* ─── VideoTile ─────────────────────────────────────────────────────────── */
function VideoTile({ trackRef, onClick, isPinned }: {
    trackRef: TrackReferenceOrPlaceholder;
    onClick?: () => void;
    isPinned?: boolean;
}) {
    const p = trackRef.participant;
    const hasVideo = isTrackReference(trackRef) && !trackRef.publication.isMuted;
    const initials = (p.name || p.identity || 'G')[0].toUpperCase();

    return (
        <div
            onClick={onClick}
            className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#0c0d1a] select-none ${onClick ? 'cursor-pointer' : ''} ${isPinned ? 'ring-2 ring-indigo-500/60' : 'border border-indigo-500/10'}`}
        >
            {hasVideo
                ? <VideoTrack trackRef={trackRef as any} className="absolute inset-0 w-full h-full object-cover" />
                : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]">
                        <div className="w-16 h-16 rounded-full bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center">
                            <span className="text-xl font-black text-indigo-400">{initials}</span>
                        </div>
                    </div>
                )
            }
            {/* Name bar */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1.5">
                {isPinned && <Pin size={9} className="text-indigo-300 shrink-0" />}
                <span className="text-white text-[11px] font-bold truncate">{p.name || p.identity}</span>
                {p.isSpeaking && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            </div>
        </div>
    );
}

/* ─── SpotlightLayout ───────────────────────────────────────────────────── */
function SpotlightLayout({ featured, strip, pinnedId, onPin }: {
    featured: TrackReferenceOrPlaceholder | null;
    strip: TrackReferenceOrPlaceholder[];
    pinnedId: string | null;
    onPin: (id: string | null) => void;
}) {
    return (
        <div className="flex h-full gap-2 p-2">
            {/* Left thumbnail strip */}
            {strip.length > 0 && (
                <div className="flex flex-col gap-2 w-40 shrink-0 overflow-y-auto">
                    {strip.map(t => (
                        <div key={`${t.participant.identity}:${t.source}`} className="h-[100px] shrink-0">
                            <VideoTile
                                trackRef={t}
                                isPinned={pinnedId === t.participant.identity}
                                onClick={() => onPin(pinnedId === t.participant.identity ? null : t.participant.identity)}
                            />
                        </div>
                    ))}
                </div>
            )}
            {/* Featured */}
            <div className="flex-1 min-w-0 h-full">
                {featured
                    ? <VideoTile
                        trackRef={featured}
                        isPinned={pinnedId === featured.participant.identity}
                        onClick={() => onPin(pinnedId === featured.participant.identity ? null : featured.participant.identity)}
                    />
                    : <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">Sin participantes</div>
                }
            </div>
        </div>
    );
}

/* ─── GridLayout ────────────────────────────────────────────────────────── */
function GridLayout({ tracks, pinnedId, onPin }: {
    tracks: TrackReferenceOrPlaceholder[];
    pinnedId: string | null;
    onPin: (id: string | null) => void;
}) {
    const n = tracks.length;
    const cols = n <= 1 ? 'grid-cols-1' : n <= 4 ? 'grid-cols-2' : 'grid-cols-3';
    // Deduplicate: a participant can have camera + screenshare = same identity
    const seen = new Set<string>();
    const unique = tracks.filter(t => {
        const k = `${t.participant.identity}:${t.source}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
    return (
        <div className={`grid ${cols} gap-2 p-2 h-full`} style={{ gridAutoRows: '1fr' }}>
            {unique.map(t => (
                <VideoTile
                    key={`${t.participant.identity}:${t.source}`}
                    trackRef={t}
                    isPinned={pinnedId === t.participant.identity}
                    onClick={() => onPin(pinnedId === t.participant.identity ? null : t.participant.identity)}
                />
            ))}
        </div>
    );
}

/* ─── ControlBar ────────────────────────────────────────────────────────── */
function CtrlBtn({ on, onLabel, offLabel, onIcon, offIcon, onClick, danger }: {
    on: boolean; onLabel: string; offLabel: string;
    onIcon: React.ReactNode; offIcon: React.ReactNode;
    onClick: () => void; danger?: boolean;
}) {
    const base = 'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors select-none';
    const active = danger
        ? 'bg-red-500/85 border border-red-400/50 text-white'
        : 'bg-indigo-600/90 border border-indigo-500/50 text-white';
    const inactive = danger
        ? 'bg-red-500/8 border border-red-500/20 text-red-300/75 hover:bg-red-500/15 hover:border-red-500/35'
        : 'bg-white/5 border border-white/8 text-white/50 hover:bg-indigo-500/12 hover:border-indigo-500/30 hover:text-indigo-200/90';
    return (
        <button onClick={onClick} className={`${base} ${on ? active : inactive}`}>
            {on ? onIcon : offIcon}
            <span>{on ? onLabel : offLabel}</span>
        </button>
    );
}

function CustomControlBar({ onLeave, chatOpen, onChatToggle, viewMode, onViewToggle }: {
    onLeave: () => void; chatOpen: boolean; onChatToggle: () => void;
    viewMode: 'spotlight' | 'grid'; onViewToggle: () => void;
}) {
    const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
    return (
        <div className="flex items-center justify-center flex-wrap gap-2 px-6 py-3 bg-[#03040a] border-t border-indigo-500/10 backdrop-blur-xl shrink-0">
            <CtrlBtn on={isMicrophoneEnabled} onLabel="Mic" offLabel="Mic Off"
                onIcon={<Mic size={13} />} offIcon={<MicOff size={13} />}
                onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)} />
            <CtrlBtn on={isCameraEnabled} onLabel="Cámara" offLabel="Cámara Off"
                onIcon={<Video size={13} />} offIcon={<VideoOff size={13} />}
                onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)} />
            <CtrlBtn on={isScreenShareEnabled} onLabel="Compartiendo" offLabel="Compartir"
                onIcon={<MonitorOff size={13} />} offIcon={<Monitor size={13} />}
                onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)} danger={isScreenShareEnabled} />
            <button onClick={onViewToggle}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/8 text-white/50 hover:bg-indigo-500/12 hover:border-indigo-500/30 hover:text-indigo-200/90 transition-colors">
                {viewMode === 'spotlight' ? <><LayoutGrid size={13} /><span>Grid</span></> : <><LayoutPanelLeft size={13} /><span>Focus</span></>}
            </button>
            <button onClick={onChatToggle}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${chatOpen ? 'bg-indigo-600/90 border border-indigo-500/50 text-white' : 'bg-white/5 border border-white/8 text-white/50 hover:bg-indigo-500/12 hover:border-indigo-500/30 hover:text-indigo-200/90'}`}>
                <MessageCircle size={13} /><span>Chat</span>
            </button>
            <button onClick={onLeave}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/8 border border-red-500/20 text-red-300/75 hover:bg-red-500/15 hover:border-red-500/35 hover:text-red-300 transition-colors">
                <PhoneOff size={13} /><span>Leave</span>
            </button>
        </div>
    );
}

/* ─── GuestRoomInner ────────────────────────────────────────────────────── */
const GuestRoomInner = ({ productionId, userName, onLeave }: { productionId: string; userName: string; onLeave: () => void }) => {
    const participants = useParticipants();
    const connectionState = useConnectionState();
    const isConnected = connectionState === ConnectionState.Connected;
    const [pinnedId, setPinnedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'spotlight' | 'grid'>('spotlight');
    const [chatOpen, setChatOpen] = useState(false);

    const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
    const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], { onlySubscribed: false });

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
                            ? <GridLayout tracks={[...cameraTracks, ...screenTracks]} pinnedId={pinnedId} onPin={setPinnedId} />
                            : <SpotlightLayout featured={featuredTrack} strip={stripTracks} pinnedId={pinnedId} onPin={setPinnedId} />
                        }
                    </div>
                </div>
                {/* Chat sidebar */}
                {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
            </div>

            {/* Control bar */}
            <CustomControlBar
                onLeave={onLeave}
                chatOpen={chatOpen}
                onChatToggle={() => setChatOpen(v => !v)}
                viewMode={viewMode}
                onViewToggle={() => setViewMode(v => v === 'grid' ? 'spotlight' : 'grid')}
            />
            <RoomAudioRenderer />
        </div>
    );
};

/* ─── Main exported component ───────────────────────────────────────────── */
export const GuestRoom = ({ productionId }: { productionId: string }) => {
    const { user } = useAuthStore();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [lkUrl, setLkUrl] = useState<string | null>(null);
    const [error, setError] = useState<{ type: 'permission' | 'connection'; msg: string } | null>(null);
    const fetchedRef = useRef(false);

    const TOKEN_KEY = `lk_token_${productionId}`;
    const URL_KEY = `lk_url_${productionId}`;
    const clearCache = () => { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(URL_KEY); };

    useEffect(() => {
        // 1. Restore from cache first (handles F5 / soft reload)
        const cachedToken = sessionStorage.getItem(TOKEN_KEY);
        const cachedUrl = sessionStorage.getItem(URL_KEY);
        if (cachedToken && cachedUrl) { setToken(cachedToken); setLkUrl(cachedUrl); return; }
        // 2. Fetch fresh token
        if (fetchedRef.current || !user) return;
        fetchedRef.current = true;
        (async () => {
            try {
                const data: any = await apiClient.post(`/streaming/${productionId}/token`, {
                    identity: user.id || `guest-${Math.random().toString(36).slice(7)}`,
                    name: user.name || 'Guest',
                    isOperator: false,
                });
                sessionStorage.setItem(TOKEN_KEY, data.token);
                sessionStorage.setItem(URL_KEY, data.url);
                setToken(data.token);
                setLkUrl(data.url);
            } catch (e: any) {
                clearCache();
                setError({ type: 'permission', msg: e.message });
                toast.error('Acceso denegado');
            }
        })();
    }, [productionId, user]);

    const handleError = (err: Error) => {
        const m = err.message || '';
        const isMedia = ['AbortError', 'NotAllowedError', 'NotFoundError'].includes(err.name)
            || m.includes('video source') || m.includes('getUserMedia') || m.includes('Timeout');
        if (isMedia) { toast.error('Verifica permisos de cámara/micrófono', { duration: 5000 }); return; }
        clearCache();
        setError({ type: 'connection', msg: m });
    };

    const handleRetry = () => { clearCache(); fetchedRef.current = false; setError(null); setToken(null); setLkUrl(null); };
    const handleLeave = () => { clearCache(); router.back(); };


    /* Loading */
    if (!token || !lkUrl) return (
        <div className="fixed inset-0 bg-[#07080f] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
                    <div className="w-14 h-14 rounded-full border-t-2 border-indigo-500 animate-spin" />
                    <div className="absolute inset-3 flex items-center justify-center"><Radio size={14} className="text-indigo-400" /></div>
                </div>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Conectando...</p>
            </div>
        </div>
    );

    /* Permission error */
    if (error?.type === 'permission') return (
        <div className="fixed inset-0 bg-[#07080f] flex items-center justify-center p-6">
            <div className="max-w-sm w-full bg-white/3 border border-white/8 rounded-3xl p-8 text-center backdrop-blur-xl">
                <ShieldAlert size={32} className="text-red-400 mx-auto mb-4" />
                <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">Acceso Denegado</h2>
                <p className="text-white/40 text-sm mb-6">Solicita al director que te asigne el rol de <span className="text-indigo-400 font-bold">GUEST</span>.</p>
                <button onClick={handleLeave} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-colors">Volver</button>
            </div>
        </div>
    );

    /* Connection error */
    if (error?.type === 'connection') return (
        <div className="fixed inset-0 bg-[#07080f] flex items-center justify-center p-6">
            <div className="max-w-sm w-full bg-white/3 border border-white/8 rounded-3xl p-8 text-center backdrop-blur-xl">
                <WifiOff size={32} className="text-amber-400 mx-auto mb-4" />
                <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">Servidor No Disponible</h2>
                <p className="text-white/40 text-sm mb-4">El servidor LiveKit no responde.</p>
                <code className="block text-left bg-black/30 border border-white/8 rounded-xl p-3 text-amber-400 text-xs mb-6 font-mono">docker compose up livekit -d</code>
                <div className="flex gap-2">
                    <button onClick={handleRetry}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-colors">Reintentar</button>
                    <button onClick={handleLeave}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-colors">Salir</button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <style>{lkBase}</style>
            <div className="fixed inset-0 overflow-hidden">
                <LiveKitRoom
                    video={false} audio={false}
                    token={token} serverUrl={lkUrl} connect
                    onDisconnected={handleLeave}
                    onError={handleError}
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                    <GuestRoomInner productionId={productionId} userName={user?.name || 'Guest'} onLeave={handleLeave} />
                </LiveKitRoom>
            </div>
        </>
    );
};
