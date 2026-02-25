import { apiClient } from '@/shared/api/api.client';
import { Rule, RuleExecutionLog, CreateRuleDto, UpdateRuleDto } from '@/features/automation/types/automation.types';

export const automationService = {
    getRules: (productionId: string): Promise<Rule[]> =>
        apiClient.get(`/productions/${productionId}/automation/rules`),

    getRule: (productionId: string, ruleId: string): Promise<Rule> =>
        apiClient.get(`/productions/${productionId}/automation/rules/${ruleId}`),

    createRule: (productionId: string, dto: CreateRuleDto): Promise<Rule> =>
        apiClient.post(`/productions/${productionId}/automation/rules`, dto),

    updateRule: (productionId: string, ruleId: string, dto: UpdateRuleDto): Promise<Rule> =>
        apiClient.put(`/productions/${productionId}/automation/rules/${ruleId}`, dto),

    deleteRule: (productionId: string, ruleId: string): Promise<{ success: boolean }> =>
        apiClient.delete(`/productions/${productionId}/automation/rules/${ruleId}`),

    getExecutionLogs: (productionId: string): Promise<RuleExecutionLog[]> =>
        apiClient.get(`/productions/${productionId}/automation/logs`),

    triggerRule: (productionId: string, ruleId: string): Promise<{ success: boolean }> =>
        apiClient.post(`/productions/${productionId}/automation/rules/${ruleId}/trigger`),

    triggerInstantClip: (productionId: string): Promise<{ success: boolean }> =>
        apiClient.post(`/productions/${productionId}/automation/instant-clip`),
};
