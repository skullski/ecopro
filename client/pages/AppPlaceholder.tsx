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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Platform Admin Control
              </h1>
            </div>
            <p className="mt-2 text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            {t("auth.logout")}
          </Button>
        </div>

        {/* Admin Badge */}
        <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Platform Administrator Access
            </CardTitle>
            <CardDescription>
              You have full control over the entire platform, all vendors, and system settings
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Registered store owners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Live storefronts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 {t("currency")}</div>
              <p className="text-xs text-muted-foreground">Subscription fees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Across all stores</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Vendor Management
              </CardTitle>
              <CardDescription>Manage all store owners and their accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View All Vendors
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                View All Stores
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Vendor Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure platform-wide settings and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                System Configuration
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Pricing & Billing
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Link to="/">
            <Button variant="ghost">{t("back")} to Homepage</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
