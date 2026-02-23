'use client';

import React from 'react';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { Sun, Moon, Zap, Monitor } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'light', name: 'Light', icon: Sun, color: 'text-amber-500' },
        { id: 'dark', name: 'Dark', icon: Moon, color: 'text-indigo-400' },
        { id: 'production', name: 'Live', icon: Zap, color: 'text-red-500' },
    ] as const;

    return (
        <div className="flex bg-stone-950/50 p-1 rounded-2xl border border-stone-800 backdrop-blur-md">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                        "p-2 rounded-xl transition-all flex items-center gap-2 group",
                        theme === t.id
                            ? "bg-stone-800 text-white shadow-inner border border-white/5"
                            : "text-stone-500 hover:text-stone-300"
                    )}
                    title={`Switch to ${t.name} mode`}
                >
                    <t.icon size={16} className={cn(
                        "transition-transform",
                        theme === t.id ? t.color : "group-hover:scale-110"
                    )} />
                    {theme === t.id && (
                        <span className="text-[10px] font-black uppercase tracking-widest pr-1">
                            {t.name}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};
