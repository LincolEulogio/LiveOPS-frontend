import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    CommandStatus,
    ChatMessage,
    SendChatMessageDto
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

    const { data: chatHistory = [], isLoading: isLoadingChat } = useQuery({
        queryKey: ['chat-messages', productionId],
        queryFn: () => chatService.getChatHistory(productionId),
        enabled: !!productionId,
    });

    // 2. Local state for real-time updates
    useEffect(() => {
        if (!socket || !productionId) return;

        const handleCommandReceived = (command: Command) => {
            if (command.productionId === productionId) {
                queryClient.setQueryData(['chat-history', productionId], (old: Command[] = []) => {
                    if (old.some(c => c.id === command.id)) return old;
                    return [command, ...old];
                });
            }
        };

        const handleAckReceived = (response: CommandResponse & { commandId: string }) => {
            queryClient.setQueryData(['chat-history', productionId], (old: Command[] = []) => {
                return old.map(cmd => {
                    if (cmd.id === response.commandId) {
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

        const handleChatReceived = (message: ChatMessage) => {
            if (message.productionId === productionId) {
                queryClient.setQueryData(['chat-messages', productionId], (old: ChatMessage[] = []) => {
                    if (old.some(m => m.id === message.id)) return old;
                    return [...old, message];
                });
            }
        };

        socket.on('command.received', handleCommandReceived);
        socket.on('command.ack_received', handleAckReceived);
        socket.on('chat.received', handleChatReceived);

        return () => {
            socket.off('command.received', handleCommandReceived);
            socket.off('command.ack_received', handleAckReceived);
            socket.off('chat.received', handleChatReceived);
        };
    }, [socket, productionId, queryClient]);

    // 3. Actions
    const sendChatMessage = useCallback((message: string) => {
        if (!socket || !isConnected || !user) return;

        const dto: SendChatMessageDto = {
            productionId,
            userId: user.id,
            message,
        };

        // Optimistic append
        const optimisticMessage: ChatMessage = {
            id: `temp-chat-${Date.now()}`,
            ...dto,
            createdAt: new Date().toISOString(),
            user: { id: user.id, name: user.name || 'Me' },
        };

        queryClient.setQueryData(['chat-messages', productionId], (old: ChatMessage[] = []) => [...old, optimisticMessage]);

        socket.emit('chat.send', dto);
    }, [socket, isConnected, productionId, user, queryClient]);

    const sendCommand = useCallback((message: string, options?: Partial<Omit<SendCommandDto, 'message' | 'productionId' | 'senderId'>>) => {
        if (!socket || !isConnected || !user) return;

        const tempId = `temp-${Date.now()}`;
        const dto: SendCommandDto = {
            productionId,
            senderId: user.id,
            message,
            targetRoleId: options?.targetRoleId,
            templateId: options?.templateId,
            requiresAck: options?.requiresAck ?? true,
        };

        // Optimistic append
        const optimisticCommand: Command = {
            id: tempId,
            ...dto,
            targetRoleId: dto.targetRoleId ?? null,
            templateId: dto.templateId ?? null,
            requiresAck: dto.requiresAck ?? true,
            createdAt: new Date().toISOString(),
            status: CommandStatus.SENT,
            sender: { id: user.id, name: user.name || 'Me' },
            responses: []
        };

        queryClient.setQueryData(['chat-history', productionId], (old: Command[] = []) => [optimisticCommand, ...old]);

        socket.emit('command.send', dto);
    }, [socket, isConnected, productionId, user, queryClient]);

    const ackCommand = useCallback((commandId: string, response: string, note?: string) => {
        if (!socket || !isConnected || !user) return;

        const dto: AckCommandDto = {
            commandId,
            responderId: user.id,
            response,
            note,
            productionId,
        };

        // Optimistic ACK
        queryClient.setQueryData(['chat-history', productionId], (old: Command[] = []) => {
            return old.map(cmd => {
                if (cmd.id === commandId) {
                    const optimisticResponse: CommandResponse = {
                        id: `temp-ack-${Date.now()}`,
                        commandId,
                        responderId: user.id,
                        response,
                        note: note || null,
                        createdAt: new Date().toISOString(),
                        responder: { id: user.id, name: user.name || 'Me' }
                    };
                    return {
                        ...cmd,
                        responses: [...(cmd.responses || []), optimisticResponse]
                    };
                }
                return cmd;
            });
        });

        socket.emit('command.ack', dto);
    }, [socket, isConnected, productionId, user, queryClient]);

    const createTemplateMutation = useMutation({
        mutationFn: (dto: Omit<CommandTemplate, 'id' | 'productionId' | 'createdAt' | 'updatedAt'>) =>
            chatService.createTemplate(productionId, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-templates', productionId] });
        },
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: (templateId: string) => chatService.deleteTemplate(productionId, templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-templates', productionId] });
        },
    });

    return {
        history,
        chatHistory,
        templates,
        isLoading: isLoadingHistory || isLoadingTemplates || isLoadingChat,
        sendCommand,
        sendChatMessage,
        ackCommand,
        createTemplate: createTemplateMutation.mutateAsync,
        deleteTemplate: deleteTemplateMutation.mutateAsync,
        isConnected,
    };
};
