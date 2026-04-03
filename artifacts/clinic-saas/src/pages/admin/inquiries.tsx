import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, MessageSquare, Phone, Mail, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ReactNode }> = {
  new: { label: "New", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  in_progress: { label: "In Progress", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  resolved: { label: "Resolved", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
};

export default function AdminInquiries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ["admin", "inquiries"],
    queryFn: () => customFetch<Inquiry[]>("/api/admin/inquiries"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      customFetch(`/api/admin/inquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      toast({ title: "Status updated" });
    },
  });

  const counts = {
    new: inquiries?.filter(i => i.status === "new").length ?? 0,
    in_progress: inquiries?.filter(i => i.status === "in_progress").length ?? 0,
    resolved: inquiries?.filter(i => i.status === "resolved").length ?? 0,
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inquiries</h1>
        <p className="text-muted-foreground">Contact form submissions from the landing page.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{counts.new}</p>
              <p className="text-sm text-muted-foreground">New</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{counts.in_progress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{counts.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              All Inquiries ({inquiries?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!inquiries || inquiries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No inquiries yet. They'll appear here when visitors submit the contact form.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry) => {
                      const sc = STATUS_CONFIG[inquiry.status] ?? STATUS_CONFIG.new;
                      return (
                        <TableRow
                          key={inquiry.id}
                          className={`cursor-pointer hover:bg-muted/50 ${selected?.id === inquiry.id ? "bg-muted" : ""}`}
                          onClick={() => setSelected(inquiry)}
                        >
                          <TableCell className="font-medium">{inquiry.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />{inquiry.phone}</span>
                              <span className="text-xs flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{inquiry.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(inquiry.createdAt), "dd MMM, hh:mm a")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={sc.variant} className="flex items-center gap-1 w-fit text-xs">
                              {sc.icon}{sc.label}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={inquiry.status}
                              onValueChange={(val) => updateStatus.mutate({ id: inquiry.id, status: val })}
                            >
                              <SelectTrigger className="h-7 text-xs w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Message Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Click any row to view the full message
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">From</p>
                  <p className="font-semibold">{selected.name}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`tel:${selected.phone}`}><Phone className="h-3 w-3 mr-1" />{selected.phone}</a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  </Button>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">{selected.email}</a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Message</p>
                  <p className="text-sm bg-muted rounded-md p-3 whitespace-pre-wrap">{selected.message}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Received: {format(new Date(selected.createdAt), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Update Status</p>
                  <Select
                    value={selected.status}
                    onValueChange={(val) => {
                      updateStatus.mutate({ id: selected.id, status: val });
                      setSelected({ ...selected, status: val });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
