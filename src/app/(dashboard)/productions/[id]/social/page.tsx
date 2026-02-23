import { SocialDashboard } from '@/features/social/components/SocialDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function SocialPage({ params }: Props) {
    const { id } = await params;
    return (
        <div className="h-full flex flex-col gap-4">
            <Link
                href={`/productions/${id}`}
                className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm font-medium w-fit group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Return to Dashboard
            </Link>
            <SocialDashboard productionId={id} />
        </div>
    );
}
