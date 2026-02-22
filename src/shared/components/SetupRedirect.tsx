'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCheckSetup } from '@/features/auth/hooks/useCheckSetup';

export function SetupRedirect() {
    const { data, isLoading } = useCheckSetup();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && data?.setupRequired && pathname !== '/register') {
            router.push('/register');
        }
    }, [data, isLoading, pathname, router]);

    return null;
}
