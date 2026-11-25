import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Sprout,
  Search,
  MapPin,
  ChevronDown,
  ShoppingBasket,
  Heart,
  SlidersHorizontal,
  Star,
  Leaf,
  ShieldCheck,
  Truck,
  Check,
  Plus,
  Minus,
  X,
  Package,
  LayoutGrid,
  ClipboardList,
  MessagesSquare,
  Headphones,
  LogOut,
  Globe,
  Apple,
  Carrot,
  Wheat,
  Bean,
  Flower2,
  FileText,
  CheckCircle2,
  Clock,
  Store,
  Settings,
  BarChart3,
  Download,
  AlertCircle,
  RefreshCw,
  Menu,
  Users,
  ArrowUpRight,
  Bell,
  ShoppingBag,
  Lock,
  CloudOff,
  Sun,
  CalendarDays,
  Scale,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  listings as seed,
  categories,
  sampleOrders,
  sampleQuotes,
  type Listing,
} from "./data";
import {
  money,
  hasIndianPinFormat,
  validateCart,
  cartSummary,
  unitPrice,
  filterListings,
} from "./domain.mjs";
import { connected, request, demoLogin } from "./api";
import { OrderDetail } from "./OrderDetail";
import { SandboxPayment, type Reservation } from "./SandboxPayment";
import { LiveRfqs, LiveSeller, LiveAdmin } from "./LiveWorkspace";
import "./styles.css";
type Line = { listing: Listing; quantity: number };
const orderStep = (o: any) =>
  o.step ??
  {
    placed: 0,
    accepted: 0,
    packed: 1,
    dispatched: 2,
    delivered: 3,
    completed: 3,
  }[o.status as string] ??
  -1;
type Page =
  "market" | "orders" | "rfqs" | "saved" | "help" | "seller" | "admin";
const icons: Record<string, LucideIcon> = {
  sprout: Sprout,
  carrot: Carrot,
  apple: Apple,
  wheat: Wheat,
  bean: Bean,
  flower: Flower2,
};
const translations: Record<string, string> = {
  Marketplace: "बाज़ार",
  "My orders": "मेरे ऑर्डर",
  "Bulk buying": "थोक खरीद",
  "Saved produce": "पसंदीदा उपज",
  "Help & support": "सहायता",
  "Your everyday farmers’ market": "आपका रोज़ का किसान बाज़ार",
  "Good food.": "अच्छा खाना।",
  "Closer to its roots.": "खेतों के और करीब।",
  "Explore produce": "उपज देखें",
  "Fresh from the farm": "खेत से ताज़ा",
  "All produce": "सभी उपज",
  Vegetables: "सब्ज़ियाँ",
  Fruits: "फल",
  Grains: "अनाज",
  Pulses: "दालें",
  Spices: "मसाले",
  Add: "जोड़ें",
  "Your basket": "आपकी टोकरी",
  "Continue to checkout": "चेकआउट करें",
  "Shop by category": "श्रेणी के अनुसार खरीदें",
  "Search produce, varieties or farmers…": "उपज, किस्म या किसान खोजें…",
  "Delivering to": "डिलीवरी स्थान",
  Filters: "फ़िल्टर",
  "Buying for your business?": "अपने व्यवसाय के लिए खरीद रहे हैं?",
  "Create a bulk request": "थोक अनुरोध बनाएँ",
  "Seller workspace": "विक्रेता कार्यक्षेत्र",
  Administration: "प्रशासन",
  "Start selling": "बेचना शुरू करें",
  "Verified growers": "सत्यापित किसान",
  "Clear, fair prices": "स्पष्ट, उचित कीमतें",
  "Farm to doorstep": "खेत से आपके दरवाज़े तक",
};
function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function read<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
    if (Array.isArray(fallback) && !Array.isArray(value)) return fallback;
    return value;
  } catch {
    return fallback;
  }
}
function initialCart(): Line[] {
  return read<unknown[]>("ks-cart", []).flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const row = value as { listing?: { id?: string }; quantity?: number };
    const listing = seed.find((p) => p.id === row.listing?.id);
    const quantity = row.quantity;
    return listing &&
      typeof quantity === "number" &&
      Number.isFinite(quantity) &&
      quantity > 0
      ? [{ listing, quantity }]
      : [];
  });
}

