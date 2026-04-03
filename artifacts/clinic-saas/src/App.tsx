import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/public/landing";
import Book from "@/pages/public/book";
import BookSuccess from "@/pages/public/book-success";
import TermsAndConditions from "@/pages/public/terms";
import RefundPolicy from "@/pages/public/refund-policy";
import Login from "@/pages/auth/login";
import AdminLogin from "@/pages/auth/admin-login";
import Register from "@/pages/auth/register";

// Doctor Dashboard
import DashboardOverview from "@/pages/dashboard/overview";
import Appointments from "@/pages/dashboard/appointments";
import Analytics from "@/pages/dashboard/analytics";
import Recharge from "@/pages/dashboard/recharge";
import Settings from "@/pages/dashboard/settings";

// Admin Panel
import AdminOverview from "@/pages/admin/overview";
import ClinicsList from "@/pages/admin/clinics";
import ClinicDetail from "@/pages/admin/clinic-detail";
import AdminInquiries from "@/pages/admin/inquiries";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/book" component={Book} />
      <Route path="/book/success" component={BookSuccess} />
      <Route path="/terms-and-conditions" component={TermsAndConditions} />
      <Route path="/refund-policy" component={RefundPolicy} />
      
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/register" component={Register} />

      {/* Doctor Dashboard Routes */}
      <Route path="/dashboard" nest>
        <ProtectedRoute allowedRoles={["doctor"]}>
          <MainLayout>
            <Switch>
              <Route path="/" component={DashboardOverview} />
              <Route path="/appointments" component={Appointments} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/recharge" component={Recharge} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </MainLayout>
        </ProtectedRoute>
      </Route>

      {/* Admin Panel Routes */}
      <Route path="/admin" nest>
        <ProtectedRoute allowedRoles={["super_admin"]}>
          <MainLayout>
            <Switch>
              <Route path="/" component={AdminOverview} />
              <Route path="/clinics" component={ClinicsList} />
              <Route path="/clinics/:clinicId" component={ClinicDetail} />
              <Route path="/inquiries" component={AdminInquiries} />
              <Route component={NotFound} />
            </Switch>
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
