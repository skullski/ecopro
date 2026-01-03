import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useStaffPermissions, PAGE_PERMISSIONS, ACTION_PERMISSIONS } from '@/contexts/StaffPermissionContext';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  action?: string;
  fallback?: ReactNode;
  showBlurred?: boolean;
  /**
   * When true, still renders children behind a blur for a preview.
   * When false (default), restricted pages do not render at all.
   */
  renderLockedContent?: boolean;
}

/**
 * PermissionGate - Wraps page content with permission checks
 * 
 * If staff doesn't have permission:
 * - Shows blurred content with a lock overlay
 * 
 * Usage:
 * <PermissionGate permission="view_orders_list">
 *   <OrdersPage />
 * </PermissionGate>
 */
export function PermissionGate({ 
  children, 
  permission, 
  action,
  fallback,
  showBlurred = true,
  renderLockedContent = false,
}: PermissionGateProps) {
  const { isStaff, hasPermission, hasActionPermission, loading } = useStaffPermissions();
  const location = useLocation();

  // Not staff = full access
  if (!isStaff) {
    return <>{children}</>;
  }

  // Still loading permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check permission
  let hasAccess = true;
  let requiredPermission: string | undefined;
  
  if (permission) {
    hasAccess = hasPermission(permission);
    requiredPermission = permission;
  } else if (action) {
    hasAccess = hasActionPermission(action);
    requiredPermission = ACTION_PERMISSIONS[action] || action;
  } else {
    // Auto-detect from route
    const path = location.pathname;
    const entries = Object.entries(PAGE_PERMISSIONS).sort((a, b) => b[0].length - a[0].length);
    for (const [route, perm] of entries) {
      if (path === route || path.startsWith(route + '/')) {
        requiredPermission = perm;
        hasAccess = hasPermission(perm);
        break;
      }
    }
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  const requiredPermissionLabel = requiredPermission || 'view access';

  // Restricted: optionally show a blurred preview, but by default DO NOT render the page.
  // This prevents data fetching/effects and stops any interaction from running.
  if (showBlurred && renderLockedContent) {
    return (
      <div className="relative min-h-[400px]">
        {/* Blurred content */}
        <div className="blur-md pointer-events-none select-none opacity-50">
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. Contact your store owner to request access.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <EyeOff className="w-4 h-4" />
              <span>
                Permission required:{' '}
                <code className="text-xs bg-muted px-2 py-1 rounded">{requiredPermissionLabel}</code>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default lock screen (no page rendered)
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
        <p className="text-muted-foreground mb-4">
          You don't have permission to access this page. Contact your store owner to request access.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <EyeOff className="w-4 h-4" />
          <span>
            Permission required:{' '}
            <code className="text-xs bg-muted px-2 py-1 rounded">{requiredPermissionLabel}</code>
          </span>
        </div>
      </div>
      {fallback ? <div className="hidden">{fallback}</div> : null}
    </div>
  );
}

interface RequirePermissionProps {
  children: ReactNode;
  permission?: string;
  action?: string;
  fallback?: ReactNode;
  disabled?: boolean;
}

/**
 * RequirePermission - Wraps actions/buttons with permission checks
 * 
 * If staff doesn't have permission:
 * - Hides the element OR shows disabled version
 * 
 * Usage:
 * <RequirePermission action="edit_order">
 *   <Button>Edit Order</Button>
 * </RequirePermission>
 */
export function RequirePermission({ 
  children, 
  permission, 
  action,
  fallback,
  disabled = false
}: RequirePermissionProps) {
  const { isStaff, hasPermission, hasActionPermission } = useStaffPermissions();

  // Not staff = full access
  if (!isStaff) {
    return <>{children}</>;
  }

  let hasAccess = true;
  
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (action) {
    hasAccess = hasActionPermission(action);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show disabled version
  if (disabled && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      disabled: true,
      className: `${(children as React.ReactElement<any>).props.className || ''} opacity-50 cursor-not-allowed`,
      title: 'You don\'t have permission for this action',
    });
  }

  // Show fallback or hide
  return <>{fallback || null}</>;
}

interface ActionButtonProps {
  children: ReactNode;
  action: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

/**
 * ActionButton - A button that respects staff permissions
 * Shows tooltip when disabled due to permissions
 */
export function ActionButton({
  children,
  action,
  onClick,
  className = '',
  disabled = false,
}: ActionButtonProps) {
  const { isStaff, hasActionPermission } = useStaffPermissions();
  
  const hasAccess = !isStaff || hasActionPermission(action);
  const isDisabled = disabled || !hasAccess;

  return (
    <button
      onClick={hasAccess ? onClick : undefined}
      disabled={isDisabled}
      className={`${className} ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!hasAccess ? 'You don\'t have permission for this action' : undefined}
    >
      {children}
      {!hasAccess && <Lock className="w-3 h-3 ml-1 inline" />}
    </button>
  );
}

/**
 * useCanAccess - Hook for checking permissions in components
 */
export function useCanAccess() {
  const { isStaff, hasPermission, hasActionPermission, hasPagePermission } = useStaffPermissions();
  
  return {
    isStaff,
    canViewPage: (path: string) => !isStaff || hasPagePermission(path),
    canDoAction: (action: string) => !isStaff || hasActionPermission(action),
    canAccess: (permission: string) => !isStaff || hasPermission(permission),
  };
}
