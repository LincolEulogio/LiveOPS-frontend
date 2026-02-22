'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Elgato Vendor ID
const VENDOR_ID = 0x0fd9;

// Stream Deck Product IDs
const PRODUCTS = {
    ORIGINAL: 0x0060,
    MINI: 0x0063,
    XL: 0x006c,
    MK2: 0x0080,
    PLUS: 0x0084,
};

export const useStreamDeck = (onKeyPress: (keyIndex: number) => void) => {
    const [device, setDevice] = useState<HIDDevice | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const onKeyPressRef = useRef(onKeyPress);
    onKeyPressRef.current = onKeyPress;

    useEffect(() => {
        setIsSupported('hid' in navigator);
    }, []);

    const handleInputReport = useCallback((event: HIDInputReportEvent) => {
        const { data } = event;
        // Elgato Stream Deck protocol:
        // First byte is usually 0x01 for key state
        if (data.getUint8(0) === 0x01) {
            // Find which key was pressed
            // The report layout depends on the model, but usually:
            // Byte 1 index is the start of key states (1 or 0 for each key)
            // This is a simplified version for common models
            for (let i = 1; i < data.byteLength; i++) {
                if (data.getUint8(i) === 0x01) {
                    onKeyPressRef.current(i - 1);
                }
            }
        }
    }, []);

    const connect = async () => {
        if (!isSupported) {
            toast.error('WebHID is not supported in this browser');
            return;
        }

        try {
            const devices = await navigator.hid.requestDevice({
                filters: [{ vendorId: VENDOR_ID }]
            });

            if (devices.length > 0) {
                const selectedDevice = devices[0];
                await selectedDevice.open();

                selectedDevice.addEventListener('inputreport', handleInputReport);
                setDevice(selectedDevice);
                toast.success(`Connected to ${selectedDevice.productName}`);
            }
        } catch (err) {
            console.error('Failed to connect to Stream Deck:', err);
            toast.error('Could not connect to Stream Deck');
        }
    };

    const disconnect = useCallback(async () => {
        if (device) {
            device.removeEventListener('inputreport', handleInputReport);
            await device.close();
            setDevice(null);
        }
    }, [device, handleInputReport]);

    useEffect(() => {
        return () => {
            if (device) device.close();
        };
    }, [device]);

    return {
        isSupported,
        isConnected: !!device,
        deviceName: device?.productName || null,
        connect,
        disconnect
    };
};
