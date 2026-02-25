'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';
import { Radio } from 'lucide-react';
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

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const data: any = await apiClient.post(`/streaming/${productionId}/token`, {
                    identity: user?.id || `guest-${Math.random().toString(36).substring(7)}`,
                    name: user?.name || 'Guest Participant',
                    isOperator: false
                });
                setToken(data.token);
                setLkUrl(data.url);
            } catch (err) {
                console.error('Failed to fetch LiveKit token:', err);
                toast.error('Error al conectar con el servidor de streaming');
            }
        };

        if (user) fetchToken();
    }, [productionId, user]);

    if (!token || !lkUrl) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted text-xs font-bold uppercase ">Iniciando sesión segura...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background font-sans text-foreground overflow-hidden">
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={lkUrl}
                connect={true}
                onDisconnected={() => router.back()}
                className="flex-1 flex flex-col"
            >
                {/* Custom Header in LiveKit Room */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-card-border bg-background/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Radio size={20} className="text-emerald-400 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold ">Live Guest Room</h1>
                            <p className="text-[10px] text-muted uppercase  font-black">
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
