'use client';

import React, { createContext, useContext, useCallback, useRef } from 'react';

interface AudioContextProps {
    playNotification: () => void;
    playAlert: () => void;
    playSuccess: () => void;
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within an AudioProvider');
    return context;
};

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
    const audioCtxRef = useRef<AudioContext | null>(null);

    const getAudioCtx = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioCtxRef.current;
    };

    const createOscillator = (freq: number, type: OscillatorType, duration: number, volume: number) => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const playNotification = useCallback(() => {
        try {
            // Soft high-pitched chime
            createOscillator(880, 'sine', 0.5, 0.1);
            setTimeout(() => createOscillator(1320, 'sine', 0.3, 0.05), 100);
        } catch (e) {
            console.warn('Audio playback failed', e);
        }
    }, []);

    const playAlert = useCallback(() => {
        try {
            // Urgent dual tone
            createOscillator(440, 'triangle', 0.2, 0.1);
            setTimeout(() => createOscillator(440, 'triangle', 0.2, 0.1), 250);
        } catch (e) {
            console.warn('Audio playback failed', e);
        }
    }, []);

    const playSuccess = useCallback(() => {
        try {
            // Rising positive tone
            createOscillator(523.25, 'sine', 0.1, 0.1); // C5
            setTimeout(() => createOscillator(659.25, 'sine', 0.1, 0.1), 100); // E5
            setTimeout(() => createOscillator(783.99, 'sine', 0.3, 0.1), 200); // G5
        } catch (e) {
            console.warn('Audio playback failed', e);
        }
    }, []);

    return (
        <AudioContext.Provider value={{ playNotification, playAlert, playSuccess }}>
            {children}
        </AudioContext.Provider>
    );
};
