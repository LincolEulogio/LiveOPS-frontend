'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function TalentLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { token, isHydrated } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && isHydrated && !token) {
            router.push('/login');
        }
    }, [token, isMounted, isHydrated, router]);

    if (!isMounted || !isHydrated || !token) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <span className="text-stone-700 font-bold uppercase tracking-widest animate-pulse">
                    Authenticating...
                </span>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-black overflow-hidden">
            {children}
        </div>
    );
}
