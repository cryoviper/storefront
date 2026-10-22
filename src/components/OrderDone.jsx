import { money } from "../lib/cart.js";

export default function OrderDone({ no }) {
  let order = null;
  try { order = JSON.parse(sessionStorage.getItem("nook.lastOrder")); } catch { /* ignore */ }
  const match = order && order.no === no;
  return (
    <section className="done">
      <div className="tick" aria-hidden="true">✓</div>
      <p className="eyebrow">Order {no}</p>
      <h1>{match ? `Thanks, ${order.name.split(" ")[0]}!` : "Order placed"}</h1>
      {match ? (
        <p>Your demo order of {order.count} item{order.count > 1 ? "s" : ""} for <b>{money(order.total)}</b> is confirmed. In a real store, a receipt would go to <b>{order.email}</b>.</p>
      ) : (
        <p>Your demo order is confirmed.</p>
      )}
      <a className="btn dark" href="#/">Keep shopping</a>
    </section>
  );
}
