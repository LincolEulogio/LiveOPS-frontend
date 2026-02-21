import { useAuthStore } from '@/features/auth/store/auth.store';

export function usePermissions(requiredPermissions: string[]) {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  // Admin bypass (assuming 'ADMIN' is the highest role or has a wildcard)
  if (user.role.name === 'ADMIN') {
    return true;
  }

  return requiredPermissions.every((permission) => user.role.permissions.includes(permission));
}
