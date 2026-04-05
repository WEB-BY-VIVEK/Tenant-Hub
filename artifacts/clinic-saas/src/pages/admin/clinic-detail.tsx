import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetClinic, getGetClinicQueryKey, useListDoctors, getListDoctorsQueryKey, useUpgradeSubscription, SubscriptionPlan, UpgradeSubscriptionBodyPlan } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, Crown, Clock, KeyRound, Eye, EyeOff, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const TOKEN_KEY = "cdg_token";
const getToken = () => localStorage.getItem(TOKEN_KEY) ?? "";

function SetPasswordDialog({ doctorId, doctorName }: { doctorId: number; doctorName: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSetPassword = async () => {
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Too short", description: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/set-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: data.error || "Failed to update password." });
        return;
      }
      toast({ title: "Password updated", description: `New password set for ${doctorName}.` });
      setPassword("");
      setOpen(false);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not connect to server." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <KeyRound className="h-3.5 w-3.5" />
          Set Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Login Password</DialogTitle>
          <DialogDescription>
            Set a new password for <span className="font-medium text-foreground">{doctorName}</span>. Share it with them securely.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="button" size="icon" variant="outline" onClick={handleCopy} disabled={!password} title="Copy password">
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setOpen(false); setPassword(""); }}>Cancel</Button>
          <Button onClick={handleSetPassword} disabled={loading || !password}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ClinicDetail() {
  const { clinicId } = useParams();
  const id = parseInt(clinicId || "0", 10);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<UpgradeSubscriptionBodyPlan | "">("");
  const { toast } = useToast();

  const { data: clinic, isLoading: loadingClinic, refetch: refetchClinic } = useGetClinic(id, { query: { queryKey: getGetClinicQueryKey(id), enabled: !!id } });
  const { data: doctors, isLoading: loadingDoctors } = useListDoctors(id, { query: { queryKey: getListDoctorsQueryKey(id), enabled: !!id } });
  
  const upgradeMutation = useUpgradeSubscription();

  const handleUpgrade = () => {
    if (!selectedPlan) return;
    
    upgradeMutation.mutate(
      { 
        clinicId: id, 
        data: { plan: selectedPlan } 
      },
      {
        onSuccess: () => {
          setIsUpgradeOpen(false);
          refetchClinic();
          toast({
            title: "Subscription upgraded",
            description: `Clinic has been successfully upgraded to the ${selectedPlan} plan.`,
          });
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Upgrade failed",
            description: (err.data as { error?: string })?.error || "Could not update subscription plan.",
          });
        }
      }
    );
  };

  if (loadingClinic) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Clinic not found</h2>
        <Link href="/clinics">
          <Button variant="link" className="mt-4">Back to clinics</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clinics">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{clinic.name}</h1>
            {clinic.isSuspended ? (
              <Badge variant="destructive">Suspended</Badge>
            ) : (
              <Badge variant="default" className="bg-emerald-500">Active</Badge>
            )}
          </div>
          <p className="text-muted-foreground">ID: {clinic.id} • Registered on {format(new Date(clinic.createdAt), "MMM d, yyyy")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Owner Name</p>
                  <p className="text-sm text-muted-foreground">{clinic.ownerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{clinic.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{clinic.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {[clinic.address, clinic.city, clinic.state, clinic.pincode].filter(Boolean).join(", ") || "No address provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clinic.subscription ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Plan</span>
                    <Badge variant="outline" className="uppercase font-bold border-primary text-primary">
                      {clinic.subscription.subscription?.plan ?? "—"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    {clinic.subscription.isActive ? (
                      <Badge className="bg-emerald-500 text-white">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                  {clinic.subscription.expiresAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expires</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(clinic.subscription.expiresAt), "MMM d, yyyy")}
                        {clinic.subscription.daysRemaining !== null && (
                          <span className="ml-1 text-xs">({clinic.subscription.daysRemaining}d remaining)</span>
                        )}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription found for this clinic.</p>
              )}
            </CardContent>
            <CardFooter>
              <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" data-testid="btn-open-upgrade">Manage Plan</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Subscription</DialogTitle>
                    <DialogDescription>
                      Change the subscription plan for {clinic.name}. This action bypasses payment for admin purposes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select onValueChange={(val) => setSelectedPlan(val as UpgradeSubscriptionBodyPlan)}>
                      <SelectTrigger data-testid="select-plan-upgrade">
                        <SelectValue placeholder="Select a new plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly (₹999/mo)</SelectItem>
                        <SelectItem value="quarterly">Quarterly (₹2,499/qtr)</SelectItem>
                        <SelectItem value="yearly">Yearly (₹9,999/yr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUpgradeOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={handleUpgrade} 
                      disabled={!selectedPlan || upgradeMutation.isPending}
                      data-testid="btn-confirm-upgrade"
                    >
                      {upgradeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Plan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="doctors" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
              <TabsTrigger 
                value="doctors" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Doctors & Staff
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Platform Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="doctors" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Doctors</CardTitle>
                  <CardDescription>Personnel attached to this clinic account.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingDoctors ? (
                    <div className="flex py-10 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : doctors && doctors.length > 0 ? (
                    <div className="space-y-4">
                      {doctors.map(doctor => (
                        <div key={doctor.id} className="border rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between p-4 bg-muted/20">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {doctor.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{doctor.name}</p>
                                <p className="text-sm text-muted-foreground">{doctor.specialization || "General Practitioner"}</p>
                              </div>
                            </div>
                            <SetPasswordDialog doctorId={doctor.id} doctorName={doctor.name} />
                          </div>
                          <div className="px-4 py-3 border-t bg-blue-50/50 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Login Email</p>
                              <p className="text-sm font-mono font-medium text-blue-800">{doctor.email}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Password</p>
                              <p className="text-sm font-mono text-muted-foreground tracking-widest">••••••••</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border rounded-lg border-dashed">
                      <Building2 className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-4" />
                      <h3 className="text-lg font-medium">No doctors found</h3>
                      <p className="text-sm text-muted-foreground">This clinic hasn't added any doctors yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                  <CardDescription>System-level configuration for this clinic.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg flex justify-between items-center bg-muted/30">
                    <div>
                      <h4 className="font-medium">WhatsApp Notifications</h4>
                      <p className="text-sm text-muted-foreground">Automated appointment reminders</p>
                    </div>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <div className="p-4 border rounded-lg flex justify-between items-center bg-muted/30">
                    <div>
                      <h4 className="font-medium">Google Maps Integration</h4>
                      <p className="text-sm text-muted-foreground">Location sharing on booking success</p>
                    </div>
                    {clinic.googleMapsUrl ? (
                      <Badge variant="default" className="bg-emerald-500">Active</Badge>
                    ) : (
                      <Badge variant="outline">Not Configured</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
