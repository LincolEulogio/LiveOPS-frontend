'use client';

import React from 'react';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { Sun, Moon, Zap, Monitor } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'light', name: 'Light', icon: Sun, color: 'text-amber-500', animation: 'animate-[spin_4s_linear_infinite]' },
        { id: 'dark', name: 'Dark', icon: Moon, color: 'text-indigo-400', animation: 'animate-[pulse_2s_ease-in-out_infinite]' },
    ] as const;

    return (
        <div className="flex bg-card-bg/50 p-1 rounded-2xl border border-card-border backdrop-blur-md">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                        "p-2 rounded-xl transition-all flex items-center gap-2 group",
                        theme === t.id
                            ? "bg-background text-foreground  border border-card-border"
                            : "text-muted hover:text-foreground hover:bg-card-border/30"
                    )}
                    title={`Switch to ${t.name} mode`}
                >
                    <t.icon size={16} className={cn(
                        "transition-transform",
                        theme === t.id ? cn(t.color, t.animation) : "group-hover:scale-110"
                    )} />
                    {theme === t.id && (
                        <span className="text-[10px] font-black uppercase  pr-1">
                            {t.name}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};
