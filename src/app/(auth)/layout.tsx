import React from 'react';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 right-6 z-50">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">LiveOPS Central</h1>
          <p className="text-muted">Sign in to your account</p>
        </div>
        {children}
      </div>
    </div>
  );
}
