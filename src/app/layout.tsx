import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import '@/app/globals.css';
import { ReactQueryProvider } from '@/shared/api/react-query.provider';
import { SocketProvider } from '@/shared/socket/socket.provider';
import { AudioProvider } from '@/shared/providers/AudioProvider';

import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { SetupRedirect } from '@/shared/components/SetupRedirect';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LiveOPS Production Control',
  description: 'Live Streaming Multi-tenant Control System',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png',
  },
  themeColor: '#6366f1',
};

import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { PWAInitializer } from '@/shared/components/PWAInitializer';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased h-dvh w-full overflow-hidden`}
        suppressHydrationWarning
      >
        <PWAInitializer />
        <ErrorBoundary>
          <ReactQueryProvider>
            <ThemeProvider>
              <AudioProvider>
                <SetupRedirect />
                <SocketProvider>{children}</SocketProvider>
                <Toaster
                  position="top-right"
                  expand={false}
                  richColors
                  closeButton
                  theme="dark"
                  toastOptions={{
                    style: {
                      background: 'rgba(12,12,12,0.85)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '1.25rem',
                      color: '#fff',
                      fontFamily: 'var(--font-inter)',
                    },
                    className: 'tactical-toast',
                  }}
                />
              </AudioProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
