# Nook · Storefront

A demo e-commerce store built with React: browse and filter products, open product pages, manage a cart, and go through a validated checkout. No real payments, it's a portfolio project.

**Live:** https://cryoviper.github.io/storefront/

## Features

- Product grid with category chips, search, price slider, in-stock filter and sorting
- Product page with image gallery, rating, stock level, quantity picker, shipping and return info
- Slide-out cart drawer with quantity controls, a free-shipping progress bar, tax and totals
- Checkout with inline validation, delivery options, and an order confirmation page
- Cart saved in `localStorage`; loading skeletons, empty and error states with retry
- Responsive down to 360px, keyboard accessible (native `<dialog>` for the drawer)

## Tech

- React 18 + Vite, Context + `useReducer` for the cart
- Cart and pricing logic as pure functions in `src/lib/cart.js`, tested with **Vitest**
- Prices handled in **cents** so totals never drift (`0.1 × 3` is exactly 30 cents)
- Stock limits enforced in the reducer, not only in the UI
- Product data from [DummyJSON](https://dummyjson.com) (free, no API key)
- GitHub Actions runs the tests, then deploys to GitHub Pages

## Run locally

```bash
git clone https://github.com/cryoviper/storefront.git
cd storefront
npm install
npm test
npm run dev
```

## What I learned

- Structuring a multi-page React app without a router library (hash routing)
- Keeping business rules (stock, shipping, tax) in testable functions
- Building forms that validate on blur and move focus to the first error

---

Built by [Praveen Sinwar](https://github.com/cryoviper). Product data and images from DummyJSON.
