'use client';

import { useSocial, SocialMessage } from '../hooks/useSocial';
import { SocialMessageCard } from './SocialMessageCard';
import { apiClient } from '@/shared/api/api.client';
import { MessageSquare, ShieldCheck, Tv } from 'lucide-react';

interface Props {
    productionId: string;
}

export const SocialDashboard = ({ productionId }: Props) => {
    const { pendingMessages, approvedMessages, onAirMessage, updateStatus } = useSocial(productionId);

    // Simulate incoming message for testing purposes if UI is empty
    const handleSimulate = async () => {
        const platforms = ['twitch', 'youtube'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const users = ['Ninja', 'Auronplay', 'Ibai', 'Rubius', 'RandomFan99'];
        const msgs = ['¡Increíble directo!', 'Saludos desde México 🇲🇽', 'Esto es spam', '¿A qué hora empieza el show?', 'Jajajaja buenísimo'];

        apiClient.post(`/productions/${productionId}/social/messages`, {
            platform,
            author: users[Math.floor(Math.random() * users.length)],
            content: msgs[Math.floor(Math.random() * msgs.length)]
        });
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-card-bg border border-card-border p-6 rounded-3xl shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <MessageSquare className="text-pink-500" />
                        Social & Moderation
                    </h1>
                    <p className="text-muted text-sm mt-1">Aggregate and moderate live chat from Twitch and YouTube.</p>
                </div>
                <button
                    onClick={handleSimulate}
                    className="text-xs font-bold bg-card-bg hover:bg-card-border text-foreground px-4 py-2 rounded-xl border border-card-border transition-all"
                >
                    Simulate Message
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* Inbox Column */}
                <div className="bg-card-bg border border-card-border rounded-3xl p-6 shadow-xl flex flex-col min-h-0">
                    <h2 className="text-sm font-bold text-foreground uppercase  flex items-center gap-2 mb-4 shrink-0">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        Inbox / Moderation ({pendingMessages.length})
                    </h2>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
                        {pendingMessages.length === 0 ? (
                            <div className="h-32 flex items-center justify-center border-2 border-card-border border-dashed rounded-xl">
                                <span className="text-muted text-sm font-medium">No pending messages</span>
                            </div>
                        ) : (
                            pendingMessages.map((msg: SocialMessage) => (
                                <SocialMessageCard
                                    key={msg.id}
                                    message={msg}
                                    onApprove={(id) => updateStatus({ id, status: 'APPROVED' })}
                                    onReject={(id) => updateStatus({ id, status: 'REJECTED' })}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Approved Queue */}
                <div className="bg-card-bg border border-card-border rounded-3xl p-6 shadow-xl flex flex-col min-h-0">
                    <h2 className="text-sm font-bold text-foreground uppercase  flex items-center gap-2 mb-4 shrink-0">
                        <CheckBadgeIcon className="text-blue-400" />
                        Approved Queue ({approvedMessages.length})
                    </h2>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
                        {approvedMessages.length === 0 ? (
                            <div className="h-32 flex items-center justify-center border-2 border-card-border border-dashed rounded-xl">
                                <span className="text-muted text-sm font-medium">No approved messages</span>
                            </div>
                        ) : (
                            approvedMessages.map((msg: SocialMessage) => (
                                <SocialMessageCard
                                    key={msg.id}
                                    message={msg}
                                    onSendToAir={(id) => updateStatus({ id, status: 'ON_AIR' })}
                                    onReject={(id) => updateStatus({ id, status: 'REJECTED' })}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* On-Air View */}
                <div className="bg-card-bg border border-card-border rounded-3xl p-6 shadow-xl flex flex-col">
                    <h2 className="text-sm font-bold text-foreground uppercase  flex items-center gap-2 mb-4 shrink-0">
                        <Tv size={16} className="text-indigo-400" />
                        Currently On-Air
                    </h2>

                    <div className="flex-1 flex flex-col">
                        {onAirMessage ? (
                            <div className="space-y-4">
                                <div className="p-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20">
                                    <SocialMessageCard
                                        message={onAirMessage}
                                        className="bg-background border-0"
                                    />
                                </div>

                                <button
                                    onClick={() => updateStatus({ id: onAirMessage.id, status: 'APPROVED' })}
                                    className="w-full py-3 bg-background hover:bg-card-border border border-card-border text-foreground font-bold text-sm rounded-xl transition-colors"
                                >
                                    Remove from Screen
                                </button>

                                <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <p className="text-xs text-indigo-300 text-center leading-relaxed">
                                        This message is currently being output to the <strong className="text-foreground">graphics.social.show</strong> event. vMix or OBS overlays listening for this event will display it.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                                <Tv size={48} className="text-muted/50 mb-4" />
                                <p className="text-muted text-sm">No message currently on screen.</p>
                                <p className="text-muted text-xs mt-1">Send an approved message to air.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper icon
const CheckBadgeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} width="16" height="16">
        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 11.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);
