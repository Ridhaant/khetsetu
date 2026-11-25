import React, { useState } from "react";
import { CheckCircle2, FileText, AlertCircle, Package } from "lucide-react";
import { connected, request, demoLogin } from "./api";
import { money } from "./domain.mjs";
export function OrderDetail({
  order,
  onUpdated,
}: {
  order: any;
  onUpdated: () => void;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState("");
  if (!order)
    return <p>This order could not be found. Refresh the order list.</p>;
  async function change(path: string, body: unknown) {
    setBusy(true);
    setMessage("");
    try {
      await demoLogin("buyer");
      await request(path, body);
      setMessage("The API saved your change.");
      setForm("");
      onUpdated();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h2>Order {order.id}</h2>
      <p>
        {connected
          ? `${order.sellerName} · PIN ${order.pin}`
          : "This sample order illustrates seller-specific fulfilment. No purchase has been made."}
      </p>
      <div className="info-strip">
        <Package size={20} />
        <span>
          {order.status.replaceAll("_", " ")}
          {connected && ` · Payment ${order.paymentStatus}`}
        </span>
      </div>
      {connected ? (
        <>
          <dl className="settings-list">
            <div>
              <dt>Created</dt>
              <dd>
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </dd>
            </div>
            <div>
              <dt>Produce subtotal</dt>
              <dd>{money(order.subtotalPaise / 100)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{money(order.deliveryPaise / 100)}</dd>
            </div>
            <div>
              <dt>Fees and tax</dt>
              <dd>{money((order.feePaise + order.taxPaise) / 100)}</dd>
            </div>
            <div>
              <dt>Order total</dt>
              <dd>{money(order.totalPaise / 100)}</dd>
            </div>
          </dl>
          <h3 style={{ marginTop: 22 }}>Your order snapshot</h3>
          {order.items.map((i: any) => (
            <div className="list-row" key={i.listingId}>
              <div>
                <strong>{i.title}</strong>
                <p>
                  {i.quantity} {i.unit} × {money(i.unitPricePaise / 100)}
                </p>
              </div>
              <strong>{money(i.lineTotalPaise / 100)}</strong>
            </div>
          ))}
          <h3 style={{ marginTop: 22 }}>Tracking history</h3>
          {order.timeline.map((s: any, i: number) => (
            <div className="list-row" key={i}>
              <CheckCircle2 size={18} />
              <div>
                <strong>{s.status.replaceAll("_", " ")}</strong>
                <p>
                  {new Date(s.at).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </p>
              </div>
            </div>
          ))}
          {order.proof && (
            <div className="info-strip">
              <FileText size={18} />
              Delivery proof recorded: {order.proof.reference}
            </div>
          )}
          <div className="order-actions">
            {["pending_payment", "placed"].includes(order.status) && (
              <button
                className="secondary full"
                disabled={busy}
                onClick={() =>
                  change(`/orders/${order.id}/transition`, {
                    status: "cancelled",
                  })
                }
              >
                Cancel eligible order
              </button>
            )}
            {order.status === "delivered" && (
              <button
                className="primary full"
                disabled={busy}
                onClick={() =>
                  change(`/orders/${order.id}/transition`, {
                    status: "completed",
                  })
                }
              >
                Confirm delivery received
              </button>
            )}
            {order.status === "completed" && (
              <button
                className="secondary full"
                onClick={() => setForm("review")}
              >
                Leave a verified review
              </button>
            )}
            {["delivered", "completed"].includes(order.status) && (
              <button
                className="secondary full"
                onClick={() => setForm("dispute")}
              >
                Report a quality issue
              </button>
            )}
          </div>
          {form === "review" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                change("/reviews", {
                  orderId: order.id,
                  rating: +String(d.get("rating")),
                  text: d.get("text"),
                });
              }}
            >
              <label className="field">
                Your rating
                <select name="rating">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Your experience
                <textarea name="text" required maxLength={2000} />
              </label>
              <button className="primary full" disabled={busy}>
                Submit verified review
              </button>
            </form>
          )}
          {form === "dispute" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                change("/disputes", {
                  orderId: order.id,
                  reason: d.get("reason"),
                  details: d.get("details"),
                  evidence: [d.get("evidence")],
                });
              }}
            >
              <div className="warning">
                <AlertCircle size={19} />
                <p>
                  The API enforces its dispute window and requires securely
                  uploaded, scanned evidence. Upload scanning is not configured
                  in this MVP; this operation will fail closed.
                </p>
              </div>
              <label className="field">
                Reason
                <select name="reason">
                  <option value="quality">Quality</option>
                  <option value="weight">Weight discrepancy</option>
                  <option value="missing_items">Missing items</option>
                  <option value="damaged">Damaged produce</option>
                </select>
              </label>
              <label className="field">
                What happened?
                <textarea name="details" required maxLength={2000} />
              </label>
              <label className="field">
                Verified evidence reference
                <input
                  name="evidence"
                  required
                  placeholder="Secure storage reference"
                />
              </label>
              <button className="primary full" disabled={busy}>
                Submit issue to API
              </button>
            </form>
          )}
        </>
      ) : (
        <p>
          Sample tracking shows the expected journey. Reviews, invoice
          generation, delivery proof, and quality reports require the connected
          API and configured integrations.
        </p>
      )}
      {message && (
        <div className="info-strip" role="status">
          {message}
        </div>
      )}
    </>
  );
}
