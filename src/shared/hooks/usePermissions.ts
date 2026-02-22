import { useAuthStore } from '@/features/auth/store/auth.store';

export function usePermissions(requiredPermissions: string[]) {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  // 1. Collect all permission actions
  // The backend might return these as { permission: { action: string } } objects
  const globalActions = user.globalRole?.permissions?.map((p: any) =>
    typeof p.permission?.action === 'string' ? p.permission.action : p.permission
  ) || [];

  const prodActions = user.role?.permissions?.map((p: any) =>
    typeof p.permission?.action === 'string' ? p.permission.action : p
  ) || [];

  const allActions = [...new Set([...globalActions, ...prodActions as any])];

  // 2. Admin bypass by name
  const isSystemAdmin =
    ['ADMIN', 'SUPERADMIN'].includes(user.globalRole?.name?.toUpperCase() || '') ||
    ['ADMIN', 'SUPERADMIN'].includes(user.role?.name?.toUpperCase() || '');

  if (isSystemAdmin) {
    return true;
  }

  // 3. Check if any of the required permissions are present
  return requiredPermissions.every((permission) => allActions.includes(permission));
}
