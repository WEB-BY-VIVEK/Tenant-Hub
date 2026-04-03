import { Link } from "wouter";
import { Activity } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-card border-t py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-foreground font-bold text-lg">
            <Activity className="h-5 w-5 text-primary" />
            <span>Clinic Digital Growth</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/terms-and-conditions" className="hover:text-primary hover:underline transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/refund-policy" className="hover:text-primary hover:underline transition-colors">
              Refund Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-primary hover:underline transition-colors">
              Privacy Policy
            </Link>
            <a href="mailto:support@clinicdigitalgrowth.in" className="hover:text-primary hover:underline transition-colors">
              Contact Us
            </a>
          </nav>
        </div>

        <div className="mt-6 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Vivek Digital Clinic Solutions. All rights reserved.
          </p>
          <p className="mt-1">Empowering healthcare providers with modern digital tools across India.</p>
        </div>
      </div>
    </footer>
  );
}
