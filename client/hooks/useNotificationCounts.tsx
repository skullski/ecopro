import { useState, useEffect, useCallback } from 'react';

interface NotificationCounts {
  newOrders: number;
  unreadMessages: number;
  loading: boolean;
}

// Store last seen timestamps in localStorage
const ORDERS_LAST_SEEN_KEY = 'orders_last_seen_at';
const CHAT_LAST_SEEN_KEY = 'chat_last_seen_at';

export function useNotificationCounts() {
  const [counts, setCounts] = useState<NotificationCounts>({
    newOrders: 0,
    unreadMessages: 0,
    loading: true,
  });

  const fetchCounts = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setCounts({ newOrders: 0, unreadMessages: 0, loading: false });
      return;
    }

    try {
      // Fetch new orders count
      const ordersLastSeen = localStorage.getItem(ORDERS_LAST_SEEN_KEY);
      const ordersParams = ordersLastSeen ? `?since=${encodeURIComponent(ordersLastSeen)}` : '';
      
      const [ordersRes, messagesRes] = await Promise.all([
        fetch(`/api/orders/new-count${ordersParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/chat/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let newOrders = 0;
      let unreadMessages = 0;

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        newOrders = ordersData.count || 0;
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        unreadMessages = messagesData.unread_count || 0;
      }

      setCounts({ newOrders, unreadMessages, loading: false });
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      setCounts(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Mark orders as seen (call when user visits orders page)
  const markOrdersSeen = useCallback(() => {
    localStorage.setItem(ORDERS_LAST_SEEN_KEY, new Date().toISOString());
    setCounts(prev => ({ ...prev, newOrders: 0 }));
  }, []);

  // Mark chat as seen (call when user visits chat page)
  const markChatSeen = useCallback(() => {
    localStorage.setItem(CHAT_LAST_SEEN_KEY, new Date().toISOString());
    setCounts(prev => ({ ...prev, unreadMessages: 0 }));
  }, []);

  // Refresh counts manually
  const refreshCounts = useCallback(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchCounts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return {
    ...counts,
    markOrdersSeen,
    markChatSeen,
    refreshCounts,
  };
}

// Global notification context for sharing state across components
import { createContext, useContext, ReactNode } from 'react';

interface NotificationContextType extends NotificationCounts {
  markOrdersSeen: () => void;
  markChatSeen: () => void;
  refreshCounts: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notifications = useNotificationCounts();
  
  return (
    <NotificationContext.Provider value={notifications}>
      {children}
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
