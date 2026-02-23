import { apiClient } from '@/shared/api/api.client';

export interface SocialMessage {
    id: string;
    productionId: string;
    platform: string;
    author: string;
    authorAvatar?: string;
    content: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_AIR';
    timestamp: string;
}

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    isActive: boolean;
}

export const socialService = {
    async getMessages(productionId: string, status?: string): Promise<SocialMessage[]> {
        return apiClient.get(`/productions/${productionId}/social/messages`, { params: { status } });
    },

    async updateMessageStatus(productionId: string, messageId: string, status: string): Promise<SocialMessage> {
        return apiClient.put(`/productions/${productionId}/social/messages/${messageId}/status`, { status });
    },

    async getActivePoll(productionId: string): Promise<Poll | null> {
        return apiClient.get(`/productions/${productionId}/social/polls/active`);
    },

    async createPoll(productionId: string, question: string, options: string[]): Promise<Poll> {
        return apiClient.post(`/productions/${productionId}/social/polls`, { question, options });
    },

    async votePoll(pollId: string, optionId: string): Promise<Poll> {
        return apiClient.post(`/productions/dummy/social/polls/${pollId}/vote`, { optionId });
    },

    async closePoll(productionId: string, pollId: string): Promise<Poll> {
        return apiClient.delete(`/productions/${productionId}/social/polls/${pollId}`);
    },

    async getBlacklist(productionId: string): Promise<string[]> {
        return apiClient.get(`/productions/${productionId}/social/blacklist`);
    },

    async updateBlacklist(productionId: string, words: string[]): Promise<{ words: string[] }> {
        return apiClient.put(`/productions/${productionId}/social/blacklist`, { words });
    }
};
