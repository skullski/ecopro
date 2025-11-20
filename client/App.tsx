import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import "./global.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import AppPlaceholder from "./pages/AppPlaceholder";
import NotFound from "./pages/NotFound";
import { I18nProvider } from "@/lib/i18n";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Product from "./pages/Product";
import Checkout from "./pages/Checkout";
import QuickSell from "./pages/QuickSell";
import MyItems from "./pages/MyItems";
import OrderSuccess from "./pages/OrderSuccess";
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import EnhancedDashboard from "./pages/admin/EnhancedDashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminAnalytics from "./pages/admin/Analytics";
import StoreSettings from "./pages/admin/StoreSettings";
import AdminSettings from "./pages/admin/Settings";
import StorePreview from "./pages/admin/StorePreview";
import Billing from "./pages/Billing";
import AdminBilling from "./pages/admin/Billing";
import Wasselni from "./pages/Wasselni";
import AdminWasselniSettings from "./pages/admin/WasselniSettings";
import AdminCalls from "./pages/admin/Calls";
import AdminStores from "./pages/admin/Stores";
import Storefront from "./pages/Storefront";
import CustomerDashboard from "./pages/customer/Dashboard";
import Marketplace from "./pages/Marketplace";
import CustomerLogin from "./pages/customer/Login";
import CustomerSignup from "./pages/customer/Signup";
import LogoDemo from "./pages/LogoDemo";
import VendorSignup from "./pages/VendorSignup";
import VendorDashboard from "./pages/VendorDashboard";
import VendorUpgrade from "./pages/VendorUpgrade";
import VendorStorefront from "./pages/VendorStorefront";
import DataMigration from "./pages/DataMigration";

// Store submenu pages
import StoreLogo from "./pages/admin/store/Logo";
import StoreTemplate from "./pages/admin/store/Template";
import StoreHomepage from "./pages/admin/store/Homepage";
import StoreContact from "./pages/admin/store/Contact";
import StoreFAQ from "./pages/admin/store/FAQ";
import StoreAbout from "./pages/admin/store/About";
import CheckoutSettings from "./pages/admin/store/CheckoutSettings";

// Orders submenu pages
import AddOrder from "./pages/admin/orders/AddOrder";
import WasselniOrders from "./pages/admin/orders/WasselniOrders";
import AbandonedOrders from "./pages/admin/orders/AbandonedOrders";
import FlexScan from "./pages/admin/orders/FlexScan";

// Delivery submenu pages
import DeliveryCompanies from "./pages/admin/delivery/DeliveryCompanies";

// Addons submenu pages
import GoogleSheetsIntegration from "./pages/admin/addons/GoogleSheets";

import { ThemeProvider } from "./contexts/ThemeContext";


const queryClient = new QueryClient();

function RedirectAdmin() {
  const loc = useLocation();
  const to = loc.pathname.replace(/^\/admin/, "/dashboard");
  return <Navigate to={to} replace />;
}

// Route guard for dashboard: only allow paid clients
function RequirePaidClient({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.is_paid_client) {
    return <Navigate to="/vendor/upgrade" replace />;
  }
  return children;
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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/quick-sell" element={<QuickSell />} />
              <Route path="/my-items" element={<MyItems />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />

              {/* Vendor Dashboard - For clients who create stores (current "admin" panel) */}
              <Route path="/dashboard" element={
                <RequirePaidClient>
                  <AdminLayout />
                </RequirePaidClient>
              }>
                <Route index element={<AdminDashboard />} />
                {/* Store submenu routes */}
                <Route path="store/logo" element={<StoreLogo />} />
                <Route path="store/homepage" element={<StoreHomepage />} />
                <Route path="store/contact" element={<StoreContact />} />
                <Route path="store/faq" element={<StoreFAQ />} />
                <Route path="store/about" element={<StoreAbout />} />
                <Route path="store/checkout-settings" element={<CheckoutSettings />} />
                {/* Orders submenu routes */}
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/add" element={<AddOrder />} />
                <Route path="orders/wasselni" element={<WasselniOrders />} />
                <Route path="orders/abandoned" element={<AbandonedOrders />} />
                <Route path="orders/flex-scan" element={<FlexScan />} />
                {/* Products routes */}
                <Route path="products" element={<AdminProducts />} />
                {/* Delivery submenu routes */}
                <Route path="delivery/companies" element={<DeliveryCompanies />} />
                {/* Addons submenu routes */}
                <Route path="addons/google-sheets" element={<GoogleSheetsIntegration />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="preview" element={<StorePreview />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="stores" element={<AdminStores />} />
                <Route path="store/:id/settings" element={<StoreSettings />} />
                <Route path="billing" element={<AdminBilling />} />
                <Route path="wasselni-settings" element={<AdminWasselniSettings />} />
                <Route path="calls" element={<AdminCalls />} />
              </Route>

              {/* Secret Platform Admin Panel - For platform owner ONLY */}
              <Route path="/platform-control-x9k2m8p5q7w3" element={<AppPlaceholder />} />

              {/* Old admin routes: redirect to /dashboard (preserve subpath) */}
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/*" element={<RedirectAdmin />} />
              <Route path="/app" element={<AdminLayout />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/wasselni" element={<Wasselni />} />
              <Route path="/s/:id" element={<Storefront />} />
              <Route path="/shop/:id/dashboard" element={<CustomerDashboard />} />
              <Route path="/shop/:id/login" element={<CustomerLogin />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/shop/:id/signup" element={<CustomerSignup />} />
              <Route path="/logo-demo" element={<LogoDemo />} />
              {/* Vendor/Marketplace routes */}
              <Route path="/vendor/signup" element={<VendorSignup />} />
              <Route path="/vendor/upgrade" element={<VendorUpgrade />} />
              <Route path="/vendor/:id/dashboard" element={<VendorDashboard />} />
              <Route path="/marketplace/:vendorSlug" element={<VendorStorefront />} />
              <Route path="/data-migration" element={<DataMigration />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root")!;
// Persist root across HMR to avoid 'createRoot on same container' warning
declare global {
  interface Window {
    __APP_ROOT__?: ReturnType<typeof createRoot>;
  }
}
if (!window.__APP_ROOT__) {
  window.__APP_ROOT__ = createRoot(container);
}
window.__APP_ROOT__.render(<App />);
