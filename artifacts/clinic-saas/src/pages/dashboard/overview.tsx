import { useState } from "react";
import { useGetDashboardToday, useGetQueueSummary, useGetTokenQueue, useListAppointments, useUpdateTokenStatus, useUpdateAppointment, UpdateTokenStatusBodyStatus, UpdateAppointmentBodyStatus } from "@workspace/api-client-react";
import { getGetDashboardTodayQueryKey, getGetQueueSummaryQueryKey, getGetTokenQueueQueryKey, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, CheckCircle2, AlertCircle, PlayCircle, SkipForward, XCircle, Ticket, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("queue");
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dashboard, isLoading: loadingDash } = useGetDashboardToday();
  const { data: queueSummary, isLoading: loadingSummary } = useGetQueueSummary({ query: { queryKey: getGetQueueSummaryQueryKey() } });
  const { data: tokenQueue, isLoading: loadingQueue } = useGetTokenQueue({ date: todayStr }, { query: { queryKey: getGetTokenQueueQueryKey({ date: todayStr }) } });
  const { data: appointments, isLoading: loadingAppts } = useListAppointments({ date: todayStr }, { query: { queryKey: getListAppointmentsQueryKey({ date: todayStr }) } });

  const updateToken = useUpdateTokenStatus();
  const updateAppointment = useUpdateAppointment();

  const handleUpdateToken = (tokenId: number, status: UpdateTokenStatusBodyStatus) => {
    updateToken.mutate(
      { tokenId, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardTodayQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetQueueSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTokenQueueQueryKey({ date: todayStr }) });
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey({ date: todayStr }) });
          toast({ title: "Status updated successfully" });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Failed to update", description: err.data?.error || "An error occurred" });
        }
      }
    );
  };

  const handleCancelAppointment = (appointmentId: number) => {
    updateAppointment.mutate(
      { appointmentId, data: { status: "cancelled" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey({ date: todayStr }) });
          toast({ title: "Appointment cancelled" });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Failed to cancel", description: err.data?.error || "An error occurred" });
        }
      }
    );
  };

  if (loadingDash || loadingSummary || loadingQueue || loadingAppts) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSubExpired = dashboard?.subscriptionStatus.isActive === false;
  const isSubExpiringSoon = dashboard?.subscriptionStatus.daysRemaining !== null && 
                            dashboard?.subscriptionStatus.daysRemaining !== undefined && 
                            dashboard?.subscriptionStatus.daysRemaining <= 14;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today's Overview</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          {dashboard?.subscriptionStatus && (
             <Badge variant={isSubExpired ? "destructive" : isSubExpiringSoon ? "secondary" : "default"} className="px-3 py-1">
               {isSubExpired 
                 ? "Subscription Expired" 
                 : isSubExpiringSoon 
                   ? `Expires in ${dashboard.subscriptionStatus.daysRemaining} days` 
                   : "Active Subscription"}
             </Badge>
          )}
          {(isSubExpired || isSubExpiringSoon) && (
            <Link href="/recharge">
              <Button size="sm" variant={isSubExpired ? "default" : "outline"} data-testid="btn-renew-sub">
                Renew Now
              </Button>
            </Link>
          )}
        </div>
      </div>

      {(isSubExpired) && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg flex items-start gap-3 border border-destructive/20">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Subscription Expired</h3>
            <p className="text-sm mt-1">Your clinic's subscription has expired. Some features may be restricted. Please recharge to continue using all features.</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalAppointmentsToday || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.waitingToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated wait: {queueSummary?.estimatedWaitMinutes || 0} mins
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Current Token</CardTitle>
            <Ticket className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{dashboard?.currentToken || "--"}</div>
            {dashboard?.nextToken && (
              <p className="text-xs text-primary-foreground/80 mt-1">
                Next: {dashboard.nextToken}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.completedToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time: {dashboard?.totalPatientsAllTime || 0} patients
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Queue Area */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="queue">Live Queue</TabsTrigger>
                <TabsTrigger value="appointments">All Appointments ({appointments?.length || 0})</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Live</span>
              </div>
            </div>
            
            <TabsContent value="queue" className="mt-0 border rounded-lg overflow-hidden bg-card">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" /> 
                  Waiting Room Status
                </h3>
              </div>
              <div className="divide-y">
                {!tokenQueue || tokenQueue.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Ticket className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No tokens in queue right now.</p>
                  </div>
                ) : (
                  tokenQueue.map((token) => (
                    <div key={token.id} className={`p-4 flex items-center justify-between ${token.status === 'called' ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          token.status === 'called' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {token.tokenNumber}
                        </div>
                        <div>
                          <p className="font-medium">{token.appointment?.patientName || "Walk-in Patient"}</p>
                          <p className="text-sm text-muted-foreground">{token.appointment?.timeSlot || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {token.status === 'waiting' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateToken(token.id, "called")}
                            disabled={updateToken.isPending}
                            data-testid={`btn-call-token-${token.id}`}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" /> Call
                          </Button>
                        )}
                        {token.status === 'called' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateToken(token.id, "skipped")}
                              disabled={updateToken.isPending}
                              data-testid={`btn-skip-token-${token.id}`}
                            >
                              <SkipForward className="h-4 w-4 mr-1" /> Skip
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleUpdateToken(token.id, "completed")}
                              disabled={updateToken.isPending}
                              data-testid={`btn-complete-token-${token.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Done
                            </Button>
                          </>
                        )}
                        {(token.status === 'skipped' || token.status === 'completed') && (
                          <Badge variant={token.status === 'completed' ? 'outline' : 'secondary'} className="capitalize">
                            {token.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="appointments" className="mt-0 border rounded-lg overflow-hidden bg-card">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {!appointments || appointments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No appointments scheduled for today.</p>
                  </div>
                ) : (
                  appointments.map((appt) => (
                    <div key={appt.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{appt.patientName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {appt.timeSlot}</span>
                          <span>•</span>
                          <span>{appt.patientPhone}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {appt.status.replace("_", " ")}
                        </Badge>
                        {(appt.status === "waiting" || appt.status === "rescheduled") && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleCancelAppointment(appt.id)}
                            disabled={updateAppointment.isPending}
                            title="Cancel Appointment"
                            data-testid={`btn-cancel-appt-${appt.id}`}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t bg-muted/20 text-center">
                <Link href="/appointments">
                  <Button variant="link" size="sm" className="text-primary h-auto p-0">
                    View all appointments
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Queue Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Tokens</span>
                <span className="font-medium">{queueSummary?.totalTokens || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Waiting</span>
                <span className="font-medium">{queueSummary?.waitingCount || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Called</span>
                <span className="font-medium">{queueSummary?.calledCount || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-emerald-600">{queueSummary?.completedCount || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Skipped</span>
                <span className="font-medium text-amber-600">{queueSummary?.skippedCount || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/appointments" className="w-full">
                <Button variant="outline" className="w-full justify-start" data-testid="btn-quick-manage-appts">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Manage Appointments
                </Button>
              </Link>
              <Link href="/settings" className="w-full">
                <Button variant="outline" className="w-full justify-start" data-testid="btn-quick-settings">
                  <Users className="mr-2 h-4 w-4" /> Clinic Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
