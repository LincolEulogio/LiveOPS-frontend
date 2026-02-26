import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { toast } from 'sonner';

interface WebRTCProps {
    productionId: string;
    userId: string;
    targetUserId?: string;
    isHost?: boolean;
}

export const useWebRTC = ({ productionId, userId, isHost = false }: WebRTCProps) => {
    const { socket, isConnected } = useSocket();
    const [isTalking, setIsTalking] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [talkingUsers, setTalkingUsers] = useState<Set<string>>(new Set());

    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);
    const setupPromise = useRef<Promise<MediaStream | null> | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyserNode = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const remoteAudios = useRef<Map<string, HTMLAudioElement>>(new Map());
    const audioContainer = useRef<HTMLDivElement | null>(null);
    const signalingMap = useRef<Map<string, boolean>>(new Map());
    const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
    const [talkingInfo, setTalkingInfo] = useState<{ senderUserId: string, targetUserId: string | null } | null>(null);

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
            // Note: playsInline is for video, but for some browsers it may be needed if they treat audio similarly
            // We use (audio as any) to bypass TS check if we really wanted it, but let's stick to standard for audio
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

                // VU Meter Setup
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                    audioContext.current = new AudioCtx();
                    analyserNode.current = audioContext.current.createAnalyser();
                    const source = audioContext.current.createMediaStreamSource(stream);
                    source.connect(analyserNode.current);
                    analyserNode.current.fftSize = 256;
                    const bufferLength = analyserNode.current.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    const updateLevel = () => {
                        if (analyserNode.current) {
                            analyserNode.current.getByteFrequencyData(dataArray);
                            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                            setAudioLevel(prev => (prev === 0 && average < 5) ? 0 : average);
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

        const configuration: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        };

        const pc = new RTCPeerConnection(configuration);

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

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

        peerConnections.current.set(targetUserId, pc);
        return pc;
    }, [productionId, socket, handleRemoteStream]);

    const initiateCall = useCallback(async (targetUserId: string) => {
        const existing = peerConnections.current.get(targetUserId);
        if (existing && existing.signalingState !== 'closed') {
            if (existing.signalingState === 'stable' && (existing.iceConnectionState === 'connected' || existing.iceConnectionState === 'completed')) {
                return;
            }
        }

        const stream = await setupLocalAudio();
        if (!stream) return;

        const pc = createPeerConnection(targetUserId, stream);

        try {
            const offer = await pc.createOffer();
            if (pc.signalingState !== 'stable') return;

            await pc.setLocalDescription(offer);

            socket?.emit('webrtc.signal', {
                productionId,
                targetUserId,
                signal: { sdp: pc.localDescription }
            });
        } catch (error) {
            console.error("Error initiating call:", error);
        }
    }, [createPeerConnection, productionId, setupLocalAudio, socket]);

    const startTalking = useCallback((targetUserId?: string) => {
        setIsTalking(true);
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => { track.enabled = true; });
        }
        if (socket) {
            socket.emit('webrtc.talking', {
                productionId,
                isTalking: true,
                targetUserId: targetUserId || null
            });
        }
    }, [socket, productionId]);

    const stopTalking = useCallback((targetUserId?: string) => {
        setIsTalking(false);
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => { track.enabled = false; });
        }
        if (socket) {
            socket.emit('webrtc.talking', {
                productionId,
                isTalking: false,
                targetUserId: targetUserId || null
            });
        }
    }, [socket, productionId]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleSignal = async (data: { senderUserId: string, signal: any }) => {
            const stream = await setupLocalAudio();
            if (!stream) return;

            let pc = peerConnections.current.get(data.senderUserId);

            if (data.signal.sdp) {
                if (signalingMap.current.get(data.senderUserId)) return;
                signalingMap.current.set(data.senderUserId, true);

                try {
                    if (!pc || pc.signalingState === 'closed') {
                        pc = createPeerConnection(data.senderUserId, stream);
                    }

                    const isOffer = data.signal.sdp.type === 'offer';
                    const isAnswer = data.signal.sdp.type === 'answer';
                    const collision = isOffer && (pc.signalingState !== 'stable' || pc.iceConnectionState === 'connected');

                    if (collision && isHost) {
                        signalingMap.current.set(data.senderUserId, false);
                        return;
                    }

                    if (isAnswer && pc.signalingState !== 'have-local-offer') {
                        signalingMap.current.set(data.senderUserId, false);
                        return;
                    }

                    await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));

                    const queued = pendingCandidates.current.get(data.senderUserId) || [];
                    for (const candidate of queued) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (e) {
                            // Suppress candidate error if connection already established
                        }
                    }
                    pendingCandidates.current.set(data.senderUserId, []);

                    if (isOffer) {
                        if (pc.signalingState !== 'have-remote-offer') {
                            signalingMap.current.set(data.senderUserId, false);
                            return;
                        }
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        socket.emit('webrtc.signal', {
                            productionId,
                            targetUserId: data.senderUserId,
                            signal: { sdp: pc.localDescription }
                        });
                    }
                } catch (error) {
                    console.error("WebRTC SDP logic error:", error);
                } finally {
                    signalingMap.current.set(data.senderUserId, false);
                }
            } else if (data.signal.ice) {
                if (!pc) {
                    pc = createPeerConnection(data.senderUserId, stream);
                }

                if (pc.remoteDescription) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(data.signal.ice));
                    } catch (e) {
                        // Suppress
                    }
                } else {
                    const queued = pendingCandidates.current.get(data.senderUserId) || [];
                    queued.push(data.signal.ice);
                    pendingCandidates.current.set(data.senderUserId, queued);
                }
            }
        };

        socket.on('webrtc.signal_received', handleSignal);

        const handleTalking = (data: { senderUserId: string, isTalking: boolean, targetUserId?: string | null }) => {
            setTalkingUsers(prev => {
                const next = new Set(prev);
                if (data.isTalking) next.add(data.senderUserId);
                else next.delete(data.senderUserId);
                return next;
            });

            if (data.isTalking) {
                setTalkingInfo({ senderUserId: data.senderUserId, targetUserId: data.targetUserId || null });
            } else {
                setTalkingInfo(null);
            }
        };
        socket.on('webrtc.talking', handleTalking);

        return () => {
            socket.off('webrtc.signal_received', handleSignal);
            socket.off('webrtc.talking', handleTalking);
        };
    }, [socket, isConnected, createPeerConnection, productionId, setupLocalAudio, isHost]);

    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContext.current) audioContext.current.close().catch(() => { });
            peerConnections.current.forEach(pc => pc.close());
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
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
        talkingInfo,
    };
};
