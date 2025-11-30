# Order Confirmation Bot

A complete WhatsApp/SMS order confirmation system with real-time admin dashboard, product management, and analytics.

## 🎯 Features

**✅ IMPLEMENTED:**
- **Automated Order Verification**: Bot monitors new orders and triggers verification automatically
- **Buyer-Initiated Orders**: Buyers place orders through client stores (Facebook, Instagram, websites)
- **Dual-Channel Messaging**: WhatsApp + SMS for confirmation
- **Order Confirmation Page**: Buyers approve/decline/request changes via unique link
- **Real-time Admin Dashboard**: Live order tracking, buyer management, message logs
- **Product Management**: Full CRUD for client product catalog
- **Bot Settings**: Customizable message templates, timing, and branding per client
- **Analytics Dashboard**: Conversion rates, revenue tracking, top products, order trends
- **WhatsApp Integration**: Baileys library with QR code authentication
- **SMS Ready**: Placeholder for GSM modem integration
- **Job Queue**: BullMQ + Redis for reliable message scheduling
- **WebSocket Updates**: Real-time dashboard notifications
- **Payment & Delivery Tracking**: Payment status, payment method, delivery status, shipping fields
- **Enhanced Database**: Products table, analytics fields, multi-language support

**🚧 TODO:**
- Search/Filter orders and buyers with export to CSV
- Email/Browser/Telegram notifications for clients
- Multi-language support (AR/FR/EN templates)
- Order editing & internal notes
- Password reset & email verification
- Public storefront for buyers to browse & order
- Algerian Wilaya/Commune dropdowns

## 📁 Project Structure

```
order-bot/
├── server/
│   ├── bot/
│   │   ├── whatsapp.js       # WhatsApp bot using Baileys
│   │   ├── sms.js             # SMS sender (placeholder)
│   │   ├── workers.js         # BullMQ workers
│   │   └── index.js           # Bot entry point
│   ├── db/
│   │   ├── schema.sql         # Database schema
│   │   ├── index.js           # Database connection
│   │   └── migrate.js         # Migration script
│   ├── models/
│   │   ├── Client.js          # Client (seller) model
│   │   ├── Buyer.js           # Buyer (customer) model
│   │   ├── Order.js           # Order model
│   │   └── Message.js         # Message log model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── orders.js          # Order management
│   │   ├── buyers.js          # Buyer management
│   │   └── messages.js        # Message logs
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── queue/
│   │   └── index.js           # BullMQ queue setup
│   └── index.js               # Express server
├── client/
│   └── src/
│       └── pages/
│           ├── LoginPage.jsx       # Client login
│           ├── DashboardPage.jsx   # Admin dashboard
│           ├── ConfirmPage.jsx     # Order confirmation
│           └── ThankYouPage.jsx    # Confirmation success
└── README.md
```

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (for BullMQ)

### 2. Install Dependencies

```bash
cd order-bot

# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/order_bot
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
JWT_SECRET=your-super-secret-key
BASE_URL=http://localhost:3001
SMS_ENABLED=false
```

### 4. Database Setup

```bash
# Create database
createdb order_bot

# Run migrations
npm run db:migrate
```

### 5. Start Services

Terminal 1 - Backend Server:
```bash
npm run dev
```

Terminal 2 - WhatsApp Bot:
```bash
npm run bot
```

Terminal 3 - Frontend:
```bash
cd client
npm run dev
```

### 6. WhatsApp Setup

1. Run `npm run bot`
2. Scan the QR code with WhatsApp
3. Bot is now connected!

## 📖 Usage

### Order Flow (How It Works)

1. **Buyer places order** through client's online store (Facebook, Instagram, website)
2. **Order appears in client's dashboard** with "pending" status
3. **Bot detects new order** (checks every 30 seconds)
4. **Messages automatically scheduled**:
   - WhatsApp after 2 hours
   - SMS after 4 hours (backup)
5. **Buyer receives confirmation link** in both messages
6. **Buyer clicks link** → Opens confirmation page
7. **Buyer chooses action**: ✅ Approve / ❌ Decline / 🔄 Request Changes
8. **Dashboard updates in real-time** via WebSocket
9. **Client sees buyer's decision** and proceeds accordingly

### Integration with Client Stores

When a buyer completes checkout on your store, create an order via webhook or API:

```bash
POST /api/orders/webhook
Content-Type: application/json

{
  "client_id": 1,
  "order_number": "ORD001",
  "buyer": {
    "name": "John Doe",
    "phone": "+213555123456",
    "email": "john@example.com",
    "address": "123 Street, Algiers"
  },
  "product_name": "Product XYZ",
  "quantity": 2,
  "total_price": 5000
}
```

The bot will automatically handle the rest!

### Dashboard Access

1. Login at `http://localhost:3000/login`
2. View orders, buyers, and message logs
3. Real-time updates via WebSocket

## 🔧 GSM Modem Integration

To integrate with a GSM modem, edit `server/bot/sms.js`:

```javascript
import { SerialPort } from 'serialport';

async function sendViaGSMModem(phone, message) {
  const port = new SerialPort({
    path: '/dev/ttyUSB0',  // Your modem port
    baudRate: 9600
  });
  
  // Send AT commands
  port.write('AT+CMGF=1\r');
  // ... implement SMS sending logic
}
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new client
- `POST /api/auth/login` - Client login

### Orders
- `GET /api/orders` - Get all orders for client (protected)
- `POST /api/orders/webhook` - Create order from external store (public, for integration)
- `GET /api/orders/:id` - Get single order (protected)
- `GET /api/orders/confirm/:token` - Get order by token (public)
- `POST /api/orders/confirm/:token` - Update order status from confirmation page (public)

### Buyers
- `GET /api/buyers` - Get all buyers (protected)
- `POST /api/buyers` - Create buyer (protected)
- `GET /api/buyers/:id` - Get single buyer (protected)
- `PUT /api/buyers/:id` - Update buyer (protected)

### Messages
- `GET /api/messages` - Get message logs (protected)
- `GET /api/messages/order/:orderId` - Get order messages (protected)

## 🎨 Frontend Pages

- `/login` - Client authentication
- `/dashboard` - Admin dashboard with real-time updates
- `/confirm?token=xxx` - Public order confirmation page
- `/thank-you?status=xxx` - Success message after confirmation

## 🔐 Security

- JWT authentication for protected routes
- Unique confirmation tokens per order
- Password hashing with bcrypt
- Input validation on all endpoints

## 📊 Database Schema

- **clients**: Client (seller) accounts
- **buyers**: Buyers (customers) for each client
- **orders**: Orders with confirmation tokens
- **messages**: WhatsApp/SMS message logs

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Queue**: BullMQ + Redis
- **WhatsApp**: Baileys library
- **Frontend**: React + Vite
- **Real-time**: WebSocket

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

MIT
