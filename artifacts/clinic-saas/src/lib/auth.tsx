import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, UserProfile, setAuthTokenGetter } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

const TOKEN_KEY = "cdg_token";

setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  const login = (newToken: string, user: UserProfile) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    if (user.role === "super_admin") {
      setLocation("/admin");
    } else if (user.role === "doctor") {
      setLocation("/dashboard");
    } else {
      setLocation("/");
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserProfile["role"][];
}) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.replace("/login");
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === "super_admin") window.location.replace("/admin");
      else if (user.role === "doctor") window.location.replace("/dashboard");
      else window.location.replace("/");
    }
  }, [user, isLoading, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
