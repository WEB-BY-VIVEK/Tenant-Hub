import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, BarChart3, CreditCard, Settings, Users, Activity, LogOut } from "lucide-react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isLinkActive = (href: string) => location === href;

  const doctorLinks = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/recharge", label: "Recharge", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const adminLinks = [
    { href: "/", label: "Overview", icon: Activity },
    { href: "/clinics", label: "Clinics", icon: Users },
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
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <header className="h-14 border-b flex items-center px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="ml-auto flex items-center space-x-4">
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
