'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface MidiMessage {
    command: number;
    note: number;
    velocity: number;
}

interface MIDIInput {
    id: string;
    name: string;
    onmidimessage: ((event: { data: Uint8Array }) => void) | null;
}

interface MIDIAccess {
    inputs: {
        values: () => IterableIterator<MIDIInput>;
    };
    onstatechange: ((event: { port: any }) => void) | null;
}

export const useMidi = (onMidiMessage: (msg: MidiMessage) => void) => {
    const [access, setAccess] = useState<MIDIAccess | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [inputs, setInputs] = useState<MIDIInput[]>([]);

    const onMidiMessageRef = useRef(onMidiMessage);
    onMidiMessageRef.current = onMidiMessage;

    useEffect(() => {
        setIsSupported('requestMIDIAccess' in navigator);
    }, []);

    const handleMidiMessage = useCallback((event: { data: Uint8Array }) => {
        const [command, note, velocity] = Array.from(event.data);

        // Command 144: Note On
        // Command 128: Note Off
        // Command 176: Control Change (CC)
        onMidiMessageRef.current({ command, note, velocity });
    }, []);

    const initMidi = useCallback(async () => {
        if (!isSupported) return;

        try {
            const midiAccess = await (navigator as any).requestMIDIAccess() as MIDIAccess;
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
