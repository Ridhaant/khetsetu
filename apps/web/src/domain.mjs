export const INDIAN_PIN_PATTERN = "[1-9][0-9]{5}";
const indianPin = new RegExp(`^${INDIAN_PIN_PATTERN}$`);
export const hasIndianPinFormat = (pin) =>
  typeof pin === "string" && pin.length === 6 && indianPin.test(pin);
export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
export function validateCart(lines, pin) {
  if (!hasIndianPinFormat(pin))
    return "Enter a six-digit Indian PIN code starting with 1–9.";
  if (!lines.length) return "Your basket is empty.";
  for (const { listing: p, quantity: q } of lines) {
    if (!Number.isFinite(q) || q < p.minimumQuantity)
      return `${p.title}: minimum ${p.minimumQuantity} ${p.unit}.`;
    if (q > p.availableQuantity)
      return `${p.title}: only ${p.availableQuantity} ${p.unit} available.`;
    if (p.status && p.status !== "active") return `${p.title} is unavailable.`;
  }
  return null;
}
export function unitPrice(p, q) {
  return (
    [...(p.tiers ?? [])].sort((a, b) => b.min - a.min).find((t) => q >= t.min)
      ?.price ?? p.price
  );
}
export function cartSummary(lines) {
  const groups = Object.values(
    lines.reduce((a, line) => {
      const id = line.listing.sellerId;
      (a[id] ??= {
        sellerId: id,
        sellerName: line.listing.sellerName,
        lines: [],
        subtotal: 0,
      }).lines.push(line);
      a[id].subtotal += unitPrice(line.listing, line.quantity) * line.quantity;
      return a;
    }, {}),
  );
  return {
    groups,
    subtotal: groups.reduce((s, g) => s + g.subtotal, 0),
    count: lines.length,
  };
}
export function filterListings(
  listings,
  {
    search = "",
    category = "All produce",
    organic = false,
    sort = "recommended",
    price = 500,
    grade = "All grades",
  },
) {
  let r = listings.filter(
    (p) =>
      (category === "All produce" || p.category === category) &&
      (!organic || p.organic) &&
      p.price <= price &&
      (grade === "All grades" || p.grade === grade) &&
      `${p.title} ${p.variety} ${p.sellerName} ${p.location}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  if (sort === "price-low") r.sort((a, b) => a.price - b.price);
  if (sort === "price-high") r.sort((a, b) => b.price - a.price);
  if (sort === "rating") r.sort((a, b) => b.rating - a.rating);
  return r;
}
