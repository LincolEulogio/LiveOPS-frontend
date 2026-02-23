'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'production';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('app-theme') as Theme;
        if (savedTheme && ['light', 'dark', 'production'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('app-theme', newTheme);

        // Apply theme class to document element
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'production');
        root.classList.add(newTheme);
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'production');
        root.classList.add(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
