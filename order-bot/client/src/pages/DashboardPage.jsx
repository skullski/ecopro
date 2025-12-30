import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderEditModal from '../components/OrderEditModal';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [editingOrder, setEditingOrder] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    payment_status: '',
    delivery_status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const clientData = localStorage.getItem('client');

    setClient(JSON.parse(clientData));
    fetchData();

    // Setup WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order-update') {
        fetchData();
      }
    };

    return () => ws.close();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Build query params for orders
      const orderParams = new URLSearchParams();
      if (filters.search) orderParams.append('search', filters.search);
      if (filters.status) orderParams.append('status', filters.status);
      if (filters.payment_status) orderParams.append('payment_status', filters.payment_status);
      if (filters.delivery_status) orderParams.append('delivery_status', filters.delivery_status);

      const [ordersRes, messagesRes, buyersRes, analyticsRes] = await Promise.all([
        fetch(`/api/orders?${orderParams.toString()}`),
        fetch('/api/messages'),
        fetch('/api/buyers'),
        fetch('/api/analytics'),
      ]);

      if (ordersRes.status === 401 || messagesRes.status === 401 || buyersRes.status === 401 || analyticsRes.status === 401) {
        navigate('/login');
        return;
      }

      const [ordersData, messagesData, buyersData, analyticsData] = await Promise.all([
        ordersRes.json(),
        messagesRes.json(),
        buyersRes.json(),
        analyticsRes.json(),
      ]);

      setOrders(ordersData.orders);
      setMessages(messagesData.messages);
      setBuyers(buyersData.buyers);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchData();
  };

  const exportToCSV = () => {
    const data = activeTab === 'orders' ? orders : buyers;
    const headers = activeTab === 'orders' 
      ? ['Order Number', 'Buyer', 'Product', 'Quantity', 'Price', 'Status', 'Payment', 'Delivery', 'Date']
      : ['Name', 'Phone', 'Email', 'Address', 'Date'];

    const rows = activeTab === 'orders'
      ? data.map(o => [
          o.order_number,
          o.buyer_name,
          o.product_name,
          o.quantity,
          o.total_price,
          o.status,
          o.payment_status || 'N/A',
          o.delivery_status || 'N/A',
          new Date(o.created_at).toLocaleDateString(),
        ])
      : data.map(b => [
          b.name,
          b.phone,
          b.email || 'N/A',
          b.address || 'N/A',
          new Date(b.created_at).toLocaleDateString(),
        ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('client');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      approved: '#4CAF50',
      declined: '#f44336',
      changed: '#2196F3',
    };
    return colors[status] || '#999';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      approved: '✅',
      declined: '❌',
      changed: '🔄',
    };
    return icons[status] || '📦';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>📊 Client Dashboard</h1>
          <p style={styles.headerSubtitle}>
            {client?.name} • {client?.company_name}
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statLabel}>Total Orders</h3>
          <p style={styles.statValue}>{analytics?.summary.totalOrders || 0}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statLabel}>Approved</h3>
          <p style={styles.statValue}>
            {analytics?.summary.approvedOrders || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statLabel}>Conversion Rate</h3>
          <p style={styles.statValue}>{analytics?.summary.conversionRate || 0}%</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statLabel}>Total Revenue</h3>
          <p style={styles.statValue}>{analytics?.summary.totalRevenue || 0} DZD</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            ...styles.tab,
            ...(activeTab === 'orders' ? styles.activeTab : {}),
          }}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('buyers')}
          style={{
            ...styles.tab,
            ...(activeTab === 'buyers' ? styles.activeTab : {}),
          }}
        >
          Buyers
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            ...styles.tab,
            ...(activeTab === 'messages' ? styles.activeTab : {}),
          }}
        >
          Message Logs
        </button>
        <button
          onClick={() => navigate('/products')}
          style={styles.productsButton}
        >
          🛍️ Products
        </button>
        <button
          onClick={() => navigate('/bot-settings')}
          style={styles.settingsButton}
        >
          ⚙️ Bot Settings
        </button>
      </div>

      {/* Filters and Export */}
      {(activeTab === 'orders' || activeTab === 'buyers') && (
        <div style={styles.filterBar}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            🔍 {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button onClick={exportToCSV} style={styles.exportButton}>
            📥 Export CSV
          </button>
        </div>
      )}

      {showFilters && activeTab === 'orders' && (
        <div style={styles.filtersCard}>
          <div style={styles.filtersGrid}>
            <input
              type="text"
              placeholder="Search order number, product, buyer..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={styles.filterInput}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="changed">Changed</option>
            </select>
            <select
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
            </select>
            <select
              value={filters.delivery_status}
              onChange={(e) => setFilters({ ...filters, delivery_status: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="">All Deliveries</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={styles.filterActions}>
            <button onClick={applyFilters} style={styles.applyButton}>
              Apply Filters
            </button>
            <button
              onClick={() => {
                setFilters({ search: '', status: '', payment_status: '', delivery_status: '' });
                setTimeout(() => applyFilters(), 100);
              }}
              style={styles.clearButton}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'orders' && (
          <div>
            <h2 style={styles.sectionTitle}>Orders</h2>
            {orders.length === 0 ? (
              <p style={styles.emptyText}>No orders yet</p>
            ) : (
              <div style={styles.table}>
                {orders.map((order) => (
                  <div key={order.id} style={styles.tableRow}>
                    <div style={styles.orderMain}>
                      <span style={styles.orderIcon}>
                        {getStatusIcon(order.status)}
                      </span>
                      <div>
                        <p style={styles.orderNumber}>#{order.order_number}</p>
                        <p style={styles.orderProduct}>{order.product_name}</p>
                        <p style={styles.orderBuyer}>{order.buyer_name}</p>
                        {order.payment_status && (
                          <span style={{ ...styles.paymentBadge, color: order.payment_status === 'paid' ? '#4CAF50' : '#ff9800' }}>
                            💳 {order.payment_status}
                          </span>
                        )}
                        {order.delivery_status && (
                          <span style={{ ...styles.deliveryBadge, marginLeft: '10px' }}>
                            🚚 {order.delivery_status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={styles.orderMeta}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(order.status) + '20',
                          color: getStatusColor(order.status),
                        }}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      <p style={styles.orderPrice}>{order.total_price} DZD</p>
                      <button
                        onClick={() => setEditingOrder(order)}
                        style={styles.editButton}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {editingOrder && (
          <OrderEditModal
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
            onSave={(updated) => {
              setOrders(orders.map(o => o.id === updated.id ? updated : o));
              setEditingOrder(null);
            }}
          />
        )}

        {activeTab === 'buyers' && (
          <div>
            <h2 style={styles.sectionTitle}>Buyers</h2>
            {buyers.length === 0 ? (
              <p style={styles.emptyText}>No buyers yet</p>
            ) : (
              <div style={styles.table}>
                {buyers.map((buyer) => (
                  <div key={buyer.id} style={styles.tableRow}>
                    <div>
                      <p style={styles.buyerName}>{buyer.name}</p>
                      <p style={styles.buyerInfo}>{buyer.phone}</p>
                      {buyer.email && (
                        <p style={styles.buyerInfo}>{buyer.email}</p>
                      )}
                    </div>
                    <div>
                      <p style={styles.buyerDate}>
                        Joined {new Date(buyer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 style={styles.sectionTitle}>Message Logs</h2>
            {messages.length === 0 ? (
              <p style={styles.emptyText}>No messages yet</p>
            ) : (
              <div style={styles.table}>
                {messages.map((msg) => (
                  <div key={msg.id} style={styles.tableRow}>
                    <div>
                      <p style={styles.messageBadge}>
                        {msg.message_type === 'whatsapp' ? '📱 WhatsApp' : '📨 SMS'}
                      </p>
                      <p style={styles.messageOrder}>Order #{msg.order_number}</p>
                      <p style={styles.messageBuyer}>To: {msg.buyer_name}</p>
                      <p style={styles.messagePhone}>{msg.recipient_phone}</p>
                    </div>
                    <div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            msg.status === 'sent' ? '#4CAF5020' : '#f4433620',
                          color: msg.status === 'sent' ? '#4CAF50' : '#f44336',
                        }}
                      >
                        {msg.status.toUpperCase()}
                      </span>
                      <p style={styles.messageDate}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  header: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#666',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  activeTab: {
    backgroundColor: '#2196F3',
    color: 'white',
  },
  productsButton: {
    padding: '12px 24px',
    backgroundColor: '#9C27B0',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  settingsButton: {
    padding: '12px 24px',
    backgroundColor: '#FF9800',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'flex-end',
  },
  filterButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
  exportButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
  filtersCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px',
  },
  filterInput: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
  },
  filterSelect: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
  },
  filterActions: {
    display: 'flex',
    gap: '10px',
  },
  applyButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#999',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
  content: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: '40px',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tableRow: {
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderMain: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  orderIcon: {
    fontSize: '24px',
  },
  orderNumber: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  orderProduct: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '3px',
  },
  orderBuyer: {
    fontSize: '13px',
    color: '#999',
  },
  orderMeta: {
    textAlign: 'right',
  },
  orderPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: '8px',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  buyerName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  buyerInfo: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '3px',
  },
  buyerDate: {
    fontSize: '13px',
    color: '#999',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.3s',
  },
  paymentBadge: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginTop: '5px',
    display: 'inline-block',
  },
  deliveryBadge: {
    fontSize: '12px',
    color: '#666',
    display: 'inline-block',
  },
  messageBadge: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: '5px',
  },
  messageOrder: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '3px',
  },
  messageBuyer: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '3px',
  },
  messagePhone: {
    fontSize: '13px',
    color: '#999',
  },
  messageDate: {
    fontSize: '12px',
    color: '#999',
    marginTop: '8px',
  },
};
