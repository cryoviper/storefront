import { useEffect, useRef } from "react";
import { money } from "../lib/cart.js";
import { useCart } from "../App.jsx";

export default function CartDrawer() {
  const { items, dispatch, totals: t, open, setOpen } = useCart();
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const pct = Math.min(100, ((t.subtotal) / (t.subtotal + t.toFreeShipping || 1)) * 100);

  return (
    <dialog ref={ref} className="drawer" aria-labelledby="cart-h" onClose={() => setOpen(false)} onClick={(e) => { if (e.target === ref.current) setOpen(false); }}>
      <div className="drawer-inner">
        <div className="drawer-head">
          <h2 id="cart-h">Your cart <span>({t.count})</span></h2>
          <button type="button" className="x" onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>
        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Your cart is empty.</p>
            <a className="btn dark" href="#/" onClick={() => setOpen(false)}>Start shopping</a>
          </div>
        ) : (
          <>
            <div className="ship-bar">
              <p>{t.toFreeShipping > 0 ? <>Add <b>{money(t.toFreeShipping)}</b> for free shipping</> : <>You've got <b>free shipping</b></>}</p>
              <div className="bar"><i style={{ width: pct + "%" }} /></div>
            </div>
            <ul className="lines">
              {items.map((i) => (
                <li key={i.id}>
                  <img src={i.thumbnail} alt="" width="72" height="72" />
                  <div className="line-info">
                    <a href={`#/product/${i.id}`} onClick={() => setOpen(false)}>{i.title}</a>
                    <span className="muted">{money(i.priceCents)}</span>
                    <div className="qty sm" role="group" aria-label={`Quantity of ${i.title}`}>
                      <button type="button" onClick={() => dispatch({ type: "setQty", id: i.id, qty: i.qty - 1 })} aria-label="Decrease">−</button>
                      <output>{i.qty}</output>
                      <button type="button" onClick={() => dispatch({ type: "setQty", id: i.id, qty: i.qty + 1 })} aria-label="Increase" disabled={i.qty >= Math.min(10, i.stock)}>+</button>
                    </div>
                  </div>
                  <div className="line-end">
                    <b>{money(i.priceCents * i.qty)}</b>
                    <button type="button" className="link" onClick={() => dispatch({ type: "remove", id: i.id })}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="sum">
              <div><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
              <div><span>Shipping</span><span>{t.shipping ? money(t.shipping) : "Free"}</span></div>
              <div><span>Estimated tax</span><span>{money(t.tax)}</span></div>
              <div className="grand"><span>Total</span><span>{money(t.total)}</span></div>
              <a className="btn dark full" href="#/checkout" onClick={() => setOpen(false)}>Checkout</a>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
