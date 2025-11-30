import express from 'express';
import { Order } from '../models/Order.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get analytics/stats for client
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.clientId;

    // Get all orders for analytics
    const orders = await Order.findByClientId(clientId);

    // Calculate stats
    const totalOrders = orders.length;
    const approvedOrders = orders.filter(o => o.status === 'approved').length;
    const declinedOrders = orders.filter(o => o.status === 'declined').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    // Conversion rate
    const conversionRate = totalOrders > 0 
      ? ((approvedOrders / totalOrders) * 100).toFixed(2) 
      : 0;

    // Total revenue (approved orders only)
    const totalRevenue = orders
      .filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    // Average order value
    const avgOrderValue = approvedOrders > 0 
      ? (totalRevenue / approvedOrders).toFixed(2) 
      : 0;

    // Response time (average time to confirm)
    const confirmedOrders = orders.filter(o => o.confirmed_at);
    const avgResponseTime = confirmedOrders.length > 0
      ? confirmedOrders.reduce((sum, o) => {
          const created = new Date(o.created_at);
          const confirmed = new Date(o.confirmed_at);
          return sum + (confirmed - created);
        }, 0) / confirmedOrders.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Product performance (most ordered products)
    const productStats = {};
    orders.forEach(order => {
      const product = order.product_name;
      if (!productStats[product]) {
        productStats[product] = {
          name: product,
          orders: 0,
          approved: 0,
          revenue: 0,
        };
      }
      productStats[product].orders++;
      if (order.status === 'approved') {
        productStats[product].approved++;
        productStats[product].revenue += parseFloat(order.total_price);
      }
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Orders over time (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === date.getTime();
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        approved: dayOrders.filter(o => o.status === 'approved').length,
      });
    }

    res.json({
      summary: {
        totalOrders,
        approvedOrders,
        declinedOrders,
        pendingOrders,
        conversionRate: parseFloat(conversionRate),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        avgOrderValue: parseFloat(avgOrderValue),
        avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
      },
      topProducts,
      ordersOverTime: last7Days,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;
