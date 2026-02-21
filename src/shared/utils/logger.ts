'use client';

/**
 * Robust Client-side Logger for LiveOPS.
 * Can be extended to send logs to a backend endpoint or monitoring service (like Sentry/Datadog).
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private static instance: Logger;
    private isProduction = process.env.NODE_ENV === 'production';

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private formatMessage(level: LogLevel, message: string, context?: any) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    public info(message: string, context?: any) {
        const formatted = this.formatMessage('info', message);
        console.info(formatted, context || '');
    }

    public warn(message: string, context?: any) {
        const formatted = this.formatMessage('warn', message);
        console.warn(formatted, context || '');
    }

    public error(message: string, error?: Error | any, context?: any) {
        const formatted = this.formatMessage('error', message);
        console.error(formatted, {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            context
        });

        // In production, this is where we would trigger an external log capture
        if (this.isProduction) {
            // Example: sendToMonitoring(formatted, error, context);
        }
    }

    public debug(message: string, context?: any) {
        if (this.isProduction) return;
        const formatted = this.formatMessage('debug', message);
        console.debug(formatted, context || '');
    }
}

export const logger = Logger.getInstance();
