import { useEffect, useState, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { useSocket } from '@/shared/socket/socket.provider';

export const useScript = (productionId: string) => {
    const { socket, isConnected } = useSocket();
    const [doc] = useState(() => new Y.Doc());
    const [awareness] = useState(() => new awarenessProtocol.Awareness(doc));
    const [isLoaded, setIsLoaded] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            setLastSyncTime(new Date());
        };

        // 3. Handle updates from other clients
        const handleUpdateReceived = (data: { update: Uint8Array }) => {
            Y.applyUpdate(doc, new Uint8Array(data.update), socket);
        };

        // 4. Handle awareness updates (cursors/selections) from others
        const handleAwarenessReceived = (data: { update: number[] }) => {
            awarenessProtocol.applyAwarenessUpdate(awareness, new Uint8Array(data.update), socket);
        };

        // 6. Handle scroll synchronization from director
        const handleScrollReceived = (data: { scrollPercentage: number }) => {
            const event = new CustomEvent('script.scroll_remote', { detail: data });
            window.dispatchEvent(event);
        };

        socket.on('script.sync_response', handleSyncResponse);
        socket.on('script.update_received', handleUpdateReceived);
        socket.on('script.awareness_received', handleAwarenessReceived);
        socket.on('script.scroll_received', handleScrollReceived);

        // 7. Propagate local doc updates to server
        const onUpdate = (update: Uint8Array, origin: unknown) => {
            if (origin !== socket) {
                setIsSyncing(true);
                socket.emit('script.update', {
                    productionId,
                    update: Array.from(update),
                });

                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = setTimeout(() => {
                    setIsSyncing(false);
                    setLastSyncTime(new Date());
                }, 1000);
            }
        };

        // 8. Propagate local awareness updates to server
        const onAwarenessUpdate = ({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }) => {
            const changedClients = added.concat(updated).concat(removed);
            const update = awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients);
            socket.emit('script.awareness_update', {
                productionId,
                update: Array.from(update),
            });
        };

        doc.on('update', onUpdate);
        awareness.on('update', onAwarenessUpdate);

        return () => {
            socket.off('script.sync_response', handleSyncResponse);
            socket.off('script.update_received', handleUpdateReceived);
            socket.off('script.awareness_received', handleAwarenessReceived);
            socket.off('script.scroll_received', handleScrollReceived);
            doc.off('update', onUpdate);
            awareness.off('update', onAwarenessUpdate);
        };
    }, [socket, isConnected, productionId, doc, awareness]);

    const syncScroll = useCallback((scrollPercentage: number) => {
        if (!socket || !isConnected || !productionId) return;
        socket.emit('script.scroll_sync', { productionId, scrollPercentage });
    }, [socket, isConnected, productionId]);

    return {
        doc,
        awareness,
        isLoaded,
        isSyncing,
        lastSyncTime,
        syncScroll,
    };
};
