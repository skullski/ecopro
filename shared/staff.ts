// Permission types and utilities for staff management system

export const PERMISSION_CATEGORIES = {
  DASHBOARD: 'dashboard',
  ORDERS: 'orders',
  PRODUCTS: 'products',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  STAFF: 'staff',
  ADVANCED: 'advanced',
} as const;

export const PERMISSIONS = {
  // Dashboard & Views
  [PERMISSION_CATEGORIES.DASHBOARD]: {
    VIEW_DASHBOARD: 'view_dashboard',
    VIEW_ORDERS_LIST: 'view_orders_list',
    VIEW_PRODUCTS_LIST: 'view_products_list',
    VIEW_ANALYTICS: 'view_analytics',
    VIEW_SETTINGS: 'view_settings',
    VIEW_STAFF: 'view_staff',
  },
  
  // Orders Management
  [PERMISSION_CATEGORIES.ORDERS]: {
    EDIT_ORDER_STATUS: 'edit_order_status',
    EDIT_ORDER_NOTES: 'edit_order_notes',
    DELETE_ORDERS: 'delete_orders',
    BULK_ORDER_ACTIONS: 'bulk_order_actions',
    BLOCK_CUSTOMERS: 'block_customers',
  },
  
  // Products Management
  [PERMISSION_CATEGORIES.PRODUCTS]: {
    ADD_PRODUCTS: 'add_products',
    EDIT_PRODUCTS: 'edit_products',
    DELETE_PRODUCTS: 'delete_products',
    MANAGE_VARIANTS: 'manage_variants',
    MANAGE_STOCK: 'manage_stock',
    VIEW_INVENTORY: 'view_inventory',
  },
  
  // Analytics
  [PERMISSION_CATEGORIES.ANALYTICS]: {
    VIEW_ANALYTICS: 'view_analytics',
    EXPORT_DATA: 'export_data',
    VIEW_REPORTS: 'view_reports',
  },
  
  // Store Settings
  [PERMISSION_CATEGORIES.SETTINGS]: {
    VIEW_STORE_SETTINGS: 'view_store_settings',
    EDIT_STORE_INFO: 'edit_store_info',
    EDIT_STORE_BRANDING: 'edit_store_branding',
    EDIT_STORE_TEMPLATES: 'edit_store_templates',
    EDIT_DELIVERY_SETTINGS: 'edit_delivery_settings',
  },
  
  // Staff Management
  [PERMISSION_CATEGORIES.STAFF]: {
    INVITE_STAFF: 'invite_staff',
    MANAGE_STAFF: 'manage_staff',
    VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  },
  
  // Advanced
  [PERMISSION_CATEGORIES.ADVANCED]: {
    MANAGE_BOT_SETTINGS: 'manage_bot_settings',
    MANAGE_BROADCASTING: 'manage_broadcasting',
    ACCESS_TEMPLATES: 'access_templates',
    MANAGE_CATEGORIES: 'manage_categories',
  },
} as const;

// Flatten all permissions for easy lookup
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).reduce(
  (acc, category) => ({ ...acc, ...category }),
  {}
) as Record<string, string>;

// Permission display names for UI
export const PERMISSION_LABELS: Record<string, string> = {
  // Dashboard
  view_dashboard: 'View Dashboard',
  view_orders_list: 'View Orders List',
  view_products_list: 'View Products List',
  view_analytics: 'View Analytics',
  view_settings: 'View Settings',
  view_staff: 'View Staff',
  
  // Orders
  edit_order_status: 'Edit Order Status',
  edit_order_notes: 'Edit Order Notes',
  delete_orders: 'Delete Orders',
  bulk_order_actions: 'Bulk Order Actions',
  block_customers: 'Block Customers',
  
  // Products
  add_products: 'Add Products',
  edit_products: 'Edit Products',
  delete_products: 'Delete Products',
  manage_variants: 'Manage Variants',
  manage_stock: 'Manage Stock',
  view_inventory: 'View Inventory',
  
  // Analytics
  export_data: 'Export Data',
  view_reports: 'View Reports',
  
  // Settings
  view_store_settings: 'View Store Settings',
  edit_store_info: 'Edit Store Info',
  edit_store_branding: 'Edit Store Branding',
  edit_store_templates: 'Edit Store Templates',
  edit_delivery_settings: 'Edit Delivery Settings',
  
  // Staff
  invite_staff: 'Invite Staff',
  manage_staff: 'Manage Staff',
  view_activity_logs: 'View Activity Logs',
  
  // Advanced
  manage_bot_settings: 'Manage Bot Settings',
  manage_broadcasting: 'Manage Broadcasting',
  access_templates: 'Access Templates',
  manage_categories: 'Manage Categories',
};

export interface StaffMember {
  id: number;
  store_id: number;
  user_id?: number;
  email: string;
  role: 'manager' | 'staff';
  status: 'pending' | 'active' | 'inactive';
  permissions: Record<string, boolean>;
  last_login?: Date;
  invited_at: Date;
  activated_at?: Date;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLog {
  id: number;
  store_id: number;
  staff_id: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  resource_name?: string;
  before_value?: Record<string, any>;
  after_value?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

// Helper functions
export function hasPermission(permissions: Record<string, boolean>, permission: string): boolean {
  return permissions[permission] === true;
}

export function getPermissionCategory(permission: string): string {
  for (const [category, perms] of Object.entries(PERMISSIONS)) {
    const categoryPerms = perms as Record<string, string>;
    if (Object.values(categoryPerms).includes(permission)) {
      return category;
    }
  }
  return '';
}

export function getCategoryPermissions(category: string): Record<string, string> {
  return PERMISSIONS[category as keyof typeof PERMISSIONS] as Record<string, string> || {};
}
