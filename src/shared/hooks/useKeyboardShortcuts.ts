'use client';

import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutMap {
    [key: string]: KeyHandler;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutMap, enabled: boolean = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input or textarea
            const activeElement = document.activeElement;
            const isInput = activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement;

            if (isInput) return;

            const handler = shortcuts[e.key];
            if (handler) {
                e.preventDefault();
                handler(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, enabled]);
};
