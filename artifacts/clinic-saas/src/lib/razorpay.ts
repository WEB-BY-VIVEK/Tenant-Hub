declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  config?: {
    display?: {
      blocks?: Record<string, { name: string; instruments: { method: string; flows?: string[] }[] }>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
}

interface RazorpayInstance {
  open(): void;
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  onSuccess: (response: RazorpayResponse) => void;
  onDismiss?: () => void;
}): Promise<void> {
  await loadScript();

  const rzp = new window.Razorpay({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency,
    name: "Vivek Digital Clinic Solutions",
    description: options.description,
    order_id: options.orderId,
    handler: options.onSuccess,
    theme: { color: "#2563eb" },
    modal: { ondismiss: options.onDismiss },
    config: {
      display: {
        blocks: {
          upi_block: {
            name: "Pay via UPI",
            instruments: [
              { method: "upi", flows: ["collect", "intent", "qr"] },
            ],
          },
          other: {
            name: "Other Payment Methods",
            instruments: [
              { method: "card" },
              { method: "netbanking" },
              { method: "wallet" },
            ],
          },
        },
        sequence: ["block.upi_block", "block.other"],
        preferences: { show_default_blocks: false },
      },
    },
  });

  rzp.open();
}
