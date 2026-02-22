import { create } from 'zustand';

export interface IntercomAlert {
    id: string;
    message: string;
    senderName: string;
    color?: string;
    timestamp: string;
    requiresAck: boolean;
    status: 'SENT' | 'ACKNOWLEDGED';
    ackTimestamp?: string;
}

interface IntercomState {
    activeAlert: IntercomAlert | null;
    history: IntercomAlert[];

    setActiveAlert: (alert: IntercomAlert | null) => void;
    addToHistory: (alert: IntercomAlert) => void;
    updateAlertStatus: (id: string, status: 'ACKNOWLEDGED', timestamp?: string) => void;
}

export const useIntercomStore = create<IntercomState>((set) => ({
    activeAlert: null,
    history: [],

    setActiveAlert: (alert) => set({ activeAlert: alert }),

    addToHistory: (alert) => set((state) => ({
        history: [alert, ...state.history].slice(0, 50)
    })),

    updateAlertStatus: (id, status, timestamp) => set((state) => ({
        activeAlert: state.activeAlert?.id === id ? { ...state.activeAlert, status, ackTimestamp: timestamp } : state.activeAlert,
        history: state.history.map(a => a.id === id ? { ...a, status, ackTimestamp: timestamp } : a)
    })),
}));
