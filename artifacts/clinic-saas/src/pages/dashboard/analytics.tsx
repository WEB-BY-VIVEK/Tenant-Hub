import { useGetWeeklyStats, useGetPatientStats, useGetSubscriptionHistory } from "@workspace/api-client-react";
import { getGetWeeklyStatsQueryKey, getGetPatientStatsQueryKey, getGetSubscriptionHistoryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Users, UserPlus, Repeat, Activity, Loader2, Calendar, Crown } from "lucide-react";
import { format } from "date-fns";

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader>
            <Skeleton className="h-5 w-44 mb-1" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-end gap-2 pb-4 px-4">
            <div className="flex items-end gap-3 h-[280px] w-full">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 items-center justify-end h-full">
                  <Skeleton className="w-full rounded" style={{ height: `${30 + Math.random() * 60}%` }} />
                  <Skeleton className="h-3 w-6 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { data: weeklyStats, isLoading: loadingWeekly } = useGetWeeklyStats({ query: { queryKey: getGetWeeklyStatsQueryKey() } });
  const { data: patientStats, isLoading: loadingPatients } = useGetPatientStats({ query: { queryKey: getGetPatientStatsQueryKey() } });
  const { data: subHistory, isLoading: loadingHistory } = useGetSubscriptionHistory({ query: { queryKey: getGetSubscriptionHistoryQueryKey() } });

  if (loadingWeekly || loadingPatients || loadingHistory) {
    return <AnalyticsSkeleton />;
  }

  // Format data for chart
  const chartData = weeklyStats?.map(stat => ({
    name: format(new Date(stat.date), "EEE"),
    Total: stat.appointments,
    Completed: stat.completed,
    Cancelled: stat.cancelled
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground">Insights into your clinic's performance and patient trends.</p>
      </div>

      {/* Patient Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientStats?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time registered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientStats?.newThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">New registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientStats?.newThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Repeat Patients</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientStats?.repeatPatients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Visited more than once</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Chart */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Weekly Appointments</CardTitle>
            <CardDescription>Appointment volume and completion status over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Completed" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>Past billing cycles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!subHistory || subHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Crown className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No subscription history.</p>
                </div>
              ) : (
                subHistory.map((sub, idx) => (
                  <div key={sub.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{sub.plan} Plan</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(sub.createdAt), "MMM d, yyyy")}
                      </p>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          sub.status === 'expired' ? 'bg-destructive/20 text-destructive' :
                          'bg-muted text-muted-foreground'
                        } capitalize`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
