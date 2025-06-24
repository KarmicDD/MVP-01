import { Request } from 'express';
import fs from 'fs';
import path from 'path';

// Security event types
export interface SecurityEvent {
    timestamp: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ip: string;
    userAgent: string;
    url: string;
    method: string;
    userId?: string;
    details: any;
    fingerprint: string;
}

// Security monitoring service
export class SecurityMonitoringService {
    private logDir: string;
    private alertThresholds: Record<string, { count: number; timeWindow: number }>;
    private eventHistory: Map<string, Array<{ timestamp: number; count: number }>>;

    constructor() {
        this.logDir = path.join(process.cwd(), 'logs', 'security');
        this.ensureLogDirectory();

        // Alert thresholds (events per time window in minutes)
        this.alertThresholds = {
            'FAILED_LOGIN': { count: 5, timeWindow: 15 },
            'SUSPICIOUS_INPUT': { count: 10, timeWindow: 10 },
            'RATE_LIMIT_EXCEEDED': { count: 3, timeWindow: 60 },
            'XSS_ATTEMPT': { count: 1, timeWindow: 5 },
            'SQL_INJECTION_ATTEMPT': { count: 1, timeWindow: 5 },
            'CSRF_TOKEN_INVALID': { count: 3, timeWindow: 15 },
            'FILE_UPLOAD_VIOLATION': { count: 5, timeWindow: 30 }
        };

        this.eventHistory = new Map();
    }

    private ensureLogDirectory(): void {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private generateFingerprint(event: Omit<SecurityEvent, 'fingerprint'>): string {
        const crypto = require('crypto');
        const data = `${event.type}:${event.ip}:${event.userId || 'anonymous'}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }

    /**
     * Log a security event
     */
    public logEvent(
        type: string,
        req: Request,
        details: any = {},
        severity: SecurityEvent['severity'] = 'medium'
    ): void {
        const event: Omit<SecurityEvent, 'fingerprint'> = {
            timestamp: new Date().toISOString(),
            type,
            severity,
            ip: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            url: req.originalUrl || req.url,
            method: req.method,
            userId: (req as any).user?.userId,
            details
        };

        const fingerprint = this.generateFingerprint(event);
        const fullEvent: SecurityEvent = { ...event, fingerprint };

        // Write to log file
        this.writeToLogFile(fullEvent);

        // Check for alert conditions
        this.checkAlertConditions(fullEvent);

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.warn('SECURITY EVENT:', JSON.stringify(fullEvent, null, 2));
        }
    }

    private writeToLogFile(event: SecurityEvent): void {
        const logFile = path.join(this.logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
        const logEntry = JSON.stringify(event) + '\n';

        fs.appendFile(logFile, logEntry, (err) => {
            if (err) {
                console.error('Failed to write security log:', err);
            }
        });
    }

    private checkAlertConditions(event: SecurityEvent): void {
        const threshold = this.alertThresholds[event.type];
        if (!threshold) return;

        const key = `${event.type}:${event.fingerprint}`;
        const now = Date.now();
        const windowStart = now - (threshold.timeWindow * 60 * 1000);

        // Get or create event history for this key
        if (!this.eventHistory.has(key)) {
            this.eventHistory.set(key, []);
        }

        const history = this.eventHistory.get(key)!;

        // Remove events outside the time window
        const filteredHistory = history.filter(h => h.timestamp > windowStart);

        // Add current event
        filteredHistory.push({ timestamp: now, count: 1 });

        // Update history
        this.eventHistory.set(key, filteredHistory);

        // Calculate total events in window
        const totalEvents = filteredHistory.reduce((sum, h) => sum + h.count, 0);

        // Check if threshold exceeded
        if (totalEvents >= threshold.count) {
            this.triggerAlert(event, totalEvents, threshold.timeWindow);
        }
    }

    private triggerAlert(event: SecurityEvent, eventCount: number, timeWindow: number): void {
        const alert = {
            timestamp: new Date().toISOString(),
            type: 'SECURITY_ALERT',
            severity: 'critical' as const,
            message: `Security threshold exceeded: ${event.type}`,
            details: {
                originalEvent: event,
                eventCount,
                timeWindow,
                threshold: this.alertThresholds[event.type]
            }
        };

        // Log alert
        const alertFile = path.join(this.logDir, 'security-alerts.log');
        fs.appendFile(alertFile, JSON.stringify(alert) + '\n', (err) => {
            if (err) {
                console.error('Failed to write security alert:', err);
            }
        });

        // In production, send to monitoring system
        console.error('SECURITY ALERT:', JSON.stringify(alert, null, 2));

        // TODO: Integrate with external alerting system (email, Slack, PagerDuty, etc.)
        // this.sendExternalAlert(alert);
    }

    /**
     * Get security statistics for dashboard
     */
    public getSecurityStats(hours: number = 24): any {
        const now = Date.now();
        const timeWindow = hours * 60 * 60 * 1000;
        const windowStart = now - timeWindow;

        const stats = {
            totalEvents: 0,
            eventsByType: {} as Record<string, number>,
            eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
            topIPs: {} as Record<string, number>,
            recentAlerts: [] as any[]
        };

        // This would typically read from a database or log aggregation system
        // For now, return empty stats structure
        return stats;
    }

    /**
     * Clean up old logs
     */
    public cleanupOldLogs(retentionDays: number = 30): void {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        try {
            const files = fs.readdirSync(this.logDir);
            files.forEach(file => {
                if (file.startsWith('security-') && file.endsWith('.log')) {
                    const filePath = path.join(this.logDir, file);
                    const stats = fs.statSync(filePath);

                    if (stats.mtime < cutoffDate) {
                        fs.unlinkSync(filePath);
                        console.log(`Cleaned up old security log: ${file}`);
                    }
                }
            });
        } catch (error) {
            console.error('Error cleaning up security logs:', error);
        }
    }
}

// Export singleton instance
export const securityMonitoring = new SecurityMonitoringService();

// Helper function for backward compatibility
export const logSecurityEvent = (
    type: string,
    req: Request,
    details: any = {},
    severity: SecurityEvent['severity'] = 'medium'
): void => {
    securityMonitoring.logEvent(type, req, details, severity);
};
