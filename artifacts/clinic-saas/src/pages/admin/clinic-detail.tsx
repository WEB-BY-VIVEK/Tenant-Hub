import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetClinic, getGetClinicQueryKey, useListDoctors, getListDoctorsQueryKey, useUpgradeSubscription, SubscriptionPlan, UpgradeSubscriptionBodyPlan } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, Crown, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
        <Link href="/admin/clinics">
          <Button variant="link" className="mt-4">Back to clinics</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clinics">
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
              {/* Note: The UI here is slightly mocked since clinic object doesn't have subscription attached in the generic endpoint. 
                  We'll adapt based on typical SaaS patterns. */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Plan</span>
                <Badge variant="outline" className="uppercase font-bold border-primary text-primary">
                  {/* This would come from clinic.subscription in a real API payload, but we'll show a placeholder */}
                  Standard
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="secondary">Active</Badge>
              </div>
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
                        <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {doctor.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{doctor.name}</p>
                              <p className="text-sm text-muted-foreground">{doctor.specialization || "General Practitioner"}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {doctor.email}
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
