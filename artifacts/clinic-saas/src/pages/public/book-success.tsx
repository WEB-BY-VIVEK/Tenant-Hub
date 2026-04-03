import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, Activity, Calendar, Clock, MapPin, Ticket, QrCode } from "lucide-react";
import type { BookingConfirmation } from "@workspace/api-client-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

export default function BookSuccess() {
  const [, setLocation] = useLocation();
  const [bookingData, setBookingData] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("bookingData");
    if (data) {
      try {
        setBookingData(JSON.parse(data));
      } catch {
        setLocation("/book");
      }
    } else {
      setLocation("/book");
    }
  }, [setLocation]);

  if (!bookingData) return null;

  const qrValue = JSON.stringify({
    apptId: bookingData.appointment.id,
    token: bookingData.token.tokenNumber,
    name: bookingData.appointment.patientName,
    date: bookingData.appointment.appointmentDate,
  });

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl mb-8 flex justify-center">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Activity className="h-6 w-6" />
          <span>CDG</span>
        </Link>
      </div>

      <Card className="w-full max-w-xl border-none shadow-lg overflow-hidden">
        <div className="bg-primary pt-8 pb-12 px-6 text-primary-foreground text-center relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          <div className="bg-white/20 p-3 rounded-full inline-flex mb-4 relative z-10">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 relative z-10">Booking Confirmed!</h1>
          <p className="text-primary-foreground/80 relative z-10">{bookingData.message}</p>
        </div>

        <CardContent className="-mt-8 px-6 relative z-20">
          {/* Token Number */}
          <Card className="shadow-md border-border mb-6">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
                Your Token Number
              </div>
              <div className="text-6xl font-extrabold text-foreground mb-4 tracking-tighter tabular-nums flex items-center justify-center gap-4">
                <Ticket className="h-8 w-8 text-primary" />
                {bookingData.token.tokenNumber}
              </div>
              <div className="w-full h-px bg-border my-4" />
              <p className="text-sm text-muted-foreground">
                Please show this token number at the reception when you arrive.
              </p>
            </CardContent>
          </Card>

          {/* QR Code for Clinic Entry */}
          <Card className="shadow-sm border-dashed border-border mb-6">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
                <QrCode className="h-4 w-4" />
                <span>Scan at Reception</span>
              </div>
              <div className="bg-white p-3 rounded-lg border shadow-sm inline-block" data-testid="booking-qr-code">
                <QRCodeSVG
                  value={qrValue}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Staff can scan this QR code to instantly verify your appointment
              </p>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <div className="space-y-4 mt-4 px-2">
            <h3 className="font-semibold text-lg border-b pb-2">Appointment Details</h3>
            <div className="grid grid-cols-[30px_1fr] gap-3 items-start">
              <UserIcon className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
                <p className="font-medium">{bookingData.appointment.patientName}</p>
              </div>

              <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(bookingData.appointment.appointmentDate), "EEEE, MMMM do, yyyy")}
                </p>
              </div>

              <Clock className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Slot</p>
                <p className="font-medium">{bookingData.appointment.timeSlot}</p>
              </div>

              <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="font-medium">Clinic #{bookingData.appointment.clinicId}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-6 pb-8 bg-muted/20 mt-4">
          <Button
            className="w-full"
            size="lg"
            onClick={() => window.print()}
            data-testid="btn-print-token"
          >
            Save / Print Token
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full" data-testid="btn-return-home">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
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