function App() {
  const [page, setPage] = useState<Page>("market"),
    [lang, setLang] = useState("en"),
    [pin, setPin] = useState("400008"),
    [pinDraft, setPinDraft] = useState("400008");
  const [catalog, setCatalog] = useState<Listing[]>(seed),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [online, setOnline] = useState(true);
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("All produce"),
    [sort, setSort] = useState("recommended"),
    [organic, setOrganic] = useState(false),
    [grade, setGrade] = useState("All grades"),
    [maxPrice, setMaxPrice] = useState(500),
    [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<Line[]>(initialCart),
    [saved, setSaved] = useState<string[]>(() =>
      read<unknown[]>("ks-saved", []).filter(
        (x): x is string => typeof x === "string",
      ),
    ),
    [drawer, setDrawer] = useState(false),
    [product, setProduct] = useState<Listing | null>(null),
    [qty, setQty] = useState(1),
    [modal, setModal] = useState(""),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false),
    [busy, setBusy] = useState(false),
    [checkoutMessage, setCheckoutMessage] = useState("");
  const [pendingCheckout, setPendingCheckout] = useState<Reservation | null>(
    null,
  );
  const [orders, setOrders] = useState<any[]>([]),
    [rfqs, setRfqs] = useState<any[]>(() => read("ks-rfqs", [])),
    [drafts, setDrafts] = useState<any[]>(() => read("ks-drafts", [])),
    [tickets, setTickets] = useState<any[]>(() => read("ks-tickets", [])),
    [sellerTab, setSellerTab] = useState("Overview"),
    [adminTab, setAdminTab] = useState("Overview"),
    [profile, setProfile] = useState(false);
  const checkoutKey = useRef("");
  const t = (s: string) => (lang === "hi" ? (translations[s] ?? s) : s);
  useEffect(() => {
    persist("ks-cart", cart);
    checkoutKey.current = "";
  }, [cart]);
  useEffect(() => {
    persist("ks-saved", saved);
  }, [saved]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    up();
    window.addEventListener("online", up);
    window.addEventListener("offline", up);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", up);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(h);
  }, [toast]);
  async function load() {
    if (!connected) return;
    setLoading(true);
    setError("");
    try {
      const d = await request(`/catalog?pin=${pin}`);
      const a = Array.isArray(d) ? d : (d.listings ?? d.data ?? []);
      setCatalog(
        a.map((p: any) => ({
          ...p,
          grade: p.grade === "A" ? "Grade A" : p.grade,
          image: p.image ?? "/produce.svg",
          rating: p.rating ?? 0,
          reviews: p.reviews ?? 0,
          badge: undefined,
          tiers: (p.tiers ?? []).map((x: any) => ({
            min: x.min ?? x.minQuantity,
            price: x.price,
          })),
        })),
      );
      setCart((old) =>
        old.map((line) => {
          const fresh = a.find((p: any) => p.id === line.listing.id);
          return {
            ...line,
            listing: fresh
              ? {
                  ...fresh,
                  grade: fresh.grade === "A" ? "Grade A" : fresh.grade,
                  rating: fresh.rating ?? 0,
                  reviews: fresh.reviews ?? 0,
                  tiers: (fresh.tiers ?? []).map((x: any) => ({
                    min: x.min ?? x.minQuantity,
                    price: x.price,
                  })),
                }
              : { ...line.listing, status: "unavailable" },
          };
        }),
      );
    } catch (e) {
      setError(String((e as Error).message));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [pin]);
  const navigate = (p: Page) => {
    setPage(p);
    setMenu(false);
    setProfile(false);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (p === "orders" && connected) fetchOrders();
  };
  const notify = (s: string) => setToast(s);
  const add = (p: Listing, q = p.minimumQuantity) => {
    setCart((old) => {
      const e = old.find((x) => x.listing.id === p.id);
      const quantity = (e?.quantity ?? 0) + q;
      if (quantity > p.availableQuantity) {
        notify("That quantity exceeds available inventory.");
        return old;
      }
      return e
        ? old.map((x) => (x.listing.id === p.id ? { ...x, quantity } : x))
        : [...old, { listing: p, quantity: q }];
    });
    notify(`${p.title} added to your basket`);
  };
  const change = (id: string, delta: number) =>
    setCart((old) =>
      old.flatMap((l) => {
        if (l.listing.id !== id) return [l];
        const q = l.quantity + delta;
        return q < l.listing.minimumQuantity
          ? []
          : q > l.listing.availableQuantity
            ? [l]
            : [{ ...l, quantity: q }];
      }),
    );
  const toggleSaved = (id: string) =>
    setSaved((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  async function fetchOrders() {
    try {
      await demoLogin("buyer");
      const d = await request("/orders");
      setOrders(Array.isArray(d) ? d : (d.orders ?? []));
    } catch (e) {
      notify((e as Error).message);
    }
  }
  async function checkout() {
    const issue = validateCart(cart, pin);
    if (issue) {
      setCheckoutMessage(issue);
      return;
    }
    if (!connected) {
      setCheckoutMessage(
        "This is a sample-data preview. No order or payment was created. Run and connect the API to reserve inventory and start Razorpay checkout.",
      );
      return;
    }
    setBusy(true);
    try {
      await demoLogin("buyer");
      const fingerprint = JSON.stringify({
        pin,
        items: cart
          .map((l) => ({ id: l.listing.id, quantity: l.quantity }))
          .sort((a, b) => a.id.localeCompare(b.id)),
      });
      const prior = read<{ fingerprint: string; key: string }>(
        "ks-checkout-attempt",
        { fingerprint: "", key: "" },
      );
      checkoutKey.current =
        prior.fingerprint === fingerprint ? prior.key : crypto.randomUUID();
      persist("ks-checkout-attempt", { fingerprint, key: checkoutKey.current });
      const d = await request(
        "/checkout",
        {
          pin,
          items: cart.map((l) => ({
            listingId: l.listing.id,
            quantity: l.quantity,
          })),
          fulfilment: "delivery",
        },
        "POST",
        { "Idempotency-Key": checkoutKey.current },
      );
      setCheckoutMessage(
        `Order reservation received. Payment is ${d.payment?.status ?? "pending"}. ${d.payment?.reason ?? "Complete payment through the configured gateway."}`,
      );
      setPendingCheckout(d);
      await fetchOrders();
      setCart([]);
      setDrawer(false);
      setPage("orders");
      notify("Inventory reserved. Payment is still pending.");
    } catch (e) {
      setCheckoutMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function mutation(
    path: string,
    body: unknown,
    role = "buyer",
    method = "POST",
  ) {
    if (!connected) {
      notify("Preview only. Connect the API to make this change.");
      return false;
    }
    setBusy(true);
    try {
      await demoLogin(role);
      await request(path, body, method);
      notify("Change saved by the API.");
      return true;
    } catch (e) {
      notify((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!drawer && !menu) return;
    const prior = document.activeElement as HTMLElement;
    const pane = document.querySelector<HTMLElement>(drawer ? ".cart-drawer" : ".sidebar");
    pane?.querySelector<HTMLElement>("button")?.focus();
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {setDrawer(false);setMenu(false);}
      if (e.key === "Tab") {
        const a = pane?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),a,input,select,textarea",
        );
        if (!a?.length) return;
        const first = a[0],
          last = a[a.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
      prior?.focus();
    };
  }, [drawer, menu]);
  const filtered = filterListings(
    page === "saved" ? catalog.filter((p) => saved.includes(p.id)) : catalog,
    {
      search,
      category: page === "saved" ? "All produce" : category,
      organic,
      sort,
      price: maxPrice,
      grade,
    },
  ) as Listing[];
  const summary = cartSummary(cart);
  const openProduct = (p: Listing) => {
    setProduct(p);
    setQty(p.minimumQuantity);
  };
  function exportCsv() {
    const rows = [
      ["Listing", "Seller", "Category", "Price INR", "Available", "Unit"],
      ...catalog.map((p) => [
        p.title,
        p.sellerName,
        p.category,
        p.price,
        p.availableQuantity,
        p.unit,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((c) => {
            const value =
              typeof c === "string" && /^[=+@-]/.test(c) ? "'" + c : String(c);
            return `"${value.replaceAll('"', '""')}"`;
          })
          .join(","),
      )
      .join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = "khetsetu-catalog.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }
  const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
    { id: "market", label: "Marketplace", icon: LayoutGrid },
    { id: "orders", label: "My orders", icon: ShoppingBag },
    { id: "rfqs", label: "Bulk buying", icon: ClipboardList },
    { id: "saved", label: "Saved produce", icon: Heart },
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to marketplace content</a>
      <aside className={`sidebar ${menu ? "mobile-open" : ""}`} role={menu ? 'dialog' : undefined} aria-modal={menu ? true : undefined} aria-label="Marketplace navigation">
        <a
          className="brand"
          href="#market"
          onClick={(e) => {
            e.preventDefault();
            navigate("market");
          }}
        >
          <span className="brand-mark">
            <Sprout size={29} />
          </span>
          <span>
            KhetSetu
            <span className="brand-caption">GOOD FOOD, GOOD ROOTS.</span>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X />
        </button>
        <div className="nav-label">YOUR MARKETPLACE</div>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "selected" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={20} />
              {t(label)}
              {id === "saved" && saved.length > 0 && (
                <span className="count">{saved.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <button
          className={`nav-item ${page === "help" ? "selected" : ""}`}
          onClick={() => navigate("help")}
        >
          <Headphones size={20} />
          {t("Help & support")}
        </button>
        <div className="seller-invite">
          <div className="invite-icon">
            <Sprout size={24} />
            <Sun size={17} />
          </div>
          <h3>
            Grow your business
            <br />
            with KhetSetu.
          </h3>
          <p>
            A better market for
            <br />
            every harvest.
          </p>
          <button onClick={() => navigate("seller")}>
            {t("Start selling")}
            <Store size={16} />
          </button>
        </div>
        <button
          className="nav-item demo-workspace"
          onClick={() => navigate("admin")}
        >
          <ShieldCheck size={18} />
          Admin preview
        </button>
        <div className="sidebar-bottom">
          <span className="pilot-dot" />
          India-wide sourcing<small>Development marketplace</small>
        </div>
      </aside>
      {menu && <div className="mobile-scrim" onClick={() => setMenu(false)} />}
      <div className="workspace">
        <header className="header">
          <div className="header-left">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <button
              className="location"
              onClick={() => {
                setPinDraft(pin);
                setModal("location");
              }}
            >
              <span className="location-icon">
                <MapPin size={20} />
              </span>
              <span>
                <small>{t("Delivering to")}</small>
                <strong>
                  {pin === "400008" ? "Mumbai" : pin}{" "}
                  <span className="pin">{pin === "400008" ? pin : ""}</span>
                </strong>
              </span>
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="header-right">
            <button
              className="language"
              onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
            >
              <Globe size={17} />
              {lang === "en" ? "EN" : "हिन्दी"}
            </button>
            <div className="header-separator" />
            <button className="basket-button" aria-label={`${t('Your basket')} (${cart.length})`} onClick={() => setDrawer(true)}>
              <ShoppingBasket size={21} />
              <span>{t("Your basket")}</span>
              {cart.length > 0 && <b>{cart.length}</b>}
            </button>
            <div className="profile-wrap">
              <button
                className="profile-button"
                aria-label="Account and workspaces"
                onClick={() => setProfile(!profile)}
              >
                <span className="avatar">AV</span>
                <span>
                  Aarav<small>Demo account</small>
                </span>
                <ChevronDown size={14} />
              </button>
              {profile && (
                <div className="profile-menu">
                  <p>Explore a workspace</p>
                  <button onClick={() => navigate("market")}>
                    <ShoppingBag size={17} />
                    Buyer marketplace
                  </button>
                  <button onClick={() => navigate("seller")}>
                    <Store size={17} />
                    Seller workspace
                  </button>
                  <button onClick={() => navigate("admin")}>
                    <ShieldCheck size={17} />
                    Administration
                  </button>
                  <small>Sample roles · API enforces permissions</small>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="environment-banner">
          <span>
            <span className="tiny-dot" />
            {connected
              ? "Development API configured"
              : "Interactive MVP preview"}
            <span className="banner-divider">/</span>
            {connected
              ? "Demo authentication only"
              : "Sample listings · No live payments"}
          </span>
          <button onClick={() => setModal("about")}>About this preview</button>
        </div>
        {!online && (
          <div className="offline-banner">
            <CloudOff size={18} />
            You’re offline. Checkout needs a connection. Previously saved items are available on this device.
          </div>
        )}
        <main id="main-content" className="main-content">
          {(page === "market" || page === "saved") && (
            <>
              {page === "market" && (
                <>
                  <div className="eyebrow-row">
                    <p className="eyebrow">
                      {t("Your everyday farmers’ market")}
                    </p>
                    <span className="season-note">
                      <Sun size={16} />
                      The best of the season
                    </span>
                  </div>
                  <section className="hero">
                    <div className="hero-copy">
                      <span className="hero-label">
                        <span />
                        FRESHER FOOD. FAIRER CONNECTIONS.
                      </span>
                      <h1>
                        {t("Good food.")}
                        <br />
                        <em>{t("Closer to its roots.")}</em>
                      </h1>
                      <p>
                        Bring the goodness of Indian farms to your table.
                        <br className="desktop-break" /> Fresh produce, trusted
                        growers, and prices that feel right.
                      </p>
                      <button
                        className="primary"
                        onClick={() =>
                          document
                            .getElementById("produce")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        {t("Explore produce")}
                        <ShoppingBasket size={18} />
                      </button>
                      <div className="hero-proof">
                        <span className="little-avatars">
                          <i>SP</i>
                          <i>GR</i>
                          <i>PF</i>
                        </span>
                        <span>
                          Meet the people
                          <br />
                          <strong>behind your produce</strong>
                        </span>
                      </div>
                    </div>
                    <div className="hero-visual">
                      <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85"
                        alt="Fresh seasonal vegetables at a farmers market"
                        onError={(e) => {
                          e.currentTarget.src = "/produce.svg";
                        }}
                      />
                      <div className="photo-shade" />
                      <div className="farm-note">
                        <span>
                          <Leaf size={22} />
                        </span>
                        <div>
                          From their fields.
                          <br />
                          <strong>To your everyday.</strong>
                        </div>
                      </div>
                      <div className="harvest-note">
                        <Sprout size={16} />A little closer to the source
                      </div>
                    </div>
                  </section>
                  <section
                    className="trust-row"
                    aria-label="Marketplace benefits"
                  >
                    {[
                      {
                        icon: ShieldCheck,
                        title: "Verified growers",
                        desc: "Know who grows your food",
                      },
                      {
                        icon: Scale,
                        title: "Clear, fair prices",
                        desc: "Every quantity. Every rupee.",
                      },
                      {
                        icon: Truck,
                        title: "Farm to doorstep",
                        desc: "Local delivery, thoughtfully done",
                      },
                    ].map(({ icon: Icon, title, desc }) => (
                      <div key={title}>
                        <span>
                          <Icon size={21} />
                        </span>
                        <p>
                          <strong>{t(title)}</strong>
                          <small>{desc}</small>
                        </p>
                      </div>
                    ))}
                  </section>
                  <section className="categories-section">
                    <div className="section-heading">
                      <h2>{t("Shop by category")}</h2>
                      <span>Goodness for every basket</span>
                    </div>
                    <div className="categories">
                      {categories.map((c) => {
                        const Icon = icons[c.icon];
                        return (
                          <button
                            key={c.name}
                            className={`category ${category === c.name ? "active" : ""}`}
                            onClick={() => setCategory(c.name)}
                          >
                            <span>
                              <Icon size={27} strokeWidth={1.6} />
                            </span>
                            {t(c.name)}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}
              {page === "saved" && (
                <div className="page-title">
                  <span className="eyebrow">YOUR PERSONAL FARM STAND</span>
                  <h1>{t("Saved produce")}</h1>
                  <p>Your favourites, ready for your next basket.</p>
                </div>
              )}
              <section id="produce" className="produce-section">
                <div className="produce-top">
                  <div>
                    <div className="section-title-line">
                      <h2>
                        {page === "saved"
                          ? "Your favourites"
                          : t(
                              category === "All produce"
                                ? "Fresh from the farm"
                                : category,
                            )}
                      </h2>
                      <span className="number-label">
                        {filtered.length} items
                      </span>
                    </div>
                    <p>
                      Seasonal picks. Honest prices. Straight from the grower.
                    </p>
                  </div>
                  <div className="sort-select">
                    <label htmlFor="sort">Sort by:</label>
                    <select
                      id="sort"
                      aria-label="Sort produce"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="price-low">Price: low to high</option>
                      <option value="price-high">Price: high to low</option>
                      <option value="rating">Top rated</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>
                <div className="search-filter-row">
                  <div className="search-input">
                    <Search size={19} />
                    <input
                      aria-label="Search produce"
                      placeholder={t("Search produce, varieties or farmers…")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        className="icon-button"
                        aria-label="Clear search"
                        onClick={() => setSearch("")}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    className={`filter-button ${showFilters ? "on" : ""}`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal size={18} />
                    {t("Filters")}
                    {(organic || grade !== "All grades" || maxPrice < 500) && (
                      <span className="filter-dot" />
                    )}
                  </button>
                  <button
                    className={`organic-toggle ${organic ? "on" : ""}`}
                    onClick={() => setOrganic(!organic)}
                    aria-pressed={organic}
                  >
                    <Leaf size={17} />
                    Organic
                  </button>
                </div>
                {showFilters && (
                  <div className="filter-panel">
                    <label>
                      Maximum unit price: {money(maxPrice)}
                      <input
                        type="range"
                        min="20"
                        max="500"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(+e.target.value)}
                      />
                    </label>
                    <label>
                      Produce grade
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                      >
                        <option>All grades</option>
                        <option>Grade A</option>
                        <option>Premium</option>
                      </select>
                    </label>
                    <button
                      className="text-button"
                      onClick={() => {
                        setOrganic(false);
                        setGrade("All grades");
                        setMaxPrice(500);
                        setSearch("");
                        setCategory("All produce");
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                )}
                {loading ? (
                  <div className="product-grid">
                    {[1, 2, 3, 4].map((n) => (
                      <div className="skeleton" key={n} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="empty-state">
                    <AlertCircle />
                    <h3>We couldn’t load the marketplace.</h3>
                    <p>{error}</p>
                    <button className="primary" onClick={load}>
                      <RefreshCw size={16} />
                      Try again
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="empty-state">
                    <Sprout size={40} />
                    <h3>
                      {page === "saved"
                        ? "A little space for your favourites."
                        : "No produce matches your search."}
                    </h3>
                    <p>
                      {page === "saved"
                        ? "Tap the heart on a listing to keep it here."
                        : "Try another category or reset your filters."}
                    </p>
                    <button
                      className="secondary"
                      onClick={() => {
                        setSearch("");
                        setCategory("All produce");
                        setOrganic(false);
                        setGrade("All grades");
                        setMaxPrice(500);
                        navigate("market");
                      }}
                    >
                      Explore all produce
                    </button>
                  </div>
                ) : (
                  <div className="product-grid">
                    {filtered.map((p) => (
                      <article className="product-card" key={p.id}>
                        <div
                          className="product-image"
                          onClick={() => openProduct(p)}
                        >
                          <img
                            src={p.image}
                            alt={p.title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = "/produce.svg";
                            }}
                          />
                          {p.badge && (
                            <span
                              className={`product-badge ${p.organic ? "organic" : ""}`}
                            >
                              {p.organic && <Leaf size={12} />} {p.badge}
                            </span>
                          )}
                          <button
                            className={`save-button ${saved.includes(p.id) ? "is-saved" : ""}`}
                            aria-label={`${saved.includes(p.id) ? "Unsave" : "Save"} ${p.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaved(p.id);
                            }}
                          >
                            <Heart
                              size={18}
                              fill={
                                saved.includes(p.id) ? "currentColor" : "none"
                              }
                            />
                          </button>
                        </div>
                        <div className="product-info">
                          <div className="product-meta">
                            <span>{p.grade}</span>
                            <span className="rating">
                              <Star size={12} fill="currentColor" />
                              {p.rating > 0 ? p.rating : "New"}{" "}
                              <small>
                                {p.reviews > 0 ? `(${p.reviews})` : ""}
                              </small>
                            </span>
                          </div>
                          <button
                            className="product-title"
                            onClick={() => openProduct(p)}
                          >
                            {p.title}
                          </button>
                          <p className="variety">{p.variety}</p>
                          <button
                            className="seller-link"
                            onClick={() => {
                              setProduct(p);
                              setModal("seller-profile");
                            }}
                          >
                            <ShieldCheck size={14} />
                            <span>{p.sellerName}</span>
                          </button>
                          <p className="product-location">
                            <MapPin size={12} />
                            {p.location.split(",")[0]}, Maharashtra
                          </p>
                          <div className="product-bottom">
                            <div>
                              <strong>{money(p.price)}</strong>
                              <span> / {p.unit}</span>
                              <small>
                                Min. {p.minimumQuantity} {p.unit}
                              </small>
                            </div>
                            <button
                              className="add-button"
                              onClick={() => add(p)}
                            >
                              {t("Add")}
                              <Plus size={15} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
              <section className="bulk-banner">
                <div className="bulk-banner-icon">
                  <ClipboardList size={33} />
                </div>
                <div>
                  <span>MORE PRODUCE. MORE POSSIBILITIES.</span>
                  <h2>{t("Buying for your business?")}</h2>
                  <p>
                    Tell growers what you need. Compare quotes. Find your right
                    price.
                  </p>
                </div>
                <button className="secondary" onClick={() => navigate("rfqs")}>
                  {t("Create a bulk request")}
                  <Plus size={17} />
                </button>
              </section>
              <div className="footnote">
                <Sprout size={19} />
                <p>
                  Better connections. Better food.{" "}
                  <strong>That’s the KhetSetu way.</strong>
                </p>
              </div>
            </>
          )}
          {page === "orders" && (
            <>
              <div className="page-title">
                <span className="eyebrow">FROM THE FARM TO YOU</span>
                <h1>{t("My orders")}</h1>
                <p>Every harvest has a journey. Follow yours here.</p>
              </div>
              {connected && pendingCheckout && (
                <SandboxPayment
                  reservation={pendingCheckout}
                  onRefresh={fetchOrders}
                />
              )}
              <div className="info-strip">
                <Package size={18} />
                {connected
                  ? "Orders from your connected development account."
                  : "Sample orders for demonstration. No purchases have been made."}
                {connected && (
                  <button className="text-button" onClick={fetchOrders}>
                    Refresh
                  </button>
                )}
              </div>
              {(connected ? orders : sampleOrders).length === 0 ? (
                <Empty
                  icon={ShoppingBag}
                  title="Your first farm-fresh order starts here."
                  text="Explore the marketplace and fill your basket."
                  action={() => navigate("market")}
                />
              ) : (
                <div className="orders-list">
                  {(connected ? orders : sampleOrders).map((o: any, i) => (
                    <article className="order-card" key={o.id}>
                      <div className="order-header">
                        <span>
                          <strong>{o.id}</strong>
                          <small>
                            {o.date ??
                              new Date(o.createdAt).toLocaleDateString(
                                "en-IN",
                                { timeZone: "Asia/Kolkata" },
                              )}
                          </small>
                        </span>
                        <Status label={o.status} />
                      </div>
                      <div className="order-body">
                        <span className="large-icon">
                          <Package />
                        </span>
                        <div>
                          <h3>
                            {o.seller ??
                              o.sellerName ??
                              o.sellerId ??
                              "Seller order"}
                          </h3>
                          <p>
                            {typeof o.items === "string"
                              ? o.items
                              : (o.items ?? [])
                                  .map(
                                    (x: any) =>
                                      `${x.title ?? x.listingId} × ${x.quantity}`,
                                  )
                                  .join(", ")}
                          </p>
                          <strong>
                            {money(o.total ?? (o.totalPaise ?? 0) / 100)}
                          </strong>
                        </div>
                        <button
                          className="secondary"
                          onClick={() => {
                            setModal(`order-${i}`);
                          }}
                        >
                          View details
                        </button>
                      </div>
                      <div className="timeline">
                        {["Confirmed", "Packed", "In transit", "Delivered"].map(
                          (s, j) => (
                            <div
                              key={s}
                              className={j <= orderStep(o) ? "done" : ""}
                            >
                              <span>
                                {j <= orderStep(o) ? (
                                  <Check size={12} />
                                ) : (
                                  j + 1
                                )}
                              </span>
                              {s}
                            </div>
                          ),
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          {page === "rfqs" &&
            (connected ? (
              <LiveRfqs notify={notify} onRefresh={load} pin={pin} />
            ) : (
              <>
                <div className="page-title row-title">
                  <div>
                    <span className="eyebrow">A BETTER WAY TO BUY IN BULK</span>
                    <h1>{t("Bulk buying")}</h1>
                    <p>One requirement. Multiple growers. Your best fit.</p>
                  </div>
                  <button className="primary" onClick={() => setModal("rfq")}>
                    <Plus size={18} />
                    New bulk request
                  </button>
                </div>
                <div className="info-strip">
                  <FileText size={18} />
                  Compare sample quotes below, or save your own requirement as a
                  local draft.
                </div>
                <div className="stats-grid three">
                  <Metric
                    label="Open sample request"
                    value="1"
                    icon={ClipboardList}
                  />
                  <Metric label="Sample quotations" value="2" icon={FileText} />
                  <Metric
                    label="Your saved drafts"
                    value={String(rfqs.length)}
                    icon={Package}
                  />
                </div>
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">
                        SAMPLE REQUEST · KS-RFQ-104
                      </span>
                      <h2>100 kg of Grade A tomatoes</h2>
                      <p>Mumbai 400008 · Delivery by 24 Nov · 2 quotations</p>
                    </div>
                    <Status label="Open" />
                  </div>
                  <div className="quote-grid">
                    {sampleQuotes.map((q) => (
                      <article className="quote-card" key={q.id}>
                        <div className="quote-seller">
                          <span className="seller-initial">
                            {q.seller.slice(0, 1)}
                          </span>
                          <div>
                            <h3>{q.seller}</h3>
                            <span className="rating">
                              <Star size={13} fill="currentColor" />
                              {q.rating} · Verified grower
                            </span>
                          </div>
                        </div>
                        <div className="quote-price">
                          <strong>
                            {money(q.price)}
                            <small> / kg</small>
                          </strong>
                          <span>
                            {q.qty} kg · {q.produce}
                          </span>
                        </div>
                        <dl>
                          <div>
                            <dt>Produce total</dt>
                            <dd>{money(q.qty * q.price)}</dd>
                          </div>
                          <div>
                            <dt>Delivery</dt>
                            <dd>
                              {q.delivery ? money(q.delivery) : "Included"}
                            </dd>
                          </div>
                          <div>
                            <dt>Estimated delivery</dt>
                            <dd>{q.eta}</dd>
                          </div>
                          <div className="total">
                            <dt>Quote total</dt>
                            <dd>{money(q.qty * q.price + q.delivery)}</dd>
                          </div>
                        </dl>
                        <button
                          className="secondary full"
                          onClick={() => {
                            setModal("quote-" + q.id);
                          }}
                        >
                          Review quotation
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
                {rfqs.length > 0 && (
                  <section className="panel">
                    <h2>Your requirement drafts</h2>
                    {rfqs.map((r, i) => (
                      <div className="list-row" key={i}>
                        <span className="large-icon">
                          <ClipboardList />
                        </span>
                        <div>
                          <strong>{r.produce}</strong>
                          <p>
                            {r.quantity} {r.unit} · {r.grade} · {r.pin}
                          </p>
                        </div>
                        <Status label="Local draft" />
                      </div>
                    ))}
                  </section>
                )}
                <section className="how-it-works">
                  <h2>A few simple steps to better bulk buying.</h2>
                  <div>
                    <p>
                      <ClipboardList />
                      <strong>Tell us what you need</strong>Produce, quantity,
                      grade, and timing.
                    </p>
                    <p>
                      <MessagesSquare />
                      <strong>Compare clear quotations</strong>See prices and
                      delivery together.
                    </p>
                    <p>
                      <ShieldCheck />
                      <strong>Order with confidence</strong>One accepted quote.
                      One clear order.
                    </p>
                  </div>
                </section>
              </>
            ))}
          {page === "seller" &&
            (connected ? (
              <LiveSeller notify={notify} onRefresh={load} />
            ) : (
              <>
                <div className="page-title row-title">
                  <div>
                    <span className="eyebrow">YOUR FARM. YOUR BUSINESS.</span>
                    <h1>{t("Seller workspace")}</h1>
                    <p>Good morning, Sahyadri Farmers Collective.</p>
                  </div>
                  <button
                    className="primary"
                    onClick={() => setModal("listing")}
                  >
                    <Plus size={18} />
                    Create listing
                  </button>
                </div>
                <div className="info-strip">
                  <Store size={18} />
                  Seller demonstration · Local drafts are saved only on this
                  device.
                  <button
                    className="text-button"
                    onClick={() => setModal("verification")}
                  >
                    View verification
                  </button>
                </div>
                <div className="tabs">
                  {[
                    "Overview",
                    "Listings & inventory",
                    "Orders",
                    "Payouts",
                  ].map((a) => (
                    <button
                      className={sellerTab === a ? "active" : ""}
                      key={a}
                      onClick={() => setSellerTab(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {sellerTab === "Overview" && (
                  <>
                    <div className="stats-grid">
                      <Metric
                        label="Sample gross sales"
                        value="₹48,260"
                        icon={BarChart3}
                      />
                      <Metric
                        label="Sample open orders"
                        value="12"
                        icon={Package}
                      />
                      <Metric
                        label="Active sample listings"
                        value={String(
                          catalog.filter((p) => p.sellerId === "s1").length,
                        )}
                        icon={Sprout}
                      />
                      <Metric
                        label="Sample grower rating"
                        value="4.9 / 5"
                        icon={Star}
                      />
                    </div>
                    <div className="dashboard-grid">
                      <section className="panel">
                        <div className="panel-heading">
                          <h2>A little attention goes a long way.</h2>
                          <Clock size={20} />
                        </div>
                        <div className="action-row">
                          <span className="large-icon orange">
                            <Package />
                          </span>
                          <div>
                            <h3>Orders ready for your attention</h3>
                            <p>
                              Review, accept, and prepare your next harvest.
                            </p>
                          </div>
                          <button
                            className="secondary"
                            onClick={() => setSellerTab("Orders")}
                          >
                            Review orders
                          </button>
                        </div>
                        <div className="action-row">
                          <span className="large-icon">
                            <ClipboardList />
                          </span>
                          <div>
                            <h3>Keep your produce up to date</h3>
                            <p>
                              Accurate inventory helps every buyer plan better.
                            </p>
                          </div>
                          <button
                            className="secondary"
                            onClick={() => setSellerTab("Listings & inventory")}
                          >
                            Manage stock
                          </button>
                        </div>
                      </section>
                      <section className="seller-tip">
                        <Sprout size={38} />
                        <span className="eyebrow">GROWER’S NOTE</span>
                        <h2>A clear listing is a great first impression.</h2>
                        <p>
                          Add your produce grade, harvest date, and honest
                          photos to help buyers choose with confidence.
                        </p>
                        <button
                          className="secondary"
                          onClick={() => setModal("listing")}
                        >
                          Create a listing
                        </button>
                      </section>
                    </div>
                  </>
                )}
                {sellerTab === "Listings & inventory" && (
                  <section className="panel">
                    <div className="panel-heading">
                      <h2>Your produce</h2>
                      <button className="text-button" onClick={exportCsv}>
                        <Download size={16} />
                        Export CSV
                      </button>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Produce</th>
                            <th>Price</th>
                            <th>Available</th>
                            <th>Reserved</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catalog
                            .filter((p) => p.sellerId === "s1")
                            .map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <div className="table-product">
                                    <img src={p.image} alt="" />
                                    <div>
                                      <strong>{p.title}</strong>
                                      <small>
                                        {p.grade} · {p.unit}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>{money(p.price)}</td>
                                <td>
                                  {p.availableQuantity} {p.unit}
                                </td>
                                <td>API required</td>
                                <td>
                                  <Status label="Active sample" />
                                </td>
                                <td>
                                  <button
                                    className="secondary compact"
                                    onClick={() => {
                                      setProduct(p);
                                      setModal("inventory");
                                    }}
                                  >
                                    Update stock
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {drafts.map((d, i) => (
                      <div className="list-row" key={i}>
                        <Sprout />
                        <div>
                          <strong>{d.title}</strong>
                          <p>
                            {d.quantity} {d.unit} · {money(+d.price)}
                          </p>
                        </div>
                        <Status label="Local draft" />
                      </div>
                    ))}
                  </section>
                )}
                {sellerTab === "Orders" && (
                  <section className="panel">
                    <h2>Fulfilment workspace</h2>
                    <p className="muted">
                      State changes require the connected API. A seller cannot
                      mark a pending payment as paid.
                    </p>
                    {sampleOrders.map((o) => (
                      <div className="list-row" key={o.id}>
                        <Package />
                        <div>
                          <strong>
                            {o.id} · {o.seller}
                          </strong>
                          <p>{o.items}</p>
                        </div>
                        <Status label={o.status} />
                        <button
                          className="secondary compact"
                          onClick={() => setModal("fulfilment")}
                        >
                          Manage fulfilment
                        </button>
                      </div>
                    ))}
                  </section>
                )}
                {sellerTab === "Payouts" && (
                  <section className="panel">
                    <div className="panel-heading">
                      <h2>Settlements & payouts</h2>
                      <Lock size={20} />
                    </div>
                    <Empty
                      icon={ShieldCheck}
                      title="Your money deserves a clear trail."
                      text="Live settlements require verified bank details and a licensed provider account. No funds are held or paid out by this preview."
                      action={() => setModal("payout")}
                      button="View payout requirements"
                    />
                  </section>
                )}
              </>
            ))}
          {page === "admin" &&
            (connected ? (
              <LiveAdmin notify={notify} onRefresh={load} />
            ) : (
              <>
                <div className="page-title row-title">
                  <div>
                    <span className="eyebrow">KHETSETU OPERATIONS</span>
                    <h1>{t("Administration")}</h1>
                    <p>
                      A clear view of the marketplace, from harvest to
                      resolution.
                    </p>
                  </div>
                  <button className="secondary" onClick={exportCsv}>
                    <Download size={17} />
                    Export catalog
                  </button>
                </div>
                <div className="warning">
                  <Lock size={19} />
                  <div>
                    <strong>Administration preview</strong>
                    <p>
                      This workspace displays sample operational data. Protected
                      changes require API role and ownership checks.
                    </p>
                  </div>
                </div>
                <div className="tabs admin-tabs">
                  {[
                    "Overview",
                    "Verification",
                    "Listings",
                    "Orders",
                    "Disputes",
                    "Service areas",
                    "Audit & settings",
                  ].map((a) => (
                    <button
                      className={adminTab === a ? "active" : ""}
                      key={a}
                      onClick={() => setAdminTab(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {adminTab === "Overview" && (
                  <>
                    <div className="stats-grid">
                      <Metric
                        label="Sample GMV"
                        value="₹2,84,600"
                        icon={BarChart3}
                      />
                      <Metric
                        label="Sample orders"
                        value="186"
                        icon={Package}
                      />
                      <Metric
                        label="Sample active growers"
                        value="24"
                        icon={Users}
                      />
                      <Metric
                        label="Sample fulfilment"
                        value="96.2%"
                        icon={Truck}
                      />
                    </div>
                    <div className="dashboard-grid">
                      <section className="panel">
                        <h2>Operational pulse</h2>
                        {[
                          {
                            a: "Seller verifications",
                            b: "3 awaiting review",
                            tab: "Verification",
                          },
                          {
                            a: "Listings for moderation",
                            b: "5 need a closer look",
                            tab: "Listings",
                          },
                          {
                            a: "Quality disputes",
                            b: "2 awaiting resolution",
                            tab: "Disputes",
                          },
                        ].map((x) => (
                          <button
                            className="operation-row"
                            key={x.a}
                            onClick={() => setAdminTab(x.tab)}
                          >
                            <span>
                              <strong>{x.a}</strong>
                              <small>{x.b}</small>
                            </span>
                            <ChevronDown className="rotate" size={17} />
                          </button>
                        ))}
                      </section>
                      <section className="panel">
                        <h2>Service areas</h2>
                        <div className="service-map">
                          <MapPin size={38} />
                          <strong>Across India</strong>
                          <small>Production routes require approval.</small>
                        </div>
                        <button
                          className="secondary full"
                          onClick={() => setAdminTab("Service areas")}
                        >
                          Review serviceability
                        </button>
                      </section>
                    </div>
                  </>
                )}
                {adminTab === "Verification" && (
                  <section className="panel">
                    <h2>Seller verification queue</h2>
                    <p className="muted">
                      Sample application. Documents, bank details, and
                      certifications must be securely reviewed before
                      activation.
                    </p>
                    <div className="list-row">
                      <span className="seller-initial">MF</span>
                      <div>
                        <strong>Maval Growers FPO</strong>
                        <p>Farmer Producer Organisation · Maharashtra</p>
                      </div>
                      <Status label="Pending review" />
                      <button
                        className="secondary"
                        onClick={() => setModal("admin-verification")}
                      >
                        Review application
                      </button>
                    </div>
                  </section>
                )}
                {adminTab === "Listings" && (
                  <section className="panel">
                    <h2>Listing moderation</h2>
                    {catalog.map((p) => (
                      <div className="list-row" key={p.id}>
                        <div className="table-product">
                          <img src={p.image} alt="" />
                          <div>
                            <strong>{p.title}</strong>
                            <small>{p.sellerName}</small>
                          </div>
                        </div>
                        <Status label="Active sample" />
                        <button
                          className="secondary compact"
                          onClick={() => {
                            setProduct(p);
                            setModal("moderate");
                          }}
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </section>
                )}
                {adminTab === "Orders" && (
                  <section className="panel">
                    <h2>Order operations</h2>
                    <p>
                      Payment, shipment, cancellation, and refund actions are
                      enforced by the API.
                    </p>
                    {sampleOrders.map((o) => (
                      <div className="list-row" key={o.id}>
                        <Package />
                        <div>
                          <strong>{o.id}</strong>
                          <p>
                            {o.seller} · {money(o.total)}
                          </p>
                        </div>
                        <Status label={o.status} />
                        <button
                          className="secondary compact"
                          onClick={() => setModal("cancel")}
                        >
                          Cancellation & refund
                        </button>
                      </div>
                    ))}
                  </section>
                )}
                {adminTab === "Disputes" && (
                  <section className="panel">
                    <h2>Quality & resolution centre</h2>
                    <div className="list-row">
                      <AlertCircle />
                      <div>
                        <strong>Sample: weight discrepancy · KS-2048</strong>
                        <p>
                          Reported quantity: 4.5 kg · Expected: 5 kg · Awaiting
                          evidence
                        </p>
                      </div>
                      <Status label="Needs review" />
                      <button
                        className="secondary"
                        onClick={() => setModal("dispute-admin")}
                      >
                        Review case
                      </button>
                    </div>
                    <p className="muted">
                      Evidence, internal notes, refund decisions, and an
                      append-only audit trail belong to the protected API.
                    </p>
                  </section>
                )}
                {adminTab === "Service areas" && (
                  <section className="panel">
                    <div className="panel-heading">
                      <h2>Delivery coverage</h2>
                      <Status label="Preview" />
                    </div>
                    <div className="service-area-card">
                      <MapPin />
                      <div>
                        <h3>India-wide request intake</h3>
                        <p>
                          Delivery and buyer pickup are available only where
                          explicitly configured.
                        </p>
                      </div>
                    </div>
                    <p className="muted">
                      Enable a production zone after confirming the route and
                      reviewing local requirements.
                    </p>
                    <button
                      className="secondary"
                      onClick={() => setModal("service-area")}
                    >
                      Review zone configuration
                    </button>
                  </section>
                )}
                {adminTab === "Audit & settings" && (
                  <section className="panel">
                    <h2>Operational configuration</h2>
                    <dl className="settings-list">
                      <div>
                        <dt>Currency</dt>
                        <dd>INR · integer paise in API</dd>
                      </div>
                      <div>
                        <dt>Business timezone</dt>
                        <dd>Asia/Kolkata · UTC storage</dd>
                      </div>
                      <div>
                        <dt>Payment provider</dt>
                        <dd>Razorpay · credentials required</dd>
                      </div>
                      <div>
                        <dt>Commission & taxes</dt>
                        <dd>Server configuration · launch review required</dd>
                      </div>
                      <div>
                        <dt>Audit trail</dt>
                        <dd>Append-only production repository required</dd>
                      </div>
                    </dl>
                    <button
                      className="secondary"
                      onClick={() => setModal("audit")}
                    >
                      View implementation notes
                    </button>
                  </section>
                )}
              </>
            ))}
          {page === "help" && (
            <>
              <div className="page-title">
                <span className="eyebrow">A HELPING HAND, ALWAYS</span>
                <h1>Let’s make things simple.</h1>
                <p>
                  From your first basket to your next harvest, we’re here to
                  help.
                </p>
              </div>
              <div className="dashboard-grid">
                <section className="panel">
                  <h2>A few common questions</h2>
                  {[
                    [
                      "Where can I order?",
                      "You can submit sourcing requests across India. Transport depends on the supplier and approved routes for your PIN.",
                    ],
                    [
                      "Can I buy for a restaurant or shop?",
                      "Yes. Create a bulk requirement, compare seller quotations, and accept a quotation through the API to create a seller order.",
                    ],
                    [
                      "How are sellers verified?",
                      "Seller identity, business details, and applicable certifications go through review. Sample verification badges in this preview are demonstration data.",
                    ],
                    [
                      "What if something is wrong with my produce?",
                      "Report a quality issue with your order, a reason, and clear photos as soon as possible. Dispute windows depend on the produce category and configured policy.",
                    ],
                    [
                      "How do payments work?",
                      "The production adapter uses Razorpay with server-side verification and signed webhooks. This preview never collects card details or simulates a successful payment.",
                    ],
                  ].map(([q, a]) => (
                    <details className="faq" key={q}>
                      <summary>
                        {q}
                        <Plus size={17} />
                      </summary>
                      <p>{a}</p>
                    </details>
                  ))}
                </section>
                <section className="help-card">
                  <Headphones size={36} />
                  <h2>
                    A real issue deserves
                    <br />a clear resolution.
                  </h2>
                  <p>
                    Save a support request with your order reference and a
                    little detail.
                  </p>
                  <button
                    className="primary"
                    onClick={() => setModal("support")}
                  >
                    Create support request
                  </button>
                  <small>Preview requests are saved locally.</small>
                </section>
              </div>
              {tickets.length > 0 && (
                <section className="panel">
                  <h2>Your local support drafts</h2>
                  {tickets.map((x, i) => (
                    <div className="list-row" key={i}>
                      <FileText />
                      <div>
                        <strong>{x.subject}</strong>
                        <p>{x.details}</p>
                      </div>
                      <Status label="Not submitted" />
                    </div>
                  ))}
                </section>
              )}
              <div className="policy-links">
                {[
                  "Privacy & data",
                  "Cancellation & refunds",
                  "Produce quality",
                  "How KhetSetu works",
                ].map((x) => (
                  <button
                    className="text-button"
                    key={x}
                    onClick={() => setModal(x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
        <footer className="footer">
          <span>© 2026 KhetSetu</span>
          <span>Connecting good growers with good people.</span>
          <button
            onClick={() => {
              navigate("help");
            }}
          >
            Help & policies
          </button>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={20} />
          {toast}
        </div>
      )}
      {drawer && (
        <div className="overlay" onClick={() => setDrawer(false)}>
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping basket"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">A LITTLE FARM-FRESH GOODNESS</span>
                <h2>
                  {t("Your basket")} <span>({cart.length})</span>
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setDrawer(false)}
                aria-label="Close basket"
              >
                <X />
              </button>
            </div>
            <div className="cart-content">
              {cart.length === 0 ? (
                <Empty
                  icon={ShoppingBasket}
                  title="Good things start with an empty basket."
                  text="Find your favourite produce and make it yours."
                  action={() => {
                    setDrawer(false);
                    navigate("market");
                  }}
                />
              ) : (
                summary.groups.map((g: any) => (
                  <section className="cart-group" key={g.sellerId}>
                    <h3>
                      <ShieldCheck size={16} />
                      {g.sellerName}
                    </h3>
                    <small>Separate seller order · {pin}</small>
                    {g.lines.map((l: Line) => (
                      <div className="cart-item" key={l.listing.id}>
                        <img src={l.listing.image} alt="" />
                        <div>
                          <strong>{l.listing.title}</strong>
                          <small>
                            {money(unitPrice(l.listing, l.quantity))} /{" "}
                            {l.listing.unit}
                          </small>
                          <div className="quantity-control">
                            <button
                              aria-label={`Reduce ${l.listing.title}`}
                              onClick={() => change(l.listing.id, -1)}
                            >
                              <Minus size={13} />
                            </button>
                            <span>
                              {l.quantity} {l.listing.unit}
                            </span>
                            <button
                              aria-label={`Increase ${l.listing.title}`}
                              onClick={() => change(l.listing.id, 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                        <strong>
                          {money(unitPrice(l.listing, l.quantity) * l.quantity)}
                        </strong>
                      </div>
                    ))}
                  </section>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-checkout">
                <div className="subtotal">
                  <span>Produce subtotal</span>
                  <strong>{money(summary.subtotal)}</strong>
                </div>
                <p>
                  Delivery, fees, and applicable taxes are calculated by the
                  API. Each seller has a separate order and shipment.
                </p>
                {checkoutMessage && (
                  <div className="warning" role="status">
                    <AlertCircle size={18} />
                    <p>{checkoutMessage}</p>
                  </div>
                )}
                <button
                  className="primary full"
                  disabled={busy || !online}
                  onClick={checkout}
                >
                  {busy ? "Checking availability…" : t("Continue to checkout")}
                  <Lock size={16} />
                </button>
                <small>
                  <ShieldCheck size={13} /> No payment details are stored by
                  KhetSetu.
                </small>
              </div>
            )}
          </aside>
        </div>
      )}
      {product && !modal && (
        <Dialog
          title="A closer look at your produce"
          onClose={() => setProduct(null)}
          wide
        >
          <div className="product-detail">
            <img src={product.image} alt={product.title} />
            <div>
              <span className="eyebrow">
                {product.grade} · {product.organic ? "ORGANIC" : "FARM DIRECT"}
              </span>
              <h2>{product.title}</h2>
              <p>{product.variety}</p>
              <button
                className="seller-link"
                onClick={() => setModal("seller-profile")}
              >
                <ShieldCheck size={16} />
                {product.sellerName}
              </button>
              <p className="product-location">
                <MapPin size={14} />
                {product.location}
              </p>
              <div className="detail-price">
                {money(unitPrice(product, qty))}
                <small> / {product.unit}</small>
              </div>
              <dl className="settings-list">
                <div>
                  <dt>Available</dt>
                  <dd>
                    {product.availableQuantity} {product.unit}
                  </dd>
                </div>
                <div>
                  <dt>Minimum order</dt>
                  <dd>
                    {product.minimumQuantity} {product.unit}
                  </dd>
                </div>
                <div>
                  <dt>Harvest / packing date</dt>
                  <dd>{product.harvestDate}</dd>
                </div>
                <div>
                  <dt>Fulfilment</dt>
                  <dd>Delivery or pickup depends on PIN {pin}</dd>
                </div>
              </dl>
              {product.tiers.length > 0 && (
                <div className="tier-list">
                  {product.tiers.map((r) => (
                    <span key={r.min}>
                      {r.min}+ {product.unit}
                      <strong>
                        {money(r.price)} / {product.unit}
                      </strong>
                    </span>
                  ))}
                </div>
              )}
              <label className="field">
                Quantity ({product.unit})
                <input
                  type="number"
                  min={product.minimumQuantity}
                  max={product.availableQuantity}
                  value={qty}
                  onChange={(e) => setQty(+e.target.value)}
                />
              </label>
              <button
                className="primary full"
                onClick={() => {
                  if (
                    qty < product.minimumQuantity ||
                    qty > product.availableQuantity
                  ) {
                    notify("Choose a quantity within the available range.");
                    return;
                  }
                  add(product, qty);
                  setProduct(null);
                }}
              >
                Add to basket · {money(unitPrice(product, qty) * qty)}
                <Plus size={18} />
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setProduct(null);
                  navigate("rfqs");
                  setModal("rfq");
                }}
              >
                Need more? Create a bulk request
              </button>
            </div>
          </div>
        </Dialog>
      )}
      {modal && (
        <Dialog
          title={
            modal === "location"
              ? "A little closer to you."
              : modal === "rfq"
                ? "Tell growers what you need."
                : modal === "listing"
                  ? "Your next harvest starts here."
                  : modal === "support"
                    ? "How can we help?"
                    : modal === "inventory"
                      ? "Keep your stock up to date."
                      : "Clear information. Better decisions."
          }
          onClose={() => {
            setModal("");
            if (product) setProduct(null);
          }}
        >
          {modal === "location" ? (
            <>
              <p className="dialog-intro">
                Enter your delivery PIN code. Precise GPS is never required.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!hasIndianPinFormat(pinDraft)) {
                    notify("Enter a valid six-digit Indian PIN code.");
                    return;
                  }
                  setPin(pinDraft);
                  setModal("");
                  notify(`Delivery PIN ${pinDraft} saved. The API checks eligibility at checkout.`);
                }}
              >
                <label className="field">
                  Delivery PIN code
                  <input
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    value={pinDraft}
                    onChange={(e) =>
                      setPinDraft(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </label>
                <div className="service-area-card">
                  <MapPin />
                  <div>
                    <strong>Any Indian PIN format</strong>
                    <p>Availability depends on your location and the configured service areas.</p>
                  </div>
                </div>
                <button className="primary full">Confirm location</button>
              </form>
            </>
          ) : modal === "rfq" ? (
            <Form
              onSubmit={async (d) => {
                const r = { ...d, pin };
                if (connected) {
                  const ok = await mutation("/rfqs", {
                    title: d.produce,
                    category: d.category,
                    quantity: +d.quantity,
                    unit: d.unit,
                    grade: d.grade,
                    pin,
                    deliveryBy: new Date(
                      d.date + "T12:00:00+05:30",
                    ).toISOString(),
                    notes: "",
                  });
                  if (!ok) return;
                }
                const next = [...rfqs, r];
                setRfqs(next);
                persist("ks-rfqs", next);
                setModal("");
                notify(
                  connected
                    ? "Bulk request submitted."
                    : "Requirement draft saved on this device.",
                );
              }}
              fields={[
                {
                  name: "produce",
                  label: "What produce do you need?",
                  placeholder: "e.g. Fresh red tomatoes",
                },
                {
                  name: "category",
                  label: "Category",
                  options: [
                    "Vegetables",
                    "Fruits",
                    "Grains",
                    "Pulses",
                    "Spices",
                  ],
                },
                { name: "quantity", label: "Quantity", type: "number", min: 1 },
                {
                  name: "unit",
                  label: "Unit",
                  options: [
                    "kg",
                    "quintal",
                    "tonne",
                    "piece",
                    "box",
                    "bag",
                    "crate",
                    "litre",
                  ],
                },
                {
                  name: "grade",
                  label: "Preferred grade",
                  options: ["Grade A", "Premium", "Standard"],
                },
                { name: "date", label: "Required by", type: "date" },
              ]}
              submit={
                connected ? "Submit bulk request" : "Save requirement draft"
              }
              note={`Delivery PIN ${pin}. A quotation becomes an order only after explicit acceptance through the API.`}
            />
          ) : modal === "listing" ? (
            <Form
              fields={[
                {
                  name: "title",
                  label: "Produce title",
                  placeholder: "e.g. Fresh red tomatoes",
                },
                {
                  name: "category",
                  label: "Category",
                  options: [
                    "Vegetables",
                    "Fruits",
                    "Grains",
                    "Pulses",
                    "Spices",
                  ],
                },
                {
                  name: "quantity",
                  label: "Available quantity",
                  type: "number",
                  min: 1,
                },
                {
                  name: "unit",
                  label: "Unit",
                  options: [
                    "kg",
                    "gram",
                    "quintal",
                    "tonne",
                    "litre",
                    "piece",
                    "box",
                    "bag",
                    "crate",
                  ],
                },
                {
                  name: "price",
                  label: "Price per unit (₹)",
                  type: "number",
                  min: 1,
                },
                {
                  name: "grade",
                  label: "Grade",
                  options: ["Grade A", "Premium", "Standard"],
                },
                {
                  name: "harvest",
                  label: "Harvest / packing date",
                  type: "date",
                },
              ]}
              submit="Save listing draft"
              note="This draft is saved on this device. Seller verification and approval are required before a live listing can be published."
              onSubmit={(d) => {
                const next = [...drafts, d];
                setDrafts(next);
                localStorage.setItem("ks-drafts", JSON.stringify(next));
                setModal("");
                setSellerTab("Listings & inventory");
                notify("Listing draft saved on this device.");
              }}
            />
          ) : modal === "support" ? (
            <Form
              fields={[
                {
                  name: "subject",
                  label: "Subject",
                  placeholder: "Tell us a little about the issue",
                },
                {
                  name: "order",
                  label: "Order reference (optional)",
                  optional: true,
                },
                { name: "details", label: "What happened?", textarea: true },
              ]}
              submit="Save support draft"
              note="Local preview only. Your request has not been sent to support."
              onSubmit={(d) => {
                const n = [...tickets, d];
                setTickets(n);
                localStorage.setItem("ks-tickets", JSON.stringify(n));
                setModal("");
                notify(
                  "Support draft saved locally. It has not been submitted.",
                );
              }}
            />
          ) : modal === "inventory" ? (
            <Form
              fields={[
                {
                  name: "quantity",
                  label: `Total stock including reservations (${product?.unit})`,
                  type: "number",
                  min: 0,
                },
              ]}
              submit="Update inventory through API"
              note="Inventory changes must be atomic and account for existing reservations. A browser-only change cannot update live stock."
              onSubmit={async (d) => {
                if (
                  await mutation(
                    `/seller/listings/${product?.id}`,
                    { availableQuantity: +d.quantity },
                    "seller",
                    "PATCH",
                  )
                ) {
                  setModal("");
                  load();
                }
              }}
            />
          ) : modal === "seller-profile" ? (
            <>
              <div className="seller-profile">
                <span className="seller-initial big">
                  {product?.sellerName.slice(0, 1)}
                </span>
                <h2>{product?.sellerName}</h2>
                <span className="verified">
                  <ShieldCheck size={16} />
                  {connected
                    ? "Development sample grower"
                    : "Sample verified grower"}
                </span>
                <p>
                  <MapPin size={15} />
                  {product?.location}
                </p>
              </div>
              <p>
                Fresh, seasonal produce from Maharashtra, with grade, quantity,
                and harvest information to help you choose.
              </p>
              <div className="info-strip">
                <Leaf size={20} />
                Verification and certification badges are sample data in this
                preview.
              </div>
              <button
                className="primary full"
                onClick={() => {
                  setSearch(product?.sellerName ?? "");
                  setModal("");
                  setProduct(null);
                  setPage("market");
                  setCategory("All produce");
                }}
              >
                Explore this grower’s produce
              </button>
            </>
          ) : modal.startsWith("quote-") ? (
            <>
              <h2>
                {sampleQuotes.find((q) => "quote-" + q.id === modal)?.seller}
              </h2>
              <p>
                This is a sample quotation for 100 kg of Grade A tomatoes,
                delivered to Mumbai 400008.
              </p>
              <div className="warning">
                <FileText size={20} />
                <p>
                  Accepting a live quotation reserves inventory and creates one
                  seller order. This sample quotation cannot be purchased.
                </p>
              </div>
              <button
                className="primary full"
                onClick={() => {
                  setModal("rfq");
                }}
              >
                Create your own requirement
              </button>
            </>
          ) : modal.startsWith("order-") ? (
            <OrderDetail
              order={
                (connected ? orders : sampleOrders)[Number(modal.split("-")[1])]
              }
              onUpdated={fetchOrders}
            />
          ) : (
            <InfoContent
              modal={modal}
              mutation={mutation}
              busy={busy}
              setModal={setModal}
              product={product}
            />
          )}
        </Dialog>
      )}
    </div>
  );
}
function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="metric">
      <div>
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong>{value}</strong>
      <small>Demonstration data</small>
    </div>
  );
}
function Status({ label }: { label: string }) {
  return (
    <span
      className={`status ${/pending|review|draft|reserved|transit/i.test(label) ? "pending" : ""}`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}
function Empty({
  icon: Icon,
  title,
  text,
  action,
  button = "Explore the marketplace",
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action: () => void;
  button?: string;
}) {
  return (
    <div className="empty-state">
      <Icon size={38} />
      <h3>{title}</h3>
      <p>{text}</p>
      <button className="secondary" onClick={action}>
        {button}
      </button>
    </div>
  );
}
function Dialog({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    ref.current
      ?.querySelector<HTMLElement>("button,input,select,textarea")
      ?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const a = ref.current?.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,[tabindex="0"]',
        );
        if (!a?.length) return;
        const first = a[0],
          last = a[a.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
      prior?.focus();
    };
  }, []);
  return (
    <div className="overlay modal-overlay" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        className={`dialog ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-heading">
          <span>{title}</span>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: string[];
  min?: number;
  optional?: boolean;
  textarea?: boolean;
};
function Form({
  fields,
  onSubmit,
  submit,
  note,
}: {
  fields: Field[];
  onSubmit: (d: Record<string, string>) => void;
  submit: string;
  note: string;
}) {
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const d = Object.fromEntries(
          new FormData(e.currentTarget).entries(),
        ) as Record<string, string>;
        onSubmit(d);
      }}
    >
      {fields.map((f) => (
        <label className="field" key={f.name}>
          {f.label}
          {f.options ? (
            <select name={f.name}>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.textarea ? (
            <textarea name={f.name} required={!f.optional} rows={4} />
          ) : (
            <input
              name={f.name}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              min={f.min}
              required={!f.optional}
            />
          )}
        </label>
      ))}
      <p className="form-note">{note}</p>
      <button className="primary full">{submit}</button>
    </form>
  );
}
function InfoContent({
  modal,
  mutation,
  busy,
  setModal,
  product,
}: {
  modal: string;
  mutation: (p: string, b: unknown, r?: string, m?: string) => Promise<boolean>;
  busy: boolean;
  setModal: (s: string) => void;
  product: Listing | null;
}) {
  const info: Record<string, [string, string]> = {
    about: [
      "An honest look at the MVP.",
      "This is an interactive development preview with realistic sample data. Browsing, filtering, saved produce, baskets, and local drafts work on this device. Real orders, verification, payments, delivery, and support require the API and configured services. No payment is collected or simulated.",
    ],
    verification: [
      "Your seller verification",
      "Live onboarding requires verified identity, business details where applicable, pickup address, service areas, and payout details. Uploads must use secure storage with malware scanning. This demo profile is sample data.",
    ],
    payout: [
      "Payouts through a licensed provider",
      "Configure Razorpay marketplace settlement products, complete provider verification, and reconcile signed payment and settlement events. KhetSetu does not claim to hold funds in an internal escrow.",
    ],
    fulfilment: [
      "From accepted to delivered",
      "The API validates paid order state and seller ownership before acceptance, packing, and dispatch. Delivery requires a proof reference. An unpaid order cannot be fulfilled.",
    ],
    audit: [
      "An accountable marketplace",
      "Critical actions require an append-only audit record in the production repository. Demo audit events are in memory and are lost on restart. Production audit durability and independent access controls remain release gates.",
    ],
    "service-area": [
      "One neighbourhood to start",
      "The development API accepts India-wide PINs by default. Approve actual routes after reviewing delivery capacity, fees, seller eligibility and state requirements.",
    ],
    "Privacy & data": [
      "Your data, handled with purpose",
      "The preview stores your basket, saved items, and drafts in this browser. Do not enter sensitive information. Production must provide purpose-specific consent, retention controls, export and deletion, processor agreements, and review of India’s staged data-protection requirements.",
    ],
    "Cancellation & refunds": [
      "Clear terms before checkout",
      "Cancellation depends on the order and shipment state. Refunds require a provider reference and reconciliation; a request is never displayed as completed until confirmed. Produce-specific policy windows require operational and legal review.",
    ],
    "Produce quality": [
      "Fresh produce deserves thoughtful care",
      "Report quality, missing-item, or weight issues promptly with photos and expected versus received quantities. Policy windows are configurable by category and must be shown before purchase. No automatic refund is promised.",
    ],
    "How KhetSetu works": [
      "Good food starts with good connections.",
      "Discover growers, compare clearly described produce, and add what you need. Your basket becomes a separate order for each seller. Businesses can request quotations before ordering. Delivery availability always depends on your PIN code.",
    ],
  };
  if (info[modal])
    return (
      <>
        <span className="large-icon">
          <Sprout size={29} />
        </span>
        <h2>{info[modal][0]}</h2>
        <p className="dialog-intro">{info[modal][1]}</p>
        <button className="secondary full" onClick={() => setModal("")}>
          Got it
        </button>
      </>
    );
  if (modal === "admin-verification")
    return (
      <>
        <h2>Review sample seller application</h2>
        <p>
          Seller document verification and approval are not implemented in this
          MVP API. This screen describes the planned review process. Identity,
          business, and payout requirements must be checked before live
          activation.
        </p>
        <div className="info-strip">
          <Lock size={20} />
          No application approval or verification is performed by this preview.
        </div>
        <button className="secondary full" onClick={() => setModal("")}>
          Close review
        </button>
      </>
    );
  if (modal === "moderate")
    return (
      <>
        <h2>{product?.title}</h2>
        <p>
          Review the listing’s accuracy, seller status, photos, and applicable
          certifications before changing availability.
        </p>
        <Form
          fields={[{ name: "reason", label: "Moderation reason" }]}
          submit="Request listing takedown"
          note="A protected, audited operation. Sample listings are not changed locally."
          onSubmit={(d) =>
            mutation(
              `/seller/listings/${product?.id}`,
              { status: "paused" },
              "admin",
              "PATCH",
            )
          }
        />
      </>
    );
  if (modal === "cancel")
    return (
      <>
        <h2>Cancellation & refund review</h2>
        <Form
          fields={[
            { name: "orderId", label: "Actual API order ID" },
            { name: "reason", label: "Reason" },
          ]}
          submit="Request cancellation"
          note="Cancellation releases eligible reserved inventory. A refund is a separate signed provider operation and must never be assumed successful."
          onSubmit={(d) =>
            mutation(
              `/orders/${d.orderId}/transition`,
              { status: "cancelled" },
              "admin",
            )
          }
        />
      </>
    );
  if (modal === "dispute-admin")
    return (
      <>
        <h2>Quality dispute review</h2>
        <Form
          fields={[
            { name: "disputeId", label: "Actual API dispute ID" },
            {
              name: "resolution",
              label: "Resolution and internal note",
              textarea: true,
            },
          ]}
          submit="Submit resolution to API"
          note="Evidence must be reviewed before any refund decision. All critical actions need a durable audit trail."
          onSubmit={(d) =>
            mutation(
              `/disputes/${d.disputeId}/resolve`,
              { resolution: d.resolution },
              "admin",
            )
          }
        />
      </>
    );
  return (
    <>
      <h2>Connect the development API</h2>
      <p>
        This workflow requires a configured API and service credentials. See the
        included setup and implementation status for exact availability.
      </p>
      <button
        className="secondary full"
        disabled={busy}
        onClick={() => setModal("")}
      >
        Close
      </button>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
