import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen, PlayCircle, MessageCircle, Search, ChevronRight,
  LayoutDashboard, Calendar, CreditCard, Settings, Users,
  Ticket, BarChart3, Phone, Mail, ExternalLink, CheckCircle2,
  Clock, Shield, Zap
} from "lucide-react";

const VIDEO_TUTORIALS = [
  {
    id: 1,
    title: "Getting Started with Your Dashboard",
    duration: "3:45",
    category: "Basics",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    description: "A complete walkthrough of your clinic dashboard — overview cards, navigation, and quick actions.",
    roles: ["doctor", "super_admin"],
  },
  {
    id: 2,
    title: "Managing Appointments & Token Queue",
    duration: "5:12",
    category: "Appointments",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    description: "Learn how to view, approve, and manage patient appointments. Advance the token queue like a pro.",
    roles: ["doctor"],
  },
  {
    id: 3,
    title: "How Patient Booking Works",
    duration: "2:30",
    category: "Booking",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    description: "See exactly what patients see when they book an appointment at your clinic using your QR code.",
    roles: ["doctor"],
  },
  {
    id: 4,
    title: "Recharging Your Subscription",
    duration: "2:00",
    category: "Billing",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    description: "Step-by-step guide to recharging your monthly, quarterly, or yearly subscription via Razorpay.",
    roles: ["doctor"],
  },
  {
    id: 5,
    title: "Admin Panel Overview",
    duration: "6:00",
    category: "Admin",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    description: "A complete tour of the super-admin panel — clinic management, revenue stats, and inquiries.",
    roles: ["super_admin"],
  },
  {
    id: 6,
    title: "Managing Clinic Subscriptions",
    duration: "4:20",
    category: "Admin",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    description: "How to view, extend, and monitor subscriptions for all registered clinics on the platform.",
    roles: ["super_admin"],
  },
];

const GUIDES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Overview",
    color: "text-blue-600",
    bg: "bg-blue-50",
    roles: ["doctor"],
    steps: [
      "After logging in you land on the Overview page — it shows today's appointments, active token number, and revenue summary.",
      "The top stat cards show: Total Patients, Today's Appointments, Current Token, and Subscription status.",
      "The recent appointments table shows the latest 5 bookings with patient name, phone, and token number.",
      "Use the sidebar on the left to navigate between sections.",
    ],
  },
  {
    icon: Calendar,
    title: "Appointments & Token Queue",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    roles: ["doctor"],
    steps: [
      "Go to Appointments in the sidebar to see all bookings for your clinic.",
      "Each appointment shows: patient name, phone, token number, appointment date, and status.",
      "Click Advance Token to move the queue forward — patients waiting can see their live token status.",
      "You can filter appointments by date or status (pending / confirmed / done).",
      "Share your clinic QR code or booking link with patients so they can self-book online.",
    ],
  },
  {
    icon: Ticket,
    title: "Patient Booking & QR Code",
    color: "text-purple-600",
    bg: "bg-purple-50",
    roles: ["doctor"],
    steps: [
      "Your clinic has a unique public booking page at: /book?clinic=YOUR_CLINIC_ID",
      "Patients open this link (or scan your QR code), enter their details, and get a token number instantly.",
      "No app download or account needed for patients — it works on any mobile browser.",
      "Print your QR code from the Settings page and display it at your reception.",
      "Patients receive their token number and can check the live queue status from the same link.",
    ],
  },
  {
    icon: CreditCard,
    title: "Recharging Your Subscription",
    color: "text-amber-600",
    bg: "bg-amber-50",
    roles: ["doctor"],
    steps: [
      "Go to Recharge in the sidebar to view your current subscription status.",
      "Choose a plan: Monthly (₹999), Quarterly (₹2,499), or Yearly (₹7,999).",
      "Click Recharge and complete payment via Razorpay (UPI, card, net banking all supported).",
      "Your subscription is activated immediately after successful payment.",
      "You will see a warning banner 7 days before your subscription expires.",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    color: "text-rose-600",
    bg: "bg-rose-50",
    roles: ["doctor"],
    steps: [
      "The Analytics page shows charts for: daily appointments, patient footfall, and revenue trends.",
      "Use the date range filter to view data for any time period.",
      "The heatmap shows which days and times are busiest for your clinic.",
      "Export data as CSV from the top-right button on the Analytics page.",
    ],
  },
  {
    icon: Settings,
    title: "Clinic Settings",
    color: "text-slate-600",
    bg: "bg-slate-50",
    roles: ["doctor"],
    steps: [
      "Go to Settings to update your clinic name, address, city, and contact details.",
      "Upload a clinic logo and set your working hours and days.",
      "Change your account password from the Security section.",
      "Your public booking page URL and QR code are shown at the bottom of Settings.",
    ],
  },
  {
    icon: Users,
    title: "Managing Clinics (Admin)",
    color: "text-blue-600",
    bg: "bg-blue-50",
    roles: ["super_admin"],
    steps: [
      "Go to Clinics in the admin sidebar to view all registered clinics.",
      "Each clinic card shows: owner name, city, subscription status, and days remaining.",
      "Click on any clinic to open its detail view — see appointments, revenue, and subscription history.",
      "You can manually extend or deactivate a clinic's subscription from the detail page.",
    ],
  },
  {
    icon: MessageCircle,
    title: "Contact Inquiries (Admin)",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    roles: ["super_admin"],
    steps: [
      "The Inquiries tab shows all messages submitted via the landing page contact form.",
      "Filter by status: New, Contacted, Closed, or view All.",
      "Change the status of any inquiry using the dropdown — this helps track follow-ups.",
      "New inquiries appear first and are highlighted with a badge.",
    ],
  },
];

