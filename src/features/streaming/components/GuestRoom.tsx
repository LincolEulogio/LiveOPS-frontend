'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'next/navigation';
import {
    Video, VideoOff, Mic, MicOff,
    Settings, Users, DoorOpen,
    Monitor, Signal, Radio
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

// Dynamic import for SimplePeer to avoid SSR issues
const SimplePeer = typeof window !== 'undefined' ? require('simple-peer') : null;

interface GuestRoomProps {
    productionId: string;
}

interface PeerConnection {
    peerId: string;
    peer: any;
    stream?: MediaStream;
}

export const GuestRoom = ({ productionId }: GuestRoomProps) => {
    const { socket, isConnected: isSocketConnected } = useSocket();
    const { user } = useAuthStore();
    const router = useRouter();

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peersRef = useRef<Map<string, PeerConnection>>(new Map());

    // 1. Initialize Local Media
    const initMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, frameRate: 30 },
                audio: true
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Failed to get local media:', err);
            toast.error('Could not access camera/microphone');
        }
    }, []);

    useEffect(() => {
        initMedia();
        return () => {
            localStream?.getTracks().forEach(track => track.stop());
        };
    }, [initMedia]);

    // 2. WebRTC Signalling Handlers
    useEffect(() => {
        if (!socket || !isSocketConnected || !localStream) return;

        const handleSignalReceived = (data: { senderUserId: string; signal: any }) => {
            const peerInfo = peersRef.current.get(data.senderUserId);

            if (peerInfo) {
                // We already have a peer, just signal it
                peerInfo.peer.signal(data.signal);
            } else {
                // New peer (someone else initiated an offer)
                createPeer(data.senderUserId, false, data.signal);
            }
        };

        const handlePresenceUpdate = (data: { members: any[] }) => {
            // Find Operators/Directors to connect to
            const targets = data.members.filter(m =>
                (m.roleName === 'DIRECTOR' || m.roleName === 'OPERATOR') &&
                m.userId !== user?.id
            );

            targets.forEach(target => {
                if (!peersRef.current.has(target.userId)) {
                    // If we are a Guest, we might want to initiate connections to the Director
                    // Or wait for Director to initiate. Let's wait for now to simplify, 
                    // or just initiate to all targets for a mesh.
                    createPeer(target.userId, true);
                }
            });
        };

        socket.on('webrtc.signal_received', handleSignalReceived);
        socket.on('presence.update', handlePresenceUpdate);

        return () => {
            socket.off('webrtc.signal_received', handleSignalReceived);
            socket.off('presence.update', handlePresenceUpdate);
        };
    }, [socket, isSocketConnected, localStream, user?.id]);

    const createPeer = (peerId: string, initiator: boolean, incomingSignal?: any) => {
        if (!localStream || !SimplePeer) return;

        console.log(`SimplePeer: Creating peer with ${peerId} (initiator: ${initiator})`);

        const peer = new SimplePeer({
            initiator,
            trickle: false,
            stream: localStream,
        });

        peer.on('signal', (signal: any) => {
            if (socket) {
                socket.emit('webrtc.signal', {
                    productionId,
                    targetUserId: peerId,
                    signal
                });
            }
        });

        peer.on('stream', (stream: MediaStream) => {
            console.log(`SimplePeer: Received stream from ${peerId}`);
            updatePeers(peerId, { stream });
        });

        peer.on('close', () => {
            console.log(`SimplePeer: Peer ${peerId} closed`);
            removePeer(peerId);
        });

        peer.on('error', (err: any) => {
            console.error('Peer error:', err);
            removePeer(peerId);
        });

        if (incomingSignal) {
            peer.signal(incomingSignal);
        }

        const peerInfo: PeerConnection = { peerId, peer };
        peersRef.current.set(peerId, peerInfo);
        setPeers(new Map(peersRef.current));
    };

    const updatePeers = (peerId: string, updates: Partial<PeerConnection>) => {
        const existing = peersRef.current.get(peerId);
        if (existing) {
            peersRef.current.set(peerId, { ...existing, ...updates });
            setPeers(new Map(peersRef.current));
        }
    };

    const removePeer = (peerId: string) => {
        const peerInfo = peersRef.current.get(peerId);
        if (peerInfo) {
            peerInfo.peer.destroy();
            peersRef.current.delete(peerId);
            setPeers(new Map(peersRef.current));
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-stone-950 font-sans text-stone-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Radio size={20} className="text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Green Room</h1>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black">
                            Production ID: {productionId.split('-')[0]}...
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-stone-800/50 rounded-full border border-stone-700/50">
                        <div className={cn("w-2 h-2 rounded-full", isSocketConnected ? "bg-emerald-500" : "bg-red-500 animate-pulse")} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            {isSocketConnected ? 'Connected' : 'Reconnecting...'}
                        </span>
                    </div>
                    <button className="p-2 hover:bg-stone-800 rounded-lg transition-colors">
                        <Settings size={20} className="text-stone-400" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
                {/* Local Preview Section */}
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    <div className="relative group flex-1 bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className={cn(
                                "w-full h-full object-cover transition-opacity duration-500",
                                isCameraOn ? "opacity-100" : "opacity-0"
                            )}
                        />

                        {/* Camera Off Placeholder */}
                        {!isCameraOn && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/90 gap-4">
                                <div className="p-8 bg-stone-800 rounded-full border border-stone-700">
                                    <VideoOff size={64} className="text-stone-600" />
                                </div>
                                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">Cámara Desactivada</p>
                            </div>
                        )}

                        {/* Overlay Info */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                            <span className="text-xs font-bold text-white uppercase tracking-tight">TÚ</span>
                            <div className="flex gap-1 h-3 items-end">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${40 + Math.random() * 60}%` }} />
                                ))}
                            </div>
                        </div>

                        {/* Controls Float */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-stone-900/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl scale-110">
                            <button
                                onClick={toggleMic}
                                className={cn(
                                    "p-3 rounded-xl transition-all",
                                    isMicOn ? "bg-stone-800 text-stone-200 hover:bg-stone-700" : "bg-red-500 text-white hover:bg-red-600"
                                )}
                            >
                                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button
                                onClick={toggleCamera}
                                className={cn(
                                    "p-3 rounded-xl transition-all",
                                    isCameraOn ? "bg-stone-800 text-stone-200 hover:bg-stone-700" : "bg-red-500 text-white hover:bg-red-600"
                                )}
                            >
                                {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                            </button>
                            <div className="w-px h-8 bg-stone-700 mx-2" />
                            <button
                                onClick={() => router.back()}
                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Operator Status */}
                <div className="w-full md:w-80 flex flex-col gap-4">
                    <div className="flex flex-col gap-4 p-5 bg-stone-900/40 border border-stone-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Signal size={16} className="text-indigo-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Live Status</h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between p-3 bg-stone-800/40 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold uppercase text-stone-500">Latency</span>
                                <span className="text-xs font-mono text-emerald-400 tracking-tighter">~42ms</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-stone-800/40 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold uppercase text-stone-500">Video Quality</span>
                                <span className="text-xs font-bold text-stone-300">1080p @ 30fps</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 p-5 bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-indigo-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Control Room</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                            {Array.from(peers.values()).map(p => (
                                <div key={p.peerId} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-emerald-500 flex items-center justify-center overflow-hidden">
                                            <Users size={18} className="text-stone-600" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-950 flex items-center justify-center">
                                            <Monitor size={8} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase text-stone-400">Director</p>
                                        <p className="text-xs font-bold text-emerald-400">Connected</p>
                                    </div>
                                </div>
                            ))}

                            {peers.size === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                    <div className="p-4 bg-stone-800/50 rounded-full">
                                        <DoorOpen size={24} className="text-stone-600" />
                                    </div>
                                    <p className="text-[10px] uppercase font-black text-stone-600 leading-relaxed">
                                        Waiting for the Director<br />to join the session...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
