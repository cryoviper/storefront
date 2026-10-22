import { useEffect, useState } from "react";
import { getProduct, categoryName } from "../lib/api.js";
import { money, toCents, MAX_QTY } from "../lib/cart.js";
import { useCart } from "../App.jsx";
import { Stars } from "./Catalog.jsx";

export default function ProductPage({ id }) {
  const [s, set] = useState({ loading: true, error: null, p: null });
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    const ctrl = new AbortController();
    set({ loading: true, error: null, p: null });
    setImg(0); setQty(1);
    getProduct(id, ctrl.signal)
      .then((p) => { set({ loading: false, error: null, p }); document.title = `${p.title} · Nook`; })
      .catch((error) => error.name !== "AbortError" && set({ loading: false, error, p: null }));
    return () => { ctrl.abort(); document.title = "Nook · Home goods"; };
  }, [id]);

  if (s.loading) return <div className="pp"><div className="pp-gallery skel" /><div className="pp-info"><div className="skel line" /></div></div>;
  if (s.error) return <div className="msg" role="alert"><b>Couldn't load this product.</b><a href="#/">Back to the shop</a></div>;
  const p = s.p;
  const images = p.images?.length ? p.images : [p.thumbnail];
  const max = Math.min(MAX_QTY, p.stock);
  const was = p.discountPercentage >= 10 ? toCents(p.price / (1 - p.discountPercentage / 100)) : null;

  return (
    <article className="pp">
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href="#/">Shop</a> / <a href={`#/?c=${p.category}`}>{categoryName(p.category)}</a> / <span aria-current="page">{p.title}</span>
      </nav>
      <div className="pp-gallery">
        <div className="pp-main"><img src={images[img]} alt={p.title} width="600" height="600" /></div>
        {images.length > 1 && (
          <div className="thumbs" role="group" aria-label="Product images">
            {images.map((src, i) => (
              <button key={src} type="button" aria-pressed={i === img} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}>
                <img src={src} alt="" loading="lazy" width="80" height="80" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="pp-info">
        {p.brand && <p className="eyebrow">{p.brand}</p>}
        <h1>{p.title}</h1>
        <Stars value={p.rating} />
        <p className="price">{money(toCents(p.price))}{was && <s>{money(was)}</s>}</p>
        <p className="desc">{p.description}</p>
        <p className={`stock ${p.stock < 10 ? "low" : ""}`}>{p.stock === 0 ? "Sold out" : p.stock < 10 ? `Only ${p.stock} left` : "In stock"}</p>
        {p.stock > 0 && (
          <div className="buy">
            <div className="qty" role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={qty <= 1}>−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="Increase quantity" disabled={qty >= max}>+</button>
            </div>
            <button className="btn dark grow" type="button" onClick={() => add(p, qty)}>Add to cart · {money(toCents(p.price) * qty)}</button>
          </div>
        )}
        <dl className="specs">
          {p.shippingInformation && <div><dt>Shipping</dt><dd>{p.shippingInformation}</dd></div>}
          {p.returnPolicy && <div><dt>Returns</dt><dd>{p.returnPolicy}</dd></div>}
          {p.warrantyInformation && <div><dt>Warranty</dt><dd>{p.warrantyInformation}</dd></div>}
        </dl>
        {p.reviews?.length > 0 && (
          <section className="reviews" aria-labelledby="rev-h">
            <h2 id="rev-h">Sample reviews</h2>
            <ul>
              {p.reviews.slice(0, 3).map((r, i) => (
                <li key={i}><Stars value={r.rating} /><p>{r.comment}</p><small>{r.reviewerName}</small></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
