import { useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSocket } from '@/shared/socket/socket.provider';
import { streamingService } from '../api/streaming.service';
import { useStreamingStore } from '../store/streaming.store';
import { StreamingCommand, StreamingState } from '../types/streaming.types';

export const useStreaming = (productionId: string | undefined) => {
    const { socket, isConnected: isSocketConnected } = useSocket();
    const { states, setStreamingState, updateStreamingState } = useStreamingStore();

    const currentState = productionId ? states[productionId] : undefined;

    // 1. Initial State Fetch
    const { data: initialData, isLoading, error } = useQuery({
        queryKey: ['streaming-state', productionId],
        queryFn: () => streamingService.getStreamingState(productionId!),
        enabled: !!productionId,
        staleTime: 10000,
    });

    useEffect(() => {
        if (initialData && productionId) {
            if (!currentState?.isConnected) {
                setStreamingState(productionId, initialData);
            } else {
                // We are already online. 
                // Only merge metadata, but DO NOT allow initialData to set isConnected to false
                if (initialData.isConnected === false) {
                    const { isConnected, ...metaOnly } = initialData;
                    updateStreamingState(productionId, metaOnly);
                } else {
                    updateStreamingState(productionId, initialData);
                }
            }
        }
    }, [initialData, productionId, setStreamingState, updateStreamingState, currentState?.isConnected]);

    // 2. Real-time Listeners
    useEffect(() => {
        if (!socket || !productionId) return;

        const handleConnectionState = (data: { productionId: string; connected: boolean }) => {
            if (data.productionId === productionId) {
                updateStreamingState(productionId, { isConnected: data.connected });
            }
        };

        const handleObsSceneChanged = (data: { productionId: string; sceneName: string; cpuUsage?: number; fps?: number }) => {
            if (data.productionId === productionId || !data.productionId) {
                updateStreamingState(productionId, {
                    obs: {
                        currentScene: data.sceneName,
                        cpuUsage: data.cpuUsage,
                        fps: data.fps
                    },
                    isConnected: true
                });
            }
        };

        const handleObsStreamState = (data: { productionId: string; active: boolean }) => {
            if (data.productionId === productionId) {
                updateStreamingState(productionId, {
                    obs: { isStreaming: data.active },
                    isConnected: true
                });
            }
        };

        const handleObsRecordState = (data: { productionId: string; active: boolean }) => {
            if (data.productionId === productionId) {
                updateStreamingState(productionId, {
                    obs: { isRecording: data.active },
                    isConnected: true
                });
            }
        };

        const handleVmixUpdate = (data: {
            productionId: string;
            activeInput: number;
            previewInput: number;
            isStreaming: boolean;
            isRecording: boolean;
            isExternal: boolean;
            isMultiCorder: boolean;
            inputs: any[];
        }) => {
            if (data.productionId === productionId && data.activeInput !== undefined) {
                updateStreamingState(productionId, {
                    vmix: {
                        activeInput: data.activeInput,
                        previewInput: data.previewInput,
                        isStreaming: data.isStreaming,
                        isRecording: data.isRecording,
                        isExternal: data.isExternal,
                        isMultiCorder: data.isMultiCorder,
                        inputs: data.inputs
                    },
                    isConnected: true
                });
            }
        };

        const handleTallyUpdate = (data: import('../types/streaming.types').TallyUpdate) => {
            if (data.productionId === productionId) {
                updateStreamingState(productionId, { tally: data });
            }
        };

        socket.on('obs.scene.changed', handleObsSceneChanged);
        socket.on('obs.stream.state', handleObsStreamState);
        socket.on('obs.record.state', handleObsRecordState);
        socket.on('obs.connection.state', handleConnectionState);
        socket.on('vmix.connection.state', handleConnectionState);
        socket.on('vmix.input.changed', handleVmixUpdate);
        socket.on('streaming.tally', handleTallyUpdate);

        // Some legacy events might still be emitted
        socket.on('engine.connection', handleConnectionState);

        return () => {
            socket.off('obs.scene.changed', handleObsSceneChanged);
            socket.off('obs.stream.state', handleObsStreamState);
            socket.off('obs.record.state', handleObsRecordState);
            socket.off('obs.connection.state', handleConnectionState);
            socket.off('vmix.connection.state', handleConnectionState);
            socket.off('vmix.input.changed', handleVmixUpdate);
            socket.off('streaming.tally', handleTallyUpdate);
            socket.off('engine.connection', handleConnectionState);
        };
    }, [socket, productionId, updateStreamingState]);

    // 3. Command Mutation
    const commandMutation = useMutation({
        mutationFn: (command: StreamingCommand) => streamingService.sendCommand(productionId!, command),
    });

    const sendCommand = useCallback(
        (command: StreamingCommand) => {
            if (!productionId) return;
            return commandMutation.mutateAsync(command);
        },
        [productionId, commandMutation]
    );

    return {
        state: currentState,
        isLoading,
        error,
        isSocketConnected,
        sendCommand,
        isPending: commandMutation.isPending,
    };
};
