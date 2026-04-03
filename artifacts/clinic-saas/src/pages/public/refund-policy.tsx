import { Link } from "wouter";
import { Activity, ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

const sections = [
  {
    title: "1. Initial Setup Charges",
    content: (
      <div>
        <p className="mb-3 text-gray-600">Initial setup charges are non-refundable once the project work has started, including:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
          <li>Website design</li>
          <li>Dashboard creation</li>
          <li>QR code setup</li>
          <li>Domain / hosting configuration</li>
        </ul>
      </div>
    ),
  },
  {
    title: "2. Monthly Maintenance Charges",
    content: (
      <p className="text-gray-600">
        Monthly maintenance and recharge payments are non-refundable once the billing cycle has started.
      </p>
    ),
  },
  {
    title: "3. Duplicate Payments",
    content: (
      <p className="text-gray-600">
        In case of accidental duplicate payment, the extra amount will be refunded within <span className="font-medium text-gray-800">5–7 business days</span> to the original payment method.
      </p>
    ),
  },
  {
    title: "4. Service Failure Refund",
    content: (
      <p className="text-gray-600">
        If the purchased service is not activated within the committed timeline due to our internal issue, the client may request a refund.
      </p>
    ),
  },
  {
    title: "5. Cancellation",
    content: (
      <p className="text-gray-600">
        Clients may cancel future monthly renewals by informing us before the next billing cycle.
      </p>
    ),
  },
  {
    title: "6. Refund Processing Time",
    content: (
      <p className="text-gray-600">
        Approved refunds will be processed through Razorpay and may take <span className="font-medium text-gray-800">5–7 business days</span> to reflect in the customer's bank account or UPI.
      </p>
    ),
  },
];

export default function RefundPolicy() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Refund &amp; Cancellation Policy</h1>
          <p className="text-muted-foreground text-sm">Effective Date: April 1, 2025</p>
          <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-primary" />
        </div>

        {/* Intro */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
          <p className="text-gray-700 leading-relaxed">
            At <span className="font-semibold text-primary">Vivek Digital Clinic Solutions</span>, we strive to provide high-quality digital services. Please read our refund and cancellation policy carefully before making a purchase.
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

        {/* Highlight Box */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm text-amber-800 font-medium">
            ⚠️ For refund requests or cancellations, please contact us at{" "}
            <a href="mailto:support@clinicdigitalgrowth.in" className="underline">
              support@clinicdigitalgrowth.in
            </a>{" "}
            with your transaction details.
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          This policy is subject to change. Continued use of our services constitutes acceptance of the updated policy.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
