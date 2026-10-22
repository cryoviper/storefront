// Product data from DummyJSON (https://dummyjson.com), a free fake-store API.
const BASE = "https://dummyjson.com";
export const CATEGORIES = [
  { slug: "furniture", name: "Furniture" },
  { slug: "home-decoration", name: "Decor" },
  { slug: "kitchen-accessories", name: "Kitchen" },
];
const SELECT = "id,title,price,rating,stock,thumbnail,images,description,brand,category,discountPercentage,reviews,returnPolicy,shippingInformation,warrantyInformation";

const cache = new Map();
async function get(path, signal) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(BASE + path, { signal });
  if (!res.ok) throw new Error(`Store API returned ${res.status}`);
  const data = await res.json();
  cache.set(path, data);
  return data;
}

export async function getCatalog(signal) {
  const lists = await Promise.all(
    CATEGORIES.map((c) => get(`/products/category/${c.slug}?limit=40&select=${SELECT}`, signal))
  );
  return lists.flatMap((l) => l.products);
}

export const getProduct = (id, signal) => get(`/products/${id}`, signal);
export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name || slug;
