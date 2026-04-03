import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { useCreatePaymentOrder, useGetCurrentSubscription, getGetCurrentSubscriptionQueryKey, CreateOrderBodyPlan } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const PLANS: { plan: CreateOrderBodyPlan; label: string; price: string; duration: string; badge?: string }[] = [
  { plan: "monthly", label: "Monthly", price: "₹999", duration: "30 days" },
  { plan: "quarterly", label: "Quarterly", price: "₹2,499", duration: "90 days", badge: "Save 17%" },
  { plan: "yearly", label: "Yearly", price: "₹9,999", duration: "365 days", badge: "Save 17%" },
];

interface RechargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RechargeModal({ open, onOpenChange }: RechargeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState<CreateOrderBodyPlan | null>(null);
  const { data: currentSub } = useGetCurrentSubscription({ query: { queryKey: getGetCurrentSubscriptionQueryKey() } });
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
            description: `Order ID: ${data.orderId}. Razorpay integration pending SDK load.`,
          });
          queryClient.invalidateQueries({ queryKey: getGetCurrentSubscriptionQueryKey() });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Recharge Subscription
          </DialogTitle>
          <DialogDescription>
            {currentSub?.isActive
              ? `Your subscription is active. You can extend it by choosing a plan below.`
              : "Your subscription has expired. Choose a plan to restore access."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {PLANS.map(({ plan, label, price, duration, badge }) => (
            <Card
              key={plan}
              className={`cursor-pointer border-2 transition-colors hover:border-primary ${plan === "yearly" ? "border-primary/50" : "border-border"}`}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{label}</span>
                    {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{duration}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{price}</span>
                  <Button
                    size="sm"
                    onClick={() => handleRecharge(plan)}
                    disabled={!!processing}
                    data-testid={`modal-btn-plan-${plan}`}
                  >
                    {processing === plan ? <Loader2 className="h-4 w-4 animate-spin" /> : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {currentSub?.isActive && currentSub.daysRemaining !== null && (
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            {currentSub.daysRemaining} days remaining on current plan
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
