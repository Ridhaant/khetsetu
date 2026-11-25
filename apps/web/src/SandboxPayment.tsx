import { useState } from "react";
import { Lock, RefreshCw } from "lucide-react";
import { money } from "./domain.mjs";
export type Reservation = {
  orders: { id: string; totalPaise?: number }[];
  payment: {
    available: boolean;
    reason?: string;
    status: string;
    providerOrderId?: string;
    amountPaise: number;
    currency?: string;
  };
};
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (name: string, handler: (r: unknown) => void) => void;
    };
  }
}
export function SandboxPayment({
  reservation,
  onRefresh,
}: {
  reservation: Reservation;
  onRefresh: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const key = (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_RAZORPAY_KEY_ID;
  async function open() {
    setBusy(true);
    setMessage("");
    try {
      if (!key?.startsWith("rzp_test_"))
        throw new Error(
          "Set VITE_RAZORPAY_KEY_ID to the matching public Razorpay test key. This development client rejects live keys.",
        );
      if (
        !reservation.payment.available ||
        !reservation.payment.providerOrderId
      )
        throw new Error(
          reservation.payment.reason ??
            "The API has not created a Razorpay provider order.",
        );
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const tag = document.createElement("script");
          tag.src = "https://checkout.razorpay.com/v1/checkout.js";
          tag.onload = () => resolve();
          tag.onerror = () =>
            reject(
              new Error(
                "Razorpay checkout could not load. Check your connection and try again.",
              ),
            );
          document.head.append(tag);
        });
      }
      if (!window.Razorpay)
        throw new Error("Razorpay checkout is unavailable.");
      const widget = new window.Razorpay({
        key,
        order_id: reservation.payment.providerOrderId,
        amount: reservation.payment.amountPaise,
        currency: "INR",
        name: "KhetSetu · Test checkout",
        description: "Development sandbox only",
        theme: { color: "#204c3d" },
        handler: () => {
          setMessage(
            "The gateway returned a response. Payment remains pending until the API verifies its signed capture webhook. Refresh the server order status.",
          );
          onRefresh();
        },
        modal: {
          ondismiss: () =>
            setMessage(
              "Checkout closed. No payment success has been assumed. Check the server order status before retrying.",
            ),
        },
      });
      widget.on("payment.failed", () =>
        setMessage(
          "The gateway reported a failure. Inventory remains reserved only until the reservation expires; check your server order state.",
        ),
      );
      widget.open();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">SERVER RESERVATION · PAYMENT PENDING</span>
          <h2>{money(reservation.payment.amountPaise / 100)}</h2>
        </div>
        <Lock size={22} />
      </div>
      <p>
        {reservation.orders.length} seller order
        {reservation.orders.length === 1 ? "" : "s"} reserved. Delivery, fees
        and taxes are included in the API total.
      </p>
      <p className="muted">
        {reservation.payment.reason ??
          "Only a signed Razorpay test capture can confirm payment. Checkout responses from this browser do not mark orders paid."}
      </p>
      {reservation.payment.available && (
        <button className="primary" disabled={busy} onClick={() => void open()}>
          {busy ? "Opening Razorpay…" : "Open Razorpay test checkout"}
          <Lock size={16} />
        </button>
      )}
      <button className="text-button" onClick={onRefresh}>
        <RefreshCw size={16} />
        Refresh server order status
      </button>
      {message && (
        <div className="info-strip" role="status">
          {message}
        </div>
      )}
    </section>
  );
}
