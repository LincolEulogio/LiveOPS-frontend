'use client';

import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface GuardProps {
  requiredPermissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Guard({ requiredPermissions, children, fallback = null }: GuardProps) {
  const hasPermission = usePermissions(requiredPermissions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
