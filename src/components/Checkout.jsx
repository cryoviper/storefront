import { useState } from "react";
import { money } from "../lib/cart.js";
import { useCart } from "../App.jsx";

const FIELDS = [
  { name: "name", label: "Full name", autoComplete: "name", validate: (v) => v.trim().length >= 2 || "Enter your name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email" },
  { name: "address", label: "Street address", autoComplete: "street-address", validate: (v) => v.trim().length >= 5 || "Enter your street address" },
  { name: "city", label: "City", autoComplete: "address-level2", validate: (v) => v.trim().length >= 2 || "Enter your city" },
  { name: "zip", label: "Postal code", autoComplete: "postal-code", validate: (v) => /^[A-Za-z0-9 -]{3,10}$/.test(v.trim()) || "Enter a valid postal code" },
];

export default function Checkout() {
  const { items, totals: t, dispatch } = useCart();
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map((f) => [f.name, ""])));
  const [touched, setTouched] = useState({});
  const [shipping, setShipping] = useState("standard");
  const [placing, setPlacing] = useState(false);

  const errors = Object.fromEntries(FIELDS.map((f) => {
    const r = f.validate(values[f.name]);
    return [f.name, r === true ? "" : r];
  }));
  const express = shipping === "express" ? 1500 : 0;

  if (!items.length) {
    return <div className="msg"><b>Your cart is empty.</b><a href="#/">Back to the shop</a></div>;
  }

  const submit = (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((f) => [f.name, true])));
    const first = FIELDS.find((f) => errors[f.name]);
    if (first) { document.getElementById("f-" + first.name)?.focus(); return; }
    setPlacing(true);
    // No real payment: simulate a short request, then confirm.
    setTimeout(() => {
      const no = "NK-" + Date.now().toString(36).toUpperCase().slice(-6);
      try {
        sessionStorage.setItem("nook.lastOrder", JSON.stringify({ no, name: values.name.trim(), email: values.email.trim(), total: t.total + express, count: t.count, shipping }));
      } catch { /* ignore */ }
      dispatch({ type: "clear" });
      window.location.hash = `/order/${no}`;
    }, 700);
  };

  return (
    <div className="checkout">
      <form className="co-form" onSubmit={submit} noValidate>
        <h1>Checkout</h1>
        <fieldset>
          <legend>Shipping details</legend>
          <div className="fields">
            {FIELDS.map((f) => {
              const show = touched[f.name] && errors[f.name];
              return (
                <label key={f.name} className={`fld fld-${f.name}`}>
                  <span>{f.label}</span>
                  <input
                    id={"f-" + f.name}
                    type={f.type || "text"}
                    autoComplete={f.autoComplete}
                    value={values[f.name]}
                    aria-invalid={!!show}
                    aria-describedby={show ? `e-${f.name}` : undefined}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    onBlur={() => setTouched((x) => ({ ...x, [f.name]: true }))}
                  />
                  {show && <small id={`e-${f.name}`} className="fld-err">{errors[f.name]}</small>}
                </label>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend>Delivery</legend>
          <div className="radios">
            <label className={shipping === "standard" ? "on" : ""}>
              <input type="radio" name="ship" checked={shipping === "standard"} onChange={() => setShipping("standard")} />
              <span><b>Standard</b><small>3 to 5 business days</small></span>
              <em>{t.shipping ? money(t.shipping) : "Free"}</em>
            </label>
            <label className={shipping === "express" ? "on" : ""}>
              <input type="radio" name="ship" checked={shipping === "express"} onChange={() => setShipping("express")} />
              <span><b>Express</b><small>Next business day</small></span>
              <em>+{money(1500)}</em>
            </label>
          </div>
        </fieldset>
        <div className="pay-note">
          <b>Payment</b>
          <p>This is a demo store, so there's no payment step and nothing will be charged or shipped.</p>
        </div>
        <button className="btn dark full" type="submit" disabled={placing}>{placing ? "Placing order…" : `Place demo order · ${money(t.total + express)}`}</button>
      </form>

      <aside className="co-summary" aria-label="Order summary">
        <h2>Order summary</h2>
        <ul>
          {items.map((i) => (
            <li key={i.id}>
              <span className="th"><img src={i.thumbnail} alt="" width="52" height="52" /><b>{i.qty}</b></span>
              <span className="nm">{i.title}</span>
              <span>{money(i.priceCents * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="sum">
          <div><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
          <div><span>Shipping</span><span>{t.shipping + express ? money(t.shipping + express) : "Free"}</span></div>
          <div><span>Tax</span><span>{money(t.tax)}</span></div>
          <div className="grand"><span>Total</span><span>{money(t.total + express)}</span></div>
        </div>
      </aside>
    </div>
  );
}
