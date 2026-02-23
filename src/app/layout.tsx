import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/shared/api/react-query.provider';
import { SocketProvider } from '@/shared/socket/socket.provider';
import { AudioProvider } from '@/shared/providers/AudioProvider';

import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { SetupRedirect } from '@/shared/components/SetupRedirect';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LiveOPS Production Control',
  description: 'Live Streaming Multi-tenant Control System',
};

import { ThemeProvider } from '@/shared/providers/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden`}
      >
        <ErrorBoundary>
          <ReactQueryProvider>
            <ThemeProvider>
              <AudioProvider>
                <SetupRedirect />
                <SocketProvider>{children}</SocketProvider>
              </AudioProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
