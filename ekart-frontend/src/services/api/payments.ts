import { apiClient } from "./client";

export interface PaymentTransaction {
  transactionId: number;
  orderId: number;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  razorpayKeyId?: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * PaymentMS (/api/payments/**) is still being built server-side as of this writing.
 * These calls are wired up correctly against the documented contract so they'll work the
 * moment the backend lands — but until then they will fail with a network/404 error, which
 * callers should catch and fall back to a friendly "online payments coming soon" message.
 */
export async function createPaymentOrder(customerEmailId: string, orderId: number): Promise<PaymentTransaction> {
  const { data } = await apiClient.post<PaymentTransaction>(
    `/payments/customer/${encodeURIComponent(customerEmailId)}/order/${orderId}/create-payment-order`
  );
  return data;
}

export async function verifyPayment(
  customerEmailId: string,
  payload: { orderId: number; gatewayOrderId: string; gatewayPaymentId: string; gatewaySignature: string }
): Promise<PaymentTransaction> {
  const { data } = await apiClient.post<PaymentTransaction>(
    `/payments/customer/${encodeURIComponent(customerEmailId)}/verify-payment`,
    payload
  );
  return data;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

/**
 * Opens the Razorpay Checkout widget for a created payment order. Resolves with the widget's
 * success callback payload, or rejects if the user dismisses the modal / it fails to load.
 * Requires the Razorpay checkout.js script (loaded lazily here) and a real key id from
 * createPaymentOrder — both unavailable until PaymentMS + real Razorpay keys are provided.
 */
export function openRazorpayCheckout(transaction: PaymentTransaction, customerName: string, customerEmail: string): Promise<RazorpaySuccessResponse> {
  return new Promise((resolve, reject) => {
    const scriptId = "razorpay-checkout-js";
    const openWidget = () => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay checkout script failed to load."));
        return;
      }
      const rzp = new window.Razorpay({
        key: transaction.razorpayKeyId,
        amount: Math.round(transaction.amount * 100),
        currency: transaction.currency ?? "INR",
        order_id: transaction.gatewayOrderId,
        name: "Mithai Junction",
        description: `Order #${transaction.orderId}`,
        prefill: { name: customerName, email: customerEmail },
        theme: { color: "#b45309" },
        handler: (response: RazorpaySuccessResponse) => resolve(response),
        modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
      });
      rzp.open();
    };

    if (window.Razorpay) {
      openWidget();
      return;
    }

    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.addEventListener("load", openWidget);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = openWidget;
    script.onerror = () => reject(new Error("Could not load Razorpay checkout script."));
    document.body.appendChild(script);
  });
}
