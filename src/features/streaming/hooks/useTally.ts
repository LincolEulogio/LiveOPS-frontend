import { useStreamingStore } from '../store/streaming.store';

export const useTally = (productionId: string | undefined) => {
    const states = useStreamingStore(s => s.states);
    const state = productionId ? states[productionId] : undefined;

    const tally = state?.tally;

    const isProgram = (sourceName: string | undefined) => {
        if (!sourceName || !tally) return false;
        return tally.program === sourceName;
    };

    const isPreview = (sourceName: string | undefined) => {
        if (!sourceName || !tally) return false;
        return tally.preview === sourceName;
    };

    return {
        tally,
        isProgram,
        isPreview
    };
};
