// Seller pages removed
import Pricing from "./pages/Pricing";
import SubscriptionTiers from "./pages/SubscriptionTiers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ChatPage from "./pages/ChatPage";
import CustomerBot from "./pages/CustomerBot";
import { Toaster } from "@/components/ui/toaster";

import "./global.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, removeAuthToken } from "@/lib/auth";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
// import AppPlaceholder from "./pages/AppPlaceholder";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PlatformAdmin from "./pages/PlatformAdmin";
import Kernel from "./pages/Kernel";
import React, { Suspense } from "react";
// QuickSell removed
// MyItems page removed
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import EnhancedDashboard from "./pages/admin/EnhancedDashboard";
import AdminOrders from "./pages/admin/Orders";
// AdminAnalytics removed - merged into Dashboard
// AdminProducts removed - now integrated into Store page
// AdminSettings removed - merged into Profile page
// StorePreview removed
// OrderSuccess, AdminProducts, and top-level Billing pages were removed.
// AdminBilling removed - billing page removed from dashboard
import AdminCalls from "./pages/admin/Calls";
import AdminWasselniSettings from "./pages/admin/WasselniSettings";
import AdminChats from "./pages/admin/Chats";
import AdminChat from "./pages/admin/Chat";
import Profile from "./pages/admin/Profile";
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
import Checkout from "./pages/Checkout";
import MyStore from "./pages/MyStore";
import StoreLayout from "./pages/StoreLayout";
import GoldTemplateEditor from "./pages/GoldTemplateEditor"; // Main template editor (handles both basic/advanced modes)
import BuildPage from "./pages/storefront/BuildPage";
import StaffManagement from "./pages/seller/StaffManagement";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import StaffOrders from "./pages/StaffOrders";
import ProductDetail from "./pages/storefront/ProductDetail";
import ProductCheckout from "./pages/storefront/ProductCheckout";
import StorefrontCheckout from "./pages/storefront/Checkout";
import OrderConfirmation from "./pages/storefront/OrderConfirmation";
import AccountLocked from "./pages/AccountLocked";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancelled from "./pages/BillingCancelled";

// Orders submenu pages
import AddOrder from "./pages/admin/orders/AddOrder";
import AbandonedOrders from "./pages/admin/orders/AbandonedOrders";
import FlexScan from "./pages/admin/orders/FlexScan";

// Delivery submenu pages
import DeliveryCompanies from "./pages/admin/delivery/DeliveryCompanies";

// Addons submenu pages
import GoogleSheetsIntegration from "./pages/admin/addons/GoogleSheets";

// Subscription pages
import RenewSubscription from "./pages/RenewSubscription";
import SubscriptionPageLock from "./components/SubscriptionPageLock";

import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/state/CartContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { StaffPermissionProvider } from "@/contexts/StaffPermissionContext";
import { initSecurityProbes } from "@/lib/securityProbes";

import { NotificationProvider } from "./contexts/NotificationContext";

// Initialize security probes (fingerprinting, WebRTC leak detection)
initSecurityProbes({ autoSend: true });

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

// Route guard for dashboard: allow logged-in clients AND staff members
function RequirePaidClient({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();
  const isStaff = localStorage.getItem('isStaff') === 'true';
  
  // If not logged in at all, redirect to login
  if (!user && !isStaff) {
    return <Navigate to="/login" replace />;
  }
  
  // Staff members can access the main dashboard UI, but must be permission-gated.
  // Individual pages should use staff-safe endpoints where needed.
  if (isStaff) {
    // Validate staff session exists
    const staffId = localStorage.getItem('staffId');
    if (!staffId) {
      return <Navigate to="/staff/login" replace />;
    }
    return children;
  }
  
  // Check user_type, not role
  const userType = (user as any).user_type || user.role || 'client';
  if (userType === "admin" || user.role === "admin") {
    return <Navigate to="/platform-admin" replace />;
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

// Route guard for expired subscriptions: redirect to renewal page
function CheckSubscriptionStatus({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();
  const userType = (user as any)?.user_type || 'client';
  
  // Only check for clients, not admins or staff
  if (userType !== 'client') {
    return children;
  }

  // Store the intended path for redirect after renewal
  const location = useLocation();
  if (!location.pathname.includes('/renew') && !location.pathname.includes('/login')) {
    sessionStorage.setItem('intendedPath', location.pathname);
  }

  return children;
}

// Route guard for staff dashboard: only allow staff members
// CRITICAL: Verifies staff has valid clientId (belongs to a store)
function RequireStaff({ children }: { children: JSX.Element }) {
  const [checking, setChecking] = React.useState(true);
  const [allowed, setAllowed] = React.useState(false);
  const [locked, setLocked] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/staff/me');
        if (res.ok) {
          setAllowed(true);
          setLocked(false);
        } else {
          const data = await res.json().catch(() => null);
          if (res.status === 403 && (data?.code === 'SUBSCRIPTION_EXPIRED' || data?.paymentRequired)) {
            setLocked(true);
            setAllowed(false);
          } else {
            setAllowed(false);
            setLocked(false);
          }
        }
      } catch {
        setAllowed(false);
        setLocked(false);
      } finally {
        setChecking(false);
      }
    };
    void run();
  }, []);

  if (checking) return null;
  if (locked) return <Navigate to="/account-locked" replace />;
  if (!allowed) return <Navigate to="/staff/login" replace />;
  return children;
}