const FAQ = [
  {
    q: "How do patients get their token number?",
    a: "Patients visit your clinic's booking page (or scan your QR code), fill in their name and phone number, and immediately receive a token number. They can also check their live position in the queue from the same link.",
    roles: ["doctor"],
  },
  {
    q: "What happens when my subscription expires?",
    a: "Your dashboard will show a 'Subscription Expired' overlay. Patients will no longer be able to book new appointments until you recharge. Your existing data is safe and will be restored as soon as you recharge.",
    roles: ["doctor"],
  },
  {
    q: "Can I accept UPI payments from patients?",
    a: "Subscription payments (doctor recharging their plan) are done via Razorpay which supports UPI, cards, and net banking. Patient booking itself is free and requires no payment.",
    roles: ["doctor"],
  },
  {
    q: "How do I share my booking link with patients?",
    a: "Your unique booking URL is shown in the Settings page. You can copy it and share via WhatsApp, print the QR code for your reception desk, or display it on your clinic's social media.",
    roles: ["doctor"],
  },
  {
    q: "Can I add multiple doctors to one clinic?",
    a: "Currently each clinic account supports one primary doctor login. Multi-doctor support is on our roadmap. Contact support if you need this feature urgently.",
    roles: ["doctor"],
  },
  {
    q: "How do I register a new admin account?",
    a: "Go to /admin-login and click the Register tab. Fill in your details and enter the Admin Secret Key (CDG-ADMIN-2024). Your account will be created and you will be logged in automatically.",
    roles: ["super_admin"],
  },
  {
    q: "How is 'Online' status determined for admins?",
    a: "An admin is shown as Online if they logged in within the last 15 minutes. The Admin Users page auto-refreshes every 30 seconds to keep the status current.",
    roles: ["super_admin"],
  },
  {
    q: "How do I deactivate a clinic?",
    a: "Open the clinic from the Clinics page, and use the subscription management options to deactivate or let the subscription lapse. Deactivated clinics cannot accept new patient bookings.",
    roles: ["super_admin"],
  },
];

