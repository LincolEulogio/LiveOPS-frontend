import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">LiveOPS Central</h1>
          <p className="text-stone-400">Sign in to your account</p>
        </div>
        {children}
      </div>
    </div>
  );
}
