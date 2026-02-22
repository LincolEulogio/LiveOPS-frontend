'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';

export interface HealthStats {
    productionId: string;
    engineType: string;
    cpuUsage: number;
    fps: number;
    bitrate: number;
    skippedFrames: number;
    totalFrames?: number;
    memoryUsage?: number;
    timestamp: string;
}

export const useStreamHealth = (productionId?: string) => {
    const { socket } = useSocket();
    const [history, setHistory] = useState<HealthStats[]>([]);
    const [lastStats, setLastStats] = useState<HealthStats | null>(null);

    useEffect(() => {
        if (!socket || !productionId) return;

        const handleStats = (data: HealthStats) => {
            if (data.productionId === productionId) {
                setLastStats(data);
                setHistory(prev => {
                    const newHistory = [...prev, data];
                    // Keep last 30 points (approx 1 minute of data at 2s polling)
                    if (newHistory.length > 30) return newHistory.slice(1);
                    return newHistory;
                });
            }
        };

        socket.on('production.health.stats', handleStats);
        return () => {
            socket.off('production.health.stats', handleStats);
        };
    }, [socket, productionId]);

    return {
        lastStats,
        history,
        isHealthy: lastStats ? lastStats.cpuUsage < 80 && lastStats.skippedFrames === 0 : true
    };
};
