# Render Database Configuration

## Current Setup

Your EcoPro marketplace is now configured to use **Render PostgreSQL**:

### Database Connection
- **Host**: dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com
- **Port**: 5432
- **Database**: eco_db_drrv
- **User**: eco_db_drrv_user
- **Password**: `teCMT25hytwYFgWqpmg2Q0x97TJymRhs`
- **Connection String**: `postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com:5432/eco_db_drrv?sslmode=require`

### Tables Created
- ✅ `users` - User accounts (admin, sellers, clients)
- ✅ `marketplace_products` - Product listings
- ✅ `marketplace_orders` - Customer orders
- ✅ `store_products` - Legacy table
- ✅ `store_orders` - Legacy table

### Indexes Created
- `idx_marketplace_products_seller_id`
- `idx_marketplace_products_status`
- `idx_marketplace_products_category`
- `idx_marketplace_orders_seller_id`
- `idx_marketplace_orders_buyer_id`

### Default Admin User
- **Email**: admin@ecopro.com
- **Password**: admin123
- **Note**: Change in production!

## Environment Variables for Render

Set these in your Render Dashboard under "Environment":

```
DATABASE_URL=postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com:5432/eco_db_drrv?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
ALLOWED_ORIGINS=https://ecopro-1lbl.onrender.com
PORT=10000
```

## Server Startup Process

When the server starts, it automatically:

1. ✅ Connects to Render PostgreSQL
2. ✅ Initializes all database tables (CREATE TABLE IF NOT EXISTS)
3. ✅ Creates default admin user if not exists
4. ✅ Sets up performance indexes
5. ✅ Starts API server

## Testing Connection

To verify the database connection locally:

```bash
# Using the connection string from .env.local
npm run dev

# Check logs for:
# 🔄 Initializing database...
# ✅ Database tables initialized
# ✅ Default admin user created: admin@ecopro.com
# 🚀 API Server running on http://localhost:8080
```

## Current Users in Database

- `admin@ecopro.com` - Admin account
- `seller@ecopro.com` - Seller account
- `skull@gmail.com` - Test user
- Plus 5+ other test accounts

## API Endpoints Working

- ✅ POST `/api/auth/register` - User registration
- ✅ POST `/api/auth/login` - User login
- ✅ GET `/api/dashboard/stats` - Dashboard metrics
- ✅ GET `/api/products` - List marketplace products
- ✅ GET `/api/seller/products` - List seller products
- ✅ POST `/api/seller/products` - Create product
- ✅ GET `/api/seller/orders` - List seller orders
- ✅ POST `/api/guest/orders` - Create guest order
- ✅ GET `/api/ping` - Health check

## Important Notes

⚠️ **Before Production Deployment**:
1. Change `JWT_SECRET` to a strong random value
2. Change default admin password
3. Set `ALLOWED_ORIGINS` to your production domain
4. Enable HTTPS for all connections
5. Set up database backups in Render Dashboard
6. Monitor database usage and add indexes if needed

## Troubleshooting

**Connection refused?**
- Check DATABASE_URL is correct
- Verify `sslmode=require` is in connection string
- Check firewall allows connections

**Tables not created?**
- Check server logs for initialization errors
- Verify user has CREATE TABLE permissions

**Admin user not created?**
- Check if user with email `admin@ecopro.com` already exists
- Check server logs for bcrypt errors

## Next Steps

1. Deploy to Render using `render.yaml`
2. Set environment variables in Render Dashboard
3. Monitor deployment logs
4. Test admin login with credentials above
5. Create test products via API or admin dashboard
