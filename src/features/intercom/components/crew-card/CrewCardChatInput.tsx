import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { IntercomTemplate } from '@/features/intercom/types/intercom.types';

interface CrewCardChatInputProps {
    memberUserId: string;
    memberUserName: string;
    isOnline: boolean;
    onSendCommand: (template: IntercomTemplate) => void;
}

export const CrewCardChatInput: React.FC<CrewCardChatInputProps> = ({
    memberUserId,
    memberUserName,
    isOnline,
    onSendCommand
}) => {
    const [chatMsg, setChatMsg] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatMsg.trim()) {
            onSendCommand({
                name: `Mensaje: ${chatMsg.trim()}`,
                id: 'chat',
                color: '#6366f1',
                isChat: true,
                targetUserId: memberUserId
            });
            setChatMsg('');
        }
    };

    return (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 mt-auto">
            <form
                onSubmit={handleSubmit}
                className="group/form relative flex items-center bg-background border border-card-border rounded-2xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all "
            >
                <input
                    type="text"
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    placeholder={`SND MSG TO ${memberUserName.split(' ')[0].toUpperCase()}...`}
                    className="flex-1 bg-transparent px-6 py-4 text-[10px] font-black text-foreground uppercase placeholder:text-muted/40 focus:outline-none "
                />
                <button
                    type="submit"
                    disabled={!chatMsg.trim() || !isOnline}
                    className="mr-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl  transition-all active:scale-90 disabled:opacity-20 disabled:scale-100"
                >
                    <Send size={16} className="group-hover/form:translate-x-0.5 group-hover/form:-translate-y-0.5 transition-transform" />
                </button>
            </form>
        </div>
    );
};
