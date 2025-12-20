import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PERMISSION_CATEGORIES, PERMISSIONS, PERMISSION_LABELS, getCategoryPermissions } from '@shared/staff';

interface PermissionEditorProps {
  permissions: Record<string, boolean>;
  onPermissionChange: (permission: string, value: boolean) => void;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  dashboard: 'Access to main dashboard and navigation',
  orders: 'Manage customer orders and their statuses',
  products: 'Manage store products and inventory',
  analytics: 'View analytics, reports, and export data',
  settings: 'Access and modify store settings',
  staff: 'Manage staff members and view activity logs',
  advanced: 'Advanced features like bot settings and broadcasting',
};

export function PermissionEditor({
  permissions,
  onPermissionChange,
}: PermissionEditorProps) {
  const categories = Object.keys(PERMISSION_CATEGORIES).map(
    (key) => PERMISSION_CATEGORIES[key as keyof typeof PERMISSION_CATEGORIES]
  );

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const perms = getCategoryPermissions(category);
        if (Object.keys(perms).length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{category.replace(/_/g, ' ')}</CardTitle>
              <CardDescription>{CATEGORY_DESCRIPTIONS[category]}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(perms).map(([key, permission]) => {
                  const label = PERMISSION_LABELS[permission as string] || permission;
                  const isChecked = permissions[permission] === true;

                  return (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          onPermissionChange(permission, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={permission}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
