import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
    Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, PhoneOff,
    MessageCircle, Hand, Smile, LayoutGrid, LayoutPanelLeft, Copy, Users
} from 'lucide-react';
import { apiClient } from '@/shared/api/api.client';

import { FloatingReaction } from './FloatingReaction';
import { ChatPanel } from './ChatPanel';
import { InviteModal } from './InviteModal';
import { WebRTCLayout } from './layouts/WebRTCLayout';
import { useVideoCallWebRTC } from '../hooks/useVideoCallWebRTC';

const REACTIONS = ['👏', '❤️', '😂', '🔥', '👍', '🎉'];

export function VideoCallInner({ roomId, userId, userName, isHost, onLeave }: { roomId: string; userId: string; userName: string; isHost: boolean; onLeave: () => void }) {
    const {
        participants,
        isMicEnabled,
        isCamEnabled,
        isScreenSharing,
        toggleMic,
        toggleCam,
        toggleScreenShare
    } = useVideoCallWebRTC({
        productionId: roomId,
        userId,
        userName,
        isHost
    });

    const [chatOpen, setChatOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [activeReactions, setActiveReactions] = useState<{ emoji: string; id: number; senderName?: string }[]>([]);

    const chatKey = `chat_hist_${roomId}`;
    const [chatMessages, setChatMessages] = useState<any[]>(() => {
        if (typeof window !== 'undefined') {
            try { const saved = localStorage.getItem(chatKey); if (saved) return JSON.parse(saved); } catch { }
        }
        return [];
    });
    
    useEffect(() => { localStorage.setItem(chatKey, JSON.stringify(chatMessages)); }, [chatMessages, chatKey]);

    const handleSendChat = (text: string) => {
        const timestamp = Date.now();
        const id = timestamp + Math.random();
        const msg = { id, message: text, timestamp, from: { name: userName, isLocal: true } };
        setChatMessages(prev => [...prev, msg]);
        // TODO: Emit via socket
    };

    return (
        <div className="flex flex-col h-full bg-[#08090f]">
            {/* Floating reactions */}
            {activeReactions.map(r => <FloatingReaction key={r.id} emoji={r.emoji} id={r.id} senderName={r.senderName} />)}

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#08090f]/90 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Video size={14} className="text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-[11px] font-black text-foreground uppercase tracking-widest">Live Engine v2</h1>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{userName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Pure WebRTC Mesh</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <Users size={9} className="text-emerald-400" />
                            <span className="text-[9px] text-emerald-400 font-bold">{participants.size}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
                <WebRTCLayout participants={participants} localUserId={userId} />
                {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} messages={chatMessages} onSend={handleSendChat} />}
            </div>

            {/* Control bar */}
            <div className="flex items-center justify-center flex-wrap gap-2 px-6 py-4 bg-[#04050a] border-t border-white/5 shrink-0 relative z-99">
                {/* Reactions picker */}
                {showReactions && (
                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex gap-3 bg-[#0e0f1e] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl z-999">
                        {REACTIONS.map(e => (
                            <button key={e} onClick={() => { setShowReactions(false); toast.info(`Reacción: ${e}`); }}
                                className="text-2xl hover:scale-125 transition-transform active:scale-95">{e}</button>
                        ))}
                    </div>
                )}

                {/* Mic */}
                <button onClick={toggleMic}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${isMicEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                    {isMicEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                    <span>{isMicEnabled ? 'Muted' : 'Unmuted'}</span>
                </button>

                {/* Camera */}
                <button onClick={toggleCam}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${isCamEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                    {isCamEnabled ? <Video size={14} /> : <VideoOff size={14} />}
                    <span>Cámara</span>
                </button>

                <div className="w-px h-6 bg-white/10 mx-2" />

                {/* Screen share */}
                <button onClick={toggleScreenShare}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${isScreenSharing ? 'bg-emerald-600 text-white' : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'}`}>
                    {isScreenSharing ? <MonitorOff size={14} /> : <Monitor size={14} />}
                    <span>Monitor</span>
                </button>

                {/* Chat */}
                <button onClick={() => setChatOpen(v => !v)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${chatOpen ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'}`}>
                    <MessageCircle size={14} />
                    <span>Chat</span>
                </button>

                <div className="w-px h-6 bg-white/10 mx-2" />

                {/* Leave */}
                <button onClick={onLeave}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-600/20">
                    <PhoneOff size={14} />
                    <span>Abandonar</span>
                </button>
            </div>
        </div>
    );
}
