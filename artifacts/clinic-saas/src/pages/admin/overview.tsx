import { useGetAdminStats, useGetRevenueChart, useGetSubscriptionHealth } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Building2, CreditCard, Loader2, ArrowUpRight, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";

export default function AdminOverview() {
  const { data: stats, isLoading: loadingStats } = useGetAdminStats();
  const { data: revenueData, isLoading: loadingRev } = useGetRevenueChart({ query: { queryKey: ["admin", "revenueChart"] } });
  const { data: subHealth, isLoading: loadingHealth } = useGetSubscriptionHealth();

  if (loadingStats || loadingRev || loadingHealth) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">Monitor overall platform performance and subscription health.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-1" /> 
              {formatCurrency(stats?.monthlyRevenue || 0)} this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clinics</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeClinics || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {stats?.totalClinics || 0} total clinics
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDoctors || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered across all clinics
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subHealth?.activeRate ? Math.round(subHealth.activeRate) : 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active subscription rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly recurring revenue for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Health */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Subscription Health</CardTitle>
            <CardDescription>Status of all clinic subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                    <span>Active Subscriptions</span>
                  </div>
                  <span className="font-medium">{subHealth?.totalActive || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                    <span>Expiring This Week</span>
                  </div>
                  <span className="font-medium">{subHealth?.expiringThisWeek || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-destructive mr-2" />
                    <span>Expired</span>
                  </div>
                  <span className="font-medium">{subHealth?.totalExpired || 0}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Top Performing Clinics</h4>
                <div className="space-y-3">
                  {subHealth?.topClinics.map((clinic) => (
                    <div key={clinic.clinicId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {clinic.clinicName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{clinic.clinicName}</p>
                          <p className="text-xs text-muted-foreground">{clinic.plan || 'Free'} Plan</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{clinic.totalPatients} pts</div>
                    </div>
                  ))}
                  {(!subHealth?.topClinics || subHealth.topClinics.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No data available yet</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Area, AreaChart } from "recharts";