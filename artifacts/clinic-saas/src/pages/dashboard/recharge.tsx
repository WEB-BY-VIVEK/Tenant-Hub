import { useState } from "react";
import { useGetCurrentSubscription, useListInvoices, useListPayments, useCreatePaymentOrder, CreateOrderBodyPlan, verifyPayment, VerifyPaymentBodyPlan } from "@workspace/api-client-react";
import { getGetCurrentSubscriptionQueryKey, getListInvoicesQueryKey, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, AlertCircle, Loader2, Receipt, CreditCard, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { openRazorpayCheckout } from "@/lib/razorpay";

export default function Recharge() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState<CreateOrderBodyPlan | null>(null);
  const [paymentError, setPaymentError] = useState("");

  const { data: currentSub, isLoading: loadingSub } = useGetCurrentSubscription({ query: { queryKey: getGetCurrentSubscriptionQueryKey() } });
  const { data: invoices, isLoading: loadingInv } = useListInvoices({ query: { queryKey: getListInvoicesQueryKey() } });
  const { data: payments, isLoading: loadingPay } = useListPayments({ query: { queryKey: getListPaymentsQueryKey() } });

  const createOrder = useCreatePaymentOrder();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const handleRecharge = (plan: CreateOrderBodyPlan) => {
    setPaymentError("");
    setIsProcessing(plan);

    createOrder.mutate(
      { data: { plan } },
      {
        onSuccess: async (data) => {
          try {
            await openRazorpayCheckout({
              keyId: data.keyId,
              orderId: data.orderId,
              amount: data.amount,
              currency: data.currency,
              description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
              onSuccess: async (response) => {
                try {
                  await verifyPayment({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    plan: plan as VerifyPaymentBodyPlan,
                  });
                  toast({ title: "Payment successful!", description: "Your subscription has been activated." });
                  queryClient.invalidateQueries({ queryKey: getGetCurrentSubscriptionQueryKey() });
                  queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
                  queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
                } catch {
                  toast({ variant: "destructive", title: "Verification failed", description: "Payment was received but verification failed. Please contact support." });
                } finally {
                  setIsProcessing(null);
                }
              },
              onDismiss: () => setIsProcessing(null),
            });
          } catch {
            setIsProcessing(null);
            setPaymentError("Could not open payment window. Please try again.");
          }
        },
        onError: (err) => {
          setIsProcessing(null);
          const errData = err.data as { error?: string } | null;
          if (err.status === 503) {
            setPaymentError("Payment gateway is not currently configured. Please contact support.");
          } else {
            setPaymentError(errData?.error || "Could not process payment order at this time.");
          }
        },
      }
    );
  };

  if (loadingSub || loadingInv || loadingPay) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = currentSub?.isActive;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recharge Subscription</h1>
        <p className="text-muted-foreground">Manage your clinic's billing and subscription plans.</p>
      </div>

      {paymentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      {currentSub && (
        <Card className={`border-2 ${isActive ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-destructive bg-destructive/5"}`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`mt-1 rounded-full p-2 ${isActive ? "bg-emerald-100 text-emerald-600" : "bg-destructive/20 text-destructive"}`}>
                  {isActive ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Current Status: {isActive ? "Active" : "Expired"}
                    {currentSub.subscription?.plan && (
                      <Badge variant="outline" className="uppercase text-xs">{currentSub.subscription.plan} Plan</Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {isActive && currentSub.expiresAt
                      ? `Your subscription is active and expires on ${format(new Date(currentSub.expiresAt), "MMMM do, yyyy")}. (${currentSub.daysRemaining} days remaining)`
                      : "Your subscription has expired. Please recharge to continue using all platform features."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { id: "monthly" as CreateOrderBodyPlan, name: "Monthly", price: 999, period: "/month", desc: "Pay as you go. Full access to all features.", recommended: false },
            { id: "quarterly" as CreateOrderBodyPlan, name: "Quarterly", price: 2499, period: "/quarter", desc: "Save ~16% compared to monthly. Full access.", recommended: true },
            { id: "yearly" as CreateOrderBodyPlan, name: "Yearly", price: 9999, period: "/year", desc: "Save ~16% compared to monthly. Full access.", recommended: false },
          ].map((plan) => (
            <Card key={plan.id} className={`relative ${plan.recommended ? "border-primary shadow-md" : ""}`}>
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  Recommended
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-3xl font-bold mt-2">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-6">
                {plan.desc}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.recommended ? "default" : "outline"}
                  onClick={() => handleRecharge(plan.id)}
                  disabled={!!isProcessing}
                  data-testid={`btn-recharge-${plan.id}`}
                >
                  {isProcessing === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isProcessing === plan.id ? "Opening payment..." : `Subscribe ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice(0, 5).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm">{format(new Date(payment.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-sm font-medium">₹{payment.amount}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "success" ? "default" : payment.status === "pending" ? "secondary" : "destructive"} className="text-[10px]">
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
                <Clock className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No past payments found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices && invoices.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.slice(0, 5).map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-sm font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell className="text-sm">{format(new Date(invoice.issuedAt), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-sm font-medium">₹{invoice.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
                <Receipt className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No invoices available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
