'use client';

import { SocialDashboard } from '@/features/social/components/SocialDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Guard } from '@/shared/components/Guard';
import { useParams } from 'next/navigation';

export default function SocialPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Guard requiredPermissions={['social:manage']}>
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
    </Guard>
  );
}
