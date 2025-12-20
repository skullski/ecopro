import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Package, User, Settings, Trash2, Plus, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActivityLogEntry {
  id: number;
  staff_id: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  resource_name?: string;
  before_value?: Record<string, any>;
  after_value?: Record<string, any>;
  timestamp: string;
}

interface ActivityLogProps {
  storeId: number;
  staffId?: number | null;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  staff_invited: <User className="w-4 h-4" />,
  staff_removed: <User className="w-4 h-4" />,
  permissions_updated: <Settings className="w-4 h-4" />,
  product_created: <Package className="w-4 h-4" />,
  product_deleted: <Trash2 className="w-4 h-4" />,
  product_updated: <Package className="w-4 h-4" />,
  order_deleted: <Trash2 className="w-4 h-4" />,
  order_status_updated: <FileText className="w-4 h-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  staff_invited: 'bg-blue-100 text-blue-800',
  staff_removed: 'bg-red-100 text-red-800',
  permissions_updated: 'bg-yellow-100 text-yellow-800',
  product_created: 'bg-green-100 text-green-800',
  product_deleted: 'bg-red-100 text-red-800',
  product_updated: 'bg-blue-100 text-blue-800',
  order_deleted: 'bg-red-100 text-red-800',
  order_status_updated: 'bg-purple-100 text-purple-800',
};

export function ActivityLog({ storeId, staffId }: ActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityLogs();
  }, [staffId]);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const url = staffId
        ? `/api/client/staff/${staffId}/activity?limit=100`
        : `/api/client/staff/0/activity?limit=100`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load activity logs');

      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No activity logs found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <p className="text-sm text-muted-foreground">Track all staff actions</p>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}`}>
                    {ACTION_ICONS[log.action] || <FileText className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{formatAction(log.action)}</span>
                      {log.resource_type && (
                        <Badge variant="outline" className="text-xs">
                          {log.resource_type}
                        </Badge>
                      )}
                    </div>

                    {log.resource_name && (
                      <p className="text-sm text-muted-foreground truncate">
                        {log.resource_name}
                      </p>
                    )}

                    {log.before_value && log.after_value && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          View changes
                        </summary>
                        <div className="mt-2 text-xs space-y-1 bg-muted p-2 rounded">
                          {Object.keys(log.after_value).map((key) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{' '}
                              <span className="text-red-600 line-through">
                                {String(log.before_value?.[key])}
                              </span>
                              {' → '}
                              <span className="text-green-600">
                                {String(log.after_value[key])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
