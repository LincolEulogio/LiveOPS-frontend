'use client';

import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 2, // 2 retries on top of initial try
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0, // Better for UX: show error immediately instead of retrying silently
          }
        },
        mutationCache: new MutationCache({
          onError: (error: any) => {
            // Show global error toast for any mutation failure
            const message = error.message || 'Error detectado en la operación táctica';
            toast.error(message, {
              icon: <AlertCircle className="text-red-500" size={16} />,
              description: 'El motor no pudo procesar la solicitud. Verifica el estado del nodo.',
              duration: 5000,
            });
          }
        })
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
