import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, Phone, Mail, Inbox } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: string;
  createdAt: string;
}

async function fetchInquiries(): Promise<Inquiry[]> {
  const token = localStorage.getItem("cdg_token");
  const res = await fetch("/api/admin/inquiries", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch inquiries");
  return res.json();
}

async function updateStatus(id: number, status: string): Promise<Inquiry> {
  const token = localStorage.getItem("cdg_token");
  const res = await fetch(`/api/admin/inquiries/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "outline"> = {
  new: "default",
  contacted: "secondary",
  closed: "outline",
};

function InquiriesTable({ inquiries, onStatusChange }: { inquiries: Inquiry[]; onStatusChange: (id: number, status: string) => void }) {
  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Inbox className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-sm">No inquiries in this category</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((inq) => (
            <TableRow key={inq.id}>
              <TableCell className="font-medium whitespace-nowrap">{inq.name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <a href={`tel:${inq.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Phone className="h-3 w-3" /> {inq.phone}
                  </a>
                  {inq.email && (
                    <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:underline">
                      <Mail className="h-3 w-3" /> {inq.email}
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="text-sm text-muted-foreground line-clamp-2">{inq.message}</p>
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                {format(new Date(inq.createdAt), "MMM d, yyyy")}
                <br />
                <span className="text-xs">{format(new Date(inq.createdAt), "h:mm a")}</span>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_COLORS[inq.status] ?? "outline"} className="capitalize">
                  {inq.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Select value={inq.status} onValueChange={(val) => onStatusChange(inq.id, val)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminInquiries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("new");

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: fetchInquiries,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast({ title: "Status updated" });
    },
    onError: () => toast({ variant: "destructive", title: "Failed to update status" }),
  });

  const filtered = (status: string) =>
    status === "all" ? inquiries : inquiries.filter((i) => i.status === status);

  const counts = {
    new: inquiries.filter((i) => i.status === "new").length,
    contacted: inquiries.filter((i) => i.status === "contacted").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
    all: inquiries.length,
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-primary" /> Contact Inquiries
        </h1>
        <p className="text-muted-foreground">All inquiries submitted via the landing page contact form.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "New", key: "new", color: "text-blue-600 bg-blue-50 border-blue-200" },
          { label: "Contacted", key: "contacted", color: "text-amber-600 bg-amber-50 border-amber-200" },
          { label: "Closed", key: "closed", color: "text-gray-600 bg-gray-50 border-gray-200" },
          { label: "Total", key: "all", color: "text-primary bg-primary/5 border-primary/20" },
        ].map(({ label, key, color }) => (
          <Card key={key} className={`border cursor-pointer ${tab === key ? "ring-2 ring-primary" : ""}`} onClick={() => setTab(key)}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color.split(" ")[0]}`}>{counts[key as keyof typeof counts]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Inquiry List</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="new">New <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5">{counts.new}</span></TabsTrigger>
              <TabsTrigger value="contacted">Contacted</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            {["new", "contacted", "closed", "all"].map((status) => (
              <TabsContent key={status} value={status}>
                <InquiriesTable
                  inquiries={filtered(status)}
                  onStatusChange={(id, s) => mutation.mutate({ id, status: s })}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
