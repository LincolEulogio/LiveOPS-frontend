import { create } from 'zustand';
import { StreamingState } from '../types/streaming.types';

interface StreamingStore {
    states: Record<string, StreamingState>; // productionId -> state
    setStreamingState: (productionId: string, state: StreamingState) => void;
    updateStreamingState: (productionId: string, partial: Partial<StreamingState>) => void;
    getProductionState: (productionId: string) => StreamingState | undefined;
}

export const useStreamingStore = create<StreamingStore>()((set, get) => ({
    states: {},
    setStreamingState: (productionId, state) =>
        set((s) => ({
            states: { ...s.states, [productionId]: state },
        })),
    updateStreamingState: (productionId, partial) =>
        set((s) => ({
            states: {
                ...s.states,
                [productionId]: s.states[productionId]
                    ? { ...s.states[productionId], ...partial, lastUpdate: new Date().toISOString() }
                    : (partial as StreamingState),
            },
        })),
    getProductionState: (productionId) => get().states[productionId],
}));
