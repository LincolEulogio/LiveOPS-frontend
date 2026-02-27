'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCheckSetup } from '@/features/auth/hooks/useCheckSetup';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function SetupRedirect() {
    const { data, isLoading } = useCheckSetup();
    const router = useRouter();
    const pathname = usePathname();

    const clearAuth = useAuthStore((state) => state.clearAuth);

    useEffect(() => {
        if (!isLoading && data?.setupRequired) {
            // Prune stale authentication state after a database reset
            clearAuth();

            if (pathname !== '/register' && pathname !== '/login') {
                router.push('/register');
            }
        }
    }, [data, isLoading, pathname, router, clearAuth]);

    return null;
}
