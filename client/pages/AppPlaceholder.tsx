import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getCurrentUser, authApi } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { User, Mail, Calendar, ShoppingBag, Package, TrendingUp, LogOut, Settings } from "lucide-react";

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
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("dashboard.welcome")}, {user.name}!
            </h1>
            <p className="mt-2 text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              {t("settings")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t("auth.logout")}
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t("dashboard.accountInfo")}
            </CardTitle>
            <CardDescription>{t("dashboard.accountDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t("auth.name")}</span>
              <span className="text-lg font-semibold">{user.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t("auth.email")}</span>
              <span className="text-lg font-semibold">{user.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t("dashboard.accountType")}</span>
              <Badge className="w-fit mt-1" variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? t("admin") : user.role === 'vendor' ? t("vendor") : t("customer")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.totalOrders")}</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.noOrdersYet")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.activeProducts")}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.startSelling")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.totalRevenue")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 {t("currency")}</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.allTime")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions")}</CardTitle>
            <CardDescription>{t("dashboard.quickActionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link to="/store">
              <Button>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t("menu.store")}
              </Button>
            </Link>
            {user.role === 'vendor' && (
              <Link to="/vendor/dashboard">
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  {t("vendor.dashboard")}
                </Button>
              </Link>
            )}
            <Link to="/">
              <Button variant="ghost">{t("back")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
