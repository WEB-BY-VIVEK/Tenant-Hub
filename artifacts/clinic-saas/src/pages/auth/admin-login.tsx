import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ShieldCheck, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SiteFooter } from "@/components/site-footer";

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
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "This login is for super-admins only.",
          });
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-white font-bold text-2xl tracking-tight">
              <ShieldCheck className="h-8 w-8 text-blue-400" />
              <span>CDG Admin</span>
            </div>
          </div>

          <Card className="shadow-2xl border border-slate-700 bg-slate-800 text-white">
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-white">Admin Panel</CardTitle>
              <CardDescription className="text-center text-slate-400">
                Super-admin access only. Authorised personnel only.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700 mb-6">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">Admin Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="admin@clinicgrowth.in"
                                type="email"
                                {...field}
                                data-testid="input-admin-email"
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400"
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
                            <FormLabel className="text-slate-300">Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="••••••••"
                                type="password"
                                {...field}
                                data-testid="input-admin-password"
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
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
                            <FormLabel className="text-slate-300">Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Admin Name"
                                {...field}
                                data-testid="input-admin-reg-name"
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400"
                              />
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
                              <FormLabel className="text-slate-300">Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="admin@example.com"
                                  type="email"
                                  {...field}
                                  data-testid="input-admin-reg-email"
                                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400"
                                />
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
                              <FormLabel className="text-slate-300">Phone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="9876543210"
                                  {...field}
                                  data-testid="input-admin-reg-phone"
                                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400"
                                />
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
                            <FormLabel className="text-slate-300">Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Min. 6 characters"
                                type="password"
                                {...field}
                                data-testid="input-admin-reg-password"
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400"
                              />
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
                            <FormLabel className="text-slate-300 flex items-center gap-1.5">
                              <KeyRound className="h-3.5 w-3.5" /> Admin Secret Key
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter the admin secret key"
                                type="password"
                                {...field}
                                data-testid="input-admin-reg-secret"
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={registering}
                        data-testid="btn-admin-register"
                      >
                        {registering
                          ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          : <ShieldCheck className="h-4 w-4 mr-2" />}
                        Create Admin Account
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-slate-700 p-4">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Doctor Login
              </Link>
            </CardFooter>
          </Card>

          <p className="text-center text-xs text-slate-500 mt-4">
            🔒 Restricted area. All access is logged and monitored.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-700">
        <SiteFooter />
      </div>
    </div>
  );
}
