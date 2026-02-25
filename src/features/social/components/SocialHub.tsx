'use client';

import React from 'react';
import { SocialManager } from './SocialManager';
import { PollManager } from './PollManager';

interface SocialHubProps {
    productionId: string;
}

export const SocialHub = ({ productionId }: SocialHubProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-4 lg:p-6 bg-background">
            {/* Left Column: Moderation */}
            <div className="flex flex-col h-[calc(100vh-200px)] lg:h-full min-h-[500px]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-foreground ">AUDIENCE MODERATION</h1>
                        <p className="text-[10px] font-bold text-muted uppercase ">Live Comment Feed & Control</p>
                    </div>
                </div>
                <SocialManager productionId={productionId} />
            </div>

            {/* Right Column: Polls */}
            <div className="flex flex-col h-[calc(100vh-200px)] lg:h-full min-h-[500px]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-foreground ">ENGAGEMENT TOOLS</h1>
                        <p className="text-[10px] font-bold text-muted uppercase ">Real-time Polls & Results</p>
                    </div>
                </div>
                <PollManager productionId={productionId} />
            </div>
        </div>
    );
};
