import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { toast } from 'sonner';

interface WebRTCProps {
    productionId: string;
    userId: string;
    targetUserId?: string; // Optional if broadcasting
    isHost?: boolean; // Is this the Hub (admin) or the Spoke (guest)?
}

export const useWebRTC = ({ productionId, userId, isHost = false }: WebRTCProps) => {
    const { socket, isConnected } = useSocket();
    const [isTalking, setIsTalking] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [talkingUsers, setTalkingUsers] = useState<Set<string>>(new Set());

    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyserNode = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const remoteAudios = useRef<Map<string, HTMLAudioElement>>(new Map());
    const signalingMap = useRef<Map<string, boolean>>(new Map()); // Mutex per target user
    const [talkingInfo, setTalkingInfo] = useState<{ senderUserId: string, targetUserId: string | null } | null>(null);

    // For Host to play incoming audio streams
    // For Guests to play incoming Host stream
    const handleRemoteStream = useCallback((stream: MediaStream, remoteUserId: string) => {
        let audio = remoteAudios.current.get(remoteUserId);
        if (!audio) {
            audio = new Audio();
            remoteAudios.current.set(remoteUserId, audio);
        }
        audio.srcObject = stream;
        audio.autoplay = true;
        // Host might want to manage volumes individually, but for now just play it
        audio.play().catch(e => console.error("WebRTC Audio Play Error:", e));
    }, []);

    const setupLocalAudio = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });
            localStream.current = stream;

            // Setup VU Meter
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (audioContext.current) {
                analyserNode.current = audioContext.current.createAnalyser();
                const source = audioContext.current.createMediaStreamSource(stream);
                source.connect(analyserNode.current);
                analyserNode.current.fftSize = 256;
                const bufferLength = analyserNode.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const updateLevel = () => {
                    if (isTalking && analyserNode.current) { // Only show meter if talking
                        analyserNode.current.getByteFrequencyData(dataArray);
                        const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                        setAudioLevel(average);
                    } else {
                        setAudioLevel(0);
                    }
                    animationRef.current = requestAnimationFrame(updateLevel);
                };
                updateLevel();
            }

            // Initially mute the tracks unless isTalking is true
            stream.getAudioTracks().forEach(track => {
                track.enabled = false;
            });

            return stream;
        } catch (error) {
            console.error("Failed to get local audio:", error);
            toast.error("Error al acceder al micrófono. Por favor, concede los permisos.");
            return null;
        }
    }, [isTalking]);

    const createPeerConnection = useCallback((targetUserId: string, stream: MediaStream) => {
        // Close existing connection if any
        const existing = peerConnections.current.get(targetUserId);
        if (existing) {
            existing.close();
        }

        const configuration: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        };

        const pc = new RTCPeerConnection(configuration);

        // Add local tracks
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // Handle remote tracks
        pc.ontrack = (event) => {
            handleRemoteStream(event.streams[0], targetUserId);
        };

        // Handle ICE candidates
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
        // Prevent redundant initiation if a connection is already active or in progress
        const existing = peerConnections.current.get(targetUserId);
        if (existing && existing.signalingState !== 'closed') {
            if (existing.signalingState === 'stable' && (existing.iceConnectionState === 'connected' || existing.iceConnectionState === 'completed')) {
                return;
            }
        }

        let stream = localStream.current;
        if (!stream) {
            stream = await setupLocalAudio();
        }
        if (!stream) return;

        const pc = createPeerConnection(targetUserId, stream);

        try {
            const offer = await pc.createOffer();
            // If another signal came in while we were creating the offer, skip
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

    // Push To Talk Logic
    const startTalking = useCallback((targetUserId?: string) => {
        setIsTalking(true);
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = true; // Unmute
            });
        }
        if (socket) {
            // targetUserId: null means broadcast to everyone in the production room
            socket.emit('webrtc.talking', {
                productionId,
                isTalking: true,
                targetUserId: targetUserId || null
            });
        }
    }, [socket, productionId]);

    const stopTalking = useCallback((targetUserId?: string) => {
        setIsTalking(false);
        setAudioLevel(0);
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = false; // Mute
            });
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
            let stream = localStream.current;
            if (!stream) {
                stream = await setupLocalAudio();
            }
            if (!stream) return;

            let pc = peerConnections.current.get(data.senderUserId);

            if (data.signal.sdp) {
                // LOCK SENDER
                if (signalingMap.current.get(data.senderUserId)) return;
                signalingMap.current.set(data.senderUserId, true);

                try {
                    if (!pc || pc.signalingState === 'closed') {
                        pc = createPeerConnection(data.senderUserId, stream);
                    }

                    const isOffer = data.signal.sdp.type === 'offer';
                    const isAnswer = data.signal.sdp.type === 'answer';

                    // Collision checking
                    const collision = isOffer && (pc.signalingState !== 'stable' || pc.iceConnectionState === 'connected');

                    if (collision) {
                        if (isHost) {
                            // Huber (impolite) ignores incoming offer
                            signalingMap.current.set(data.senderUserId, false);
                            return;
                        }
                    }

                    if (isAnswer && pc.signalingState !== 'have-local-offer') {
                        signalingMap.current.set(data.senderUserId, false);
                        return;
                    }

                    await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));

                    if (isOffer) {
                        if (pc.signalingState !== 'have-remote-offer') {
                            signalingMap.current.set(data.senderUserId, false);
                            return;
                        }
                        const answer = await pc.createAnswer();
                        if (pc.signalingState === 'have-remote-offer') {
                            await pc.setLocalDescription(answer);
                            socket.emit('webrtc.signal', {
                                productionId,
                                targetUserId: data.senderUserId,
                                signal: { sdp: pc.localDescription }
                            });
                        }
                    }
                } catch (error) {
                    console.error("WebRTC SDP logic error:", error);
                } finally {
                    signalingMap.current.set(data.senderUserId, false);
                }
            } else if (data.signal.ice) {
                // Ensure pc is initialized for ICE candidates
                if (!pc) {
                    pc = createPeerConnection(data.senderUserId, stream);
                }
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.signal.ice));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
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
    }, [socket, isConnected, createPeerConnection, productionId, setupLocalAudio]);

    // Cleanup
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
        initiateCall, // Used by host to connect to all users
        setupLocalAudio,
        talkingUsers,
        talkingInfo,
    };
};
