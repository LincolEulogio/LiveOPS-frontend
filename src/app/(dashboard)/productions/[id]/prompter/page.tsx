import { PrompterView } from '@/features/script/components/PrompterView';

interface Props {
    params: {
        id: string;
    }
}

export default function PrompterPage({ params }: Props) {
    return <PrompterView productionId={params.id} />;
}
