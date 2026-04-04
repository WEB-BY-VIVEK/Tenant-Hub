import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

type Step = "email" | "otp" | "reset" | "done";

interface OtpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OtpModal({ open, onOpenChange }: OtpModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("email");
        setEmail("");
        setOtp(["", "", "", "", "", ""]);
        setNewPassword("");
        setConfirmPassword("");
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: data.error || "Failed to send OTP." });
        return;
      }
      setStep("otp");
      setResendCooldown(60);
      toast({ title: "OTP Sent", description: `A 6-digit code was sent to ${email}` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not connect to server." });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("").slice(0, 6);
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextEmpty = newOtp.findIndex((v, i) => i >= index && !v);
      const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs.current[focusIdx]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Invalid OTP", description: data.error || "Wrong or expired code." });
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }
      setStep("reset");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not connect to server." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ variant: "destructive", title: "Weak password", description: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: data.error || "Reset failed." });
        return;
      }
      setStep("done");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not connect to server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "email" && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">Forgot Password</DialogTitle>
              <DialogDescription className="text-center">
                Enter your registered email address and we'll send you a 6-digit verification code.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input
                type="email"
                placeholder="doctor@yourclinic.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="h-11"
                autoFocus
              />
              <Button className="w-full h-11" onClick={handleSendOtp} disabled={!email || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                Send OTP Code
              </Button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <DialogHeader>
              <button onClick={() => setStep("email")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 w-fit">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <DialogTitle className="text-center text-xl">Enter Verification Code</DialogTitle>
              <DialogDescription className="text-center">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-2">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 text-center text-xl font-bold border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    style={{ height: "52px" }}
                  />
                ))}
              </div>
              <Button
                className="w-full h-11"
                onClick={handleVerifyOtp}
                disabled={otp.join("").length < 6 || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify Code
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Didn't receive it?{" "}
                {resendCooldown > 0 ? (
                  <span className="text-muted-foreground">Resend in {resendCooldown}s</span>
                ) : (
                  <button onClick={handleSendOtp} className="text-blue-600 font-medium hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {step === "reset" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Set New Password</DialogTitle>
              <DialogDescription className="text-center">
                Create a strong new password for your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder="New password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
              <Button className="w-full h-11" onClick={handleResetPassword} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset Password
              </Button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Password Reset!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Back to Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
