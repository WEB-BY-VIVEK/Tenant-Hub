import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ShieldCheck, Loader2, ArrowLeft, KeyRound, Eye, EyeOff, Lock, Users2
} from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { OtpModal } from "@/components/otp-modal";
import { isSupabaseConfigured, signInWithGoogle } from "@/lib/supabase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  secretKey: z.string().min(1, "Admin secret key is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", secretKey: "" },
  });

  const loginMutation = useLogin();

  const onLogin = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        if (data.user.role !== "super_admin") {
          toast({ variant: "destructive", title: "Access denied", description: "This login is for super-admins only." });
          return;
        }
        setAuthContext(data.token, data.user);
        toast({ title: "Welcome, Admin", description: "Logged in to the admin panel." });
        setLocation("/admin");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: (error.data as { error?: string })?.error || "Invalid credentials.",
        });
      },
    });
  };

  const onRegister = async (values: z.infer<typeof registerSchema>) => {
    setRegistering(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Registration failed", description: data.error || "Something went wrong." });
        return;
      }
      setAuthContext(data.token, data.user);
      toast({ title: "Admin account created", description: "Welcome to the admin panel." });
      setLocation("/admin");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not connect to server." });
    } finally {
      setRegistering(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      toast({
        variant: "destructive",
        title: "Google login not configured",
        description: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Google login.",
      });
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogle(`${window.location.origin}/auth/callback?role=super_admin`);
    } catch {
      toast({ variant: "destructive", title: "Google sign-in failed", description: "Please try again." });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-indigo-500 blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-8">
            <ShieldCheck className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Admin Panel</h1>
          <p className="text-slate-400 text-sm mb-10">Clinic Digital Growth</p>
          <div className="space-y-3 text-left">
            {[
              { icon: Users2, label: "Multi-clinic management" },
              { icon: ShieldCheck, label: "Full platform control" },
              { icon: Lock, label: "Secure restricted access" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <Icon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-8">Restricted. All access is logged.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">CDG Admin Panel</p>
              <p className="text-slate-500 text-xs">Vivek Digital Clinic Solutions</p>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white">Admin Sign In</h2>
            <p className="text-slate-400 text-sm mt-1">Authorised personnel only</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700 mb-6 h-10">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-sm"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-4">
              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium flex items-center gap-3"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-950 px-3 text-xs text-slate-500">or continue with email</span>
                </div>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm">Admin Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin@clinicgrowth.in"
                            type="email"
                            {...field}
                            data-testid="input-admin-email"
                            className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-300 text-sm">Password</FormLabel>
                          <button
                            type="button"
                            onClick={() => setOtpOpen(true)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="••••••••"
                              type={showPwd ? "text" : "password"}
                              {...field}
                              data-testid="input-admin-password"
                              className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPwd(!showPwd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                              tabIndex={-1}
                            >
                              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-900/30"
                    disabled={loginMutation.isPending}
                    data-testid="btn-admin-login"
                  >
                    {loginMutation.isPending
                      ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Sign In to Admin Panel
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Admin Name" {...field} data-testid="input-admin-reg-name"
                            className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 text-sm">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@example.com" type="email" {...field} data-testid="input-admin-reg-email"
                              className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 text-sm">Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} data-testid="input-admin-reg-phone"
                              className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm">Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Min. 6 characters" type="password" {...field} data-testid="input-admin-reg-password"
                            className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="secretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5" /> Admin Secret Key
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the admin secret key" type="password" {...field} data-testid="input-admin-reg-secret"
                            className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    disabled={registering}
                    data-testid="btn-admin-register"
                  >
                    {registering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Create Admin Account
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-5 border-t border-slate-800 flex justify-center">
            <Link href="/login" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-400 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Doctor Login
            </Link>
          </div>
        </div>
      </div>

      <OtpModal open={otpOpen} onOpenChange={setOtpOpen} />
    </div>
  );
}
