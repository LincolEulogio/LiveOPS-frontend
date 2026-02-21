import { apiClient } from '@/shared/api/api.client';
import { StreamingState, StreamingCommand, CommandResponse } from '../types/streaming.types';

export const streamingService = {
    async getStreamingState(productionId: string): Promise<StreamingState> {
        return apiClient.get(`/streaming/${productionId}/state`);
    },

    async sendCommand(productionId: string, command: StreamingCommand): Promise<CommandResponse> {
        return apiClient.post(`/streaming/${productionId}/command`, command);
    },
};
