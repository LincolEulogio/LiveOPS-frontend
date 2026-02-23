export interface OverlayLayer {
    id: string;
    type: 'text' | 'image' | 'shape';
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    zIndex: number;
    content: string; // text content or image URL
    style: Record<string, any>;
    binding?: {
        source: 'rundown' | 'social' | 'manual' | 'telemetry';
        field: string;
        prefix?: string;
        suffix?: string;
    };
}

export interface OverlayConfig {
    width: number; // usually 1920
    height: number; // usually 1080
    layers: OverlayLayer[];
}

export interface OverlayTemplate {
    id: string;
    productionId: string;
    name: string;
    description?: string;
    config: OverlayConfig;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOverlayDto {
    name: string;
    description?: string;
    config: OverlayConfig;
    isActive?: boolean;
}
