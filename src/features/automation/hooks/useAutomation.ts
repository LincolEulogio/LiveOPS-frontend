import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationService } from '../api/automation.service';
import { CreateRuleDto, UpdateRuleDto, Rule } from '../types/automation.types';
import { useSocket } from '@/shared/socket/socket.provider';

export const useAutomation = (productionId: string) => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    // 1. Fetch rules
    const { data: rules = [], isLoading: isLoadingRules } = useQuery({
        queryKey: ['automation-rules', productionId],
        queryFn: () => automationService.getRules(productionId),
        enabled: !!productionId,
    });

    // 2. Fetch logs
    const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
        queryKey: ['automation-logs', productionId],
        queryFn: () => automationService.getExecutionLogs(productionId),
        enabled: !!productionId,
        refetchInterval: 5000, // Refresh logs every 5 seconds
    });

    // 3. Mutations
    const createMutation = useMutation({
        mutationFn: (dto: CreateRuleDto) => automationService.createRule(productionId, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation-rules', productionId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateRuleDto }) =>
            automationService.updateRule(productionId, id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation-rules', productionId] });
        },
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
            automationService.updateRule(productionId, id, { isEnabled }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation-rules', productionId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => automationService.deleteRule(productionId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation-rules', productionId] });
        },
    });

    const triggerRule = (rule: Rule) => {
        if (!socket) return;
        socket.emit('manual.trigger', {
            productionId,
            ruleId: rule.id,
            ruleName: rule.name,
        });
    };

    return {
        rules,
        logs,
        isLoading: isLoadingRules || isLoadingLogs,
        createRule: createMutation.mutateAsync,
        updateRule: updateMutation.mutateAsync,
        toggleRule: toggleMutation.mutateAsync,
        deleteRule: deleteMutation.mutateAsync,
        triggerRule,
        isMutating: createMutation.isPending || updateMutation.isPending || toggleMutation.isPending || deleteMutation.isPending,
    };
};
