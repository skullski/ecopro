// SellerSignup page removed
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { Toaster } from "@/components/ui/toaster";

import "./global.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
// import AppPlaceholder from "./pages/AppPlaceholder";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Marketplace from "./pages/Marketplace";
import Product from "./pages/Product";
import SellerLogin from "./pages/SellerLogin";
import SellerSignup from "./pages/SellerSignup";
import SellerDashboard from "./pages/SellerDashboard";
import PlatformAdmin from "./pages/PlatformAdmin";
import React, { Suspense } from "react";
// QuickSell removed
// MyItems page removed
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import EnhancedDashboard from "./pages/admin/EnhancedDashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminAnalytics from "./pages/admin/Analytics";
// StoreSettings removed
import AdminSettings from "./pages/admin/Settings";
// StorePreview removed
// OrderSuccess, AdminProducts, and top-level Billing pages were removed.
import AdminBilling from "./pages/admin/Billing";
import AdminCalls from "./pages/admin/Calls";
// AdminStores removed
// Storefront page removed
import LogoDemo from "./pages/LogoDemo";
// Vendor pages removed
import DataMigration from "./pages/DataMigration";
// PostItem and MyListings pages removed

// Admin store pages removed

// Customer pages
import StockManagement from "./pages/customer/StockManagement";
import Store from "./pages/customer/Store";
import PublicProduct from "./pages/PublicProduct";
import Storefront from "./pages/Storefront";
import MyStore from "./pages/MyStore";

// Orders submenu pages
import AddOrder from "./pages/admin/orders/AddOrder";
import AbandonedOrders from "./pages/admin/orders/AbandonedOrders";
import FlexScan from "./pages/admin/orders/FlexScan";

// Delivery submenu pages
import DeliveryCompanies from "./pages/admin/delivery/DeliveryCompanies";

// Addons submenu pages
import GoogleSheetsIntegration from "./pages/admin/addons/GoogleSheets";

import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/state/CartContext";
// REMOVE non-existent pages to avoid build errors
// import ProductDetail from "@/pages/ProductDetail";
// import Cart from "@/pages/Cart";
// import Checkout from "@/pages/Checkout";
// import Chat from "@/pages/Chat";
// import SellerDashboard from "@/pages/SellerDashboard";
// import BuyerInfo from "@/pages/BuyerInfo";

const queryClient = new QueryClient();

function RedirectAdmin() {
  const loc = useLocation();
  const to = loc.pathname.replace(/^\/admin/, "/dashboard");
  return <Navigate to={to} replace />;
}

