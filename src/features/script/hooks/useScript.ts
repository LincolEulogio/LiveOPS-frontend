import { useEffect, useState, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { useSocket } from '@/shared/socket/socket.provider';

export const useScript = (productionId: string) => {
    const { socket, isConnected } = useSocket();
    const [doc] = useState(() => new Y.Doc());
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!socket || !isConnected || !productionId) return;

        // 1. Request initial sync
        socket.emit('script.sync', { productionId });

        // 2. Handle initial sync response
        const handleSyncResponse = (data: { content: Uint8Array }) => {
            if (data.content) {
                Y.applyUpdate(doc, new Uint8Array(data.content));
            }
            setIsLoaded(true);
        };

        // 3. Handle updates from other clients
        const handleUpdateReceived = (data: { update: Uint8Array }) => {
            Y.applyUpdate(doc, new Uint8Array(data.update));
        };

        socket.on('script.sync_response', handleSyncResponse);
        socket.on('script.update_received', handleUpdateReceived);

        // 4. Propagate local updates to server
        const onUpdate = (update: Uint8Array, origin: any) => {
            if (origin !== socket) {
                socket.emit('script.update', {
                    productionId,
                    update: Array.from(update), // Send as array for JSON serializability
                });
            }
        };

        doc.on('update', onUpdate);

        return () => {
            socket.off('script.sync_response', handleSyncResponse);
            socket.off('script.update_received', handleUpdateReceived);
            doc.off('update', onUpdate);
        };
    }, [socket, isConnected, productionId, doc]);

    return {
        doc,
        isLoaded,
    };
};
