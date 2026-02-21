'use client';

import { useEffect, useState } from 'react';

export const TimelineIndicator = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return (
        <div className="relative flex items-center gap-3 py-4">
            <div className="h-px flex-1 bg-indigo-500/30"></div>
            <div className="flex items-center gap-2 bg-indigo-600 px-3 py-1 rounded-full shadow-lg shadow-indigo-600/20 border border-indigo-400/30">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-mono font-bold tracking-wider">
                    {timeString}
                </span>
            </div>
            <div className="h-px flex-1 bg-indigo-500/30"></div>
        </div>
    );
};
