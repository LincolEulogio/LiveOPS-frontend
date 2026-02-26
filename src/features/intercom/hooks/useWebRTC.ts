import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { toast } from 'sonner';
import { ICE_CONFIG } from '@/shared/lib/ice-config';

interface WebRTCProps {
    productionId: string;
    userId: string;
    roleName?: string;
    isHost?: boolean;
}

export const useWebRTC = ({ productionId, userId, roleName, isHost = false }: WebRTCProps) => {
    const { socket, isConnected } = useSocket();
    const [isTalking, setIsTalking] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [talkingUsers, setTalkingUsers] = useState<Set<string>>(new Set());
    const [talkingLevels, setTalkingLevels] = useState<Map<string, number>>(new Map());
    const lastEmitTime = useRef<number>(0);
    const EMIT_INTERVAL = 100; // 100ms throttle for audio levels

    const [connectionStates, setConnectionStates] = useState<Map<string, RTCPeerConnectionState>>(new Map());
    const retryCounts = useRef<Map<string, number>>(new Map());
    const MAX_RETRIES = 5;

    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);
    const setupPromise = useRef<Promise<MediaStream | null> | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyserNode = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const remoteAudios = useRef<Map<string, HTMLAudioElement>>(new Map());
    const audioContainer = useRef<HTMLDivElement | null>(null);

    // Perfect Negotiation State
    const makingOffer = useRef<Map<string, boolean>>(new Map());
    const ignoreOffer = useRef<Map<string, boolean>>(new Map());
    const isSettingRemoteAnswerPending = useRef<Map<string, boolean>>(new Map());

    const [talkingInfo, setTalkingInfo] = useState<{ senderUserId: string, targetUserId: string | null, senderRoleName?: string } | null>(null);

    // Initialize hidden audio container
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const container = document.createElement('div');
        container.id = `webrtc-audio-container-${userId}`;
        container.style.display = 'none';
        document.body.appendChild(container);
        audioContainer.current = container;

        return () => {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        };
    }, [userId]);

    const handleRemoteStream = useCallback((stream: MediaStream, remoteUserId: string) => {
        if (typeof document === 'undefined') return;

        let audio = remoteAudios.current.get(remoteUserId);

        if (!audio) {
            audio = document.createElement('audio');
            audio.id = `audio-${remoteUserId}`;
            audio.autoplay = true;
            remoteAudios.current.set(remoteUserId, audio);
            if (audioContainer.current) {
                audioContainer.current.appendChild(audio);
            }
        }

        if (audio.srcObject !== stream) {
            audio.srcObject = stream;
        }

        audio.play().catch(e => {
            console.warn("WebRTC Audio Play Error:", e);
        });
    }, []);

    const setupLocalAudio = useCallback(async () => {
        if (typeof window === 'undefined') return null;
        if (setupPromise.current) return setupPromise.current;

        setupPromise.current = (async () => {
            try {
                if (localStream.current) return localStream.current;

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    }
                });
                localStream.current = stream;

                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                    audioContext.current = new AudioCtx();
                    analyserNode.current = audioContext.current.createAnalyser();
                    const source = audioContext.current.createMediaStreamSource(stream);
                    source.connect(analyserNode.current);
                    analyserNode.current.fftSize = 256;
                    const bufferLength = analyserNode.current.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    if (audioContext.current?.state === 'suspended') {
                        audioContext.current.resume();
                    }

                    const updateLevel = () => {
                        if (analyserNode.current) {
                            analyserNode.current.getByteFrequencyData(dataArray);
                            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                            setAudioLevel(prev => (prev === 0 && average < 5) ? 0 : average);

                            // Throttled Socket Emission
                            if (socket && isTalking && isConnected) {
                                const now = Date.now();
                                if (now - lastEmitTime.current > EMIT_INTERVAL) {
                                    socket.emit('webrtc.audio_level', {
                                        productionId,
                                        level: average
                                    });
                                    lastEmitTime.current = now;
                                }
                            }
                        }
                        animationRef.current = requestAnimationFrame(updateLevel);
                    };
                    updateLevel();
                }

                stream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });

                return stream;
            } catch (error) {
                console.error("Failed to get local audio:", error);
                toast.error("Error al acceder al micrófono.");
                setupPromise.current = null;
                return null;
            }
        })();

        return setupPromise.current;
    }, []);

    const createPeerConnection = useCallback((targetUserId: string, stream: MediaStream) => {
        const existing = peerConnections.current.get(targetUserId);
        if (existing && existing.signalingState !== 'closed') {
            return existing;
        }

        const pc = new RTCPeerConnection(ICE_CONFIG);

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // Negotiation Needed Event - Best practice
        pc.onnegotiationneeded = async () => {
            try {
                makingOffer.current.set(targetUserId, true);
                await pc.setLocalDescription(); // Automatic offer creation in modern browsers
                socket?.emit('webrtc.signal', {
                    productionId,
                    targetUserId,
                    signal: { sdp: pc.localDescription },
                    context: 'intercom'
                });
            } catch (err) {
                console.error(`[WebRTC] Negotiation error with ${targetUserId}:`, err);
            } finally {
                makingOffer.current.set(targetUserId, false);
            }
        };

        pc.ontrack = (event) => {
            handleRemoteStream(event.streams[0], targetUserId);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc.signal', {
                    productionId,
                    targetUserId,
                    signal: { ice: event.candidate }
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`[WebRTC] ICE State with ${targetUserId}: ${pc.iceConnectionState}`);
            if (pc.iceConnectionState === 'failed') {
                pc.restartIce();
            }
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            console.log(`[WebRTC] Connection State with ${targetUserId}: ${state}`);

            setConnectionStates(prev => {
                const updated = new Map(prev);
                updated.set(targetUserId, state);
                return updated;
            });

            if (state === 'failed') {
                const count = retryCounts.current.get(targetUserId) || 0;
                if (count < MAX_RETRIES) {
                    console.warn(`[WebRTC] Connection failed with ${targetUserId}. Retry ${count + 1}/${MAX_RETRIES}`);
                    retryCounts.current.set(targetUserId, count + 1);

                    // Delay retry to avoid spin-locking
                    setTimeout(() => {
                        pc.close();
                        peerConnections.current.delete(targetUserId);
                        initiateCall(targetUserId);
                    }, 2000 * (count + 1));
                } else {
                    console.error(`[WebRTC] Max retries reached for ${targetUserId}`);
                    toast.error(`Error de conexión persistente con ${targetUserId}`);
                }
            } else if (state === 'connected') {
                retryCounts.current.set(targetUserId, 0); // Reset on success
            }
        };

        peerConnections.current.set(targetUserId, pc);
        return pc;
    }, [productionId, socket, handleRemoteStream]);

    const initiateCall = useCallback(async (targetUserId: string) => {
        // Just trigger stream setup; createPeerConnection handles the rest via onnegotiationneeded
        const stream = await setupLocalAudio();
        if (!stream) return;
        createPeerConnection(targetUserId, stream);
    }, [createPeerConnection, setupLocalAudio]);

    const startTalking = useCallback((targetId?: string) => {
        setIsTalking(true);
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => { track.enabled = true; });
        }
        if (socket) {
            socket.emit('webrtc.talking', {
                productionId,
                isTalking: true,
                targetUserId: targetId || null,
                senderRoleName: roleName
            });
        }
    }, [socket, productionId, roleName]);

    const stopTalking = useCallback((targetId?: string) => {
        setIsTalking(false);
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => { track.enabled = false; });
        }
        if (socket) {
            socket.emit('webrtc.talking', {
                productionId,
                isTalking: false,
                targetUserId: targetId || null,
                senderRoleName: roleName
            });
        }
    }, [socket, productionId, roleName]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handlePresence = (data: { members: any[] }) => {
            // Warm Start: Pre-establish everyone's connection
            data.members.forEach(member => {
                if (member.userId !== userId) {
                    // Host initiates to all, guests only initiate to Host to minimize complexity
                    const isHostMember = member.roleName.toLowerCase().includes('director') ||
                        member.roleName.toLowerCase().includes('admin');
                    if (isHost || isHostMember) {
                        initiateCall(member.userId);
                    }
                }
            });
        };

        socket.on('presence.update', handlePresence);
        socket.emit('presence.request');

        const handleSignal = async (data: { senderUserId: string, signal: any, context?: string }) => {
            if (data.context && data.context !== 'intercom') return;
            try {
                const stream = await setupLocalAudio();
                if (!stream) return;

                let pc = peerConnections.current.get(data.senderUserId);
                if (!pc) {
                    pc = createPeerConnection(data.senderUserId, stream);
                }

                if (data.signal.sdp) {
                    const isOffer = data.signal.sdp.type === 'offer';
                    const isStable = pc.signalingState === 'stable' || (isSettingRemoteAnswerPending.current.get(data.senderUserId) ?? false);
                    const collision = isOffer && (!isStable || (makingOffer.current.get(data.senderUserId) ?? false));

                    // Polite/Impolite logic: Host is impolite, guests are polite
                    ignoreOffer.current.set(data.senderUserId, !isHost && collision);
                    if (ignoreOffer.current.get(data.senderUserId)) {
                        console.warn(`[WebRTC] Ignoring offer collision with ${data.senderUserId}`);
                        return;
                    }

                    isSettingRemoteAnswerPending.current.set(data.senderUserId, !isOffer);

                    // Fix: Check signaling state for Answers to avoid InvalidStateError if already stable
                    if (!isOffer && pc.signalingState === 'stable') {
                        console.warn(`[WebRTC] Received an answer while in stable state for ${data.senderUserId}, skipping.`);
                        isSettingRemoteAnswerPending.current.set(data.senderUserId, false);
                        return;
                    }

                    await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
                    isSettingRemoteAnswerPending.current.set(data.senderUserId, false);

                    if (isOffer) {
                        await pc.setLocalDescription(); // Modern answer
                        socket.emit('webrtc.signal', {
                            productionId,
                            targetUserId: data.senderUserId,
                            signal: { sdp: pc.localDescription },
                            context: 'intercom'
                        });
                    }
                } else if (data.signal.ice) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(data.signal.ice));
                    } catch (err) {
                        if (!ignoreOffer.current.get(data.senderUserId)) {
                            console.error(`[WebRTC] ICE error for ${data.senderUserId}`, err);
                        }
                    }
                }
            } catch (err) {
                console.error("[WebRTC] Signal handling failed:", err);
            }
        };

        socket.on('webrtc.signal_received', handleSignal);

        const handleTalking = (data: { senderUserId: string, isTalking: boolean, targetUserId?: string | null, senderRoleName?: string }) => {
            setTalkingUsers(prev => {
                const next = new Set(prev);
                if (data.isTalking) next.add(data.senderUserId);
                else next.delete(data.senderUserId);
                return next;
            });

            if (data.isTalking) {
                setTalkingInfo({
                    senderUserId: data.senderUserId,
                    targetUserId: data.targetUserId || null,
                    senderRoleName: data.senderRoleName
                });
            } else {
                setTalkingInfo(null);
            }
        };
        socket.on('webrtc.talking', handleTalking);

        const handleAudioLevel = (data: { senderUserId: string, level: number }) => {
            setTalkingLevels(prev => {
                const next = new Map(prev);
                if (data.level < 5) next.delete(data.senderUserId);
                else next.set(data.senderUserId, data.level);
                return next;
            });
        };
        socket.on('webrtc.audio_level', handleAudioLevel);

        return () => {
            socket.off('webrtc.signal_received', handleSignal);
            socket.off('webrtc.talking', handleTalking);
            socket.off('webrtc.audio_level', handleAudioLevel);
            socket.off('presence.update', handlePresence);
        };
    }, [socket, isConnected, createPeerConnection, productionId, setupLocalAudio, isHost, initiateCall, userId]);

    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContext.current) audioContext.current.close().catch(() => { });

            peerConnections.current.forEach(pc => pc.close());
            peerConnections.current.clear();

            remoteAudios.current.forEach(audio => {
                if (audio.parentNode) audio.parentNode.removeChild(audio);
            });
            remoteAudios.current.clear();

            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
                localStream.current = null;
            }
        };
    }, []);

    return {
        isTalking,
        audioLevel,
        startTalking,
        stopTalking,
        initiateCall,
        setupLocalAudio,
        talkingUsers,
        talkingLevels,
        talkingInfo,
        connectionStates,
        isManagerConnected: isConnected
    };
};
