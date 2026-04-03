import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useGetClinic, useUpdateClinic } from "@workspace/api-client-react";
import { getGetClinicQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save, UserCircle, Building, Map, QrCode, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";

const profileSchema = z.object({
  name: z.string().min(2, "Clinic name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  phone: z.string().min(10, "Phone number is required"),
  whatsappNumber: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  pincode: z.string().optional().or(z.literal("")),
  googleMapsUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export default function Settings() {
  const { user } = useAuth();
  const clinicId = user?.clinicId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qrCanvasRef = useRef<HTMLDivElement | null>(null);

  const { data: clinic, isLoading: loadingClinic } = useGetClinic(clinicId || 0, { 
    query: { enabled: !!clinicId, queryKey: getGetClinicQueryKey(clinicId || 0) } 
  });

  const updateClinic = useUpdateClinic();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      ownerName: "",
      phone: "",
      whatsappNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      googleMapsUrl: "",
    },
  });

  useEffect(() => {
    if (clinic) {
      form.reset({
        name: clinic.name || "",
        ownerName: clinic.ownerName || "",
        phone: clinic.phone || "",
        whatsappNumber: clinic.whatsappNumber || "",
        address: clinic.address || "",
        city: clinic.city || "",
        state: clinic.state || "",
        pincode: clinic.pincode || "",
        googleMapsUrl: clinic.googleMapsUrl || "",
      });
    }
  }, [clinic, form]);

  const bookingUrl = clinicId
    ? `${window.location.origin}/book?clinic=${clinicId}`
    : "";

  const handleDownloadQR = () => {
    const container = qrCanvasRef.current;
    if (!container) return;
    const canvas = container.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clinic?.name ?? "clinic"}-booking-qr.png`;
    a.click();
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!clinicId) return;

    updateClinic.mutate(
      { clinicId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetClinicQueryKey(clinicId) });
          toast({
            title: "Settings saved",
            description: "Your clinic profile has been updated successfully.",
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Update failed",
            description: error.data?.error || "Could not save settings.",
          });
        }
      }
    );
  };

  if (!clinicId) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <p className="text-muted-foreground">No clinic profile attached to this user.</p>
      </div>
    );
  }

  if (loadingClinic) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinic Settings</h1>
        <p className="text-muted-foreground">Manage your clinic profile and public information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                Doctor Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Logged in as</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Email</p>
                <p className="font-medium text-sm">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="font-medium capitalize text-sm">{user?.role}</p>
              </div>
            </CardContent>
          </Card>

          {bookingUrl && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Reception QR Poster
                </CardTitle>
                <CardDescription>
                  Print and place at reception. Patients scan to book instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                {/* Printable poster card */}
                <div
                  ref={qrCanvasRef}
                  id="qr-poster"
                  className="bg-white rounded-xl border-2 border-primary/30 p-4 flex flex-col items-center gap-3 text-center"
                >
                  {/* Header bar */}
                  <div className="w-full rounded-lg bg-primary px-3 py-2">
                    <p className="text-white text-xs font-semibold uppercase tracking-widest">Book Your Appointment</p>
                  </div>

                  {/* Clinic name */}
                  <div>
                    <p className="text-base font-bold text-gray-900 leading-tight">{clinic?.name}</p>
                    {clinic?.ownerName && (
                      <p className="text-xs text-gray-500">Dr. {clinic.ownerName}</p>
                    )}
                  </div>

                  {/* QR code */}
                  <div className="p-2 bg-white rounded-lg border shadow-inner">
                    <QRCodeCanvas
                      value={bookingUrl}
                      size={160}
                      level="H"
                      includeMargin
                    />
                  </div>

                  <p className="text-xs font-medium text-primary">📱 Scan with your phone camera</p>

                  {/* Clinic details */}
                  <div className="w-full text-left space-y-1 border-t pt-3 mt-1">
                    {clinic?.phone && (
                      <p className="text-xs text-gray-700">📞 {clinic.phone}</p>
                    )}
                    {clinic?.whatsappNumber && (
                      <p className="text-xs text-gray-700">💬 WhatsApp: {clinic.whatsappNumber}</p>
                    )}
                    {(clinic?.address || clinic?.city) && (
                      <p className="text-xs text-gray-700">
                        📍 {[clinic?.address, clinic?.city, clinic?.state, clinic?.pincode].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="w-full rounded-md bg-gray-50 border px-2 py-1">
                    <p className="text-[10px] text-gray-400 break-all">{bookingUrl}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-2 pb-4 px-4">
                <Button
                  className="w-full"
                  data-testid="btn-print-qr"
                  onClick={() => {
                    const el = document.getElementById("qr-poster");
                    if (!el) return;
                    const win = window.open("", "_blank");
                    if (!win) return;
                    win.document.write(`
                      <html><head><title>Reception QR Poster</title>
                      <style>
                        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; font-family: sans-serif; }
                        .poster { background: white; border: 2px solid #1a3a6e; border-radius: 12px; padding: 20px; width: 320px; text-align: center; }
                        .header { background: #1a3a6e; border-radius: 8px; padding: 8px 12px; color: white; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
                        .clinic-name { font-size: 16px; font-weight: bold; color: #111; }
                        .doctor-name { font-size: 11px; color: #666; margin-top: 2px; }
                        .qr-wrap { border: 1px solid #ddd; border-radius: 8px; padding: 8px; display: inline-block; margin: 12px 0; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
                        .scan-hint { font-size: 11px; font-weight: 600; color: #1a3a6e; margin-bottom: 12px; }
                        .details { text-align: left; border-top: 1px solid #eee; padding-top: 10px; margin-top: 4px; }
                        .detail-row { font-size: 11px; color: #444; margin-bottom: 4px; }
                        .url-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 6px 8px; margin-top: 10px; font-size: 9px; color: #999; word-break: break-all; }
                        @media print { body { background: white; } }
                      </style></head><body>
                      <div class="poster">
                        <div class="header">Book Your Appointment</div>
                        <div class="clinic-name">${clinic?.name ?? ""}</div>
                        ${clinic?.ownerName ? `<div class="doctor-name">Dr. ${clinic.ownerName}</div>` : ""}
                        <div class="qr-wrap">${el.querySelector("canvas")?.outerHTML ?? ""}</div>
                        <div class="scan-hint">📱 Scan with your phone camera</div>
                        <div class="details">
                          ${clinic?.phone ? `<div class="detail-row">📞 ${clinic.phone}</div>` : ""}
                          ${clinic?.whatsappNumber ? `<div class="detail-row">💬 WhatsApp: ${clinic.whatsappNumber}</div>` : ""}
                          ${(clinic?.address || clinic?.city) ? `<div class="detail-row">📍 ${[clinic?.address, clinic?.city, clinic?.state, clinic?.pincode].filter(Boolean).join(", ")}</div>` : ""}
                        </div>
                        <div class="url-box">${bookingUrl}</div>
                      </div>
                      <script>window.onload = () => window.print();<\/script>
                      </body></html>
                    `);
                    win.document.close();
                  }}
                >
                  🖨️ Print Poster
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadQR}
                  data-testid="btn-download-qr"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                Clinic Information
              </CardTitle>
              <CardDescription>
                This information is displayed to your patients.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-settings-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor / Owner Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-settings-owner" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Phone</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-settings-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Number (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-settings-whatsapp" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 border-t mt-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                      <Map className="h-4 w-4" /> Location Details
                    </h3>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-settings-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-settings-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-settings-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-settings-pincode" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="googleMapsUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Maps URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://maps.google.com/..." {...field} data-testid="input-settings-maps" />
                          </FormControl>
                          <FormDescription>
                            Patients will receive this link to find your clinic easily.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                  <Button 
                    type="submit" 
                    disabled={updateClinic.isPending}
                    data-testid="btn-save-settings"
                  >
                    {updateClinic.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
