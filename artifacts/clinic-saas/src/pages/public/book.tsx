import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Activity, Loader2, Calendar, Clock, User, ArrowRight, ArrowLeft, QrCode, CheckCircle2 } from "lucide-react";
import { useBookAppointment } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type PublicClinic = { id: number; name: string; city: string | null; address: string | null };

function usePublicClinics() {
  return useQuery<PublicClinic[]>({
    queryKey: ["clinics", "public"],
    queryFn: () =>
      fetch("/api/clinics/public").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch clinics");
        return r.json();
      }),
    staleTime: 5 * 60 * 1000,
  });
}

const bookingSchema = z.object({
  clinicId: z.coerce.number().min(1, "Please select a clinic"),
  patientName: z.string().min(2, "Name is required"),
  patientPhone: z.string().min(10, "Valid phone number required"),
  patientEmail: z.string().email("Valid email required").or(z.literal("")).optional(),
  appointmentDate: z.date({ required_error: "A date is required." }),
  timeSlot: z.string().min(1, "Time slot is required"),
  reason: z.string().optional(),
});

function QrScannerTab({ onClinicId }: { onClinicId: (id: number) => void }) {
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "running" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function startScanner() {
    setScanStatus("running");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!scannerDivRef.current) return;
      const html5QrCode = new Html5Qrcode("qr-reader-div");
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText) => {
          const match = decodedText.match(/cdg:clinic:(\d+)/);
          if (match) {
            scannerRef.current?.stop().catch(() => {});
            onClinicId(parseInt(match[1], 10));
          }
        },
        () => {}
      );
    } catch {
      setErrorMsg("Camera unavailable. Please select a clinic manually.");
      setScanStatus("error");
    }
  }

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-4" data-testid="qr-scanner-tab">
      {scanStatus === "idle" && (
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Scan the clinic's QR code (posted at reception) to instantly select it.
          </p>
          <Button type="button" variant="outline" onClick={startScanner} data-testid="btn-start-scan">
            Start Camera Scan
          </Button>
        </div>
      )}
      {scanStatus === "running" && (
        <>
          <div
            id="qr-reader-div"
            ref={scannerDivRef}
            className="w-full max-w-xs rounded-lg overflow-hidden border shadow"
          />
          <p className="text-sm text-muted-foreground text-center">
            Point your camera at the clinic's QR code
          </p>
        </>
      )}
      {scanStatus === "error" && (
        <div className="text-center text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

export default function BookAppointment() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const prefillClinicId = params.get("clinic") ? parseInt(params.get("clinic")!, 10) : null;

  const [step, setStep] = useState(prefillClinicId ? 2 : 1);
  const [scannedClinicId, setScannedClinicId] = useState<number | null>(null);

  const { data: clinics, isLoading: loadingClinics } = usePublicClinics();
  const bookMutation = useBookAppointment();

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clinicId: prefillClinicId ?? 0,
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      timeSlot: "",
      reason: "",
    },
  });

  const selectedClinicId = form.watch("clinicId");
  const selectedClinic = clinics?.find((c) => c.id === selectedClinicId);

  function handleQrClinicId(id: number) {
    setScannedClinicId(id);
    form.setValue("clinicId", id);
    setStep(2);
  }

  useEffect(() => {
    if (prefillClinicId) {
      form.setValue("clinicId", prefillClinicId);
    }
  }, [prefillClinicId, form]);

  const onSubmit = (values: z.infer<typeof bookingSchema>) => {
    bookMutation.mutate(
      {
        data: {
          ...values,
          appointmentDate: format(values.appointmentDate, "yyyy-MM-dd"),
        },
      },
      {
        onSuccess: (data) => {
          sessionStorage.setItem("bookingData", JSON.stringify(data));
          setLocation("/book/success");
        },
      }
    );
  };

  const nextStep = async () => {
    let valid = false;
    if (step === 1) {
      valid = await form.trigger(["clinicId"]);
    } else if (step === 2) {
      valid = await form.trigger(["patientName", "patientPhone", "patientEmail"]);
    }
    if (valid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const timeSlots = [
    { value: "9AM-12PM", label: "Morning (9 AM - 12 PM)" },
    { value: "12PM-3PM", label: "Afternoon (12 PM - 3 PM)" },
    { value: "3PM-6PM", label: "Evening (3 PM - 6 PM)" },
    { value: "6PM-9PM", label: "Night (6 PM - 9 PM)" },
  ];

  const TOTAL_STEPS = 3;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Activity className="h-6 w-6" />
          <span>CDG</span>
        </Link>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {[1, 2, 3].map((s, i) => (
            <>
              <span
                key={s}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {s}
              </span>
              {i < TOTAL_STEPS - 1 && (
                <span className={cn("h-px w-4", step > s ? "bg-primary" : "bg-border")} />
              )}
            </>
          ))}
        </div>
      </div>

      <Card className="w-full max-w-2xl border-none shadow-lg">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-2xl font-bold">Book an Appointment</CardTitle>
          <CardDescription>
            Secure your spot in the token queue to minimize wait time
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Step 1: Select Clinic — QR scan or dropdown */}
              <div className={cn("space-y-4", step !== 1 && "hidden")}>
                <div className="flex items-center gap-2 mb-2 text-lg font-semibold text-primary">
                  <Activity className="h-5 w-5" />
                  <h3>Select Clinic</h3>
                </div>

                {scannedClinicId && (
                  <div className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-4 py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Clinic selected via QR scan
                  </div>
                )}

                <Tabs defaultValue={prefillClinicId ? "manual" : "qr"}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="qr" className="flex-1 gap-2" data-testid="tab-qr-scan">
                      <QrCode className="h-4 w-4" /> Scan QR Code
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex-1 gap-2" data-testid="tab-manual">
                      <User className="h-4 w-4" /> Select Manually
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="qr">
                    <QrScannerTab onClinicId={handleQrClinicId} />
                  </TabsContent>

                  <TabsContent value="manual">
                    <FormField
                      control={form.control}
                      name="clinicId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Which clinic would you like to visit?</FormLabel>
                          <Select
                            onValueChange={(val) => field.onChange(parseInt(val))}
                            defaultValue={field.value ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-clinic">
                                <SelectValue placeholder={loadingClinics ? "Loading clinics..." : "Select a clinic"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clinics?.map((clinic) => (
                                <SelectItem key={clinic.id} value={clinic.id.toString()}>
                                  {clinic.name}{clinic.city ? ` — ${clinic.city}` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Step 2: Patient Details */}
              <div className={cn("space-y-4", step !== 2 && "hidden")}>
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-primary">
                  <User className="h-5 w-5" />
                  <h3>Patient Details</h3>
                </div>
                {selectedClinic && (
                  <div className="text-sm bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 text-primary font-medium">
                    Booking at: {selectedClinic.name}{selectedClinic.city ? `, ${selectedClinic.city}` : ""}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-patient-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit mobile number" {...field} data-testid="input-patient-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="patientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Email for updates" type="email" {...field} data-testid="input-patient-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 3: Appointment Time */}
              <div className={cn("space-y-4", step !== 3 && "hidden")}>
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-primary">
                  <Calendar className="h-5 w-5" />
                  <h3>Date & Time</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                data-testid="btn-date-picker"
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time Slot</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-time-slot">
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Visit (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe your symptoms or reason for visit"
                          className="resize-none"
                          {...field}
                          data-testid="textarea-reason"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between pt-4 border-t">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep} data-testid="btn-prev-step">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} data-testid="btn-next-step">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={bookMutation.isPending} data-testid="btn-submit-booking">
                    {bookMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirm Booking
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
