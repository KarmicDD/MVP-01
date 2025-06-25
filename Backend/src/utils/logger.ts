// utils/logger.ts
import fs from 'fs';
import path from 'path';

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    data?: any;
    context?: string;
    userId?: string;
    requestId?: string;
}

class Logger {
    private logDir: string;
    private isDevelopment: boolean;

    constructor() {
        this.logDir = path.join(__dirname, '..', '..', 'logs');
        this.isDevelopment = process.env.NODE_ENV !== 'production';
        this.ensureLogDirectory();
    }

    private ensureLogDirectory(): void {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private getColorCode(level: string): string {
        const colors = {
            INFO: '\x1b[36m',    // Cyan
            ERROR: '\x1b[31m',   // Red
            WARN: '\x1b[33m',    // Yellow
            DEBUG: '\x1b[35m',   // Magenta
            SUCCESS: '\x1b[32m', // Green
            HTTP: '\x1b[34m',    // Blue
            RESET: '\x1b[0m'     // Reset
        };
        return colors[level as keyof typeof colors] || colors.RESET;
    }

    private formatConsoleMessage(level: string, message: string, data?: any, context?: string): string {
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const color = this.getColorCode(level);
        const reset = this.getColorCode('RESET');

        // Create a cleaner, more compact format
        let formattedMessage = `${color}${timestamp}${reset} ${message}`;

        // Only show data if it's relevant and not too verbose
        if (data && Object.keys(data).length > 0) {
            const filteredData = this.filterSensitiveData(data);
            const compactData = this.compactDataString(filteredData);
            if (compactData) {
                formattedMessage += ` ${color}│${reset} ${compactData}`;
            }
        }

        return formattedMessage;
    }

    private filterSensitiveData(data: any): any {
        if (!data || typeof data !== 'object') return data;

        const filtered = { ...data };
        const sensitiveKeys = ['password', 'token', 'auth', 'secret', 'key', 'userAgent'];

        for (const key of Object.keys(filtered)) {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                filtered[key] = '[HIDDEN]';
            }
        }

        return filtered;
    }

    private compactDataString(data: any): string {
        if (!data || typeof data !== 'object') return String(data);

        const entries = Object.entries(data);
        if (entries.length === 0) return '';

        // Show only the most important fields in a compact format
        const important = entries
            .filter(([key, value]) => value !== undefined && value !== null && value !== '')
            .slice(0, 3) // Limit to 3 most important fields
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

        return important;
    }

    private writeToFile(entry: LogEntry): void {
        try {
            const logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(logFile, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    private log(level: string, message: string, data?: any, context?: string): void {
        const entry: LogEntry = {
            timestamp: this.formatTimestamp(),
            level,
            message,
            data,
            context
        };

        // Console output with better formatting
        if (this.isDevelopment) {
            console.log(this.formatConsoleMessage(level, message, data, context));
        }

        // File output
        this.writeToFile(entry);
    }

    info(message: string, data?: any, context?: string): void {
        this.log('INFO', message, data, context);
    }

    error(message: string, data?: any, context?: string): void {
        this.log('ERROR', message, data, context);
    }

    warn(message: string, data?: any, context?: string): void {
        this.log('WARN', message, data, context);
    }

    debug(message: string, data?: any, context?: string): void {
        if (this.isDevelopment) {
            this.log('DEBUG', message, data, context);
        }
    }

    success(message: string, data?: any, context?: string): void {
        this.log('SUCCESS', message, data, context);
    }

    http(message: string, data?: any, context?: string): void {
        this.log('HTTP', message, data, context);
    }

    // Enhanced HTTP request logging with multi-line, professional formatting (no emojis)
    httpRequest(method: string, url: string, statusCode: number, duration: number, userId?: string, userAgent?: string, requestId?: string): void {
        let level = 'INFO';
        let header = 'HTTP REQUEST';
        if (statusCode >= 200 && statusCode < 300) {
            level = 'SUCCESS';
            header = 'HTTP SUCCESS';
        } else if (statusCode >= 400 && statusCode < 500) {
            level = 'WARNING';
            header = 'HTTP WARNING';
        } else if (statusCode >= 500) {
            level = 'ERROR';
            header = 'HTTP ERROR';
        }

        const message = [
            '============================================================',
            ` ${header}`,
            '------------------------------------------------------------',
            ` Timestamp   : ${this.formatTimestamp()}`,
            ` Request ID  : ${requestId || 'N/A'}`,
            ` User        : ${userId || 'anonymous'}`,
            ` User-Agent  : ${userAgent || 'N/A'}`,
            ` Method      : ${method}`,
            ` URL         : ${url}`,
            ` Status      : ${statusCode}`,
            ` Duration    : ${duration}ms`,
            '============================================================',
        ].join('\n');

        this.log(level, message, undefined, 'HTTP');
    }

    // Method for database operations
    database(operation: string, table: string, duration?: number, error?: any): void {
        const data = {
            operation,
            table,
            duration: duration ? `${duration}ms` : undefined,
            error: error?.message
        };

        const level = error ? 'ERROR' : 'INFO';
        const tag = error ? '[DATABASE ERROR]' : '[DATABASE]';

        this.log(level, `${tag} Database ${operation} on ${table}${duration ? ` (${duration}ms)` : ''}`, data, 'DATABASE');
    }

    // Method for authentication events
    auth(event: string, userId?: string, email?: string, success: boolean = true): void {
        const data = {
            event,
            userId,
            email,
            success
        };

        const tag = success ? '[AUTH]' : '[AUTH WARNING]';
        const level = success ? 'INFO' : 'WARN';

        this.log(level, `${tag} Auth: ${event}${email ? ` for ${email}` : ''}`, data, 'AUTH');
    }

    // Method for API errors
    apiError(error: any, context?: string, userId?: string): void {
        const data = {
            message: error.message,
            stack: error.stack,
            code: error.code,
            userId,
            context
        };

        this.error(`[API ERROR] ${error.message}`, data, 'API_ERROR');
    }

    // Method for startup/shutdown events
    system(message: string, data?: any): void {
        this.info(`[SYSTEM] ${message}`, data, 'SYSTEM');
    }
}

const logger = new Logger();
export default logger;