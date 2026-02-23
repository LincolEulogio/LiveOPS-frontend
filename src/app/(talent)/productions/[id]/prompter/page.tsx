import { PrompterView } from '@/features/script/components/PrompterView';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function PrompterPage({ params }: Props) {
    const { id } = await params;
    return <PrompterView productionId={id} />;
}
