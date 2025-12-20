import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Permissions {
  [key: string]: boolean;
}

interface PermissionContextType {
  permissions: Permissions;
  isStaff: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<Permissions>({});
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load permissions from localStorage or API
    const storedUser = localStorage.getItem('user');
    const userIsStaff = localStorage.getItem('isStaff') === 'true';

    if (storedUser && userIsStaff) {
      try {
        const user = JSON.parse(storedUser);
        setPermissions(user.permissions || {});
        setIsStaff(true);
      } catch (err) {
        console.error('Failed to parse user permissions:', err);
        setPermissions({});
        setIsStaff(false);
      }
    } else {
      // Owner has all permissions by default
      setPermissions({
        view_orders: true,
        edit_orders: true,
        delete_orders: true,
        view_products: true,
        add_products: true,
        edit_products: true,
        delete_products: true,
        view_analytics: true,
        export_data: true,
        manage_staff: true,
        view_settings: true,
        edit_settings: true,
      });
      setIsStaff(false);
    }

    setIsLoading(false);
  }, []);

  const hasPermission = (permission: string): boolean => {
    // Owners always have all permissions
    if (!isStaff) return true;

    // Staff members check their specific permissions
    return permissions[permission] === true;
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every((perm) => hasPermission(perm));
  };

  const value: PermissionContextType = {
    permissions,
    isStaff,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook to use permissions context
 * Throws error if used outside PermissionProvider
 */
export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
}
