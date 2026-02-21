export enum EngineType {
    OBS = 'OBS',
    VMIX = 'VMIX',
}

export interface ObsState {
    currentScene: string;
    scenes: string[];
    isStreaming: boolean;
    isRecording: boolean;
    cpuUsage?: number;
    fps?: number;
    isConnected: boolean;
}

export interface VmixState {
    activeInput: number;
    previewInput: number;
    isStreaming: boolean;
    isRecording: boolean;
    isExternal: boolean;
    isMultiCorder: boolean;
}

export interface StreamingState {
    productionId: string;
    engineType: EngineType;
    status: string;
    isConnected: boolean;
    obs?: ObsState;
    vmix?: VmixState;
    lastUpdate: string;
}

export type StreamingCommand =
    | { type: 'CHANGE_SCENE'; sceneName: string }
    | { type: 'START_STREAM' }
    | { type: 'STOP_STREAM' }
    | { type: 'START_RECORD' }
    | { type: 'STOP_RECORD' }
    | { type: 'VMIX_CUT' }
    | { type: 'VMIX_FADE'; duration?: number }
    | { type: 'VMIX_SELECT_INPUT'; payload: { input: number; isPreview?: boolean } };

export interface CommandResponse {
    success: boolean;
    message?: string;
    error?: string;
}