export default function HelpPage() {
  const { user } = useAuth();
  const role = user?.role ?? "doctor";
  const [search, setSearch] = useState("");
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const filteredVideos = VIDEO_TUTORIALS.filter(
    (v) => v.roles.includes(role) &&
      (search === "" || v.title.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredGuides = GUIDES.filter(
    (g) => g.roles.includes(role) &&
      (search === "" || g.title.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredFaq = FAQ.filter(
    (f) => f.roles.includes(role) &&
      (search === "" || f.q.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-br from-primary/5 via-blue-50/50 to-background rounded-2xl border">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Help Center</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Learn how to get the most out of Clinic Digital Growth — watch videos or read step-by-step guides.
        </p>
        {/* Search */}
        <div className="relative max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tutorials, guides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Quick Links */}
      {search === "" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: PlayCircle, label: "Video Tutorials", color: "text-red-500", anchor: "#videos" },
            { icon: BookOpen, label: "Step-by-step Guides", color: "text-blue-500", anchor: "#guides" },
            { icon: Zap, label: "FAQ", color: "text-amber-500", anchor: "#faq" },
            { icon: Phone, label: "Contact Support", color: "text-emerald-500", anchor: "#support" },
          ].map((item, i) => (
            <a key={i} href={item.anchor}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border hover:border-primary/30 h-full">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-5 text-center">
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}

      {/* Video Tutorials */}
      {filteredVideos.length > 0 && (
        <section id="videos">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold">Video Tutorials</h2>
            <Badge variant="secondary">{filteredVideos.length} videos</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Thumbnail / Player */}
                <div className="relative bg-slate-900 aspect-video flex items-center justify-center overflow-hidden">
                  {playingVideo === video.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      title={video.title}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <button
                          onClick={() => setPlayingVideo(video.id)}
                          className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all group-hover:scale-110"
                        >
                          <PlayCircle className="h-8 w-8 text-white fill-white" />
                        </button>
                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-0.5 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white text-xs border-0">{video.category}</Badge>
                      </div>
                    </>
                  )}
                </div>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm font-semibold leading-snug">{video.title}</CardTitle>
                  <CardDescription className="text-xs">{video.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <button
                    onClick={() => setPlayingVideo(video.id)}
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    Watch now <ChevronRight className="h-3 w-3" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Step-by-Step Guides */}
      {filteredGuides.length > 0 && (
        <section id="guides">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold">Step-by-Step Guides</h2>
            <Badge variant="secondary">{filteredGuides.length} guides</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {filteredGuides.map((guide, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${guide.bg} flex items-center justify-center flex-shrink-0`}>
                      <guide.icon className={`h-5 w-5 ${guide.color}`} />
                    </div>
                    <CardTitle className="text-base">{guide.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ol className="space-y-2">
                    {guide.steps.map((step, j) => (
                      <li key={j} className="flex gap-2.5 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {j + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {filteredFaq.length > 0 && (
        <section id="faq">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaq.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        {faq.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm pl-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      )}

      {/* No results */}
      {search !== "" && filteredVideos.length === 0 && filteredGuides.length === 0 && filteredFaq.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No results for "{search}"</p>
          <p className="text-sm mt-1">Try a different keyword or browse the sections above.</p>
        </div>
      )}

      {/* Support Card */}
      <section id="support">
        <Card className="bg-gradient-to-br from-primary/5 to-blue-50/50 border-primary/20">
          <CardContent className="py-8">
            <div className="text-center max-w-md mx-auto">
              <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Still need help?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Our support team is available Monday–Saturday, 9 AM to 7 PM. We typically respond within a few hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://wa.me/919560990946?text=Hi%2C%20I%20need%20help%20with%20Clinic%20Digital%20Growth" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Support
                  </Button>
                </a>
                <a href="mailto:support@clinicdigitalgrowth.in">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </Button>
                </a>
                <a href="tel:+919560990946">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Phone className="h-4 w-4" />
                    Call Us
                  </Button>
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Mon–Sat · 9 AM – 7 PM IST
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
