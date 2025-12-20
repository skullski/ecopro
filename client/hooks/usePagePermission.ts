import { usePermissions } from '@/context/PermissionContext';

/**
 * Hook to check if current page-level permission is granted
 * Returns formatted permission name and access status
 */
export function usePagePermission(requiredPermission: string) {
  const { hasPermission, isStaff } = usePermissions();
  return {
    hasAccess: hasPermission(requiredPermission),
    isStaff,
    permissionName: requiredPermission.replace(/_/g, ' ').toLowerCase(),
  };
}
