'use client';

import { useChat } from '@/features/chat/hooks/useChat';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSocket } from '@/shared/socket/socket.provider';

// New Sub-components
import { ChatHeader } from '@/features/chat/components/chat-panel/ChatHeader';
import { ChatMessageList } from '@/features/chat/components/chat-panel/ChatMessageList';
import { ChatInput } from '@/features/chat/components/chat-panel/ChatInput';

interface Props {
    productionId: string;
}

export const ChatPanel = ({ productionId }: Props) => {
    const { socket } = useSocket();
    const {
        chatHistory,
        sendChatMessage,
        isConnected,
        isLoading,
        unreadCount,
        resetUnread,
        typingUsers,
        setTyping,
        members
    } = useChat(productionId);

    const currentUser = useAuthStore((state) => state.user);
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<{ type: 'user' | 'command', id: string, name: string }[] | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset unread when opened
    useEffect(() => {
        if (isOpen && unreadCount > 0) {
            resetUnread();
        }
    }, [isOpen, unreadCount, resetUnread]);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setMessage(val);

        if (!socket || !isConnected) return;

        // --- Suggestions Logic ---
        const lastWord = val.split(' ').pop() || '';

        if (lastWord.startsWith('@')) {
            const query = lastWord.slice(1).toLowerCase();
            const matchingUsers = members
                .filter(m => m.userId !== currentUser?.id && m.userName.toLowerCase().includes(query))
                .map(m => ({ type: 'user' as const, id: m.userId, name: m.userName }));
            setSuggestions(matchingUsers.length > 0 ? matchingUsers : null);
            setSelectedIndex(0);
        } else if (lastWord.startsWith('/')) {
            const query = lastWord.slice(1).toLowerCase();
            const commands = [
                { type: 'command' as const, id: 'alert', name: '/alert <mensaje>' },
                { type: 'command' as const, id: 'clear', name: '/clear' },
            ].filter(c => c.id.includes(query));
            setSuggestions(commands.length > 0 ? commands : null);
            setSelectedIndex(0);
        } else {
            setSuggestions(null);
        }

        // --- Typing Indicator ---
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 2000);
    };

    const applySuggestion = (suggestion: { type: 'user' | 'command', id: string, name: string }) => {
        const words = message.split(' ');
        words.pop();
        const replacement = suggestion.type === 'user' ? `@${suggestion.name} ` : `${suggestion.name.split(' ')[0]} `;
        setMessage(words.join(' ') + (words.length > 0 ? ' ' : '') + replacement);
        setSuggestions(null);
    };

    const handleSend = () => {
        if (!message.trim()) return;
        sendChatMessage(message.trim());
        setMessage('');
        setTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                applySuggestion(suggestions[selectedIndex]);
            } else if (e.key === 'Escape') {
                setSuggestions(null);
            }
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message === '/clear') {
                setMessage('');
                return;
            }
            handleSend();
        }
    };

    return (
        <div className={cn(
            "fixed right-0 top-0 h-screen transition-all duration-500 ease-in-out z-40 flex",
            isOpen ? "w-80" : "w-0"
        )}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "absolute left-[-32px] top-1/2 -translate-y-1/2 w-8 h-16 bg-card-bg border-l border-y border-card-border rounded-l-xl flex items-center justify-center text-muted hover:text-foreground transition-colors group ",
                    !isOpen && "left-[-40px] opacity-100"
                )}
            >
                {isOpen ? <ChevronRight size={16} className="group-hover:scale-125 transition-transform" /> : <ChevronLeft size={16} className="group-hover:scale-125 transition-transform" />}

                {/* Unread Badge */}
                {!isOpen && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                        <span className="text-[9px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </div>
                )}
            </button>

            <div className="flex-1 bg-background/90 backdrop-blur-2xl border-l border-card-border flex flex-col ">
                <ChatHeader isConnected={isConnected} />

                <ChatMessageList
                    chatHistory={chatHistory}
                    isLoading={isLoading}
                    currentUser={currentUser}
                    scrollRef={scrollRef}
                />

                <ChatInput
                    message={message}
                    handleMessageChange={handleMessageChange}
                    handleKeyDown={handleKeyDown}
                    handleSend={handleSend}
                    typingUsers={typingUsers}
                    suggestions={suggestions}
                    selectedIndex={selectedIndex}
                    applySuggestion={applySuggestion}
                />
            </div>
        </div>
    );
};
