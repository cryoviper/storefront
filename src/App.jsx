import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { cartReducer, totals } from "./lib/cart.js";
import Catalog from "./components/Catalog.jsx";
import ProductPage from "./components/ProductPage.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Checkout from "./components/Checkout.jsx";
import OrderDone from "./components/OrderDone.jsx";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);
const KEY = "nook.cart.v1";

function useHash() {
  const get = () => window.location.hash.replace(/^#/, "") || "/";
  const [h, setH] = useState(get);
  useEffect(() => {
    const on = () => { setH(get()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return h;
}

export default function App() {
  const route = useHash();
  const [items, dispatch] = useReducer(cartReducer, null, () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ } }, [items]);

  const add = (product, qty = 1) => {
    dispatch({ type: "add", product, qty });
    setFlash(`Added ${product.title}`);
    setOpen(true);
  };
  useEffect(() => { if (flash) { const t = setTimeout(() => setFlash(""), 2500); return () => clearTimeout(t); } }, [flash]);

  const t = totals(items);
  const product = route.match(/^\/product\/(\d+)/);
  const order = route.match(/^\/order\/([\w-]+)/);

  return (
    <CartCtx.Provider value={{ items, dispatch, add, totals: t, open, setOpen }}>
      <a className="skip" href="#main">Skip to content</a>
      <div className="notice">Demo store for a portfolio project. Nothing is for sale and no payment is taken.</div>
      <header className="top">
        <a className="brand" href="#/">Nook<span>.</span></a>
        <nav className="nav" aria-label="Main">
          <a href="#/">Shop</a>
          <a href="#/?c=furniture">Furniture</a>
          <a href="#/?c=home-decoration">Decor</a>
          <a href="#/?c=kitchen-accessories">Kitchen</a>
        </nav>
        <button className="cart-btn" type="button" onClick={() => setOpen(true)} aria-label={`Open cart, ${t.count} items`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
          <span>Cart</span>
          {t.count > 0 && <b>{t.count}</b>}
        </button>
      </header>

      <main id="main">
        {product ? <ProductPage id={Number(product[1])} />
          : route.startsWith("/checkout") ? <Checkout />
          : order ? <OrderDone no={order[1]} />
          : <Catalog route={route} />}
      </main>

      <CartDrawer />
      <div className="sr" role="status" aria-live="polite">{flash}</div>
      <footer className="foot">
        <div><b className="brand small">Nook<span>.</span></b><p>Home goods for slow mornings. A demo store built with React.</p></div>
        <p>Product data and images from <a href="https://dummyjson.com" target="_blank" rel="noopener">DummyJSON</a>. Built by <a href="https://github.com/cryoviper" target="_blank" rel="noopener">Praveen Sinwar</a>.</p>
      </footer>
    </CartCtx.Provider>
  );
}
