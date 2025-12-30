import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  requestNotificationPermission, 
  notifyNewOrder, 
  notifyNewMessage,
  getNotificationPermission 
} from '@/utils/browserNotifications';
import { useTranslation } from '@/lib/i18n';
import { Bell, X } from 'lucide-react';

interface NotificationContextType {
  notificationPermission: NotificationPermission | 'unsupported';
  newOrdersCount: number;
  unreadMessagesCount: number;
  requestPermission: () => Promise<NotificationPermission>;
  showPrompt: boolean;
  dismissPrompt: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Storage keys
const ORDERS_LAST_SEEN_KEY = 'orders_last_seen_at';
const CHAT_LAST_SEEN_KEY = 'chat_last_seen_at';
const PERMISSION_ASKED_KEY = 'notification_permission_asked';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslation();
  const navigate = useNavigate();
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  
  const prevOrdersCount = useRef(0);
  const prevMessagesCount = useRef(0);

  // Check permission on mount
  useEffect(() => {
    const permission = getNotificationPermission();
    setNotificationPermission(permission);
    
    // Show prompt if permission hasn't been asked yet
    const hasAsked = localStorage.getItem(PERMISSION_ASKED_KEY);
    if (permission === 'default' && !hasAsked) {
      setTimeout(() => setShowPrompt(true), 3000);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
    setShowPrompt(false);
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    return permission;
  }, []);

  // Dismiss prompt
  const dismissPrompt = useCallback(() => {
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
    setShowPrompt(false);
  }, []);

  // Fetch new orders count
  const fetchNewOrdersCount = useCallback(async () => {
    try {
      const lastSeen = localStorage.getItem(ORDERS_LAST_SEEN_KEY);
      const params = lastSeen ? `?since=${encodeURIComponent(lastSeen)}` : '';
      const res = await fetch(`/api/orders/new-count${params}`);
      if (res.ok) {
        const data = await res.json();
        const newCount = data.count || 0;
        
        // Show browser notification if there are new orders
        if (newCount > prevOrdersCount.current && newCount > 0) {
          notifyNewOrder(newCount, () => navigate('/dashboard/orders'));
        }
        
        prevOrdersCount.current = newCount;
        setNewOrdersCount(newCount);
      }
    } catch (err) {
      console.error('Failed to fetch new orders count:', err);
    }
  }, [navigate]);

  // Fetch unread messages count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/unread-count');
      if (res.ok) {
        const data = await res.json();
        const newCount = data.unreadCount || 0;
        
        // Show browser notification if there are new messages
        if (newCount > prevMessagesCount.current && newCount > 0) {
          notifyNewMessage(newCount, () => navigate('/dashboard/support'));
        }
        
        prevMessagesCount.current = newCount;
        setUnreadMessagesCount(newCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [navigate]);

  // Poll for updates
  useEffect(() => {
    // Initial fetch
    fetchNewOrdersCount();
    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchNewOrdersCount();
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNewOrdersCount, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{
      notificationPermission,
      newOrdersCount,
      unreadMessagesCount,
      requestPermission,
      showPrompt,
      dismissPrompt,
    }}>
      {children}
      
      {/* Global Notification Permission Prompt */}
      {showPrompt && (
        <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
          <div 
            className="bg-white rounded-xl shadow-2xl border border-blue-200 p-4 max-w-sm"
            style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)' }}
          >
            <button 
              onClick={dismissPrompt}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">
                  {locale === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {locale === 'ar' 
                    ? 'احصل على إشعارات فورية للطلبات الجديدة والرسائل'
                    : 'Get instant alerts for new orders and messages'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={requestPermission}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    {locale === 'ar' ? 'تفعيل' : 'Enable'}
                  </button>
                  <button
                    onClick={dismissPrompt}
                    className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg transition-colors text-sm"
                  >
                    {locale === 'ar' ? 'لاحقاً' : 'Later'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
