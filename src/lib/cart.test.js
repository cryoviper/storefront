import { describe, it, expect } from "vitest";
import { cartReducer, totals, FREE_SHIPPING_CENTS, SHIPPING_CENTS } from "./cart.js";

const lamp = { id: 1, title: "Lamp", price: 19.99, stock: 3, thumbnail: "" };
const rug = { id: 2, title: "Rug", price: 60, stock: 50, thumbnail: "" };

describe("cartReducer", () => {
  it("adds items and merges duplicates", () => {
    let c = cartReducer([], { type: "add", product: lamp });
    c = cartReducer(c, { type: "add", product: lamp });
    expect(c).toHaveLength(1);
    expect(c[0].qty).toBe(2);
    expect(c[0].priceCents).toBe(1999);
  });
  it("never goes above stock", () => {
    let c = cartReducer([], { type: "add", product: lamp, qty: 5 });
    expect(c[0].qty).toBe(3);
    c = cartReducer(c, { type: "setQty", id: 1, qty: 9 });
    expect(c[0].qty).toBe(3);
  });
  it("removes when qty drops to 0", () => {
    const c = cartReducer(cartReducer([], { type: "add", product: rug }), { type: "setQty", id: 2, qty: 0 });
    expect(c).toEqual([]);
  });
});

describe("totals", () => {
  it("is all zero for an empty cart", () => {
    expect(totals([])).toMatchObject({ count: 0, subtotal: 0, shipping: 0, total: 0 });
  });
  it("charges shipping under the threshold", () => {
    const t = totals(cartReducer([], { type: "add", product: lamp }));
    expect(t.subtotal).toBe(1999);
    expect(t.shipping).toBe(SHIPPING_CENTS);
    expect(t.tax).toBe(160); // 8% of 19.99, rounded
    expect(t.total).toBe(1999 + SHIPPING_CENTS + 160);
    expect(t.toFreeShipping).toBe(FREE_SHIPPING_CENTS - 1999);
  });
  it("gives free shipping over the threshold", () => {
    const c = cartReducer([], { type: "add", product: rug, qty: 2 });
    expect(totals(c).shipping).toBe(0);
  });
  it("adds cents exactly (no float drift)", () => {
    const p = { id: 3, title: "x", price: 0.1, stock: 10 };
    const c = cartReducer([], { type: "add", product: p, qty: 3 });
    expect(totals(c).subtotal).toBe(30);
  });
});
