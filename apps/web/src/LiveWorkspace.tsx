import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ClipboardList,
  FileText,
  LoaderCircle,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Download,
} from "lucide-react";
import { request, demoLogin } from "./api";
import { money } from "./domain.mjs";
import { SandboxPayment } from "./SandboxPayment";

type Props = { notify: (message: string) => void; onRefresh?: () => void };
type Listing = {
  id: string;
  title: string;
  unit: string;
  price: number;
  availableQuantity: number;
  reservedQuantity: number;
  minimumQuantity: number;
  status: string;
  grade: string;
};
type Quote = {
  id: string;
  sellerName: string;
  price: number;
  quantity: number;
  validUntil: string;
  status: string;
  notes: string;
  listingId: string;
};
type Rfq = {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  pin: string;
  deliveryBy: string;
  status: string;
  notes: string;
  quotes: Quote[];
};
type Order = {
  id: string;
  sellerName: string;
  buyerId: string;
  status: string;
  paymentStatus: string;
  totalPaise: number;
  items: { title: string; quantity: number; unit: string }[];
};
type Dispute = {
  id: string;
  orderId: string;
  reason: string;
  details: string;
  evidence: string[];
  status: string;
  resolution?: string;
};
type Audit = {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  at: string;
  hash: string;
};
type Checkout = {
  orders: Order[];
  payment: {
    available: boolean;
    reason?: string;
    amountPaise: number;
    status: string;
  };
};
const readable = (value: string) => value.replace(/_/g, " ");
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The request could not be completed. Please try again.";
const date = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
const data = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  return Object.fromEntries(new FormData(event.currentTarget)) as Record<
    string,
    string
  >;
};
function Notice({ role }: { role: string }) {
  return (
    <div className="info-strip">
      <ShieldCheck size={20} />
      <span>
        <strong>Connected development API · {role} demonstration</strong>
        <br />
        These are selectable demo identities. API records are temporary and
        reset when the server restarts. Payments remain pending until a signed
        Razorpay test capture.
      </span>
    </div>
  );
}
function Failure({ error, retry }: { error: string; retry: () => void }) {
  return error ? (
    <div className="warning" role="alert">
      <AlertCircle size={20} />
      <div>
        <strong>We could not complete that request.</strong>
        <p>{error}</p>
        <button type="button" className="secondary compact" onClick={retry}>
          Try again
        </button>
      </div>
    </div>
  ) : null;
}
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="muted" style={{ padding: "1.5rem 0" }}>
      {children}
    </p>
  );
}
function Loading() {
  return (
    <p role="status">
      <LoaderCircle size={18} /> Loading API records…
    </p>
  );
}
function Status({ value }: { value: string }) {
  return <span className="status">{readable(value)}</span>;
}
function useKeys() {
  const keys = useRef(new Map<string, string>());
  return (scope: string) => {
    if (!keys.current.has(scope)) keys.current.set(scope, crypto.randomUUID());
    return keys.current.get(scope)!;
  };
}

