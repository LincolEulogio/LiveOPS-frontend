import { create } from 'zustand';
import { StreamingState } from '@/features/streaming/types/streaming.types';

interface StreamingStore {
    states: Record<string, StreamingState>; // productionId -> state
    setStreamingState: (productionId: string, state: StreamingState) => void;
    updateStreamingState: (productionId: string, partial: {
        isConnected?: boolean;
        obs?: Partial<import('../types/streaming.types').ObsState>;
        vmix?: Partial<import('../types/streaming.types').VmixState>;
        tally?: import('../types/streaming.types').TallyUpdate;
    }) => void;
    getProductionState: (productionId: string) => StreamingState | undefined;
}

export const useStreamingStore = create<StreamingStore>()((set, get) => ({
    states: {},
    setStreamingState: (productionId, state) =>
        set((s) => ({
            states: { ...s.states, [productionId]: state },
        })),
    updateStreamingState: (productionId, partial) =>
        set((s) => {
            const current = s.states[productionId] || {};
            const nextObs = partial.obs ? { ...current.obs, ...partial.obs } : current.obs;
            const nextVmix = partial.vmix ? { ...current.vmix, ...partial.vmix } : current.vmix;

            return {
                states: {
                    ...s.states,
                    [productionId]: {
                        ...current,
                        ...partial,
                        obs: nextObs,
                        vmix: nextVmix,
                        lastUpdate: new Date().toISOString(),
                    } as StreamingState,
                },
            };
        }),
    getProductionState: (productionId) => get().states[productionId],
}));
