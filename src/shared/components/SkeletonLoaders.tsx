'use client';

import { cn } from '@/shared/utils/cn';

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
    return (
        <div className={cn("animate-pulse bg-stone-800/50 rounded-lg", className)} />
    );
};

export const TimelineSkeleton = () => {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                    <Skeleton className="w-12 h-12" />
                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="w-1/3 h-4" />
                            <Skeleton className="w-16 h-4" />
                        </div>
                        <Skeleton className="w-2/3 h-3" />
                        <div className="flex gap-2">
                            <Skeleton className="w-16 h-8" />
                            <Skeleton className="w-16 h-8" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const IntercomSkeleton = () => {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className={cn(
                    "flex flex-col gap-2 p-3 rounded-xl border",
                    i % 2 === 0 ? "bg-stone-900 border-stone-800" : "bg-indigo-500/5 border-indigo-500/20"
                )}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-6 h-6 rounded-lg" />
                            <Skeleton className="w-20 h-3" />
                        </div>
                        <Skeleton className="w-12 h-2" />
                    </div>
                    <Skeleton className="w-full h-12" />
                    <div className="flex gap-2">
                        <Skeleton className="w-10 h-4 rounded-full" />
                        <Skeleton className="w-10 h-4 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const MetricsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <Skeleton className="w-12 h-4" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="w-2/3 h-8" />
                        <Skeleton className="w-1/2 h-4" />
                    </div>
                </div>
            ))}
        </div>
    );
};
export const RolesSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-[#0a0a0f]/80 border border-black/5 dark:border-white/10 rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="w-2/3 h-6" />
                            <Skeleton className="w-1/3 h-3" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="w-8 h-8 rounded-xl" />
                            <Skeleton className="w-8 h-8 rounded-xl" />
                        </div>
                    </div>
                    <Skeleton className="w-full h-8" />
                    <div className="space-y-3">
                        <Skeleton className="w-full h-12 rounded-xl" />
                        <Skeleton className="w-full h-12 rounded-xl" />
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const UsersSkeleton = () => {
    return (
        <div className="bg-white dark:bg-[#050508]/40 border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex gap-8">
                <Skeleton className="w-1/4 h-4" />
                <Skeleton className="w-1/4 h-4" />
                <Skeleton className="w-1/4 h-4" />
                <Skeleton className="w-1/4 h-4 text-right" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-8 border-b border-black/5 dark:border-white/5 flex items-center gap-8">
                    <div className="flex items-center gap-4 flex-1">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="w-1/2 h-4" />
                            <Skeleton className="w-1/3 h-2" />
                        </div>
                    </div>
                    <Skeleton className="w-1/4 h-8 rounded-xl" />
                    <Skeleton className="w-1/4 h-4" />
                    <div className="flex gap-2 justify-end flex-1">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="w-10 h-10 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
};
