import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

export function ChatPanel({
  onClose,
  messages,
  onSend,
}: {
  onClose: () => void;
  messages: any[];
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };
  return (
    <div className="flex flex-col w-[300px] shrink-0 bg-[#0a0b14] border-l border-indigo-500/10">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-indigo-500/10 bg-[#0d0e1c] shrink-0">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        <span className="text-indigo-300/70 text-[10px] font-black uppercase tracking-[0.15em]">
          Chat
        </span>
        <button
          onClick={onClose}
          className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <X size={11} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/15 text-xs text-center leading-relaxed">
              El chat está vacío.
              <br />
              Di hola 👋
            </p>
          </div>
        )}
        {messages.map((msg: any) => {
          const isOwn = msg.from?.isLocal ?? false;
          return (
            <div
              key={msg.id ?? msg.timestamp}
              className={`flex flex-col max-w-[85%] gap-0.5 ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {!isOwn && (
                <span className="text-indigo-300/60 text-[9px] font-black uppercase tracking-widest px-1">
                  {msg.from?.name || msg.from?.identity}
                </span>
              )}
              <div
                className={`px-3 py-2 ${isOwn ? 'bg-indigo-600/85 rounded-2xl rounded-tr-sm' : 'bg-white/7 border border-white/8 rounded-2xl rounded-tl-sm'}`}
              >
                <p className="text-white/88 text-[13px] leading-snug wrap-break-word">
                  {msg.message}
                </p>
                <time className="text-white/25 text-[9px] block text-right mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="px-3 py-3 border-t border-indigo-500/10 bg-[#0d0e1c] flex gap-2 items-end shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-white/5 border border-indigo-500/15 rounded-[20px] px-4 py-2.5 text-[13px] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-indigo-500/6 transition-colors"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 min-w-[40px] rounded-full bg-linear-to-br from-indigo-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 disabled:opacity-40 transition-opacity"
        >
          <Send size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
}
