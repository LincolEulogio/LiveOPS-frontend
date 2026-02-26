'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/cn';
import { Camera, RefreshCw } from 'lucide-react';

interface SmartVmixImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackIcon?: React.ReactNode;
    refreshInterval?: number;
}

/**
 * SmartVmixImage
 * Implementation of Double-Buffering for vMix thumbnails and previews.
 * Prevents "white flashes" by keeping the old image until the new one is fully loaded.
 */
export const SmartVmixImage: React.FC<SmartVmixImageProps> = ({
    src,
    alt,
    className,
    fallbackIcon,
    refreshInterval = 2000
}) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [bufferSrc, setBufferSrc] = useState<string | null>(null);
    const [isBuffering, setIsBuffering] = useState(false);
    const [hasError, setHasError] = useState(false);

    // We use a tick to force refresh if the URL doesn't have a dynamic parts 
    // but usually vMix images need a cache-buster
    const [tick, setTick] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(Date.now());
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    useEffect(() => {
        if (!src) return;

        // Build the URL with cache buster
        const baseUrl = src.includes('?') ? src.split('?')[0] : src;
        const newUrl = `${baseUrl}?t=${tick}`;

        setHasError(false);
        setIsBuffering(true);
        setBufferSrc(newUrl);

        const img = new Image();
        img.src = newUrl;
        img.onload = () => {
            setCurrentSrc(newUrl);
            setIsBuffering(false);
            setBufferSrc(null);
        };
        img.onerror = () => {
            setIsBuffering(false);
            // If it's the first load, show error. If it's a refresh, keep the old one.
            if (!currentSrc || currentSrc === src) {
                setHasError(true);
            }
        };
    }, [src, tick]);

    if (hasError) {
        return (
            <div className={cn("w-full h-full bg-card-bg/50 flex flex-col items-center justify-center text-muted/20 gap-2", className)}>
                {fallbackIcon || <Camera size={32} />}
                <span className="text-[8px] font-black uppercase text-muted/40">No Signal</span>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full h-full overflow-hidden bg-black", className)}>
            {/* Primary Image (Old/Current) */}
            <img
                src={currentSrc}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    isBuffering ? "opacity-90" : "opacity-100"
                )}
            />

            {/* Buffering Indicator (Subtle) */}
            {isBuffering && (
                <div className="absolute top-2 right-2 p-1 bg-black/40 backdrop-blur-md rounded-full shadow-lg">
                    <RefreshCw size={10} className="text-white/40 animate-spin" />
                </div>
            )}
        </div>
    );
};
