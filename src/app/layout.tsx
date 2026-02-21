import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/shared/api/react-query.provider';
import { SocketProvider } from '@/shared/socket/socket.provider';

import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stone-950 text-stone-50 h-screen w-screen overflow-hidden`}
      >
        <ErrorBoundary>
          <ReactQueryProvider>
            <SocketProvider>{children}</SocketProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
