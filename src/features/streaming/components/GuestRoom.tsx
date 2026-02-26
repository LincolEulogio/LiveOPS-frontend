'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';
import { Radio, WifiOff, ShieldAlert } from 'lucide-react';
import { LiveKitRoom } from '@livekit/components-react';
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

import { GuestRoomInner } from './GuestRoomInner';

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
