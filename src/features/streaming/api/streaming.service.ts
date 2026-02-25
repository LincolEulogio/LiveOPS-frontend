import { apiClient } from '@/shared/api/api.client';
import { StreamingState, StreamingCommand, CommandResponse, StreamingDestination } from '@/features/streaming/types/streaming.types';

export const streamingService = {
    async getStreamingState(productionId: string): Promise<StreamingState> {
        return apiClient.get(`/streaming/${productionId}/state`);
    },

    async sendCommand(productionId: string, command: StreamingCommand): Promise<CommandResponse> {
        return apiClient.post(`/streaming/${productionId}/command`, command);
    },

    // --- Destination Management --- //
    async getDestinations(productionId: string): Promise<StreamingDestination[]> {
        return apiClient.get(`/streaming/${productionId}/destinations`);
    },

    async createDestination(productionId: string, data: any): Promise<StreamingDestination> {
        return apiClient.post(`/streaming/${productionId}/destinations`, data);
    },

    async updateDestination(destId: string, data: any): Promise<StreamingDestination> {
        return apiClient.put(`/streaming/destinations/${destId}`, data);
    },

    async deleteDestination(destId: string): Promise<void> {
        return apiClient.delete(`/streaming/destinations/${destId}`);
    },
};
