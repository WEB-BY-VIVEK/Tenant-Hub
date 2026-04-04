import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Circle, UserCheck, UserX, RefreshCw, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: string;
  isOnline: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "cdg_token";
const getToken = () => localStorage.getItem(TOKEN_KEY) ?? "";

function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ["admin", "admin-users"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/admin-users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch admin users");
      return res.json();
    },
    refetchInterval: 30000,
  });
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never logged in";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function AdminUsers() {
  const { data: admins, isLoading, refetch, isFetching } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const toggleStatus = async (id: number, name: string) => {
    setTogglingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/admin-users/${id}/toggle-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: data.error || "Something went wrong." });
        return;
      }
      toast({
        title: "Status updated",
        description: `${name} is now ${data.isActive === "active" ? "active" : "inactive"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "admin-users"] });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not connect to server." });
    } finally {
      setTogglingId(null);
    }
  };

  const totalAdmins = admins?.length ?? 0;
  const onlineAdmins = admins?.filter((a) => a.isOnline).length ?? 0;
  const activeAdmins = admins?.filter((a) => a.isActive === "active").length ?? 0;
  const inactiveAdmins = admins?.filter((a) => a.isActive === "inactive").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Users</h1>
          <p className="text-muted-foreground">Monitor all super-admin accounts, their activity and status.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAdmins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online Now</CardTitle>
            <Circle className="h-4 w-4 text-emerald-500 fill-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{onlineAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in last 15 min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeAdmins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Accounts</CardTitle>
            <UserX className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-500">{inactiveAdmins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admins Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Admin</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Live Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Login</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Registered On</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Account</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins && admins.length > 0 ? admins.map((admin) => (
                    <tr key={admin.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                              <ShieldCheck className="h-4 w-4 text-blue-600" />
                            </div>
                            {admin.isOnline && (
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {admin.id === currentUser?.id ? "You" : "Super Admin"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{admin.email}</div>
                        <div className="text-xs text-muted-foreground">{admin.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        {admin.isOnline ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1.5">
                            <Circle className="h-2 w-2 fill-emerald-500" />
                            Online
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1.5">
                            <Circle className="h-2 w-2 fill-slate-400" />
                            Offline
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatRelativeTime(admin.lastLoginAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {admin.isActive === "active" ? (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {admin.id === currentUser?.id ? (
                          <span className="text-xs text-muted-foreground italic">Current session</span>
                        ) : (
                          <Button
                            size="sm"
                            variant={admin.isActive === "active" ? "destructive" : "outline"}
                            disabled={togglingId === admin.id}
                            onClick={() => toggleStatus(admin.id, admin.name)}
                          >
                            {togglingId === admin.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : admin.isActive === "active" ? "Deactivate" : "Activate"
                            }
                          </Button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        No admin accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