// Route guard for dashboard: only allow logged-in clients (NOT sellers or admins)
function RequirePaidClient({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Check user_type, not role
  const userType = (user as any).user_type || 'client';
  if (userType === "admin" || user.role === "admin") {
    return <Navigate to="/platform-admin" replace />;
  }
  if (userType === "seller") {
    return <Navigate to="/seller/dashboard" replace />;
  }
  return children;
}

function RequireClient({ children }: { children: JSX.Element }) {
  // Vendor role and vendor-dashboard removed — allow clients through.
  return children;
}

function RequireVendor({ children }: { children: JSX.Element }) {
  // Vendor flows removed — treat this as a no-op guard to avoid redirects.
  return children;
}

// Route guard for seller dashboard: only allow sellers
function RequireSeller({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/seller/login" replace />;
  }
  // Check user_type, not role
  const userType = (user as any).user_type || 'client';
  if (userType === "admin" || user.role === "admin") {
    return <Navigate to="/platform-admin" replace />;
  }
  if (userType !== "seller") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Inline guest checkout page (no new file)
function GuestCheckout() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const [state, setState] = React.useState({
    loading: true,
    product: null as any,
    submitted: null as any,
    error: "" as string,
  });
  const [form, setForm] = React.useState({
    shipping_name: "",
    shipping_line1: "",
    shipping_line2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal_code: "",
    shipping_country: "",
    shipping_phone: "",
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error(await res.text());
        const product = await res.json();
        setState((s) => ({ ...s, product, loading: false }));
      } catch (e: any) {
        setState((s) => ({ ...s, error: e.message || "Failed to load", loading: false }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState((s) => ({ ...s, error: "", submitted: null }));
    try {
      const res = await fetch("/api/guest/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, ...form }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setState((s) => ({ ...s, submitted: data }));
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message || "Failed to place order" }));
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (state.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (state.error && !state.product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">Error: {state.error}</div>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const p = state.product;
  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Marketplace
          </button>
          <h1 className="text-3xl font-bold mb-2">Guest Checkout</h1>
          <p className="text-muted-foreground">Complete your order without creating an account</p>
        </div>

        {!state.submitted ? (
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Left Column - Order Summary */}
            <div className="space-y-6">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="flex gap-4">
                  {p?.images?.[0] ? (
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      className="w-24 h-24 object-cover rounded-lg border" 
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{p?.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{p?.description}</p>
                    <div className="text-2xl font-bold text-primary">${Number(p?.price ?? 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${Number(p?.price ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">{p?.shipping_available ? 'Free' : 'Calculated at shipping'}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${Number(p?.price ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Buyer Protection</div>
                    <p className="text-blue-700 dark:text-blue-300">Your order is protected. The seller will receive your shipping information to fulfill your order.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Shipping Form */}
            <div>
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                {state.error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-red-800 dark:text-red-200">{state.error}</div>
                    </div>
                  </div>
                )}
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="John Doe"
                      value={form.shipping_name}
                      onChange={set("shipping_name")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="123 Main Street"
                      value={form.shipping_line1}
                      onChange={set("shipping_line1")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 2</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={form.shipping_line2}
                      onChange={set("shipping_line2")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="New York"
                        value={form.shipping_city}
                        onChange={set("shipping_city")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State/Region</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="NY"
                        value={form.shipping_state}
                        onChange={set("shipping_state")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="10001"
                        value={form.shipping_postal_code}
                        onChange={set("shipping_postal_code")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="USA"
                        value={form.shipping_country}
                        onChange={set("shipping_country")}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="+1 (555) 000-0000"
                      value={form.shipping_phone}
                      onChange={set("shipping_phone")}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Place Order
                  </button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our terms of service and privacy policy
                  </p>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Your order <span className="font-mono font-semibold text-foreground">#{state.submitted.id}</span> has been placed. 
                The seller has received your shipping information and will contact you soon.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3 text-left">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">What happens next?</div>
                    <p className="text-muted-foreground">The seller will prepare your order and reach out to arrange delivery or payment details.</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/seller/login')}
                  className="px-6 py-2.5 border border-border font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  Are you a seller? Sign in
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <I18nProvider>
          <BrowserRouter>
            <Layout>
              <CartProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  {/* Seller routes */}
                  <Route path="/seller/login" element={<SellerLogin />} />
                  <Route path="/seller/signup" element={<SellerSignup />} />
                  <Route
                    path="/seller/dashboard"
                    element={
                      <RequireSeller>
                        <SellerDashboard />
                      </RequireSeller>
                    }
                  />
                  {/* Platform Admin route */}
                  <Route path="/platform-admin" element={<PlatformAdmin />} />
                  {/* /seller-signup removed */}
                  {/* /quick-sell removed */}
                  {/* /my-items removed */}

                  {/* /post-item and /my-listings removed */}
                  {/* Vendor Dashboard - For clients who create stores (current "admin" panel) */}
                  <Route
                    path="/dashboard"
                    element={
                      <RequirePaidClient>
                        <AdminLayout />
                      </RequirePaidClient>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    {/* Store submenu routes */}
                    <Route path="preview" element={<Store />} />
                    {/* Admin store submenu removed */}
                    {/* Customer stock management */}
                    <Route path="stock" element={<StockManagement />} />
                    {/* Orders submenu routes */}
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/add" element={<AddOrder />} />
                    <Route path="orders/abandoned" element={<AbandonedOrders />} />
                    <Route path="orders/flex-scan" element={<FlexScan />} />
                    {/* Products routes removed */}
                    {/* Delivery submenu routes */}
                    <Route path="delivery/companies" element={<DeliveryCompanies />} />
                    {/* Addons submenu routes */}
                    <Route path="addons/google-sheets" element={<GoogleSheetsIntegration />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    {/* Admin store preview/stores/settings removed */}
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="billing" element={<AdminBilling />} />
                    <Route path="calls" element={<AdminCalls />} />
                  </Route>
                  {/* Secret Platform Admin Panel removed */}
                  {/* Old admin routes: redirect to /dashboard (preserve subpath) */}
                  <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/admin/*" element={<RedirectAdmin />} />
                  <Route path="/app" element={<AdminLayout />} />
                  {/* Top-level billing page removed */}
                  {/* Storefront route removed */}
                  {/* Shop/store customer routes removed */}
                  <Route path="/logo-demo" element={<LogoDemo />} />
                  {/* Vendor/store routes */}
                  {/* Vendor signup/dashboard removed */}
                  {/* Vendor storefront accessible via store routes */}
                  <Route path="/data-migration" element={<DataMigration />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  {/* Guest checkout route (public, no account needed) */}
                  <Route path="/guest-checkout/:productId" element={<GuestCheckout />} />
                  {/* My Store - logged in client viewing their own store */}
                  <Route path="/my-store" element={<MyStore />} />
                  {/* Public storefront routes (client's store) */}
                  <Route path="/store/:clientId" element={<Storefront />} />
                  <Route path="/store/:clientId/:slug" element={<PublicProduct />} />
                  {/* REMOVE duplicate/non-existent custom routes */}
                  {/* <Route path="/product/:id" element={<ProductDetail />} /> */}
                  {/* <Route path="/cart" element={<Cart />} /> */}
                  {/* <Route path="/checkout/:productId" element={<Checkout />} /> */}
                  {/* <Route path="/chat/:conversationId" element={<Chat />} /> */}
                  {/* <Route path="/seller" element={<SellerDashboard />} /> */}
                  {/* <Route path="/buyer-info" element={<BuyerInfo />} /> */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </Layout>
          </BrowserRouter>
        </I18nProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
