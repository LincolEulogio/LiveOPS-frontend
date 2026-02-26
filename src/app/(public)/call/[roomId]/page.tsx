'use client';
import React from 'react';
import { VideoCallRoom } from '@/features/video-call/components/VideoCallRoom';

export default function VideoCallPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = React.use(params);
    return <VideoCallRoom roomId={roomId} />;
}
