import React from 'react';

export function FloatingReaction({ emoji, id, senderName }: { emoji: string; id: number; senderName?: string }) {
    const startPos = 10 + (id % 80); // Randomish horizontal start between 10% and 90%
    const animType = id % 3; // Randomish curve type
    return (
        <div
            key={id}
            className="fixed pointer-events-none z-[9999] flex flex-col items-center"
            style={{
                left: `${startPos}%`,
                bottom: '100px', // Start right above the control bar
                animation: `floatUp-${animType} 3.5s cubic-bezier(0.25, 1, 0.5, 1) forwards`
            }}
        >
            <style>{`
                @keyframes floatUp-0 { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 10% { transform: translateY(-20px) scale(1.2); opacity: 1; } 100% { transform: translateY(-60vh) translateX(-40px) scale(1); opacity: 0; } }
                @keyframes floatUp-1 { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 10% { transform: translateY(-20px) scale(1.2); opacity: 1; } 100% { transform: translateY(-60vh) translateX(40px) scale(1); opacity: 0; } }
                @keyframes floatUp-2 { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 10% { transform: translateY(-20px) scale(1.2); opacity: 1; } 100% { transform: translateY(-60vh) scale(1); opacity: 0; } }
            `}</style>
            <div className="text-[40px] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{emoji}</div>
            {senderName && <span className="text-[10px] font-black tracking-wider text-white bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full mt-2 shadow-2xl">{senderName}</span>}
        </div>
    );
}
