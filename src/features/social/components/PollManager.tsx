'use client';

import React, { useState } from 'react';
import { BarChart3, Plus, X, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSocial, PollOption } from '../hooks/useSocial';

interface PollManagerProps {
    productionId: string;
}

export const PollManager = ({ productionId }: PollManagerProps) => {
    const { activePoll, createPoll, votePoll, closePoll } = useSocial(productionId);
    const [isCreating, setIsCreating] = useState(false);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const handleCreatePoll = async () => {
        if (!question || options.some(opt => !opt)) return;

        try {
            await createPoll({ question, options });
            setIsCreating(false);
            setQuestion('');
            setOptions(['', '']);
        } catch (err) {
            console.error('Error creating poll', err);
        }
    };

    const handleClosePoll = async () => {
        if (!activePoll) return;
        try {
            await closePoll(activePoll.id);
        } catch (err) {
            console.error('Error closing poll', err);
        }
    };

    const handleVote = async (optionId: string) => {
        if (!activePoll) return;
        try {
            await votePoll({ pollId: activePoll.id, optionId });
        } catch (err) {
            console.error('Error voting', err);
        }
    };

    const totalVotes = activePoll?.options.reduce((sum: number, opt: PollOption) => sum + opt.votes, 0) || 0;

    return (
        <div className="flex flex-col h-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/50">
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-emerald-400" />
                    <h2 className="text-sm font-bold text-white uppercase ">Live Polls</h2>
                </div>
                {!isCreating && !activePoll && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-all"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {isCreating ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase mb-1.5 block">Question</label>
                            <input
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                placeholder="What's your favorite platform?"
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-500 uppercase mb-1.5 block">Options</label>
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        value={opt}
                                        onChange={e => {
                                            const newOps = [...options];
                                            newOps[idx] = e.target.value;
                                            setOptions(newOps);
                                        }}
                                        placeholder={`Option ${idx + 1}`}
                                        className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                                    />
                                    {options.length > 2 && (
                                        <button
                                            onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                                            className="p-2 text-stone-600 hover:text-red-400"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {options.length < 5 && (
                                <button
                                    onClick={() => setOptions([...options, ''])}
                                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-2"
                                >
                                    <Plus size={12} /> ADD OPTION
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-700 transition-all"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleCreatePoll}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                START POLL
                            </button>
                        </div>
                    </div>
                ) : activePoll ? (
                    <div className="space-y-6">
                        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
                            <h3 className="text-base font-bold text-white mb-4 leading-tight">{activePoll.question}</h3>
                            <div className="space-y-3">
                                {activePoll.options.map((opt: PollOption) => {
                                    const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                                    return (
                                        <div key={opt.id} className="relative group overflow-hidden">
                                            <div className="flex items-center justify-between mb-1.5 px-1">
                                                <span className="text-xs font-medium text-stone-300">{opt.text}</span>
                                                <span className="text-xs font-bold text-emerald-400">{opt.votes} votes ({Math.round(percentage)}%)</span>
                                            </div>
                                            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    className="h-full bg-emerald-500 rounded-full"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleVote(opt.id)}
                                                className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-stone-600 uppercase ">{totalVotes} Total Votes</span>
                                <button
                                    onClick={handleClosePoll}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Square size={12} fill="currentColor" /> END POLL
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-40">
                        <div className="p-4 bg-stone-800/50 rounded-full">
                            <BarChart3 size={24} className="text-stone-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase  text-stone-600">
                            No Active Polls
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="mt-2 text-[10px] font-bold text-emerald-500 hover:underline"
                        >
                            CREATE ONE NOW
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
