import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, RefreshCw, Search } from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "../../types/Product";
import { formatCurrency } from "../../utils/helpers";
import { extractErrorMessage } from "../../utils/errors";
import * as adminApi from "../../services/api/admin";
import ProductImage from "../../shared/components/ProductImage";
import { useLocation } from "react-router-dom";

export default function AdminProducts() {
  const inventoryView = useLocation().pathname.endsWith("/inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setProducts(await adminApi.getAdminProducts()); setError(null); }
    catch (cause) { setError(extractErrorMessage(cause, "Could not load products.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const toggleAvailability = async (product: Product) => {
    setSavingId(product.productId);
    try {
      const updated = await adminApi.setAdminProductAvailability(product.productId, !product.available);
      setProducts((items) => items.map((item) => item.productId === updated.productId ? updated : item));
      toast.success(`${product.name} is ${updated.available ? "available" : "unavailable"}.`);
    } catch (cause) { toast.error(extractErrorMessage(cause, "Could not update availability.")); }
    finally { setSavingId(null); }
  };

  const changeStock = async (product: Product, delta: number) => {
    await saveStock(product, Math.max(0, product.availableQuantity + delta));
  };

  const saveStock = async (product: Product, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 0) { toast.error("Stock must be a whole number zero or greater."); return; }
    setSavingId(product.productId);
    try {
      const updated = await adminApi.setAdminProductStock(product.productId, quantity);
      setProducts((items) => items.map((item) => item.productId === updated.productId ? updated : item));
      toast.success(`${product.name}: stock set to ${quantity}.`);
    } catch (cause) { toast.error(extractErrorMessage(cause, "Could not update stock.")); }
    finally { setSavingId(null); }
  };

  const archiveProduct = async (product: Product) => {
    if (!window.confirm(`Archive ${product.name}? It will disappear from the customer catalogue while remaining in past orders.`)) return;
    setSavingId(product.productId);
    try {
      await adminApi.archiveAdminProduct(product.productId);
      await refresh();
      toast.success(`${product.name} was archived.`);
    } catch (cause) { toast.error(extractErrorMessage(cause, "Could not archive product.")); }
    finally { setSavingId(null); }
  };

  const categories = ["All categories", ...Array.from(new Set(products.map((product) => product.category))).sort()];
  const visibleProducts = products.filter((product) =>
    (category === "All categories" || product.category === category)
    && `${product.name} ${product.category}`.toLowerCase().includes(search.trim().toLowerCase()));

  const availabilityButton = (product: Product) => (
    <button type="button" disabled={savingId === product.productId} onClick={() => void toggleAvailability(product)} className={`inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors disabled:opacity-60 ${product.available ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
      {savingId === product.productId ? "Saving…" : product.available ? "Available · turn off" : "Unavailable · turn on"}
    </button>
  );

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const values = new FormData(event.currentTarget);
    const payload = {
      name: String(values.get("name") ?? "").trim(), description: String(values.get("description") ?? "").trim(),
      categoryId: Number(values.get("categoryId")), price: Number(values.get("price")),
      availableQuantity: Number(values.get("availableQuantity")), unit: String(values.get("unit")),
      unitQuantity: values.get("unitQuantity") ? Number(values.get("unitQuantity")) : null,
      imageUrl: String(values.get("imageUrl") ?? "").trim() || null,
      ingredients: String(values.get("ingredients") ?? "").trim() || null,
      allergens: String(values.get("allergens") ?? "").trim() || null,
      shelfLifeDays: values.get("shelfLifeDays") ? Number(values.get("shelfLifeDays")) : null,
      veg: values.get("veg") === "on", available: values.get("available") === "on",
    };
    setSavingId(typeof editing === "string" ? -1 : editing.productId);
    try {
      await adminApi.saveAdminProduct(typeof editing === "string" ? null : editing.productId, payload);
      setEditing(null);
      await refresh();
      toast.success(typeof editing === "string" ? "Product added." : "Product updated.");
    } catch (cause) { toast.error(extractErrorMessage(cause, "Could not save product.")); }
    finally { setSavingId(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-maroon-700">Mithai Junction · Shopkeeper</p><h1 className="mt-1 font-serif text-3xl font-semibold text-darkbrown">{inventoryView ? "Inventory" : "Products"}</h1><p className="mt-2 text-sm text-stone-600">{inventoryView ? "Update quantities and availability for the live catalogue." : "Search the catalogue and review product availability."}</p></div>
        <div className="flex gap-2"><button type="button" onClick={() => setEditing("new")} className="min-h-11 rounded-xl bg-maroon-800 px-4 text-sm font-semibold text-white">Add product</button><button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-mithai-300 bg-white px-4 text-sm font-semibold text-darkbrown hover:bg-mithai-50 disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button></div>
      </div>
      {error ? <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}<button type="button" onClick={() => void refresh()} className="ml-3 font-semibold underline">Try again</button></div> : null}
      {loading ? <div className="mt-10 flex justify-center text-maroon-700"><LoaderCircle className="animate-spin" aria-label="Loading products" /></div> : products.length === 0 && !error ? <div className="mt-6 rounded-3xl border border-mithai-200 bg-white p-8 text-center text-stone-600">There are no products in the catalogue yet.</div> : null}

      {!loading && products.length > 0 ? <>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-mithai-200 bg-white px-3"><Search size={16} className="text-stone-400"/><input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none"/></label>
          <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 rounded-xl border border-mithai-200 bg-white px-3 text-sm">{categories.map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        <div className="mt-5 space-y-3 md:hidden">
          {visibleProducts.map((product) => <article key={product.productId} className="flex min-w-0 items-center gap-3 rounded-2xl border border-mithai-200 bg-white p-3 shadow-sm">
            <ProductImage product={product} width={200} className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl bg-mithai-100 object-cover" />
            <div className="min-w-0 flex-1"><h2 className="truncate font-semibold text-darkbrown">{product.name} {product.archived ? <span className="text-xs text-stone-500">· Archived</span> : null}</h2><p className="mt-1 text-xs text-stone-500">{product.category} · {formatCurrency(product.price)}</p><div className="my-2 flex items-center gap-3 text-sm"><button disabled={savingId === product.productId || product.availableQuantity <= 0 || product.archived} onClick={() => void changeStock(product, -1)} className="h-9 w-9 rounded-lg border disabled:opacity-40" aria-label={`Decrease ${product.name} stock`}>−</button><span>Stock: {product.availableQuantity}</span><button disabled={savingId === product.productId || product.archived} onClick={() => void changeStock(product, 1)} className="h-9 w-9 rounded-lg border disabled:opacity-40" aria-label={`Increase ${product.name} stock`}>+</button></div>{!product.archived ? availabilityButton(product) : null}<button type="button" disabled={product.archived} onClick={() => setEditing(product)} className="ml-2 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50">Edit</button>{!product.archived ? <button type="button" disabled={savingId === product.productId} onClick={() => void archiveProduct(product)} className="ml-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Archive</button> : null}</div>
          </article>)}
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-mithai-200 bg-white shadow-sm md:block">
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-wide text-stone-600"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Availability</th><th className="p-4">Actions</th></tr></thead>
            <tbody>{visibleProducts.map((product) => <tr key={product.productId} className="border-t border-mithai-100"><td className="p-4"><div className="flex items-center gap-3"><ProductImage product={product} width={160} className="h-14 w-14 rounded-xl bg-mithai-100 object-cover" /><div><p className="font-semibold text-darkbrown">{product.name}{product.archived ? " · Archived" : ""}</p><p className="mt-1 text-xs text-stone-500">{product.unitQuantity ?? ""} {product.unit?.toLowerCase()}</p></div></div></td><td className="p-4">{product.category}</td><td className="p-4">{formatCurrency(product.price)}</td><td className="p-4"><div className="flex items-center gap-2"><button disabled={savingId === product.productId || product.availableQuantity<=0 || product.archived} onClick={() => void changeStock(product,-1)} aria-label={`Decrease ${product.name} stock`}>−</button><input aria-label={`${product.name} stock quantity`} type="number" min="0" disabled={product.archived} defaultValue={product.availableQuantity} onBlur={(event) => { const next = Number(event.currentTarget.value); if (next !== product.availableQuantity) void saveStock(product,next); }} className="w-16 rounded border px-2 py-1"/><button disabled={savingId === product.productId || product.archived} onClick={() => void changeStock(product,1)} aria-label={`Increase ${product.name} stock`}>+</button></div></td><td className="p-4">{product.archived ? <span className="text-stone-500">Archived</span> : availabilityButton(product)}</td><td className="p-4"><div className="flex gap-2"><button type="button" disabled={product.archived} onClick={() => setEditing(product)} className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50">Edit</button>{!product.archived ? <button type="button" disabled={savingId === product.productId} onClick={() => void archiveProduct(product)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Archive</button> : null}</div></td></tr>)}</tbody>
          </table></div>
        </div>
      </> : null}
      {editing ? <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"><form role="dialog" aria-modal="true" aria-labelledby="product-form-title" onSubmit={(event) => void saveProduct(event)} className="my-auto w-full max-w-2xl space-y-4 rounded-3xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h2 id="product-form-title" className="font-serif text-2xl font-semibold text-darkbrown">{editing === "new" ? "Add product" : `Edit ${editing.name}`}</h2><button type="button" onClick={() => setEditing(null)} className="rounded-lg px-3 py-2 text-stone-500">Close</button></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Name<input name="name" required defaultValue={editing === "new" ? "" : editing.name} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm">Category<select name="categoryId" required defaultValue={editing === "new" ? products[0]?.categoryId : editing.categoryId} className="mt-1 w-full rounded-xl border p-3">{Array.from(new Map(products.map((product) => [product.categoryId, product.category])).entries()).map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select></label><label className="text-sm">Price<input name="price" type="number" min="0.01" step="0.01" required defaultValue={editing === "new" ? "" : editing.price} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm">Stock quantity<input name="availableQuantity" type="number" min="0" step="1" required defaultValue={editing === "new" ? 0 : editing.availableQuantity} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm">Unit<select name="unit" defaultValue={editing === "new" ? "GRAM" : editing.unit} className="mt-1 w-full rounded-xl border p-3">{["GRAM","KG","PIECE","BOX"].map((unit) => <option key={unit}>{unit}</option>)}</select></label><label className="text-sm">Pack size<input name="unitQuantity" type="number" min="1" defaultValue={editing === "new" ? "" : editing.unitQuantity ?? ""} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm sm:col-span-2">Image URL<input name="imageUrl" type="url" defaultValue={editing === "new" ? "" : editing.imageUrl ?? ""} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm sm:col-span-2">Description<textarea name="description" defaultValue={editing === "new" ? "" : editing.description} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm">Ingredients<input name="ingredients" defaultValue={editing === "new" ? "" : editing.ingredients ?? ""} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm">Allergens<input name="allergens" defaultValue={editing === "new" ? "" : editing.allergens ?? ""} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm">Shelf life (days)<input name="shelfLifeDays" type="number" min="1" defaultValue={editing === "new" ? "" : editing.shelfLifeDays ?? ""} className="mt-1 w-full rounded-xl border p-3"/></label><div className="flex items-center gap-5"><label><input type="checkbox" name="veg" defaultChecked={editing === "new" || editing.veg}/> Vegetarian</label><label><input type="checkbox" name="available" defaultChecked={editing === "new" || editing.available}/> Available</label></div></div><button disabled={savingId !== null} className="min-h-11 rounded-xl bg-maroon-800 px-5 font-semibold text-white disabled:opacity-50">{savingId !== null ? "Saving…" : "Save product"}</button></form></div> : null}
    </div>
  );
}
