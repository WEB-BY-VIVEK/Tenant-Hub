import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, BarChart3, CreditCard, Settings, Users, Activity, LogOut, AlertTriangle, MessageSquare, ShieldCheck, HelpCircle } from "lucide-react";
import { useGetCurrentSubscription, getGetCurrentSubscriptionQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { RechargeModal } from "@/components/recharge-modal";

function SubscriptionExpiredOverlay({ onRecharge }: { onRecharge: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="max-w-sm mx-auto text-center px-6 py-10 border rounded-xl shadow-xl bg-card">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Subscription Expired</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your clinic subscription has expired. Recharge now to continue accessing your dashboard and patient features.
        </p>
        <Button className="w-full" size="lg" onClick={onRecharge} data-testid="overlay-btn-recharge">
          <CreditCard className="h-4 w-4 mr-2" /> Recharge Now
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Need help? Contact support at support@clinicdigitalgrowth.in
        </p>
      </div>
    </div>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const isDoctor = user?.role === "doctor";

  const { data: subscriptionStatus } = useGetCurrentSubscription({
    query: {
      queryKey: getGetCurrentSubscriptionQueryKey(),
      enabled: isDoctor,
    },
  });

  const isExpired = isDoctor && subscriptionStatus && !subscriptionStatus.isActive;
  const isLinkActive = (href: string) => location === href;

  const doctorLinks = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/recharge", label: "Recharge", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help", icon: HelpCircle },
  ];

  const adminLinks = [
    { href: "/", label: "Overview", icon: Activity },
    { href: "/clinics", label: "Clinics", icon: Users },
    { href: "/inquiries", label: "Inquiries", icon: MessageSquare },
    { href: "/admins", label: "Admin Users", icon: ShieldCheck },
    { href: "/help", label: "Help", icon: HelpCircle },
  ];

  const links = user?.role === "super_admin" ? adminLinks : doctorLinks;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarContent>
            <div className="p-4">
              <h2 className="text-xl font-bold text-primary tracking-tight">CDG</h2>
              <p className="text-xs text-muted-foreground">{user?.role === "super_admin" ? "Admin Panel" : "Clinic Workspace"}</p>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {links.map((link) => (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton asChild isActive={isLinkActive(link.href)}>
                        <Link href={link.href} data-testid={`nav-${link.label.toLowerCase()}`}>
                          <link.icon className="w-4 h-4 mr-2" />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={logout} data-testid="nav-logout" className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isDoctor && subscriptionStatus?.daysRemaining !== null && subscriptionStatus?.daysRemaining !== undefined && subscriptionStatus.daysRemaining <= 7 && subscriptionStatus.isActive && (
              <div className="mx-3 mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <p className="font-semibold mb-1">⚠️ Subscription expiring soon</p>
                <p>{subscriptionStatus.daysRemaining} day{subscriptionStatus.daysRemaining !== 1 ? "s" : ""} remaining</p>
                <button
                  className="mt-2 text-amber-900 underline font-medium"
                  onClick={() => setRechargeOpen(true)}
                  data-testid="sidebar-btn-recharge"
                >
                  Recharge now →
                </button>
              </div>
            )}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
          <header className="h-14 border-b flex items-center px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="ml-auto flex items-center space-x-4">
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-y-auto relative">
            {children}
            {isExpired && location !== "/recharge" && (
              <SubscriptionExpiredOverlay onRecharge={() => setRechargeOpen(true)} />
            )}
          </div>
        </main>
      </div>

      <RechargeModal open={rechargeOpen} onOpenChange={setRechargeOpen} />
    </SidebarProvider>
  );
}
