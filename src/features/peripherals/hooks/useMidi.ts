'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface MidiMessage {
    command: number;
    note: number;
    velocity: number;
}

// Using local interfaces with unique names to avoid collisions with global WebMIDI types
interface LocalMIDIInput {
    id: string;
    name: string | null;
    onmidimessage: ((event: { data: Uint8Array }) => void) | null;
}

interface LocalMIDIAccess {
    inputs: {
        values: () => IterableIterator<LocalMIDIInput>;
    };
    onstatechange: ((event: { port: unknown }) => void) | null;
}

export const useMidi = (onMidiMessage: (msg: MidiMessage) => void) => {
    const [access, setAccess] = useState<LocalMIDIAccess | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [inputs, setInputs] = useState<LocalMIDIInput[]>([]);

    const onMidiMessageRef = useRef(onMidiMessage);
    onMidiMessageRef.current = onMidiMessage;

    useEffect(() => {
        setIsSupported('requestMIDIAccess' in navigator);
    }, []);

    const handleMidiMessage = useCallback((event: { data: Uint8Array }) => {
        const [command, note, velocity] = Array.from(event.data);
        onMidiMessageRef.current({ command, note, velocity });
    }, []);

    const initMidi = useCallback(async () => {
        if (!isSupported) return;

        try {
            // Use unknown to safely bridge to the internal interface without collision
            const midiAccess = await (navigator as any).requestMIDIAccess() as LocalMIDIAccess;
            setAccess(midiAccess);

            const midiInputs = Array.from(midiAccess.inputs.values());
            setInputs(midiInputs);

            midiInputs.forEach((input) => {
                input.onmidimessage = handleMidiMessage;
            });

            midiAccess.onstatechange = () => {
                setInputs(Array.from(midiAccess.inputs.values()));
            };

        } catch (err) {
            console.error('Failed to access MIDI:', err);
        }
    }, [isSupported, handleMidiMessage]);

    useEffect(() => {
        initMidi();
    }, [initMidi]);

    return {
        isSupported,
        inputs,
        isConnected: inputs.length > 0
    };
};
