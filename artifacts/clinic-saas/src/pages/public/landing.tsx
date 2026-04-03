import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Star, MessageCircle, ArrowRight, Activity, Shield, Clock, CalendarDays } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto mb-6">
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
          </div>
        </section>

        {/* Services / Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
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
                <Card key={i} className="border-none shadow-md bg-card/50">
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
          <div className="container mx-auto px-4">
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
          <div className="container mx-auto px-4">
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
                { q: "How does the token system work?", a: "Patients receive a token number upon booking. You can advance the queue from your dashboard, and patients can check their live status." }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="bg-card py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4 text-foreground font-bold">
            <Activity className="h-5 w-5 text-primary" />
            <span>Clinic Digital Growth</span>
          </div>
          <p className="text-sm mb-4">Empowering healthcare providers with modern digital tools.</p>
          <p className="text-xs">&copy; {new Date().getFullYear()} Clinic Digital Growth. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/919876543210" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50"
        data-testid="btn-whatsapp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
