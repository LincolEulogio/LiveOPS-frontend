export interface ProductionLog {
    id: string;
    productionId: string;
    eventType: string;
    details: Record<string, unknown>;
    createdAt: string;
}

export interface OperatorActivity {
    id: string;
    productionId: string;
    userId: string;
    action: string;
    details: Record<string, unknown>;
    createdAt: string;
    user?: {
        id: string;
        name: string;
    };
}

export interface EventBreakdown {
    eventType: string;
    _count: number;
}

export interface DashboardMetrics {
    productionId: string;
    totalEvents: number;
    breakdown: EventBreakdown[];
    totalOperatorActions: number;
}
