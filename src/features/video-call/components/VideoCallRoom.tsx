'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';
import {
    Video,
} from 'lucide-react';
import {
    LiveKitRoom,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { apiClient } from '@/shared/api/api.client';

/* ─── Minimal LiveKit CSS ──────────────────────────────────────────────── */
const lkBase = `
  .lk-participant-tile { background: #0b0c18 !important; border-radius: 16px !important; overflow: hidden !important; }
  .lk-participant-tile video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
  .lk-participant-placeholder { background: #0b0c18 !important; }
  .lk-participant-metadata { display: none !important; }
`;

import { VideoCallInner } from './VideoCallInner';

/* ─── Main VideoCallRoom ────────────────────────────────────────────────── */
export const VideoCallRoom = ({ roomId }: { roomId: string }) => {
    // ── All hooks FIRST — no early returns before this block ──────────────
    const { user, isHydrated } = useAuthStore();
        const router = useRouter();
        const [token, setToken] = useState<string | null>(null);
        const [lkUrl, setLkUrl] = useState<string | null>(null);
        const [error, setError] = useState<string | null>(null);
        const [isHost, setIsHost] = useState(false);
        const fetchedRef = useRef(false);

        // Derived constants (not hooks — safe to compute early)
        // Derived constants (not hooks — safe to compute early). Force new cache key config
        const TOKEN_KEY = `lk_auth_${roomId ?? ''}`;
        const URL_KEY = `lk_url_${roomId ?? ''}`;
        const IS_HOST_KEY = `lk_ishost_${roomId ?? ''}`;
        const clearCache = () => {
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(URL_KEY);
            sessionStorage.removeItem(IS_HOST_KEY);
            // Nota: No se elimina el almacenamiento local del chat aquí. Se mantendrá accesible hasta que la sala se marque como finalizada u obsoleta.
        };

        // Redirect if unauthenticated (via effect, not during render)
        useEffect(() => {
            if (isHydrated && !user) router.replace('/login');
        }, [isHydrated, user]);

        // Fetch / restore token
        useEffect(() => {
            if (!roomId || !isHydrated || !user) return;
            const ct = sessionStorage.getItem(TOKEN_KEY);
            const cu = sessionStorage.getItem(URL_KEY);
            const ch = sessionStorage.getItem(IS_HOST_KEY);
            if (ct && cu && ch !== null) { setToken(ct); setLkUrl(cu); setIsHost(ch === 'true'); return; }
            if (fetchedRef.current) return;
            fetchedRef.current = true;
            (async () => {
                try {
                    const data: any = await apiClient.post(`/video-call/rooms/by-room/${roomId}/join`, {
                        name: user.name || 'Participant',
                        isHost: false, // will rely on backend determining actual host logic
                    });
                    sessionStorage.setItem(TOKEN_KEY, data.token);
                    sessionStorage.setItem(URL_KEY, data.url);
                    sessionStorage.setItem(IS_HOST_KEY, String(data.isHost));
                    setToken(data.token);
                    setLkUrl(data.url);
                    setIsHost(data.isHost);
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
                        onError={handleError}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <VideoCallInner roomId={roomId} userId={user?.id || ''} userName={user?.name || 'Participant'} isHost={isHost} onLeave={handleLeave} />
                    </LiveKitRoom>
                </div>
            </>
    );
};
