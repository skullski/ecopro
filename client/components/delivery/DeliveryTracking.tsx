// Delivery tracking component for displaying order tracking status
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Calendar, Loader2 } from 'lucide-react';

interface DeliveryEvent {
  id: number;
  event_type: string;
  event_status: string;
  description?: string;
  location?: string;
  created_at: string;
}

interface TrackingInfo {
  status: string;
  tracking_number?: string;
  events: DeliveryEvent[];
}

interface DeliveryTrackingProps {
  orderId: number;
  initialTracking?: TrackingInfo;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function DeliveryTracking({
  orderId,
  initialTracking,
  autoRefresh = true,
  refreshInterval = 30000,
}: DeliveryTrackingProps) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(initialTracking || null);
  const [loading, setLoading] = useState(!initialTracking);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracking info
  const fetchTracking = async () => {
    try {
      const response = await fetch(`/api/delivery/orders/${orderId}/tracking`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
      });

      if (!response.ok) {
        if (response.status === 400) {
          setError('No tracking information available');
          return;
        }
        throw new Error('Failed to fetch tracking');
      }

      const data = await response.json();
      setTracking(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!initialTracking) {
      fetchTracking();
    }
  }, [orderId, initialTracking]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !tracking) return;

    const interval = setInterval(() => {
      fetchTracking();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, tracking]);

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'pending': 'secondary',
      'assigned': 'outline',
      'in_transit': 'default',
      'out_for_delivery': 'default',
      'delivered': 'default',
      'failed': 'destructive',
      'returned': 'destructive',
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pending',
      'assigned': 'Assigned',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'failed': 'Delivery Failed',
      'returned': 'Returned',
    };
    return labels[status] || status;
  };

  const getEventIcon = (eventType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'pickup': '📦',
      'in_transit': '🚚',
      'out_for_delivery': '📬',
      'delivered': '✅',
      'failed': '❌',
      'returned': '↩️',
    };
    return iconMap[eventType] || '📍';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading tracking information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tracking) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Delivery Tracking
        </CardTitle>
        <CardDescription>
          {tracking.tracking_number && `Tracking #: ${tracking.tracking_number}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Current Status</span>
          <Badge variant={getStatusColor(tracking.status)}>
            {getStatusLabel(tracking.status)}
          </Badge>
        </div>

        {/* Timeline of Events */}
        {tracking.events && tracking.events.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Delivery Timeline</h3>
            <div className="space-y-3">
              {tracking.events.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className="text-2xl">{getEventIcon(event.event_type)}</div>
                    {index < tracking.events.length - 1 && (
                      <div className="w-0.5 h-12 bg-border my-1" />
                    )}
                  </div>

                  {/* Event details */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium capitalize">
                          {event.event_type.replace(/_/g, ' ')}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Event metadata */}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No events yet */}
        {(!tracking.events || tracking.events.length === 0) && (
          <div className="text-center py-6 text-muted-foreground">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tracking events yet. We'll update this page when the courier provides updates.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
