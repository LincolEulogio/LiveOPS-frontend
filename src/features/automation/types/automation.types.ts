export interface Trigger {
    id: string;
    ruleId: string;
    eventType: string;
    condition: any;
}

export interface Action {
    id: string;
    ruleId: string;
    actionType: string;
    payload: any;
    order: number;
}

export interface Rule {
    id: string;
    productionId: string;
    name: string;
    description: string | null;
    isEnabled: boolean;
    triggers: Trigger[];
    actions: Action[];
    createdAt: string;
    updatedAt: string;
}

export interface RuleExecutionLog {
    id: string;
    ruleId: string;
    rule?: { name: string };
    productionId: string;
    status: 'SUCCESS' | 'ERROR';
    details: string;
    createdAt: string;
}

export interface CreateTriggerDto {
    eventType: string;
    condition?: any;
}

export interface CreateActionDto {
    actionType: string;
    payload?: any;
    order?: number;
}

export interface CreateRuleDto {
    name: string;
    description?: string;
    isEnabled?: boolean;
    triggers: CreateTriggerDto[];
    actions: CreateActionDto[];
}

export interface UpdateRuleDto {
    name?: string;
    description?: string;
    isEnabled?: boolean;
}
