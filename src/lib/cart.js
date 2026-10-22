// Cart logic as pure functions so it can be unit tested.
// Prices are handled in cents to avoid floating point errors.

export const FREE_SHIPPING_CENTS = 7500;
export const SHIPPING_CENTS = 699;
export const TAX_RATE = 0.08;
export const MAX_QTY = 10;

export const toCents = (dollars) => Math.round(dollars * 100);

export function cartReducer(items, action) {
  switch (action.type) {
    case "add": {
      const { product, qty = 1 } = action;
      const limit = Math.min(MAX_QTY, product.stock ?? MAX_QTY);
      const existing = items.find((i) => i.id === product.id);
      if (existing) {
        return items.map((i) => (i.id === product.id ? { ...i, qty: Math.min(limit, i.qty + qty) } : i));
      }
      return [...items, {
        id: product.id, title: product.title, thumbnail: product.thumbnail,
        priceCents: toCents(product.price), stock: product.stock ?? MAX_QTY, qty: Math.min(limit, qty),
      }];
    }
    case "setQty": {
      if (action.qty <= 0) return items.filter((i) => i.id !== action.id);
      return items.map((i) => (i.id === action.id ? { ...i, qty: Math.min(Math.min(MAX_QTY, i.stock), action.qty) } : i));
    }
    case "remove": return items.filter((i) => i.id !== action.id);
    case "clear": return [];
    default: return items;
  }
}

export function totals(items) {
  const count = items.reduce((a, i) => a + i.qty, 0);
  const subtotal = items.reduce((a, i) => a + i.priceCents * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS;
  const tax = Math.round(subtotal * TAX_RATE);
  return { count, subtotal, shipping, tax, total: subtotal + shipping + tax, toFreeShipping: Math.max(0, FREE_SHIPPING_CENTS - subtotal) };
}

export const money = (cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