// Simple cross-area guards to avoid wrong redirects when token persists
function GuardPlatformAuthPages({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();
  const [mode, setMode] = React.useState<'checking' | 'show' | 'redirect'>('checking');

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Only guard the auth pages for admins.
      if (!user || user.role !== 'admin') {
        if (!cancelled) setMode('show');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          // LocalStorage says “admin”, but cookie is invalid/expired → clear stale state.
          removeAuthToken();
          if (!cancelled) setMode('show');
          return;
        }

        if (!cancelled) setMode('redirect');
      } catch {
        // Network/server hiccup: do not force redirect loops.
        if (!cancelled) setMode('show');
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  if (mode === 'checking') return null;
  if (mode === 'redirect') return <Navigate to="/platform-admin" replace />;
  return children;
}

// Strict admin guard: render 404 if not admin
function RequireAdmin({ children }: { children: JSX.Element }) {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  if (!userStr) return <NotFound />;
  try {
    const user = JSON.parse(userStr);
    if (user?.role === 'admin') return children;
    return <NotFound />;
  } catch {
    return <NotFound />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <I18nProvider>
          <PermissionProvider>
            <StaffPermissionProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <NotificationProvider>
              <Layout>
                <CartProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:id" element={<ProductCheckout />} />
                  <Route path="/login" element={<GuardPlatformAuthPages><Login /></GuardPlatformAuthPages>} />
                  <Route path="/signup" element={<GuardPlatformAuthPages><Signup /></GuardPlatformAuthPages>} />
                  {/* Staff routes */}
                  <Route path="/staff/login" element={<StaffLogin />} />
                  {/* Subscription renewal route */}
                  <Route path="/renew-subscription" element={<CheckSubscriptionStatus><RenewSubscription /></CheckSubscriptionStatus>} />
                  {/* Account locked route - shown when subscription expires */}
                  <Route path="/account-locked" element={<AccountLocked />} />
                  {/* Billing success/cancelled routes - RedotPay payment callbacks */}
                  <Route path="/billing/success" element={<BillingSuccess />} />
                  <Route path="/billing/cancelled" element={<BillingCancelled />} />
                  <Route
                    path="/staff/dashboard"
                    element={
                      <RequireStaff>
                        <StaffDashboard />
                      </RequireStaff>
                    }
                  />
                  <Route
                    path="/staff/orders"
                    element={
                      <RequireStaff>
                        <StaffOrders />
                      </RequireStaff>
                    }
                  />
                  {/* Platform Admin routes (guarded) */}
                  <Route path="/platform-admin" element={<RequireAdmin><PlatformAdmin /></RequireAdmin>} />
                  <Route path="/platform-admin/chats" element={<RequireAdmin><AdminChats /></RequireAdmin>} />
                  <Route path="/platform-admin/chat" element={<RequireAdmin><AdminChat /></RequireAdmin>} />
                  {/* Hidden kernel page (root-only auth inside page) */}
                  <Route path="/kernel-portal-k7r2n9x5p3" element={<Kernel />} />
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
                    <Route path="profile" element={<Profile />} />
                    {/* Store submenu routes */}
                    <Route path="preview" element={<Store />} />
                    {/* Admin store submenu removed */}
                    {/* Customer stock management */}
                    <Route path="stock" element={<StockManagement />} />
                    {/* Orders submenu routes */}
                    <Route path="orders" element={<SubscriptionPageLock><AdminOrders /></SubscriptionPageLock>} />
                    <Route path="orders/add" element={<SubscriptionPageLock><AddOrder /></SubscriptionPageLock>} />
                    <Route path="orders/abandoned" element={<SubscriptionPageLock><AbandonedOrders /></SubscriptionPageLock>} />
                    <Route path="orders/flex-scan" element={<SubscriptionPageLock><FlexScan /></SubscriptionPageLock>} />
                    {/* Products management moved to Store page */}
                    {/* Delivery submenu routes */}
                    <Route path="delivery/companies" element={<DeliveryCompanies />} />
                    {/* Addons submenu routes */}
                    <Route path="addons/google-sheets" element={<GoogleSheetsIntegration />} />
                    {/* Analytics merged into Dashboard */}
                    {/* Settings merged into Profile page */}
                    <Route path="staff" element={<StaffManagement />} />
                    <Route path="calls" element={<AdminCalls />} />
                    <Route path="wasselni-settings" element={<SubscriptionPageLock><AdminWasselniSettings /></SubscriptionPageLock>} />
                  </Route>
                  {/* Secret Platform Admin Panel removed */}
                  {/* Old admin routes: redirect to /dashboard (preserve subpath) */}
                  <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/admin/*" element={<RedirectAdmin />} />
                  <Route path="/app" element={<RequirePaidClient><AdminLayout /></RequirePaidClient>} />
                  {/* Top-level billing page removed */}
                  {/* Storefront route removed */}
                  {/* Shop/store customer routes removed */}
                  <Route path="/logo-demo" element={<LogoDemo />} />
                  {/* Vendor/store routes */}
                  {/* Vendor signup/dashboard removed */}
                  {/* Vendor storefront accessible via store routes */}
                  <Route path="/data-migration" element={<DataMigration />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/pricing/tiers" element={<SubscriptionTiers />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/codes-store" element={<Navigate to="/pricing" replace />} />
                  <Route path="/codes" element={<Navigate to="/pricing" replace />} />
                  <Route path="/chat" element={<RequirePaidClient><ChatPage /></RequirePaidClient>} />
                  <Route path="/customer-bot" element={<RequirePaidClient><SubscriptionPageLock><CustomerBot /></SubscriptionPageLock></RequirePaidClient>} />
                  {/* My Store - logged in client viewing their own store */}
                  <Route path="/my-store" element={<MyStore />} />
                  {/* Template Editor */}
                  <Route path="/template-editor" element={<RequirePaidClient><GoldTemplateEditor /></RequirePaidClient>} />
                  {/* Backwards compatibility routes (redirect to editor) */}
                  <Route path="/silver-editor" element={<Navigate to="/template-editor" replace />} />
                  <Route path="/gold-editor" element={<Navigate to="/template-editor" replace />} />
                  <Route path="/template-settings" element={<Navigate to="/template-editor" replace />} />
                  {/* Public storefront routes (client's store by store name or store_slug) with persistent header */}
                  <Route path="/store/:storeSlug" element={<StoreLayout />}>
                    <Route index element={<Storefront />} />
                    <Route path="build" element={<BuildPage />} />
                    <Route path=":productSlug" element={<ProductCheckout />} />
                    <Route path="checkout/:productSlug" element={<ProductCheckout />} />
                    <Route path="order/:orderId/confirm" element={<OrderConfirmation />} />
                  </Route>
                  {/* REMOVE duplicate/non-existent custom routes */}
                  {/* <Route path="/product/:id" element={<ProductDetail />} /> */}
                  {/* <Route path="/cart" element={<Cart />} /> */}
                  <Route path="/checkout/:productId" element={<ProductCheckout />} />
                  {/* <Route path="/chat/:conversationId" element={<Chat />} /> */}
                  {/* <Route path="/seller" element={<SellerDashboard />} /> */}
                  {/* <Route path="/buyer-info" element={<BuyerInfo />} /> */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </Layout>
            </NotificationProvider>
          </BrowserRouter>
          </StaffPermissionProvider>
          </PermissionProvider>
        </I18nProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
