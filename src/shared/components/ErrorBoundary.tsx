'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Here we could pipe to a logging service like Sentry
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8  text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-2">
                            <AlertCircle size={40} />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white ">System Interruption</h1>
                            <p className="text-stone-400 text-sm leading-relaxed">
                                The application encountered an unexpected error. Don't worry, your production state is safe on the server.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-left">
                                <p className="text-[10px] font-bold text-stone-600 uppercase  mb-1">Error Signature</p>
                                <p className="text-xs font-mono text-red-400/80 break-all leading-tight">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all  "
                            >
                                <RefreshCcw size={18} />
                                Attempt Recovery
                            </button>

                            <Link
                                href="/"
                                className="w-full flex items-center justify-center gap-2 bg-stone-950 border border-stone-800 text-stone-400 hover:text-white py-3 rounded-xl font-bold transition-all"
                            >
                                <Home size={18} />
                                Return to Dashboard
                            </Link>
                        </div>

                        <p className="text-[10px] text-stone-600 font-medium">
                            If the problem persists, please contact technical support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
