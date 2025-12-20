import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PermissionGuardProps {
  hasPermission: boolean;
  permissionName?: string;
  children: React.ReactNode;
  onRequestAccess?: () => void;
}

/**
 * Permission Guard Component
 * 
 * Shows blurred overlay with lock icon when staff doesn't have permission
 * Allows staff to see what's available but prevents access
 * 
 * Usage:
 * <PermissionGuard hasPermission={permissions.view_orders}>
 *   <OrdersPage />
 * </PermissionGuard>
 */
export default function PermissionGuard({
  hasPermission,
  permissionName = 'this feature',
  children,
  onRequestAccess,
}: PermissionGuardProps) {
  if (hasPermission) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm opacity-50 pointer-events-none">
        {children}
      </div>

      {/* Overlay with lock */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center max-w-sm">
          {/* Lock Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900 rounded-full p-4">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Message */}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Access Restricted
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
            You don't have permission to access <span className="font-medium">{permissionName}</span>.
          </p>

          {/* Contact Owner Info */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Please contact the store owner to request access.
          </p>

          {/* Optional Button */}
          {onRequestAccess && (
            <Button
              onClick={onRequestAccess}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Request Access
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
