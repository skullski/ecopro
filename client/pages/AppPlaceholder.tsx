import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getCurrentUser, authApi } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Users, 
  Store, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Settings,
  BarChart3,
  Package
} from "lucide-react";
import Ghost from "@/components/ui/ghost";

export default function AppPlaceholder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    // Only platform admins can access this page
    if (currentUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authApi.logout();
  };


  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

    // Horror dark theme background and ghostly effects
    return (
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('/admin/1399550.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Animated ghost SVGs */}
        <Ghost className="absolute left-10 top-20 w-32 h-32 opacity-60 animate-float pointer-events-none" />
        <Ghost className="absolute right-20 top-40 w-24 h-24 opacity-40 animate-float delay-1000 pointer-events-none" />
        <Ghost className="absolute left-1/2 bottom-10 w-40 h-40 opacity-30 animate-float delay-2000 pointer-events-none" />
        {/* Horror background overlay */}
    {/* Dark overlay for horror readability */}
    <div className="absolute inset-0 bg-black/80 z-0" />
        <div className="relative z-10 w-full max-w-4xl mx-auto p-10 rounded-2xl shadow-2xl border border-purple-900 bg-black/80 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-10 h-10 text-purple-400 drop-shadow-glow" />
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-fuchsia-600 to-indigo-500 bg-clip-text text-transparent drop-shadow-glow">
                  Platform Admin Control
                </h1>
              </div>
              <p className="mt-2 text-purple-200 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-purple-300 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              {t("auth.logout")}
            </Button>
          </div>

          {/* Admin Badge */}
          <Card className="mb-6 border-2 border-purple-800/40 bg-gradient-to-br from-purple-900/40 to-black/60 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-200">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Platform Administrator Access
              </CardTitle>
              <CardDescription className="text-purple-300">
                You have full control over the entire platform, all vendors, and system settings
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-black/60 border-purple-900/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-200">Total Vendors</CardTitle>
                <Users className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0</div>
                <p className="text-xs text-purple-400">Registered store owners</p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-purple-900/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-200">Active Stores</CardTitle>
                <Store className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0</div>
                <p className="text-xs text-purple-400">Live storefronts</p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-purple-900/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-200">Platform Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0 {t("currency")}</div>
                <p className="text-xs text-purple-400">Subscription fees</p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-purple-900/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-200">Total Orders</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0</div>
                <p className="text-xs text-purple-400">Across all stores</p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/60 border-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-200">
                  <Users className="w-5 h-5 text-purple-400" />
                  Vendor Management
                </CardTitle>
                <CardDescription className="text-purple-400">Manage all store owners and their accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start bg-purple-950/60 text-purple-200 border-purple-800 hover:bg-purple-900/80" variant="outline">
                  <Users className="w-4 h-4 mr-2 text-purple-400" />
                  View All Vendors
                </Button>
                <Button className="w-full justify-start bg-purple-950/60 text-purple-200 border-purple-800 hover:bg-purple-900/80" variant="outline">
                  <Package className="w-4 h-4 mr-2 text-purple-400" />
                  View All Stores
                </Button>
                <Button className="w-full justify-start bg-purple-950/60 text-purple-200 border-purple-800 hover:bg-purple-900/80" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2 text-purple-400" />
                  Vendor Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-200">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Platform Settings
                </CardTitle>
                <CardDescription className="text-purple-400">Configure platform-wide settings and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start bg-purple-950/60 text-purple-200 border-purple-800 hover:bg-purple-900/80" variant="outline">
                  <Settings className="w-4 h-4 mr-2 text-purple-400" />
                  System Configuration
                </Button>
                <Button className="w-full justify-start bg-purple-950/60 text-purple-200 border-purple-800 hover:bg-purple-900/80" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2 text-purple-400" />
                  Pricing & Billing
                </Button>
                <Button className="w-full justify-start bg-purple-950/60 text-purple-200 border-purple-800 hover:bg-purple-900/80" variant="outline">
                  <ShieldCheck className="w-4 h-4 mr-2 text-purple-400" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Link to="/">
              <Button variant="ghost" className="text-purple-300 hover:text-white">{t("back")} to Homepage</Button>
            </Link>
          </div>
        </div>
      </section>
    );
}
