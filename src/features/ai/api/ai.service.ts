import { apiClient } from '@/shared/api/api.client';

export const aiService = {
    suggestScriptContent: (title: string, content: string): Promise<{ suggestion: string }> =>
        apiClient.post('/ai/suggest-script', { title, content }),

    generateBriefing: (data: { social: string; telemetry: string; script: string }): Promise<{ briefing: string }> =>
        apiClient.post('/ai/generate-briefing', data),
};