export function LiveRfqs({ notify, onRefresh, pin }: Props & { pin: string }) {
  const [rfqs, setRfqs] = useState<Rfq[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [create, setCreate] = useState(false),
    [checkout, setCheckout] = useState<Checkout | null>(null);
  const key = useKeys();
  const generation = useRef(0);
  async function refresh() {
    const run = ++generation.current;
    setBusy(true);
    setError("");
    try {
      await demoLogin("buyer");
      const records = await request("/rfqs");
      if (run === generation.current) setRfqs(records);
    } catch (e) {
      if (run === generation.current) setError(message(e));
    } finally {
      if (run === generation.current) setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
    return () => {
      generation.current++;
    };
  }, []);
  async function accept(quote: Quote) {
    setBusy(true);
    setError("");
    try {
      await demoLogin("buyer");
      const result = await request(`/quotes/${quote.id}/accept`, {}, "POST", {
        "Idempotency-Key": key(`quote:${quote.id}`),
      });
      setCheckout(result);
      notify("Quotation accepted. Seller order created with payment pending.");
      await refresh();
      onRefresh?.();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function createRfq(event: FormEvent<HTMLFormElement>) {
    const values = data(event);
    setBusy(true);
    setError("");
    try {
      await demoLogin("buyer");
      await request("/rfqs", {
        title: values.title,
        category: values.category,
        quantity: Number(values.quantity),
        unit: values.unit,
        pin,
        deliveryBy: new Date(`${values.date}T12:00:00+05:30`).toISOString(),
        notes: values.notes ?? "",
      });
      setCreate(false);
      notify("Bulk requirement submitted to the development API.");
      await refresh();
      onRefresh?.();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-title row-title">
        <div>
          <span className="eyebrow">YOUR BULK REQUIREMENTS</span>
          <h1>Bulk buying</h1>
          <p>Compare actual seller quotations for your API account.</p>
        </div>
        <button
          className="primary"
          disabled={busy}
          onClick={() => setCreate(!create)}
        >
          <Plus size={18} />
          {create ? "Close form" : "New requirement"}
        </button>
      </div>
      <Notice role="Buyer" />
      <Failure error={error} retry={() => void refresh()} />
      {create && (
        <section className="panel">
          <h2>Tell growers what you need.</h2>
          <form className="form" onSubmit={createRfq}>
            <label className="field">
              Produce requirement
              <input
                name="title"
                required
                maxLength={120}
                placeholder="e.g. Grade A tomatoes for a restaurant"
              />
            </label>
            <label className="field">
              Category
              <select name="category">
                {[
                  "Vegetables",
                  "Fruits",
                  "Grains",
                  "Pulses",
                  "Spices",
                  "Oilseeds",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Quantity
              <input
                name="quantity"
                type="number"
                min="0.001"
                step="0.001"
                required
              />
            </label>
            <label className="field">
              Unit
              <select name="unit">
                {[
                  "kg",
                  "gram",
                  "quintal",
                  "tonne",
                  "litre",
                  "piece",
                  "box",
                  "bag",
                  "crate",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Required date · India time
              <input
                name="date"
                type="date"
                min={new Date().toLocaleDateString("en-CA", {
                  timeZone: "Asia/Kolkata",
                })}
                required
              />
            </label>
            <label className="field">
              Notes
              <textarea name="notes" maxLength={2000} rows={3} />
            </label>
            <p className="form-note">
              Delivery PIN {pin}. Accepting a quote creates a pending-payment
              order; it does not collect money.
            </p>
            <button className="primary" disabled={busy}>
              Submit requirement
            </button>
          </form>
        </section>
      )}
      {checkout && (
        <SandboxPayment
          reservation={checkout}
          onRefresh={() => void refresh()}
        />
      )}
      {checkout && (
        <section className="panel" aria-live="polite">
          <h2>Your quotation became an order.</h2>
          <p>
            {checkout.orders.length} seller order ·{" "}
            {money(checkout.payment.amountPaise / 100)} · payment pending.
          </p>
          <p>
            {checkout.payment.reason ??
              "Complete an actual Razorpay test checkout before fulfilment can begin. No payment has been confirmed."}
          </p>
          {checkout.orders.map((order) => (
            <p key={order.id}>
              <strong>{order.id}</strong>
            </p>
          ))}
        </section>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h2>Your requirements</h2>
          <button
            className="secondary compact"
            disabled={busy}
            onClick={() => void refresh()}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        {busy && <Loading />}
        {!busy && rfqs.length === 0 && (
          <Empty>
            No bulk requirements yet. Create one to receive real quotations from
            the development seller accounts.
          </Empty>
        )}
        {rfqs.map((rfq) => (
          <article
            key={rfq.id}
            style={{ padding: "1.25rem 0", borderBottom: "1px solid #e2e8e2" }}
          >
            <div className="panel-heading">
              <div>
                <h3>{rfq.title}</h3>
                <p>
                  {rfq.quantity} {rfq.unit} · PIN {rfq.pin} · Needed{" "}
                  {date(rfq.deliveryBy)}
                </p>
              </div>
              <Status value={rfq.status} />
            </div>
            {rfq.notes && <p>{rfq.notes}</p>}
            {rfq.quotes.length === 0 ? (
              <Empty>
                No quotations received. A seller can respond from the connected
                seller workspace.
              </Empty>
            ) : (
              <div className="quote-grid">
                {[...rfq.quotes]
                  .sort((a, b) => a.price - b.price)
                  .map((quote) => {
                    const expired =
                      new Date(quote.validUntil).getTime() <= Date.now();
                    return (
                      <section className="quote-card" key={quote.id}>
                        <h3>{quote.sellerName}</h3>
                        <div className="quote-price">
                          <strong>
                            {money(quote.price)}
                            <small> / {rfq.unit}</small>
                          </strong>
                          <span>
                            {quote.quantity} {rfq.unit} offered
                          </span>
                        </div>
                        <p>
                          Produce subtotal:{" "}
                          <strong>{money(quote.price * rfq.quantity)}</strong>
                        </p>
                        <p className="muted">
                          Delivery is calculated by the API when accepted. Valid
                          until {date(quote.validUntil)}.
                        </p>
                        {quote.notes && <p>{quote.notes}</p>}
                        <button
                          className="secondary full"
                          disabled={
                            busy ||
                            rfq.status !== "open" ||
                            quote.status !== "open" ||
                            expired
                          }
                          onClick={() => void accept(quote)}
                        >
                          {quote.status === "accepted"
                            ? "Accepted"
                            : expired
                              ? "Expired"
                              : "Accept quotation"}
                        </button>
                      </section>
                    );
                  })}
              </div>
            )}
          </article>
        ))}
      </section>
    </>
  );
}

export function LiveSeller({ notify, onRefresh }: Props) {
  const [sellerId, setSellerId] = useState("s1"),
    [listings, setListings] = useState<Listing[]>([]),
    [orders, setOrders] = useState<Order[]>([]),
    [rfqs, setRfqs] = useState<Rfq[]>([]),
    [tab, setTab] = useState("Inventory"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [create, setCreate] = useState(false);
  const generation = useRef(0);
  async function refresh() {
    const run = ++generation.current;
    setBusy(true);
    setError("");
    try {
      await demoLogin("seller", sellerId);
      const [inventory, actualOrders, requirements] = await Promise.all([
        request("/seller/listings"),
        request("/orders"),
        request("/rfqs"),
      ]);
      if (run === generation.current) {
        setListings(inventory);
        setOrders(actualOrders);
        setRfqs(requirements);
      }
    } catch (e) {
      if (run === generation.current) setError(message(e));
    } finally {
      if (run === generation.current) setBusy(false);
    }
  }
  useEffect(() => {
    setListings([]);
    setOrders([]);
    setRfqs([]);
    void refresh();
    return () => {
      generation.current++;
    };
  }, [sellerId]);
  async function mutate(
    path: string,
    body: unknown,
    success: string,
    method = "POST",
  ) {
    setBusy(true);
    setError("");
    try {
      await demoLogin("seller", sellerId);
      await request(path, body, method);
      notify(success);
      await refresh();
      onRefresh?.();
      return true;
    } catch (e) {
      setError(message(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function createListing(event: FormEvent<HTMLFormElement>) {
    const values = data(event);
    if (
      await mutate(
        "/seller/listings",
        {
          title: values.title,
          category: values.category,
          unit: values.unit,
          grade: values.grade,
          price: Number(values.price),
          availableQuantity: Number(values.quantity),
          minimumQuantity: Number(values.minimum),
        },
        "Listing created in the development API.",
      )
    )
      setCreate(false);
  }
  async function stock(event: FormEvent<HTMLFormElement>, listing: Listing) {
    const values = data(event);
    await mutate(
      `/seller/listings/${listing.id}`,
      { availableQuantity: Number(values.quantity) },
      "Stock updated. Existing reservations were checked.",
      "PATCH",
    );
  }
  async function quote(event: FormEvent<HTMLFormElement>, rfq: Rfq) {
    const values = data(event);
    await mutate(
      `/rfqs/${rfq.id}/quotes`,
      {
        listingId: values.listingId,
        price: Number(values.price),
        quantity: Number(values.quantity),
        validUntil: new Date(values.validUntil).toISOString(),
        notes: values.notes ?? "",
      },
      "Quotation sent to the buyer.",
    );
  }
  return (
    <>
      <div className="page-title row-title">
        <div>
          <span className="eyebrow">YOUR FARM. YOUR BUSINESS.</span>
          <h1>Seller workspace</h1>
          <p>
            Manage actual development inventory, seller orders, and quotations.
          </p>
        </div>
        <button
          className="primary"
          disabled={busy}
          onClick={() => setCreate(!create)}
        >
          <Plus size={18} />
          {create ? "Close form" : "Create listing"}
        </button>
      </div>
      <Notice role="Seller" />
      <Failure error={error} retry={() => void refresh()} />
      <section className="panel">
        <div className="panel-heading">
          <label className="field" style={{ marginBottom: 0 }}>
            Development seller account
            <select
              value={sellerId}
              disabled={busy}
              onChange={(e) => setSellerId(e.target.value)}
            >
              <option value="s1">Sahyadri Farmers Collective</option>
              <option value="s2">Patil Family Farm</option>
              <option value="s3">Deccan Harvest FPO</option>
            </select>
          </label>
          <button
            className="secondary compact"
            disabled={busy}
            onClick={() => void refresh()}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        <p className="muted">
          All three accounts are seeded fixtures. Selecting one is a development
          role switch.
        </p>
      </section>
      <div className="stats-grid three">
        {[
          [
            "Active listings",
            listings.filter((l) => l.status === "active").length,
          ],
          ["Seller orders", orders.length],
          ["Open requirements", rfqs.filter((r) => r.status === "open").length],
        ].map(([label, value]) => (
          <section className="panel" key={label}>
            <span className="eyebrow">{label}</span>
            <h2>{value}</h2>
          </section>
        ))}
      </div>
      {create && (
        <section className="panel">
          <h2>Add your produce</h2>
          <form className="form" onSubmit={createListing}>
            <label className="field">
              Produce title
              <input name="title" maxLength={120} required />
            </label>
            <label className="field">
              Category
              <select name="category">
                {[
                  "Vegetables",
                  "Fruits",
                  "Grains",
                  "Pulses",
                  "Spices",
                  "Oilseeds",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Unit
              <select name="unit">
                {[
                  "kg",
                  "gram",
                  "quintal",
                  "tonne",
                  "litre",
                  "piece",
                  "box",
                  "bag",
                  "crate",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Price per unit (₹)
              <input
                name="price"
                type="number"
                min="0.01"
                max="100000"
                step="0.01"
                required
              />
            </label>
            <label className="field">
              Total stock
              <input
                name="quantity"
                type="number"
                min="0"
                step="0.001"
                required
              />
            </label>
            <label className="field">
              Minimum order quantity
              <input
                name="minimum"
                type="number"
                min="0.001"
                step="0.001"
                defaultValue="1"
                required
              />
            </label>
            <label className="field">
              Grade
              <select name="grade">
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </label>
            <p className="form-note">
              The seeded seller must already be verified. Listings expire after
              seven days in this reference API.
            </p>
            <button className="primary" disabled={busy}>
              Create API listing
            </button>
          </form>
        </section>
      )}
      <div className="tabs">
        {["Inventory", "Orders", "Bulk requirements"].map((name) => (
          <button
            className={tab === name ? "active" : ""}
            key={name}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {busy && <Loading />}
      {tab === "Inventory" && (
        <section className="panel">
          <h2>Listings & inventory</h2>
          {!busy && listings.length === 0 && (
            <Empty>No listings for this seller account.</Empty>
          )}
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="list-row"
              style={{ alignItems: "flex-start", flexWrap: "wrap" }}
            >
              <Sprout size={22} />
              <div style={{ flex: "1 1 200px" }}>
                <h3>{listing.title}</h3>
                <p>
                  {money(listing.price)} / {listing.unit} · Grade{" "}
                  {listing.grade}
                </p>
                <p>
                  Total: {listing.availableQuantity} · Reserved:{" "}
                  {listing.reservedQuantity} · Available:{" "}
                  {Math.max(
                    0,
                    listing.availableQuantity - listing.reservedQuantity,
                  )}{" "}
                  {listing.unit}
                </p>
                <Status value={listing.status} />
              </div>
              <form
                onSubmit={(e) => void stock(e, listing)}
                style={{
                  display: "flex",
                  alignItems: "end",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <label
                  className="field"
                  style={{ marginBottom: 0, maxWidth: 170 }}
                >
                  Total stock ({listing.unit})
                  <input
                    key={`${listing.id}-${listing.availableQuantity}`}
                    name="quantity"
                    type="number"
                    min={listing.reservedQuantity}
                    step="0.001"
                    defaultValue={listing.availableQuantity}
                    required
                  />
                </label>
                <button className="secondary compact" disabled={busy}>
                  Update stock
                </button>
                <button
                  className="secondary compact"
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void mutate(
                      `/seller/listings/${listing.id}`,
                      {
                        status:
                          listing.status === "active" ? "paused" : "active",
                      },
                      "Listing availability updated.",
                      "PATCH",
                    )
                  }
                >
                  {listing.status === "active" ? "Pause" : "Activate"}
                </button>
              </form>
            </div>
          ))}
        </section>
      )}
      {tab === "Orders" && (
        <section className="panel">
          <h2>Your seller orders</h2>
          {!busy && orders.length === 0 && (
            <Empty>
              No orders yet. A buyer checkout for your listing will create a
              pending-payment seller order here.
            </Empty>
          )}
          {orders.map((order) => {
            const next: Record<string, string> = {
              placed: "accepted",
              accepted: "packed",
              packed: "dispatched",
            };
            return (
              <div
                key={order.id}
                className="list-row"
                style={{ flexWrap: "wrap" }}
              >
                <Package size={22} />
                <div style={{ flex: "1 1 240px" }}>
                  <strong>{order.id}</strong>
                  <p>
                    {order.items
                      .map(
                        (item) =>
                          `${item.title} · ${item.quantity} ${item.unit}`,
                      )
                      .join(", ")}
                  </p>
                  <p>
                    {money(order.totalPaise / 100)} · Payment:{" "}
                    {readable(order.paymentStatus)}
                  </p>
                  <Status value={order.status} />
                </div>
                {next[order.status] && (
                  <button
                    className="primary compact"
                    disabled={busy || order.paymentStatus !== "paid"}
                    onClick={() =>
                      void mutate(
                        `/orders/${order.id}/transition`,
                        { status: next[order.status] },
                        `Order marked ${next[order.status]}.`,
                      )
                    }
                  >
                    Mark {next[order.status]}
                  </button>
                )}
                {["pending_payment", "placed", "accepted"].includes(
                  order.status,
                ) && (
                  <button
                    className="secondary compact"
                    disabled={busy}
                    onClick={() =>
                      void mutate(
                        `/orders/${order.id}/transition`,
                        { status: "cancelled" },
                        "Order cancelled. Captured funds still require provider refund reconciliation.",
                      )
                    }
                  >
                    Cancel order
                  </button>
                )}
                {order.status === "dispatched" && (
                  <p className="muted">
                    Delivery confirmation needs a configured proof-upload and
                    scanning service.
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}
      {tab === "Bulk requirements" && (
        <section className="panel">
          <h2>Buyer requirements</h2>
          {!busy && rfqs.length === 0 && (
            <Empty>No buyer requirements have been created.</Empty>
          )}
          {rfqs.map((rfq) => (
            <article
              key={rfq.id}
              style={{
                padding: "1.25rem 0",
                borderBottom: "1px solid #e2e8e2",
              }}
            >
              <div className="panel-heading">
                <div>
                  <h3>{rfq.title}</h3>
                  <p>
                    {rfq.quantity} {rfq.unit} · PIN {rfq.pin} · Needed{" "}
                    {date(rfq.deliveryBy)}
                  </p>
                </div>
                <Status value={rfq.status} />
              </div>
              {rfq.quotes.map((q) => (
                <p key={q.id}>
                  Your quote: {money(q.price)} / {rfq.unit} ·{" "}
                  {readable(q.status)} · Valid until {date(q.validUntil)}
                </p>
              ))}
              {rfq.status === "open" &&
                (listings.filter(
                  (l) => l.unit === rfq.unit && l.status === "active",
                ).length ? (
                  <form className="form" onSubmit={(e) => void quote(e, rfq)}>
                    <label className="field">
                      Your produce listing
                      <select name="listingId">
                        {listings
                          .filter(
                            (l) => l.unit === rfq.unit && l.status === "active",
                          )
                          .map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.title} ·{" "}
                              {l.availableQuantity - l.reservedQuantity}{" "}
                              {l.unit} free
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="field">
                      Quoted price per {rfq.unit} (₹)
                      <input
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </label>
                    <label className="field">
                      Quantity offered ({rfq.unit})
                      <input
                        name="quantity"
                        type="number"
                        min={rfq.quantity}
                        step="0.001"
                        defaultValue={rfq.quantity}
                        required
                      />
                    </label>
                    <label className="field">
                      Quote valid until · your local time
                      <input name="validUntil" type="datetime-local" required />
                    </label>
                    <label className="field">
                      Notes
                      <textarea name="notes" maxLength={2000} rows={2} />
                    </label>
                    <button className="secondary" disabled={busy}>
                      Send quotation
                    </button>
                  </form>
                ) : (
                  <p className="muted">
                    Create an active listing in {rfq.unit} before quoting this
                    requirement.
                  </p>
                ))}
            </article>
          ))}
        </section>
      )}
    </>
  );
}

export function LiveAdmin({ notify, onRefresh }: Props) {
  const [orders, setOrders] = useState<Order[]>([]),
    [disputes, setDisputes] = useState<Dispute[]>([]),
    [audit, setAudit] = useState<Audit[]>([]),
    [tab, setTab] = useState("Orders"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = useKeys();
  async function refresh() {
    setBusy(true);
    setError("");
    try {
      await demoLogin("admin");
      const [actualOrders, actualDisputes, actualAudit] = await Promise.all([
        request("/orders"),
        request("/disputes"),
        request("/admin/audit"),
      ]);
      setOrders(actualOrders);
      setDisputes(actualDisputes);
      setAudit(actualAudit);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function mutate(
    path: string,
    body: unknown,
    success: string,
    headers: Record<string, string> = {},
  ) {
    setBusy(true);
    setError("");
    try {
      await demoLogin("admin");
      await request(path, body, "POST", headers);
      notify(success);
      await refresh();
      onRefresh?.();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function refund(event: FormEvent<HTMLFormElement>, order: Order) {
    const values = data(event);
    const amountPaise = Math.round(Number(values.amount) * 100);
    await mutate(
      `/orders/${order.id}/refund`,
      { amountPaise },
      "Refund requested from the test provider. Completion still awaits its signed webhook.",
      { "Idempotency-Key": key(`refund:${order.id}:${amountPaise}`) },
    );
  }
  function exportOrders() {
    const cell = (value: unknown) => {
      let text = String(value ?? "");
      if (/^[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };
    const rows = [
      ["Order", "Buyer", "Seller", "Status", "Payment status", "Total INR"],
      ...orders.map((o) => [
        o.id,
        o.buyerId,
        o.sellerName,
        o.status,
        o.paymentStatus,
        (o.totalPaise / 100).toFixed(2),
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "khetsetu-development-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="page-title row-title">
        <div>
          <span className="eyebrow">KHETSETU OPERATIONS</span>
          <h1>Administration</h1>
          <p>
            Actual development records, permission-checked API actions, and
            audit history.
          </p>
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => void refresh()}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>
      <Notice role="Administrator" />
      <Failure error={error} retry={() => void refresh()} />
      <div className="stats-grid three">
        {[
          ["API orders", orders.length],
          ["Open disputes", disputes.filter((d) => d.status === "open").length],
          [
            "Pending refunds",
            orders.filter((o) => o.paymentStatus === "refund_pending").length,
          ],
        ].map(([label, value]) => (
          <section className="panel" key={label}>
            <span className="eyebrow">{label}</span>
            <h2>{value}</h2>
          </section>
        ))}
      </div>
      <div className="tabs">
        {["Orders", "Disputes", "Audit history"].map((name) => (
          <button
            key={name}
            className={tab === name ? "active" : ""}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {busy && <Loading />}
      {tab === "Orders" && (
        <section className="panel">
          <div className="panel-heading">
            <h2>Seller orders & refunds</h2>
            <button
              className="secondary compact"
              disabled={orders.length === 0}
              onClick={exportOrders}
            >
              <Download size={16} />
              Export orders CSV
            </button>
          </div>
          {!busy && orders.length === 0 && (
            <Empty>
              No orders in the connected API. A buyer checkout creates the first
              seller-specific records.
            </Empty>
          )}
          {orders.map((order) => (
            <article
              key={order.id}
              style={{
                padding: "1.25rem 0",
                borderBottom: "1px solid #e2e8e2",
              }}
            >
              <div className="panel-heading">
                <div>
                  <h3>{order.id}</h3>
                  <p>
                    {order.sellerName} · {money(order.totalPaise / 100)}
                  </p>
                  <p>
                    {order.items
                      .map(
                        (item) =>
                          `${item.title} · ${item.quantity} ${item.unit}`,
                      )
                      .join(", ")}
                  </p>
                </div>
                <Status value={order.status} />
              </div>
              <p>
                Buyer: {order.buyerId} · Payment:{" "}
                <strong>{readable(order.paymentStatus)}</strong>
              </p>
              {["pending_payment", "placed", "accepted"].includes(
                order.status,
              ) && (
                <button
                  className="secondary compact"
                  disabled={busy}
                  onClick={() =>
                    void mutate(
                      `/orders/${order.id}/transition`,
                      { status: "cancelled" },
                      "Order cancelled. Refunds remain separate provider operations.",
                    )
                  }
                >
                  Cancel order
                </button>
              )}
              {["paid", "partially_refunded", "refund_pending"].includes(
                order.paymentStatus,
              ) && (
                <form
                  onSubmit={(e) => void refund(e, order)}
                  style={{
                    display: "flex",
                    alignItems: "end",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 16,
                  }}
                >
                  <label className="field" style={{ marginBottom: 0 }}>
                    Refund amount (₹)
                    <input
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={order.totalPaise / 100}
                      required
                    />
                  </label>
                  <button className="secondary" disabled={busy}>
                    Request test-provider refund
                  </button>
                  <p className="muted">
                    The API checks captured funds, prior refunds, and pending
                    requests. A request does not mean a refund succeeded.
                  </p>
                </form>
              )}
            </article>
          ))}
        </section>
      )}
      {tab === "Disputes" && (
        <section className="panel">
          <h2>Quality disputes</h2>
          {!busy && disputes.length === 0 && (
            <Empty>
              No quality disputes have been filed. Real disputes require
              delivery and scanned photo evidence.
            </Empty>
          )}
          {disputes.map((dispute) => (
            <article
              key={dispute.id}
              style={{
                padding: "1.25rem 0",
                borderBottom: "1px solid #e2e8e2",
              }}
            >
              <div className="panel-heading">
                <div>
                  <h3>{readable(dispute.reason)}</h3>
                  <p>Order {dispute.orderId}</p>
                </div>
                <Status value={dispute.status} />
              </div>
              <p>{dispute.details}</p>
              <p>
                Evidence references: {dispute.evidence.join(", ") || "None"}
              </p>
              {dispute.resolution && (
                <p>
                  <strong>Resolution:</strong> {dispute.resolution}
                </p>
              )}
              {dispute.status === "open" && (
                <form
                  className="form"
                  onSubmit={(event) => {
                    const values = data(event);
                    void mutate(
                      `/disputes/${dispute.id}/resolve`,
                      { resolution: values.resolution },
                      "Resolution recorded in the API audit history.",
                    );
                  }}
                >
                  <label className="field">
                    Resolution explanation
                    <textarea
                      name="resolution"
                      required
                      minLength={5}
                      maxLength={2000}
                      rows={3}
                    />
                  </label>
                  <p className="form-note">
                    A resolution does not automatically issue a refund. Use the
                    order refund action separately when approved.
                  </p>
                  <button className="primary" disabled={busy}>
                    Record resolution
                  </button>
                </form>
              )}
            </article>
          ))}
        </section>
      )}
      {tab === "Audit history" && (
        <section className="panel">
          <h2>API audit history</h2>
          <p className="muted">
            Hash-linked records from this volatile development process. The
            database migration supplies append-only triggers; it is not
            connected here.
          </p>
          {!busy && audit.length === 0 && (
            <Empty>
              No sensitive changes have been recorded in this API process.
            </Empty>
          )}
          {[...audit].reverse().map((entry) => (
            <div className="list-row" key={entry.id}>
              <FileText size={20} />
              <div>
                <strong>{entry.action}</strong>
                <p>
                  {date(entry.at)} · {entry.actorId}
                </p>
                <p style={{ overflowWrap: "anywhere" }}>
                  Target: {entry.targetId}
                </p>
                <small>Record hash: {entry.hash.slice(0, 20)}…</small>
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
