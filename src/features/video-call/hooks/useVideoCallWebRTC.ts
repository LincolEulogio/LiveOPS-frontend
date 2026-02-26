'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { toast } from 'sonner';
import { ICE_CONFIG } from '@/shared/lib/ice-config';

interface WebRTCProps {
    productionId: string;
    userId: string;
    userName: string;
    isHost?: boolean;
}

export const useVideoCallWebRTC = ({ productionId, userId, userName, isHost = false }: WebRTCProps) => {
    const { socket, isConnected } = useSocket();
    const [participants, setParticipants] = useState<Map<string, { userId: string, stream: MediaStream, name: string }>>(new Map());
    const [connectionStates, setConnectionStates] = useState<Map<string, RTCPeerConnectionState>>(new Map());
    
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isCamEnabled, setIsCamEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);
    const screenStream = useRef<MediaStream | null>(null);
    
    // Perfect Negotiation State
    const makingOffer = useRef<Map<string, boolean>>(new Map());
    const ignoreOffer = useRef<Map<string, boolean>>(new Map());
    const isSettingRemoteAnswerPending = useRef<Map<string, boolean>>(new Map());

    const setupLocalStream = useCallback(async () => {
        try {
            if (localStream.current) return localStream.current;

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true },
                video: { width: 1280, height: 720, frameRate: 30 }
            });
            localStream.current = stream;
            
            // Add local stream to participants so we can see ourselves
            setParticipants(prev => {
                const next = new Map(prev);
                next.set(userId, { userId, stream, name: userName });
                return next;
            });

            return stream;
        } catch (error) {
            console.error("Failed to get local stream:", error);
            toast.error("Error al acceder a la cámara o micrófono.");
            return null;
        }
    }, [userId, userName]);

    const createPeerConnection = useCallback((targetUserId: string, stream: MediaStream) => {
        const existing = peerConnections.current.get(targetUserId);
        if (existing && existing.signalingState !== 'closed') return existing;

        const pc = new RTCPeerConnection(ICE_CONFIG);

        // Add tracks from local stream
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        pc.onnegotiationneeded = async () => {
            try {
                makingOffer.current.set(targetUserId, true);
                await pc.setLocalDescription();
                socket?.emit('webrtc.signal', {
                    productionId,
                    targetUserId,
                    signal: { sdp: pc.localDescription },
                    context: 'videocall'
                });
            } catch (err) {
                console.error(`[VideoCall] Negotiation error with ${targetUserId}:`, err);
            } finally {
                makingOffer.current.set(targetUserId, false);
            }
        };

        pc.ontrack = (event) => {
            console.log(`[VideoCall] Received track from ${targetUserId}`);
            setParticipants(prev => {
                const next = new Map(prev);
                next.set(targetUserId, { 
                    userId: targetUserId, 
                    stream: event.streams[0], 
                    name: "Participant" // In a real app, link with presence name
                });
                return next;
            });
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc.signal', {
                    productionId,
                    targetUserId,
                    signal: { ice: event.candidate },
                    context: 'videocall'
                });
            }
        };

        pc.onconnectionstatechange = () => {
            setConnectionStates(prev => {
                const updated = new Map(prev);
                updated.set(targetUserId, pc.connectionState);
                return updated;
            });
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
                setParticipants(prev => {
                    const next = new Map(prev);
                    next.delete(targetUserId);
                    return next;
                });
            }
        };

        peerConnections.current.set(targetUserId, pc);
        return pc;
    }, [productionId, socket]);

    const initiateCall = useCallback(async (targetUserId: string) => {
        const stream = await setupLocalStream();
        if (!stream) return;
        createPeerConnection(targetUserId, stream);
    }, [createPeerConnection, setupLocalStream]);

    // Handle incoming signals
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handlePresence = (data: { members: any[] }) => {
            data.members.forEach(member => {
                if (member.userId !== userId) {
                    // In video call, everyone connects to everyone (Mesh for small rooms)
                    // or we could use the Host as a gateway. Let's use polite mesh for now.
                    // To avoid collisions, we can use userId comparison
                    if (userId < member.userId) { 
                        initiateCall(member.userId);
                    }
                }
            });
        };

        socket.on('presence.update', handlePresence);
        socket.emit('presence.request');

        const handleSignal = async (data: { senderUserId: string, signal: any, context?: string }) => {
            if (data.context !== 'videocall') return;
            
            try {
                const stream = await setupLocalStream();
                if (!stream) return;

                let pc = peerConnections.current.get(data.senderUserId);
                if (!pc) pc = createPeerConnection(data.senderUserId, stream);

                if (data.signal.sdp) {
                    const isOffer = data.signal.sdp.type === 'offer';
                    const isStable = pc.signalingState === 'stable' || (isSettingRemoteAnswerPending.current.get(data.senderUserId) ?? false);
                    const collision = isOffer && (!isStable || (makingOffer.current.get(data.senderUserId) ?? false));

                    // Polite/Impolite logic: Lower ID is impolite
                    const impolite = userId < data.senderUserId;
                    ignoreOffer.current.set(data.senderUserId, !impolite && collision);
                    
                    if (ignoreOffer.current.get(data.senderUserId)) return;

                    isSettingRemoteAnswerPending.current.set(data.senderUserId, !isOffer);
                    await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
                    isSettingRemoteAnswerPending.current.set(data.senderUserId, false);

                    if (isOffer) {
                        await pc.setLocalDescription();
                        socket.emit('webrtc.signal', {
                            productionId,
                            targetUserId: data.senderUserId,
                            signal: { sdp: pc.localDescription },
                            context: 'videocall'
                        });
                    }
                } else if (data.signal.ice) {
                    await pc.addIceCandidate(new RTCIceCandidate(data.signal.ice));
                }
            } catch (err) {
                console.error("[VideoCall] Signal error:", err);
            }
        };

        socket.on('webrtc.signal_received', handleSignal);

        return () => {
            socket.off('presence.update', handlePresence);
            socket.off('webrtc.signal_received', handleSignal);
        };
    }, [socket, isConnected, userId, productionId, initiateCall, createPeerConnection, setupLocalStream]);

    // Track controls
    const toggleMic = useCallback(() => {
        setIsMicEnabled(prev => {
            const next = !prev;
            localStream.current?.getAudioTracks().forEach(t => t.enabled = next);
            return next;
        });
    }, []);

    const toggleCam = useCallback(() => {
        setIsCamEnabled(prev => {
            const next = !prev;
            localStream.current?.getVideoTracks().forEach(t => t.enabled = next);
            return next;
        });
    }, []);

    const toggleScreenShare = useCallback(async () => {
        if (isScreenSharing) {
            screenStream.current?.getTracks().forEach(t => t.stop());
            screenStream.current = null;
            setIsScreenSharing(false);
            
            // Revert to camera
            const stream = localStream.current;
            if (stream) {
                peerConnections.current.forEach(pc => {
                    const senders = pc.getSenders();
                    stream.getTracks().forEach(track => {
                        const sender = senders.find(s => s.track?.kind === track.kind);
                        if (sender) sender.replaceTrack(track);
                    });
                });
            }
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                screenStream.current = stream;
                setIsScreenSharing(true);

                stream.getVideoTracks()[0].onended = () => toggleScreenShare();

                peerConnections.current.forEach(pc => {
                    const senders = pc.getSenders();
                    const videoSender = senders.find(s => s.track?.kind === 'video');
                    if (videoSender) videoSender.replaceTrack(stream.getVideoTracks()[0]);
                });
            } catch (err) {
                console.error("Screen share error:", err);
            }
        }
    }, [isScreenSharing]);

    useEffect(() => {
        return () => {
            localStream.current?.getTracks().forEach(t => t.stop());
            screenStream.current?.getTracks().forEach(t => t.stop());
            peerConnections.current.forEach(pc => pc.close());
        };
    }, []);

    return {
        participants,
        connectionStates,
        isMicEnabled,
        isCamEnabled,
        isScreenSharing,
        toggleMic,
        toggleCam,
        toggleScreenShare,
        localStream: localStream.current
    };
};
