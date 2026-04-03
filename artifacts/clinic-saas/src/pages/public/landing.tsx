import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Star, ArrowRight, Activity, Shield, Clock, CalendarDays, Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiteFooter } from "@/components/site-footer";
import { customFetch } from "@workspace/api-client-react";

const WHATSAPP_NUMBER = "919876543210";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-in");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Landing() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const featuresRef = useScrollReveal();
  const pricingRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const contactRef = useScrollReveal();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await customFetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify(contactForm),
      });
      setContactForm({ name: "", phone: "", email: "", message: "" });
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    } catch {
      toast({ variant: "destructive", title: "Failed to send", description: "Please try again or call us directly." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.animate-in { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Activity className="h-6 w-6" />
            <span>Clinic Digital Growth</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/book">
              <Button variant="ghost" className="hidden sm:inline-flex" data-testid="link-book-patient">Patient Booking</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" data-testid="link-login">Doctor Login</Button>
            </Link>
            <Link href="/register">
              <Button data-testid="link-register">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
              <Activity className="h-4 w-4" /> Trusted by 500+ Indian Clinics
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto mb-6 leading-tight">
              Modernize Your Clinic.<br/>
              <span className="text-primary">Streamline Patient Care.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The complete digital operating system for Indian clinics. Manage appointments, token queues, and patient records with a platform doctors trust.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base" data-testid="btn-hero-start">
                  Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/book">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base" data-testid="btn-hero-demo">
                  View Patient Experience
                </Button>
              </Link>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto text-center">
              {[
                { stat: "500+", label: "Clinics onboarded" },
                { stat: "2L+", label: "Tokens issued" },
                { stat: "40%", label: "Less wait time" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-extrabold text-primary">{s.stat}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services / Features */}
        <section className="py-20 bg-background">
          <div ref={featuresRef} className="reveal container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything your clinic needs</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Purpose-built tools to reduce wait times and improve the patient experience.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Smart Token Queue", desc: "Live display of token numbers to keep your waiting room calm and organized.", icon: Clock },
                { title: "Digital Booking", desc: "Allow patients to book appointments online 24/7 without calling the reception.", icon: CalendarDays },
                { title: "Secure Records", desc: "Bank-grade security for your clinic data and patient information.", icon: Shield }
              ].map((feature, i) => (
                <Card key={i} className="border-none shadow-md bg-card/50 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 bg-muted/50">
          <div ref={pricingRef} className="reveal container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Website & Setup Packages</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">One-time setup fees for your digital presence. (SaaS subscription billed separately).</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { name: "Smart Booking", price: "₹7,999", desc: "Basic setup for small clinics", features: ["Booking Widget", "Token System", "Basic Support"] },
                { name: "Standalone Website", price: "₹12,999", desc: "Professional clinic website", features: ["Custom Domain", "5 Page Website", "SEO Optimized", "Booking Integration"] },
                { name: "Digital Growth", price: "₹18,999", desc: "The complete digital package", featured: true, features: ["Premium Website", "Social Media Setup", "Google Business Profile", "Priority Support", "Custom Branding"] }
              ].map((plan, i) => (
                <Card key={i} className={`relative ${plan.featured ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}>
                  {plan.featured && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Most Popular</div>}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-bold mt-2">{plan.price}<span className="text-sm font-normal text-muted-foreground">/one-time</span></div>
                    <CardDescription>{plan.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.featured ? "default" : "outline"} data-testid={`btn-plan-${plan.name.replace(/\s+/g, '-').toLowerCase()}`}>
                      Choose Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-background">
          <div ref={testimonialsRef} className="reveal container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">Trusted by Indian Doctors</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { name: "Dr. Sharma", clinic: "City Care Clinic", quote: "The token system has completely transformed our waiting room. No more crowded receptions." },
                { name: "Dr. Patel", clinic: "Wellness Center", quote: "Patients love booking online. It has reduced our reception call volume by 40%." }
              ].map((t, i) => (
                <Card key={i} className="bg-muted/30 border-none">
                  <CardContent className="pt-6">
                    <div className="flex text-yellow-400 mb-4">
                      {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="italic text-muted-foreground mb-4">"{t.quote}"</p>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.clinic}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "Is the platform secure?", a: "Yes, we use industry-standard encryption to protect all clinic and patient data." },
                { q: "Can I use my own domain?", a: "Yes, our Standalone Website and Digital Growth packages include custom domain mapping." },
                { q: "How does the token system work?", a: "Patients receive a token number upon booking. You can advance the queue from your dashboard, and patients can check their live status." },
                { q: "Is there a contract or lock-in period?", a: "No lock-in. Our monthly subscription can be cancelled anytime. One-time setup fees are non-refundable." }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact & Maps */}
        <section className="py-20 bg-background">
          <div ref={contactRef} className="reveal container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Have questions? Our team is ready to help you get started.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Form */}
              <div>
                <form onSubmit={handleContactSubmit} className="space-y-4" data-testid="contact-form">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="contact-name">Your Name</Label>
                      <Input
                        id="contact-name"
                        placeholder="Dr. Ramesh"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                        required
                        data-testid="contact-name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="contact-phone">Phone Number</Label>
                      <Input
                        id="contact-phone"
                        placeholder="+91 98765 43210"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(f => ({ ...f, phone: e.target.value }))}
                        required
                        data-testid="contact-phone"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contact-email">Email Address</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="doctor@yourclinic.in"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                      required
                      data-testid="contact-email"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Tell us about your clinic and what you're looking for..."
                      rows={4}
                      className="resize-none"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                      required
                      data-testid="contact-message"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending} data-testid="btn-contact-submit">
                    {sending ? "Sending..." : <><Send className="h-4 w-4 mr-2" /> Send Message</>}
                  </Button>
                </form>

                <div className="mt-8 space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <span>+91 98765 43210 (Mon–Sat, 9 AM – 7 PM)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span>support@clinicdigitalgrowth.in</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span>Andheri West, Mumbai, Maharashtra 400058</span>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="rounded-xl overflow-hidden border shadow-md h-[400px] lg:h-auto">
                <iframe
                  title="Clinic Digital Growth Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.521996024487!2d72.83283177473823!3d19.13368938210516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b7b2a9b0e02d%3A0x4a56d6c2f7c91234!2sAndheri+West%2C+Mumbai%2C+Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  data-testid="google-maps-embed"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20am%20interested%20in%20Clinic%20Digital%20Growth%20for%20my%20clinic.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 z-50"
        data-testid="btn-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.64 4.64 1.853 6.64L2.667 29.333l6.907-1.813A13.267 13.267 0 0 0 16.004 29.333C23.36 29.333 29.333 23.36 29.333 16c0-7.36-5.973-13.333-13.329-13.333zm0 24c-2.16 0-4.267-.587-6.107-1.693l-.44-.267-4.107 1.08 1.093-4-.28-.453A10.64 10.64 0 0 1 4.667 16c0-5.893 4.787-10.667 10.667-10.667 5.88 0 10.666 4.774 10.666 10.667 0 5.893-4.786 10.667-10.666 10.667zm5.84-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.144-.144.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.253-.613-.52-.533-.72-.547-.187-.013-.4-.013-.613-.013a1.2 1.2 0 0 0-.867.4c-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.267 3.453 5.493 4.84.773.333 1.373.533 1.84.68.773.24 1.48.2 2.04.12.627-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z"/>
        </svg>
      </a>
    </div>
  );
}
