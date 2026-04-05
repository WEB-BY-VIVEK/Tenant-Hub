import { useState } from "react";
import { Link } from "wouter";
import { useAdminListClinics, useSuspendClinic, ClinicWithSubscription } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Search, MoreHorizontal, Ban, PlayCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminListClinicsQueryKey } from "@workspace/api-client-react";

function ClinicsTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clinic Info</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-36 mb-1.5" />
                <Skeleton className="h-3 w-28 mb-1" />
                <Skeleton className="h-3 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full mb-1.5" />
                <Skeleton className="h-3 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 ml-auto rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ClinicsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: clinics, isLoading } = useAdminListClinics();
  const suspendMutation = useSuspendClinic();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSuspendToggle = (clinicId: number, currentStatus: boolean) => {
    suspendMutation.mutate(
      { clinicId, data: { suspend: !currentStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListClinicsQueryKey() });
          toast({
            title: `Clinic ${!currentStatus ? "suspended" : "reactivated"}`,
            description: "The action was successful.",
          });
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Action failed",
            description: (err.data as { error?: string })?.error || "Could not update clinic status",
          });
        }
      }
    );
  };

  const filteredClinics = clinics?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinics Directory</h1>
          <p className="text-muted-foreground">Manage all registered clinics on the platform.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clinics..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-clinics"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ClinicsTableSkeleton />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic Info</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClinics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No clinics found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClinics.map((clinic) => (
                      <TableRow key={clinic.id}>
                        <TableCell>
                          <div className="font-medium">{clinic.name}</div>
                          <div className="text-xs text-muted-foreground">{clinic.email}</div>
                          <div className="text-xs text-muted-foreground">{clinic.phone}</div>
                        </TableCell>
                        <TableCell>
                          {clinic.subscription?.subscription ? (
                            <div className="space-y-1">
                              <Badge variant="outline" className="uppercase text-[10px]">
                                {clinic.subscription.subscription.plan}
                              </Badge>
                              {clinic.subscription.daysRemaining !== null && clinic.subscription.daysRemaining !== undefined ? (
                                <div className={`text-xs font-medium ${clinic.subscription.daysRemaining < 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                  {clinic.subscription.daysRemaining > 0 
                                    ? `${clinic.subscription.daysRemaining} days left` 
                                    : 'Expired'}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Free Tier</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{clinic.totalPatients}</span> patients
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{clinic.totalDoctors}</span> doctors
                          </div>
                        </TableCell>
                        <TableCell>
                          {clinic.isSuspended ? (
                            <Badge variant="destructive">Suspended</Badge>
                          ) : (
                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`btn-clinic-actions-${clinic.id}`}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/clinics/${clinic.id}`} className="cursor-pointer flex w-full items-center">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleSuspendToggle(clinic.id, clinic.isSuspended)}
                                className={clinic.isSuspended ? "text-emerald-600" : "text-destructive"}
                                disabled={suspendMutation.isPending}
                                data-testid={`btn-toggle-suspend-${clinic.id}`}
                              >
                                {clinic.isSuspended ? (
                                  <><PlayCircle className="mr-2 h-4 w-4" /> Reactivate Clinic</>
                                ) : (
                                  <><Ban className="mr-2 h-4 w-4" /> Suspend Clinic</>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
