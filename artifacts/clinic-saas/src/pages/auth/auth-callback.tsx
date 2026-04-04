import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Activity, Loader2, XCircle } from "lucide-react";
import { getSupabaseSession } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const exchangeToken = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const role = params.get("role") || "doctor";

        await new Promise((res) => setTimeout(res, 800));

        const session = await getSupabaseSession();
        if (!session) {
          setError("Could not get session from Google. Please try again.");
          return;
        }

        const res = await fetch(`${API_BASE}/api/auth/google-signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: session.access_token,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
            role,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Google sign-in failed on the server.");
          return;
        }

        setAuthContext(data.token, data.user);
        toast({ title: "Signed in with Google", description: `Welcome, ${data.user.name}` });

        if (data.user.role === "super_admin") {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    };

    exchangeToken();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign-in Failed</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Button onClick={() => setLocation("/login")} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-6">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Completing sign-in...</span>
        </div>
      </div>
    </div>
  );
}
