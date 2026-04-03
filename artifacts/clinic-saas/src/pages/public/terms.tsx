import { Link } from "wouter";
import { Activity, ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

const sections = [
  {
    title: "1. Services",
    content: (
      <div>
        <p className="mb-3 text-gray-600">We provide digital solutions for clinics, doctors, dentists, and hospitals, including but not limited to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
          <li>Clinic website development</li>
          <li>QR-based appointment booking</li>
          <li>Token management system</li>
          <li>Doctor dashboard</li>
          <li>Admin dashboard</li>
          <li>Subscription and recharge services</li>
        </ul>
      </div>
    ),
  },
  {
    title: "2. Payment Terms",
    content: (
      <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
        <li>All payments made through Razorpay are processed securely.</li>
        <li>The applicable package charges and monthly maintenance fees are clearly displayed before purchase.</li>
        <li>Subscription-based services are billed according to the selected plan.</li>
      </ul>
    ),
  },
  {
    title: "3. Subscription Validity",
    content: (
      <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
        <li>For QR-based plans, monthly maintenance starts from the 2nd month.</li>
        <li>Failure to renew the subscription may result in temporary suspension of dashboard and booking services until recharge is completed.</li>
      </ul>
    ),
  },
  {
    title: "4. Service Activation",
    content: (
      <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
        <li>Services will be activated after successful payment confirmation.</li>
        <li>Initial setup may require 1–7 business days depending on package complexity.</li>
      </ul>
    ),
  },
  {
    title: "5. Client Responsibilities",
    content: (
      <p className="text-gray-600">
        The client is responsible for providing accurate clinic information, doctor details, contact information, and branding content.
      </p>
    ),
  },
  {
    title: "6. Changes to Pricing",
    content: (
      <p className="text-gray-600">
        We reserve the right to update pricing, features, and plans with prior notice.
      </p>
    ),
  },
  {
    title: "7. Limitation of Liability",
    content: (
      <p className="text-gray-600">
        We are not liable for losses caused by third-party service outages, payment gateway downtime, hosting interruptions, or force majeure events.
      </p>
    ),
  },
  {
    title: "8. Governing Law",
    content: (
      <p className="text-gray-600">
        These terms shall be governed by the laws of India.
      </p>
    ),
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-lg">
            <Activity className="h-5 w-5" />
            <span>Clinic Digital Growth</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        {/* Page Title */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground text-sm">Effective Date: April 1, 2025</p>
          <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-primary" />
        </div>

        {/* Intro */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Welcome to <span className="font-semibold text-primary">Vivek Digital Clinic Solutions</span>. By accessing or using our website, dashboard, QR booking system, and related SaaS services, you agree to be bound by these Terms and Conditions.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-primary mb-3">{section.title}</h2>
              {section.content}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          If you have questions about these terms, contact us at{" "}
          <a href="mailto:support@clinicdigitalgrowth.in" className="text-primary hover:underline">
            support@clinicdigitalgrowth.in
          </a>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
