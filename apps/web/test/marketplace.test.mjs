import test from "node:test";
import assert from "node:assert/strict";
import {
  validateCart,
  cartSummary,
  unitPrice,
  filterListings,
  money,
} from "../src/domain.mjs";
const tomato = {
  id: "t",
  title: "Tomato",
  sellerId: "s1",
  sellerName: "FPO",
  unit: "kg",
  minimumQuantity: 1,
  availableQuantity: 100,
  price: 30,
  tiers: [
    { min: 25, price: 25 },
    { min: 50, price: 20 },
  ],
  status: "active",
  category: "Vegetables",
  grade: "Grade A",
  organic: false,
  variety: "Red",
  location: "Nashik",
  rating: 4.9,
};
const rice = {
  ...tomato,
  id: "r",
  title: "Rice",
  sellerId: "s2",
  sellerName: "Other farm",
  category: "Grains",
  minimumQuantity: 5,
  price: 80,
  tiers: [],
  organic: true,
};
test("basket accepts nationwide PIN formats and rejects malformed PINs", () => {
  const lines = [{ listing: tomato, quantity: 2 }];
  for (const pin of ["110001", "400008", "560001", "700001", "744101"])
    assert.equal(validateCart(lines, pin), null, pin);
  for (const pin of ["010001", "40008", "A00008", "4000088"])
    assert.match(validateCart(lines, pin), /six-digit Indian PIN/);
});
test("empty, below MOQ, non-finite, unavailable and overstock baskets fail", () => {
  assert.match(validateCart([], "400008"), /empty/);
  for (const q of [0, -1, NaN, 101])
    assert.ok(validateCart([{ listing: tomato, quantity: q }], "400008"));
  assert.ok(
    validateCart(
      [{ listing: { ...tomato, status: "expired" }, quantity: 5 }],
      "400008",
    ),
  );
  assert.ok(validateCart([{ listing: rice, quantity: 1 }], "400008"));
});
test("bulk price applies at exact quantity boundaries independent of tier ordering", () => {
  assert.equal(unitPrice(tomato, 24), 30);
  assert.equal(unitPrice(tomato, 25), 25);
  assert.equal(unitPrice(tomato, 50), 20);
  assert.equal(
    unitPrice({ ...tomato, tiers: [...tomato.tiers].reverse() }, 50),
    20,
  );
});
test("multi-seller cart produces separate groups with tier-aware total", () => {
  const c = cartSummary([
    { listing: tomato, quantity: 50 },
    { listing: rice, quantity: 5 },
  ]);
  assert.equal(c.groups.length, 2);
  assert.equal(c.subtotal, 1400);
  assert.equal(c.count, 2);
  assert.equal(c.groups[0].subtotal, 1000);
});
test("search matches seller and origin, filters compose, sorting is numeric", () => {
  const opts = {
    search: "nashik",
    category: "All produce",
    organic: false,
    sort: "price-low",
    price: 100,
    grade: "All grades",
  };
  assert.equal(filterListings([rice, tomato], opts)[0].id, "t");
  assert.deepEqual(
    filterListings([tomato, rice], {
      ...opts,
      search: "",
      organic: true,
      category: "Vegetables",
    }),
    [],
  );
  assert.equal(
    filterListings([tomato, rice], { ...opts, search: "", organic: true })[0]
      .id,
    "r",
  );
  assert.equal(
    filterListings([tomato, rice], { ...opts, search: "", price: 40 }).length,
    1,
  );
});
test("INR format preserves paise and uses Indian digit grouping", () => {
  assert.match(money(284600), /2,84,600/);
  assert.match(money(32.5), /32\.5/);
  assert.match(money(32.57), /32\.57/);
});
