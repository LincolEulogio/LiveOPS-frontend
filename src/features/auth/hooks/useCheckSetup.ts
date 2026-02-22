import { useQuery } from '@tanstack/react-query';
import { authService } from '../api/auth.service';

export const useCheckSetup = () => {
    return useQuery({
        queryKey: ['auth', 'check-setup'],
        queryFn: () => authService.checkSetup(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });
};
