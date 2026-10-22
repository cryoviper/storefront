import { useEffect, useMemo, useState } from "react";
import { getCatalog, CATEGORIES } from "../lib/api.js";
import { money, toCents } from "../lib/cart.js";
import { useCart } from "../App.jsx";

const SORTS = {
  featured: { label: "Featured", fn: (a, b) => b.rating * Math.log(b.stock + 2) - a.rating * Math.log(a.stock + 2) },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  rating: { label: "Top rated", fn: (a, b) => b.rating - a.rating },
};

function useCatalog() {
  const [s, set] = useState({ loading: true, error: null, data: [] });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    set((x) => ({ ...x, loading: true, error: null }));
    getCatalog(ctrl.signal)
      .then((data) => set({ loading: false, error: null, data }))
      .catch((error) => error.name !== "AbortError" && set({ loading: false, error, data: [] }));
    return () => ctrl.abort();
  }, [retry]);
  return { ...s, retry: () => setRetry((n) => n + 1) };
}

export function Stars({ value }) {
  return (
    <span className="stars" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <span style={{ "--p": `${(value / 5) * 100}%` }} aria-hidden="true">★★★★★</span>
      <small>{value.toFixed(1)}</small>
    </span>
  );
}

export default function Catalog({ route }) {
  const params = new URLSearchParams(route.split("?")[1] || "");
  const cat = params.get("c") || "";
  const { loading, error, data, retry } = useCatalog();
  const { add } = useCart();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(0);
  const [inStock, setInStock] = useState(false);

  const priceCeil = useMemo(() => Math.ceil(Math.max(0, ...data.map((p) => p.price)) / 50) * 50 || 1000, [data]);
  const limit = maxPrice || priceCeil;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data
      .filter((p) => (!cat || p.category === cat) && p.price <= limit && (!inStock || p.stock > 0) &&
        (!s || p.title.toLowerCase().includes(s) || (p.brand || "").toLowerCase().includes(s)))
      .sort(SORTS[sort].fn);
  }, [data, cat, q, sort, limit, inStock]);

  const setCat = (slug) => { window.location.hash = slug ? `/?c=${slug}` : "/"; };

  return (
    <>
      {!cat && (
        <section className="hero">
          <div>
            <p className="eyebrow">New season</p>
            <h1>Make the everyday <em>feel good.</em></h1>
            <p>Furniture, decor and kitchen pieces picked for small homes and slow mornings.</p>
            <button className="btn dark" type="button" onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}>Shop the collection</button>
          </div>
          <div className="hero-img" aria-hidden="true">
            {data.slice(0, 3).map((p) => <img key={p.id} src={p.thumbnail} alt="" />)}
          </div>
        </section>
      )}

      <section className="shop" id="shop" aria-labelledby="shop-h">
        <div className="shop-head">
          <h2 id="shop-h">{cat ? CATEGORIES.find((c) => c.slug === cat)?.name : "All products"}</h2>
          <p className="muted" aria-live="polite">{loading ? "Loading…" : `${list.length} products`}</p>
        </div>

        <div className="filters">
          <div className="chips" role="group" aria-label="Category">
            <button type="button" aria-pressed={!cat} onClick={() => setCat("")}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.slug} type="button" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)}>{c.name}</button>
            ))}
          </div>
          <div className="filter-row">
            <label className="search"><span className="sr">Search products</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />
            </label>
            <label className="range">
              <span>Up to <b>{money(toCents(limit))}</b></span>
              <input type="range" min="10" max={priceCeil} step="10" value={limit} onChange={(e) => setMaxPrice(Number(e.target.value))} />
            </label>
            <label className="check"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock</label>
            <label className="sort"><span className="sr">Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <div className="msg" role="alert">
            <b>The store couldn't load.</b><span>{error.message}.</span>
            <button className="btn" type="button" onClick={retry}>Try again</button>
          </div>
        ) : loading ? (
          <ul className="grid" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <li key={i} className="tile skel" />)}</ul>
        ) : list.length === 0 ? (
          <div className="msg"><b>No products match.</b><span>Try clearing the search or raising the price limit.</span></div>
        ) : (
          <ul className="grid">
            {list.map((p) => (
              <li key={p.id} className="tile">
                <a href={`#/product/${p.id}`} className="tile-img">
                  <img src={p.thumbnail} alt={p.title} loading="lazy" width="300" height="300" />
                  {p.discountPercentage >= 10 && <span className="tag">−{Math.round(p.discountPercentage)}%</span>}
                </a>
                <div className="tile-body">
                  <a href={`#/product/${p.id}`} className="t">{p.title}</a>
                  <Stars value={p.rating} />
                  <div className="tile-foot">
                    <b>{money(toCents(p.price))}</b>
                    <button type="button" className="add" disabled={!p.stock} onClick={() => add(p)} aria-label={`Add ${p.title} to cart`}>
                      {p.stock ? "Add" : "Sold out"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
