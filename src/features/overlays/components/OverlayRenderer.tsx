'use client';

import React, { useState, useEffect } from 'react';
import { OverlayTemplate, OverlayLayer } from '../types/overlay.types';
import { useSocket } from '@/shared/socket/socket.provider';

interface Props {
    template: OverlayTemplate;
}

export const OverlayRenderer = ({ template }: Props) => {
    const { socket } = useSocket();
    const [layers, setLayers] = useState<OverlayLayer[]>(template.config.layers);
    const [dynamicData, setDynamicData] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!socket) return;

        // Listen for live updates (e.g., scene changes, social messages, telemetry)
        socket.on('overlay.update_data', (data: Record<string, any>) => {
            setDynamicData(prev => ({ ...prev, ...data }));
        });

        // Also listen for template updates
        socket.on(`overlay.template_update:${template.id}`, (updatedTemplate: OverlayTemplate) => {
            setLayers(updatedTemplate.config.layers);
        });

        return () => {
            socket.off('overlay.update_data');
            socket.off(`overlay.template_update:${template.id}`);
        };
    }, [socket, template.id]);

    const renderContent = (layer: OverlayLayer) => {
        let content = layer.content;

        // Apply bindings if present
        if (layer.binding) {
            const boundValue = dynamicData[layer.binding.field];
            if (boundValue !== undefined) {
                content = `${layer.binding.prefix || ''}${boundValue}${layer.binding.suffix || ''}`;
            }
        }

        if (layer.type === 'text') {
            return <div className="w-full h-full flex items-center">{content}</div>;
        }

        if (layer.type === 'image') {
            return <img src={content} className="w-full h-full object-contain" alt={layer.name} />;
        }

        return null;
    };

    return (
        <div
            className="relative overflow-hidden w-full h-full bg-transparent"
            style={{
                width: template.config.width,
                height: template.config.height,
            }}
        >
            {layers.sort((a, b) => a.zIndex - b.zIndex).map(layer => (
                <div
                    key={layer.id}
                    className="absolute"
                    style={{
                        left: layer.x,
                        top: layer.y,
                        width: layer.width,
                        height: layer.height,
                        opacity: layer.opacity,
                        backgroundColor: layer.type === 'shape' ? layer.content : 'transparent',
                        ...layer.style
                    }}
                >
                    {renderContent(layer)}
                </div>
            ))}
        </div>
    );
};
