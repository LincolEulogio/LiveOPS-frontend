'use client';

import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import { cn } from '@/shared/utils/cn';
import { useEffect, useState, useMemo } from 'react';
import { Clock, ArrowRight, Play, AlertTriangle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Props {
  productionId: string;
}

export const TalentView = ({ productionId }: Props) => {
  const { blocks, isLoading } = useTimeline(productionId);

  const activeBlock = useMemo(() => blocks.find((b) => b.status === 'ACTIVE'), [blocks]);
  const nextBlock = useMemo(() => {
    if (!activeBlock) return blocks.find((b) => b.status === 'PENDING');
    const activeIdx = blocks.findIndex((b) => b.id === activeBlock.id);
    return blocks.slice(activeIdx + 1).find((b) => b.status === 'PENDING' || b.status === 'ACTIVE');
  }, [blocks, activeBlock]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-4xl font-black animate-pulse uppercase ">
          Cargando Teleprompter...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-white selection:bg-neon-green overflow-hidden flex flex-col p-8 md:p-12 lg:p-16 relative">
      {/* Back Button */}
      <Link
        href={`/productions/${productionId}`}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 bg-card-bg border border-card-border rounded-xl text-muted hover:text-foreground hover:bg-card-border transition-all font-bold uppercase  text-xs z-50"
      >
        <ChevronLeft size={16} /> Volver
      </Link>

      <AnimatePresence mode="wait">
        {activeBlock ? (
          <motion.div
            key={activeBlock.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col justify-between"
          >
            {/* Header: Next Up Hint */}
            <div className="flex items-center justify-between border-b-2 border-white/10 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 bg-emerald-500 text-black font-black text-xl uppercase  rounded-lg">
                  AL AIRE
                </div>
                <h2 className="text-2xl font-bold text-muted uppercase ">Bloque Actual</h2>
              </div>
              <div className="text-right">
                <p className="text-muted text-sm font-bold uppercase  mb-1">Hora Local</p>
                <DigitalClock />
              </div>
            </div>

            {/* Center: Massive Title & Timer */}
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black leading-tight er uppercase wrap-break-word w-full px-4">
                {activeBlock.title}
              </h1>

              <div className="mt-12 scale-150 md:scale-[2.5]">
                <BigTimer
                  startTime={activeBlock.startTime ?? null}
                  durationMs={activeBlock.durationMs ?? 0}
                />
              </div>
            </div>

            {/* Footer: Next Block */}
            {nextBlock && (
              <div className="mt-12 bg-white/5 border-2 border-white/10 rounded-[3rem] p-10 flex items-center justify-between group">
                <div>
                  <p className="text-emerald-400 text-xl font-black uppercase  mb-3 flex items-center gap-3">
                    <ArrowRight size={24} /> SIGUIENTE
                  </p>
                  <h3 className="text-5xl md:text-6xl font-black uppercase ">{nextBlock.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-muted text-lg font-bold uppercase  mb-1">Duración</p>
                  <p className="text-4xl font-black">
                    {((nextBlock.durationMs ?? 0) / 60000).toFixed(0)} MIN
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
          >
            <AlertTriangle className="text-amber-400 w-48 h-48 animate-pulse" />
            <h1 className="text-8xl font-black uppercase er">Standby</h1>
            <p className="text-4xl text-muted font-bold uppercase ">
              Esperando inicio de producción
            </p>

            {nextBlock && (
              <div className="bg-white/5 border-2 border-white/10 rounded-[3rem] p-12 w-full max-w-7xl">
                <p className="text-indigo-400 text-2xl font-black uppercase  mb-4">PRIMER BLOQUE</p>
                <h2 className="text-6xl font-black uppercase">{nextBlock.title}</h2>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-4xl font-black  tabular-nums">
      {time.toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}
    </span>
  );
};

const BigTimer = ({ startTime, durationMs }: { startTime: string | null; durationMs: number }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();
    const update = () => {
      const now = new Date().getTime();
      setElapsed(now - start);
    };
    const t = setInterval(update, 1000);
    update();
    return () => clearInterval(t);
  }, [startTime]);

  const remaining = durationMs - elapsed;
  const isOver = remaining < 0;
  const absRemaining = Math.abs(remaining);

  const minutes = Math.floor(absRemaining / 60000);
  const seconds = Math.floor((absRemaining % 60000) / 1000);

  return (
    <div
      className={cn(
        'font-black tabular-nums transition-colors duration-500',
        isOver
          ? 'text-red-500 animate-pulse'
          : remaining < 30000
            ? 'text-amber-400'
            : 'text-emerald-400'
      )}
    >
      <div className="flex items-baseline gap-2">
        {isOver && <span className="text-3xl mr-2">+</span>}
        <span className="text-7xl md:text-8xl">{minutes.toString().padStart(2, '0')}</span>
        <span className="text-4xl animate-pulse">:</span>
        <span className="text-7xl md:text-8xl">{seconds.toString().padStart(2, '0')}</span>
      </div>
      <p className="text-[10px] uppercase  text-center mt-2 opacity-50">
        {isOver ? 'TIEMPO EXTRA' : 'RESTANTE'}
      </p>
    </div>
  );
};
