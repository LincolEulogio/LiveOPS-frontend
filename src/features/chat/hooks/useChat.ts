import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../api/chat.service';
import { useSocket } from '@/shared/socket/socket.provider';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useEffect, useState, useCallback } from 'react';
import {
    Command,
    CommandTemplate,
    SendCommandDto,
    AckCommandDto,
    CommandResponse,
} from '../types/chat.types';

export const useChat = (productionId: string) => {
    const queryClient = useQueryClient();
    const { socket, isConnected } = useSocket();
    const user = useAuthStore((state) => state.user);

    // 1. Fetch history and templates via React Query
    const { data: history = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ['chat-history', productionId],
        queryFn: () => chatService.getCommandHistory(productionId),
        enabled: !!productionId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
        queryKey: ['chat-templates', productionId],
        queryFn: () => chatService.getTemplates(productionId),
        enabled: !!productionId,
    });

    // 2. Local state for real-time updates (we prepend new commands)
    // We use the query as the initial state, but we also want to react to WS events instantly
    useEffect(() => {
        if (!socket || !productionId) return;

        const handleCommandReceived = (command: Command) => {
            if (command.productionId === productionId) {
                // Optimistically update the query cache
                queryClient.setQueryData(['chat-history', productionId], (old: Command[] = []) => {
                    // Check if it already exists to avoid duplicates
                    if (old.some(c => c.id === command.id)) return old;
                    return [command, ...old];
                });
            }
        };

        const handleAckReceived = (response: CommandResponse & { commandId: string }) => {
            queryClient.setQueryData(['chat-history', productionId], (old: Command[] = []) => {
                return old.map(cmd => {
                    if (cmd.id === response.commandId) {
                        // Check if response already exists
                        const responseExists = cmd.responses?.some(r => r.id === response.id);
                        if (responseExists) return cmd;

                        return {
                            ...cmd,
                            responses: [...(cmd.responses || []), response]
                        };
                    }
                    return cmd;
                });
            });
        };

        socket.on('command.received', handleCommandReceived);
        socket.on('command.ack_received', handleAckReceived);

        return () => {
            socket.off('command.received', handleCommandReceived);
            socket.off('command.ack_received', handleAckReceived);
        };
    }, [socket, productionId, queryClient]);

    // 3. Command Actions
    const sendCommand = useCallback((message: string, options?: Partial<Omit<SendCommandDto, 'message' | 'productionId' | 'senderId'>>) => {
        if (!socket || !isConnected || !user) return;

        const dto: SendCommandDto = {
            productionId,
            senderId: user.id,
            message,
            targetRoleId: options?.targetRoleId,
            templateId: options?.templateId,
            requiresAck: options?.requiresAck ?? true,
        };

        socket.emit('command.send', dto);
    }, [socket, isConnected, productionId, user]);

    const ackCommand = useCallback((commandId: string, response: string, note?: string) => {
        if (!socket || !isConnected || !user) return;

        const dto: AckCommandDto = {
            commandId,
            responderId: user.id,
            response,
            note,
            productionId,
        };

        socket.emit('command.ack', dto);
    }, [socket, isConnected, productionId, user]);

    return {
        history,
        templates,
        isLoading: isLoadingHistory || isLoadingTemplates,
        sendCommand,
        ackCommand,
        isConnected,
    };
};
