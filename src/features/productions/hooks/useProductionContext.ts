import { useEffect } from 'react';
import { useAppStore } from '@/shared/store/app.store';

export function useProductionContextInitializer(productionId: string | undefined) {
  const setActiveProductionId = useAppStore((state) => state.setActiveProductionId);

  useEffect(() => {
    if (productionId) {
      setActiveProductionId(productionId);
    }

    // We do NOT clear it on unmount here. If the user navigates away to the main dashboard,
    // they might still want the global header/socket to stay in the background context
    // until they explicitly enter another one or close the app.
  }, [productionId, setActiveProductionId]);
}
