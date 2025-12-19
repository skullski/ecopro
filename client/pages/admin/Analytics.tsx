import { TrendingUp, DollarSign, ShoppingCart, Users, BarChart3, ArrowUpRight, ArrowDownRight, Activity, Zap } from "lucide-react";

export default function Analytics() {
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  const revenue = orders.reduce((s:any,o:any)=>s + (o.total||0), 0);
  const totalOrders = orders.length;
  const confirmedOrders = orders.filter((o:any) => o.status === 'confirmed').length;
  const conversionRate = totalOrders ? Math.round((confirmedOrders / totalOrders) * 100) : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-black dark:via-slate-900 dark:to-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl sm:text-2xl md:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Track your store performance in real-time</p>
        </div>

        {/* Primary Stats - Apple Style */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Revenue Card */}
          <div className="group relative bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:border-slate-300/50 dark:hover:border-slate-600 transition-all duration-300">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 group-hover:from-emerald-500/30 group-hover:to-emerald-600/20 transition-all">
                <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                23%
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium mb-0.5">Revenue</p>
            <p className="text-2xl sm:text-xl md:text-2xl lg:text-lg md:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">${revenue.toFixed(2)}</p>
          </div>

          {/* Orders Card */}
          <div className="group relative bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:border-slate-300/50 dark:hover:border-slate-600 transition-all duration-300">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all">
                <ShoppingCart className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                12%
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium mb-0.5">Total Orders</p>
            <p className="text-2xl sm:text-xl md:text-2xl lg:text-lg md:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{totalOrders}</p>
          </div>

          {/* Conversion Card */}
          <div className="group relative bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:border-slate-300/50 dark:hover:border-slate-600 transition-all duration-300">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all">
                <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-semibold bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                2%
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium mb-0.5">Conversion</p>
            <p className="text-2xl sm:text-xl md:text-2xl lg:text-lg md:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{conversionRate}%</p>
          </div>

          {/* Active Users Card */}
          <div className="group relative bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:border-slate-300/50 dark:hover:border-slate-600 transition-all duration-300">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 group-hover:from-orange-500/30 group-hover:to-orange-600/20 transition-all">
                <Users className="h-5 sm:h-6 w-5 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                15%
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium mb-0.5">Active Users</p>
            <p className="text-2xl sm:text-xl md:text-2xl lg:text-lg md:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{Math.floor(totalOrders * 0.7)}</p>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid gap-4 lg:gap-3 md:gap-4 lg:grid-cols-3 mb-6">
          {/* Order Status Summary */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur rounded-lg md:rounded-2xl p-3 md:p-4 lg:p-3 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Order Status</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Confirmed */}
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-500/10 dark:to-green-500/5 border border-green-200/50 dark:border-green-500/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">Confirmed</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">{confirmedOrders}</span>
              </div>

              {/* Pending */}
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-50 to-yellow-50/50 dark:from-yellow-500/10 dark:to-yellow-500/5 border border-yellow-200/50 dark:border-yellow-500/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-yellow-500"></div>
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">Pending</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {orders.filter((o:any) => o.status === 'pending').length}
                </span>
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-500/10 dark:to-red-500/5 border border-red-200/50 dark:border-red-500/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-500"></div>
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">Cancelled</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                  {orders.filter((o:any) => o.status === 'failed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 md:p-4 lg:p-3 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                <Zap className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Quick Stats</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700/50">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Order Value</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  ${totalOrders ? (revenue / totalOrders).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700/50">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Success Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {totalOrders ? Math.round((confirmedOrders / totalOrders) * 100) : 0}%
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">${revenue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-500/10 dark:to-blue-500/5 rounded-2xl md:rounded-2xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-500/20">
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            <span className="font-semibold">💡 Pro Tip:</span> Your dashboard updates in real-time. Check back frequently to monitor your store's performance and identify trends.
          </p>
        </div>
      </div>
    </div>
  );
}
