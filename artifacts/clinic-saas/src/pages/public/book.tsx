import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Activity, Loader2, Calendar, Clock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { useBookAppointment, useListClinics } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  clinicId: z.coerce.number().min(1, "Please select a clinic"),
  patientName: z.string().min(2, "Name is required"),
  patientPhone: z.string().min(10, "Valid phone number required"),
  patientEmail: z.string().email("Valid email required").or(z.literal("")).optional(),
  appointmentDate: z.date({
    required_error: "A date of birth is required.",
  }),
  timeSlot: z.string().min(1, "Time slot is required"),
  reason: z.string().optional(),
});

export default function BookAppointment() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  
  const { data: clinics, isLoading: loadingClinics } = useListClinics();
  const bookMutation = useBookAppointment();

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clinicId: 0,
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      timeSlot: "",
      reason: "",
    },
  });

  const onSubmit = (values: z.infer<typeof bookingSchema>) => {
    bookMutation.mutate(
      { 
        data: {
          ...values,
          appointmentDate: format(values.appointmentDate, "yyyy-MM-dd"),
        } 
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
    
    if (valid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const timeSlots = [
    { value: "9AM-12PM", label: "Morning (9 AM - 12 PM)" },
    { value: "12PM-3PM", label: "Afternoon (12 PM - 3 PM)" },
    { value: "3PM-6PM", label: "Evening (3 PM - 6 PM)" },
    { value: "6PM-9PM", label: "Night (6 PM - 9 PM)" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Activity className="h-6 w-6" />
          <span>CDG</span>
        </Link>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</span>
          <span className={cn("h-px w-4", step >= 2 ? "bg-primary" : "bg-border")} />
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</span>
          <span className={cn("h-px w-4", step >= 3 ? "bg-primary" : "bg-border")} />
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>3</span>
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
              
              {/* Step 1: Select Clinic */}
              <div className={cn("space-y-4", step !== 1 && "hidden")}>
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-primary">
                  <Activity className="h-5 w-5" />
                  <h3>Select Clinic</h3>
                </div>
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
                              {clinic.name} {clinic.city ? `- ${clinic.city}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 2: Patient Details */}
              <div className={cn("space-y-4", step !== 2 && "hidden")}>
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-primary">
                  <User className="h-5 w-5" />
                  <h3>Patient Details</h3>
                </div>
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
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="btn-date-picker"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
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
                  <div></div> // Spacer
                )}
                
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} data-testid="btn-next-step">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={bookMutation.isPending}
                    data-testid="btn-submit-booking"
                  >
                    {bookMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
