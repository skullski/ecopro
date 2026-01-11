import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Phone, MapPin, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface RiskOrder {
  order_id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_price: number;
  created_at: string;
  risk: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    flags: string[];
    recommendation: string;
    history: {
      total_orders: number;
      fake_orders: number;
      returned_orders: number;
      cancelled_orders: number;
      no_answer_orders: number;
      completed_orders: number;
    };
  };
}

interface RiskAlertProps {
  onOrderClick?: (orderId: number) => void;
}

export function RiskAlert({ onOrderClick }: RiskAlertProps) {
  const { t, locale } = useTranslation();
  const [highRiskOrders, setHighRiskOrders] = useState<RiskOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadHighRiskOrders();
  }, []);

  const loadHighRiskOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/orders/high-risk');
      if (res.ok) {
        const data = await res.json();
        setHighRiskOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to load high-risk orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isDismissed || highRiskOrders.length === 0) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-500';
      case 'high': return 'bg-orange-500/20 border-orange-500/50 text-orange-500';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-500';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return locale === 'ar' ? 'حرج' : 'Critical';
      case 'high': return locale === 'ar' ? 'مرتفع' : 'High';
      case 'medium': return locale === 'ar' ? 'متوسط' : 'Medium';
      default: return locale === 'ar' ? 'منخفض' : 'Low';
    }
  };

  const criticalCount = highRiskOrders.filter(o => o.risk?.level === 'critical').length;
  const highCount = highRiskOrders.filter(o => o.risk?.level === 'high').length;

  return (
    <div className="mb-4 rounded-lg border-2 border-red-500/30 bg-red-500/10 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
          <span className="font-bold text-red-500">
            {locale === 'ar' 
              ? `⚠️ تنبيه: ${highRiskOrders.length} طلبات مشبوهة تحتاج مراجعة`
              : `⚠️ Alert: ${highRiskOrders.length} suspicious orders need review`
            }
          </span>
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
              {criticalCount} {locale === 'ar' ? 'حرج' : 'Critical'}
            </span>
          )}
          {highCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold">
              {highCount} {locale === 'ar' ? 'مرتفع' : 'High'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {highRiskOrders.filter(o => o.risk).map((order) => (
            <div 
              key={order.order_id}
              className={`rounded-lg border p-3 cursor-pointer hover:opacity-80 transition-opacity ${getRiskColor(order.risk.level)}`}
              onClick={() => onOrderClick?.(order.order_id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">ORD-{String(order.order_id).padStart(3, '0')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRiskColor(order.risk.level)}`}>
                      {getRiskLabel(order.risk.level)} ({order.risk.score}%)
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.customer_name}</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="font-bold">{Math.round(order.total_price)} DZD</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{order.customer_phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold mb-1">
                    {locale === 'ar' ? 'سجل الزبون:' : 'Customer History:'}
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {order.risk.history.fake_orders > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-red-500/30 text-red-500 text-xs">
                        {order.risk.history.fake_orders} {locale === 'ar' ? 'وهمي' : 'fake'}
                      </span>
                    )}
                    {order.risk.history.returned_orders > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-500/30 text-orange-500 text-xs">
                        {order.risk.history.returned_orders} {locale === 'ar' ? 'مرتجع' : 'returned'}
                      </span>
                    )}
                    {order.risk.history.cancelled_orders > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/30 text-yellow-500 text-xs">
                        {order.risk.history.cancelled_orders} {locale === 'ar' ? 'ملغي' : 'cancelled'}
                      </span>
                    )}
                    {order.risk.history.no_answer_orders > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-500/30 text-gray-500 text-xs">
                        {order.risk.history.no_answer_orders} {locale === 'ar' ? 'لم يرد' : 'no answer'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Flags */}
              {order.risk.flags.length > 0 && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  <div className="flex flex-wrap gap-1">
                    {order.risk.flags.map((flag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-background/50 text-xs">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendation */}
              <div className="mt-2 text-xs italic opacity-80">
                💡 {order.risk.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
