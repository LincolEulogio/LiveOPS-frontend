/**
 * WebRTC ICE Server configuration for LiveOPS
 *
 * Uses a cascading strategy:
 * 1. STUN (Google) — free, works in most networks
 * 2. TURN via Metered (free tier) — handles NAT/symmetric NAT and corporate firewalls
 *
 * For production, set your own TURN credentials in .env.local:
 *   NEXT_PUBLIC_TURN_URL=turn:your-server.com:3478
 *   NEXT_PUBLIC_TURN_USERNAME=user
 *   NEXT_PUBLIC_TURN_CREDENTIAL=password
 *
 * Free TURN options tested with LiveOPS:
 * - Metered.ca (free tier): https://www.metered.ca/tools/openrelay/
 * - Cloudflare TURN: https://developers.cloudflare.com/calls/turn-service/
 */

const TURN_URL = process.env.NEXT_PUBLIC_TURN_URL ?? 'turn:openrelay.metered.ca:80';
const TURN_URL_TLS = process.env.NEXT_PUBLIC_TURN_URL_TLS ?? 'turn:openrelay.metered.ca:443';
const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME ?? 'openrelayproject';
const TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_CREDENTIAL ?? 'openrelayproject';

export const ICE_SERVERS: RTCIceServer[] = [
    // STUN — Fast, no relay needed (works in ~80% of networks)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:openrelay.metered.ca:80' },

    // TURN over UDP — Relay for NAT traversal
    {
        urls: TURN_URL,
        username: TURN_USERNAME,
        credential: TURN_CREDENTIAL,
    },
    // TURN over TCP — Fallback if UDP is blocked
    {
        urls: TURN_URL_TLS,
        username: TURN_USERNAME,
        credential: TURN_CREDENTIAL,
    },
    // TURN over TLS 443 — Works through HTTPS-only corporate firewalls
    {
        urls: `turns:${TURN_URL_TLS.replace('turn:', '')}`,
        username: TURN_USERNAME,
        credential: TURN_CREDENTIAL,
    },
];

export const ICE_CONFIG: RTCConfiguration = {
    iceServers: ICE_SERVERS,
    iceTransportPolicy: 'all',   // 'relay' to force TURN only (max compatibility)
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
};
