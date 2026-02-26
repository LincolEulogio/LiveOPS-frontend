'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';
import { Radio, WifiOff, ShieldAlert } from 'lucide-react';
import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { apiClient } from '@/shared/api/api.client';

export const GuestRoom = ({ productionId }: { productionId: string }) => {
    const { user } = useAuthStore();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [lkUrl, setLkUrl] = useState<string | null>(null);
    const [error, setError] = useState<{ type: 'permission' | 'connection'; msg: string } | null>(null);
    // Prevent double-fetch caused by React StrictMode
    const fetchedRef = React.useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;

        const fetchToken = async () => {
            fetchedRef.current = true;
            try {
                const data: any = await apiClient.post(`/streaming/${productionId}/token`, {
                    identity: user?.id || `guest-${Math.random().toString(36).substring(7)}`,
                    name: user?.name || 'Guest Participant',
                    isOperator: false
                });
                setToken(data.token);
                setLkUrl(data.url);
            } catch (err: any) {
                console.error('Failed to fetch LiveKit token:', err);
                setError({ type: 'permission', msg: err.message || 'Sin permisos suficientes' });
                toast.error('Acceso denegado');
            }
        };

        if (user) fetchToken();
    }, [productionId, user]);

    const handleLiveKitError = (err: Error) => {
        const msg = err.message || '';
        console.error('LiveKit error:', msg);

        // Media device errors - camera/mic issues. Show toast, stay in room.
        const isMediaError =
            err.name === 'AbortError' ||
            err.name === 'NotAllowedError' ||
            err.name === 'NotFoundError' ||
            err.name === 'OverconstrainedError' ||
            msg.includes('video source') ||
            msg.includes('audio source') ||
            msg.includes('getUserMedia') ||
            msg.includes('Permission denied') ||
            msg.includes('Timeout starting');

        if (isMediaError) {
            // Don't kick user out — just warn about the specific device
            toast.error('No se pudo acceder a la cámara/micrófono. Verifica los permisos del navegador.', {
                duration: 6000,
            });
            return; // Stay in the room, user can manually enable devices
        }

        // Real connection errors — server is down or unreachable
        setError({ type: 'connection', msg });
    };

    // Permission error screen
    if (error?.type === 'permission') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert size={32} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Acceso Denegado</h2>
                <p className="text-muted text-sm max-w-md mb-6">
                    No cuentas con los permisos necesarios para unirte como fuente de vídeo en esta producción.
                    Contacta con el director para que te asigne el rol de <b>GUEST</b> o <b>OPERATOR</b>.
                </p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-card-bg hover:bg-card-border border border-card-border rounded-xl text-foreground font-bold transition-all"
                >
                    Volver Atrás
                </button>
            </div>
        );
    }

    // LiveKit server not available screen
    if (error?.type === 'connection') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                    <WifiOff size={32} className="text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Servidor de Streaming No Disponible</h2>
                <p className="text-muted text-sm max-w-md mb-2">
                    El token fue generado correctamente, pero no se pudo conectar al servidor de vídeo (LiveKit).
                </p>
                <p className="text-muted text-xs max-w-md mb-6 bg-card-bg border border-card-border rounded-lg p-3 font-mono text-left">
                    Ejecuta en <span className="text-indigo-400">backend/</span>:<br />
                    <span className="text-amber-400">docker compose up livekit -d</span>
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            fetchedRef.current = false;
                            setError(null);
                            setToken(null);
                            setLkUrl(null);
                        }}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/50 rounded-xl text-white font-bold transition-all"
                    >
                        Reintentar
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-card-bg hover:bg-card-border border border-card-border rounded-xl text-foreground font-bold transition-all"
                    >
                        Volver Atrás
                    </button>
                </div>
            </div>
        );
    }

    if (!token || !lkUrl) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted text-xs font-bold uppercase">Iniciando sesión segura...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background font-sans text-foreground overflow-hidden">
            <LiveKitRoom
                video={false}
                audio={false}
                token={token}
                serverUrl={lkUrl}
                connect={true}
                onDisconnected={() => router.back()}
                onError={handleLiveKitError}
                className="flex-1 flex flex-col"
            >
                {/* Custom Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-card-border bg-background/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Radio size={20} className="text-emerald-400 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Live Guest Room</h1>
                            <p className="text-[10px] text-muted uppercase font-black">
                                Production ID: {productionId.split('-')[0]}...
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden">
                    <VideoConference />
                </div>

                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
};
