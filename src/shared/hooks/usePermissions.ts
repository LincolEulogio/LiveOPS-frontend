import { useAuthStore } from '@/features/auth/store/auth.store';

export function usePermissions(requiredPermissions: string[]) {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  // 1. Collect all permission actions
  const globalActions = user.globalRole?.permissions?.map(p => p.permission.action) || [];
  const prodActions = user.role?.permissions || [];

  const allActions = [...new Set([...globalActions, ...prodActions])];

  // 2. Admin bypass by name (Optional, but let's stick to actions for precision)
  if (user.globalRole?.name === 'ADMIN' || user.role?.name === 'ADMIN') {
    return true;
  }

  // 3. Check if all required permissions are present
  return requiredPermissions.every((permission) => allActions.includes(permission));
}
