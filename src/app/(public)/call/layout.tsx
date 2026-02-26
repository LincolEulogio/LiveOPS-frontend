import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Video Call · LiveOPS',
    description: 'Videollamada en tiempo real con LiveKit',
};

export default function VideoCallLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
