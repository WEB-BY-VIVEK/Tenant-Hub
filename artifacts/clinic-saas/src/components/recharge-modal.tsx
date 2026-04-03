import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Loader2, CheckCircle2, AlertCircle, Clock, Receipt } from "lucide-react";
import {
  useCreatePaymentOrder,
  useGetCurrentSubscription,
  useListInvoices,
  getGetCurrentSubscriptionQueryKey,
  getListInvoicesQueryKey,
  CreateOrderBodyPlan,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const PLANS: { plan: CreateOrderBodyPlan; label: string; price: string; duration: string; badge?: string }[] = [
  { plan: "monthly", label: "Monthly", price: "₹999", duration: "30 days" },
  { plan: "quarterly", label: "Quarterly", price: "₹2,499", duration: "90 days", badge: "Save 17%" },
  { plan: "yearly", label: "Yearly", price: "₹9,999", duration: "365 days", badge: "Best Value" },
];

interface RechargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RechargeModal({ open, onOpenChange }: RechargeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState<CreateOrderBodyPlan | null>(null);

  const { data: currentSub } = useGetCurrentSubscription({
    query: { queryKey: getGetCurrentSubscriptionQueryKey(), enabled: open },
  });
  const { data: invoices } = useListInvoices({
    query: { queryKey: getListInvoicesQueryKey(), enabled: open },
  });

  const createOrder = useCreatePaymentOrder();

  const handleRecharge = (plan: CreateOrderBodyPlan) => {
    setProcessing(plan);
    createOrder.mutate(
      { data: { plan } },
      {
        onSuccess: (data) => {
          setProcessing(null);
          toast({
            title: "Payment order created",
            description: `Order ID: ${data.orderId}. Razorpay checkout coming soon.`,
          });
          queryClient.invalidateQueries({ queryKey: getGetCurrentSubscriptionQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
          onOpenChange(false);
        },
        onError: (err) => {
          setProcessing(null);
          const errData = err.data as { error?: string } | null;
          if (err.status === 503) {
            toast({
              variant: "destructive",
              title: "Payment gateway unavailable",
              description: "Razorpay is not yet configured. Contact support.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Payment failed",
              description: errData?.error || "Could not process payment order.",
            });
          }
        },
      }
    );
  };

  const recentInvoices = invoices?.slice(0, 3) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Subscription & Billing
          </DialogTitle>
          <DialogDescription>
            Manage your clinic subscription and view billing history.
          </DialogDescription>
        </DialogHeader>

        {/* Current Status Banner */}
        {currentSub && (
          <div className={`rounded-lg px-4 py-3 flex items-start gap-3 ${currentSub.isActive ? "bg-emerald-50 border border-emerald-200" : "bg-destructive/10 border border-destructive/20"}`}>
            {currentSub.isActive ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${currentSub.isActive ? "text-emerald-800" : "text-destructive"}`}>
                {currentSub.isActive ? "Subscription Active" : "Subscription Expired"}
                {currentSub.subscription?.plan && (
                  <Badge variant="outline" className="ml-2 uppercase text-xs">
                    {currentSub.subscription.plan}
                  </Badge>
                )}
              </p>
              {currentSub.isActive && currentSub.expiresAt ? (
                <p className="text-xs text-emerald-700 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expires {format(new Date(currentSub.expiresAt), "MMMM d, yyyy")}
                  {currentSub.daysRemaining !== null && ` (${currentSub.daysRemaining} days remaining)`}
                </p>
              ) : !currentSub.isActive ? (
                <p className="text-xs text-destructive/80 mt-0.5">
                  Recharge below to restore access to all features.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Plan Selection */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            {currentSub?.isActive ? "Extend / Change Plan" : "Choose a Plan"}
          </p>
          <div className="space-y-2">
            {PLANS.map(({ plan, label, price, duration, badge }) => (
              <Card
                key={plan}
                className={`border-2 transition-colors ${plan === "yearly" ? "border-primary/40 bg-primary/5" : "border-border"}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{label}</span>
                      {badge && (
                        <Badge variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{duration}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{price}</span>
                    <Button
                      size="sm"
                      onClick={() => handleRecharge(plan)}
                      disabled={!!processing}
                      variant={plan === "yearly" ? "default" : "outline"}
                      data-testid={`modal-btn-plan-${plan}`}
                    >
                      {processing === plan ? <Loader2 className="h-4 w-4 animate-spin" /> : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        {recentInvoices.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Recent Invoices
              </p>
              <div className="space-y-2">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                  >
                    <div>
                      <span className="font-medium">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(invoice.amount)}
                      </span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <Badge variant={invoice.paymentId ? "default" : "secondary"} className="text-xs capitalize">
                      {invoice.paymentId ? "paid" : "pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
