'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MonitorPlay, Activity, LayoutDashboard, Settings, Video, Server, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { cn } from '@/shared/utils/cn';

interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ElementType;
    action: () => void;
    category: 'Productions' | 'Navigation' | 'Actions';
    color?: string;
}

export const CommandPalette = () => {
    const { isOpen, close } = useCommandPalette();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch quick access productions
    const { data: productions = [] } = useQuery({
        queryKey: ['productions', 'command-palette'],
        queryFn: async () => {
            const res = await apiClient.get<{ data: any[] }>('/productions');
            return res.data;
        },
        enabled: isOpen,
    });

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const items: CommandItem[] = React.useMemo(() => {
        const staticItems: CommandItem[] = [
            { id: 'nav-home', title: 'Home Dashboard', icon: LayoutDashboard, action: () => router.push('/productions'), category: 'Navigation' },
            { id: 'nav-settings', title: 'Global Settings', icon: Settings, action: () => console.log('Settings clicked'), category: 'Navigation' },
            { id: 'action-theme', title: 'Toggle Theme', icon: Activity, action: () => console.log('Theme toggle'), category: 'Actions' },
        ];

        const prodItems: CommandItem[] = productions.map((p: any) => ({
            id: `prod-${p.id}`,
            title: p.name,
            subtitle: `Status: ${p.status} • Engine: ${p.engineType}`,
            icon: p.engineType === 'OBS' ? Video : Server,
            color: p.status === 'ON_AIR' ? 'text-emerald-400' : 'text-indigo-400',
            action: () => router.push(`/productions/${p.id}`),
            category: 'Productions',
        }));

        const allItems = [...prodItems, ...staticItems];

        if (!search) return allItems;

        return allItems.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [productions, search, router]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % items.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (items[selectedIndex]) {
                    items[selectedIndex].action();
                    close();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, items, selectedIndex, close]);

    // Group items for rendering
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    let globalIndexOffset = 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 font-sans">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
                        onClick={close}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] ring-1 ring-white/10"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-4 border-b border-stone-800">
                            <Search className="w-5 h-5 text-stone-500 mr-3" />
                            <input
                                ref={inputRef}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                placeholder="Search productions, commands, or jump to..."
                                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-stone-500 placeholder:font-light"
                            />
                            <div className="flex items-center gap-1.5 ml-3">
                                <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-1.5 text-[10px] font-bold text-stone-500 bg-stone-800 rounded">ESC</kbd>
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="p-8 text-center text-stone-500">
                                    <p>No results found for "{search}"</p>
                                </div>
                            ) : (
                                Object.entries(groupedItems).map(([category, itemsInCategory]) => {
                                    const CategoryWrapper = (
                                        <div key={category} className="mb-4 last:mb-0">
                                            <h3 className="px-3 py-2 text-[10px] font-bold text-stone-500 uppercase  sticky top-0 bg-stone-900 z-10">
                                                {category}
                                            </h3>
                                            <div className="space-y-0.5">
                                                {itemsInCategory.map((item) => {
                                                    const currentIndex = globalIndexOffset++;
                                                    const isSelected = selectedIndex === currentIndex;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                                                            onClick={() => { item.action(); close(); }}
                                                            className={cn(
                                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
                                                                isSelected ? "bg-indigo-500/10 border-indigo-500/20" : "hover:bg-stone-800 border-transparent border"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "p-2 rounded-lg shrink-0",
                                                                isSelected ? "bg-indigo-500/20 text-indigo-400" : "bg-stone-800 text-stone-400",
                                                                item.color && !isSelected && "bg-stone-800"
                                                            )}>
                                                                <item.icon size={16} className={item.color && !isSelected ? item.color : ""} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn("text-sm font-medium truncate", isSelected ? "text-white" : "text-stone-300")}>
                                                                    {item.title}
                                                                </p>
                                                                {item.subtitle && (
                                                                    <p className="text-xs text-stone-500 truncate">{item.subtitle}</p>
                                                                )}
                                                            </div>
                                                            {isSelected && (
                                                                <ArrowRight size={16} className="text-indigo-400 shrink-0" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                    return CategoryWrapper;
                                })
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="px-4 py-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-500">
                            <div className="flex justify-center items-center gap-4 w-full">
                                <span className="flex items-center gap-1.5"><kbd className="w-4 h-4 rounded bg-stone-800 flex items-center justify-center font-sans">↑</kbd><kbd className="w-4 h-4 rounded bg-stone-800 flex items-center justify-center font-sans">↓</kbd> to navigate</span>
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 h-4 rounded bg-stone-800 flex items-center justify-center font-sans">↵</kbd> to select</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
