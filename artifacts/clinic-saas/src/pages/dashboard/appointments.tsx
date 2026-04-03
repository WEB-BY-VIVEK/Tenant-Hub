import { useState } from "react";
import { useListAppointments, useUpdateAppointment, UpdateAppointmentBodyStatus } from "@workspace/api-client-react";
import { getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Loader2, Search, Calendar as CalendarIcon, FilterX } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  
  const dateStr = date ? format(date, "yyyy-MM-dd") : undefined;
  
  const { data: appointments, isLoading } = useListAppointments({ 
    date: dateStr,
    status: status || undefined,
    patientName: search || undefined
  }, { 
    query: { 
      queryKey: getListAppointmentsQueryKey({ date: dateStr, status: status || undefined, patientName: search || undefined }) 
    } 
  });

  const updateAppointment = useUpdateAppointment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (appointmentId: number, newStatus: UpdateAppointmentBodyStatus) => {
    updateAppointment.mutate(
      { appointmentId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
          toast({ title: "Status updated" });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Update failed", description: err.data?.error || "Could not update status" });
        }
      }
    );
  };

  const clearFilters = () => {
    setDate(undefined);
    setStatus("");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">View and manage all patient appointments.</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b mb-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient name..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search-appts"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    data-testid="btn-filter-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Filter by date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>

              {(date || status || search) && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters" data-testid="btn-clear-filters">
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex py-10 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!appointments || appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No appointments found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell>
                          <div className="font-medium">{appt.patientName}</div>
                          <div className="text-sm text-muted-foreground">{appt.patientPhone}</div>
                          {appt.patientEmail && <div className="text-xs text-muted-foreground">{appt.patientEmail}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{format(new Date(appt.appointmentDate), "MMM d, yyyy")}</div>
                          <div className="text-sm text-muted-foreground">{appt.timeSlot}</div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm truncate" title={appt.reason || "Not specified"}>
                            {appt.reason || <span className="text-muted-foreground italic">Not specified</span>}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            appt.status === "completed" ? "outline" :
                            appt.status === "cancelled" || appt.status === "no_show" ? "destructive" :
                            appt.status === "waiting" ? "default" : "secondary"
                          } className="capitalize">
                            {appt.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select 
                            value={appt.status} 
                            onValueChange={(val) => handleStatusChange(appt.id, val as UpdateAppointmentBodyStatus)}
                            disabled={updateAppointment.isPending}
                          >
                            <SelectTrigger className="w-[130px] h-8 ml-auto" data-testid={`select-action-appt-${appt.id}`}>
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="waiting">Set Waiting</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="rescheduled">Rescheduled</SelectItem>
                              <SelectItem value="no_show">No Show</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
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
