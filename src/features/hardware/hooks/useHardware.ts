'use client';

import { useState, useEffect, useCallback } from 'react';

// Stream Deck Vendor ID for filtering
const ELGATO_VID = 0x0fd9;

interface WebHIDDevice {
    productId: number;
    productName?: string;
    opened: boolean;
    open: () => Promise<void>;
    addEventListener: (type: string, listener: (event: any) => void) => void;
}

interface NavigatorWithHID {
    hid: {
        getDevices: () => Promise<WebHIDDevice[]>;
        requestDevice: (options: { filters: { vendorId?: number }[] }) => Promise<WebHIDDevice[]>;
        addEventListener: (type: string, listener: (event: any) => void) => void;
    };
}

export interface HardwareDevice {
    id: string;
    type: 'hid' | 'midi';
    name: string;
    connected: boolean;
    rawDevice?: any; // Native browser types are hard to unifiy here
}

export interface HardwareEvent {
    deviceId: string;
    type: 'hid' | 'midi';
    key: string;
    state: 'pressed' | 'released' | 'value';
    value?: number;
}

export const useHardware = () => {
    const [devices, setDevices] = useState<HardwareDevice[]>([]);
    const [lastEvent, setLastEvent] = useState<HardwareEvent | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- MIDI SUPPORT ---
    const initMIDI = useCallback(async () => {
        if (!('requestMIDIAccess' in navigator)) {
            console.warn('WebMIDI not supported in this browser.');
            return;
        }

        try {
            const midiAccess = await navigator.requestMIDIAccess();

            const updateMIDIDevices = () => {
                const inputs: HardwareDevice[] = [];
                midiAccess.inputs.forEach((input) => {
                    inputs.push({
                        id: input.id,
                        type: 'midi',
                        name: input.name || 'Unknown MIDI Device',
                        connected: input.state === 'connected',
                        rawDevice: input,
                    });

                    // Set up listener
                    input.onmidimessage = (message: any) => {
                        const [command, note, velocity] = message.data;
                        // Command 144 is Note On, 128 is Note Off on channel 1
                        const isNoteOn = (command & 0xf0) === 0x90;
                        const isNoteOff = (command & 0xf0) === 0x80;
                        const isControlChange = (command & 0xf0) === 0xb0;

                        if (isNoteOn && velocity > 0) {
                            setLastEvent({ deviceId: input.id, type: 'midi', key: `Note ${note}`, state: 'pressed', value: velocity });
                        } else if (isNoteOff || (isNoteOn && velocity === 0)) {
                            setLastEvent({ deviceId: input.id, type: 'midi', key: `Note ${note}`, state: 'released' });
                        } else if (isControlChange) {
                            setLastEvent({ deviceId: input.id, type: 'midi', key: `CC ${note}`, state: 'value', value: velocity });
                        }
                    };
                });

                setDevices(prev => {
                    const nonMidi = prev.filter(d => d.type !== 'midi');
                    return [...nonMidi, ...inputs];
                });
            };

            updateMIDIDevices();
            midiAccess.onstatechange = updateMIDIDevices;
        } catch (err) {
            console.error('MIDI Access denied or failed', err);
            setError('Could not access MIDI devices.');
        }
    }, []);

    // --- HID SUPPORT (Stream Deck) ---
    const initHID = useCallback(async () => {
        if (!('hid' in navigator)) {
            console.warn('WebHID not supported in this browser.');
            return;
        }

        try {
            const hidDevices = await (navigator as unknown as NavigatorWithHID).hid.getDevices();

            const setupHIDDevice = (device: WebHIDDevice) => {
                if (!device.opened) {
                    device.open().then(() => {
                        console.log(`Opened HID device: ${device.productName}`);
                        device.addEventListener('inputreport', (event: { data: DataView }) => {
                            const { data } = event;
                            // Basic parsing for Stream Deck (varies by model, this is a generic placeholder)
                            // Usually the first few bytes indicate button state
                            const bytes = new Uint8Array(data.buffer);
                            // Simple heuristic: just stringify the first few non-zero bytes representing the button press
                            // In a real app we'd use a vendor-specific protocol parser like `@elgato-stream-deck/webhid`

                            // For proof of concept, let's just log it and emit a rough event
                            const pressedIndices = [];
                            for (let i = 0; i < bytes.length; i++) {
                                // Assume 1 means pressed for some generic pads. StreamDeck protocol is more complex.
                                if (bytes[i] === 1) pressedIndices.push(i);
                            }

                            if (pressedIndices.length > 0) {
                                setLastEvent({
                                    deviceId: device.productId.toString(),
                                    type: 'hid',
                                    key: `Btn ${pressedIndices.join(',')}`,
                                    state: 'pressed'
                                });
                            }
                        });
                    }).catch((e: Error) => console.error('Failed to open HID device', e));
                }
            };

            const updateHIDDevices = (devs: WebHIDDevice[]) => {
                const mapped: HardwareDevice[] = devs.map(d => ({
                    id: d.productId.toString(),
                    type: 'hid',
                    name: d.productName || 'Unknown HID',
                    connected: true,
                    rawDevice: d,
                }));

                devs.forEach(setupHIDDevice);

                setDevices(prev => {
                    const nonHid = prev.filter(d => d.type !== 'hid');
                    return [...nonHid, ...mapped];
                });
            };

            updateHIDDevices(hidDevices);

            const nav = (navigator as unknown as NavigatorWithHID);
            nav.hid.addEventListener('connect', () => {
                nav.hid.getDevices().then((d) => updateHIDDevices(d));
            });

            nav.hid.addEventListener('disconnect', () => {
                nav.hid.getDevices().then((d) => updateHIDDevices(d));
            });

        } catch (err) {
            console.error('HID Access denied or failed', err);
        }
    }, []);

    // Initial setup for permitted devices
    useEffect(() => {
        initMIDI();
        initHID();
    }, [initMIDI, initHID]);

    // Request new HID device
    const requestHIDDevice = async () => {
        if (!('hid' in navigator)) {
            setError('WebHID is not supported in this browser (requires Chrome/Edge).');
            return;
        }
        try {
            await (navigator as unknown as NavigatorWithHID).hid.requestDevice({ filters: [] }); // Or filter by ELGATO_VID
            // Re-run init to pick up the new device
            initHID();
        } catch (err) {
            console.error('User cancelled or error', err);
        }
    };

    return {
        devices,
        lastEvent,
        error,
        requestHIDDevice,
        clearLastEvent: () => setLastEvent(null)
    };
};
