"use client";

import { usePushNotifications } from '@/shared/hooks/usePushNotifications';

export const PWAInitializer = () => {
    usePushNotifications();
    return null;
};
