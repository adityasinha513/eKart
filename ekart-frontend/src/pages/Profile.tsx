import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart, MapPin, Package, Pencil, Plus, Star, Trash2 } from "lucide-react";
import PrimaryButton from "../components/ui/PrimaryButton";
import SecondaryButton from "../components/ui/SecondaryButton";
import { useAuth } from "../context/AuthContext";
import * as addressesApi from "../services/api/addresses";
import type { Address, AddressInput } from "../types/Address";

const emptyForm: AddressInput = { label: "", line1: "", line2: "", city: "", state: "", pincode: "", landmark: "" };

export default function Profile() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAddresses = () => {
    if (!user) return;
    setIsLoading(true);
    addressesApi
      .getAddresses(user.emailId)
      .then(setAddresses)
      .catch(() => toast.error("Could not load addresses."))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadAddresses, [user]);

  const startEdit = (address?: Address) => {
    if (address) {
      setEditingId(address.addressId);
      setForm({
        label: address.label ?? "",
        line1: address.line1,
        line2: address.line2 ?? "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark ?? "",
      });
    } else {
      setEditingId("new");
      setForm(emptyForm);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error("Address line, city, state, and pincode are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId === "new") {
        await addressesApi.addAddress(user.emailId, form);
        toast.success("Address added.");
      } else if (typeof editingId === "number") {
        await addressesApi.updateAddress(user.emailId, editingId, form);
        toast.success("Address updated.");
      }
      setEditingId(null);
      loadAddresses();
    } catch {
      toast.error("Could not save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!user) return;
    try {
      await addressesApi.deleteAddress(user.emailId, addressId);
      toast.success("Address removed.");
      loadAddresses();
    } catch {
      toast.error("Could not remove address.");
    }
  };

  const handleSetDefault = async (addressId: number) => {
    if (!user) return;
    try {
      await addressesApi.setDefaultAddress(user.emailId, addressId);
      loadAddresses();
    } catch {
      toast.error("Could not set default address.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-mithai-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-maroon-700">Your account</p>
            <h1 className="mt-2 text-3xl font-semibold text-maroon-900">Hello, {user?.name ?? "there"}</h1>
            <p className="mt-2 text-stone-500">{user?.emailId} • {user?.phoneNumber}</p>
          </div>
          <Link to="/catalog">
            <PrimaryButton>Continue shopping</PrimaryButton>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Heart className="text-maroon-700" />
            <h2 className="text-xl font-semibold text-maroon-900">Wishlist</h2>
          </div>
          <p className="mt-3 text-sm text-stone-600">View and manage the sweets you've saved.</p>
          <Link to="/wishlist" className="mt-4 inline-block text-sm font-semibold text-maroon-700">View wishlist →</Link>
        </div>

        <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Package className="text-maroon-700" />
            <h2 className="text-xl font-semibold text-maroon-900">Orders</h2>
          </div>
          <p className="mt-3 text-sm text-stone-600">Track live orders or reorder your favorites.</p>
          <Link to="/orders" className="mt-4 inline-block text-sm font-semibold text-maroon-700">View orders →</Link>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MapPin className="text-maroon-700" />
            <h2 className="text-xl font-semibold text-maroon-900">Address book</h2>
          </div>
          {editingId === null ? (
            <button onClick={() => startEdit()} className="inline-flex items-center gap-1 text-sm font-semibold text-maroon-700">
              <Plus size={16} /> Add address
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-mithai-100" />
        ) : (
          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <div key={address.addressId} className="rounded-2xl border border-mithai-200 bg-cream-100 p-4 text-sm text-stone-600">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-maroon-900">
                      {address.label || "Address"}
                      {address.isDefault ? <span className="ml-2 rounded-full bg-mithai-200 px-2 py-0.5 text-xs font-medium text-maroon-700">Default</span> : null}
                    </p>
                    <p className="mt-2">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}</p>
                    {address.landmark ? <p className="mt-1 text-stone-500">Landmark: {address.landmark}</p> : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => startEdit(address)} className="rounded-full p-2 text-stone-500 hover:bg-white hover:text-maroon-700" aria-label="Edit address">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(address.addressId)} className="rounded-full p-2 text-stone-500 hover:bg-white hover:text-red-500" aria-label="Delete address">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {!address.isDefault ? (
                  <button onClick={() => handleSetDefault(address.addressId)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-maroon-700">
                    <Star size={12} /> Set as default
                  </button>
                ) : null}
              </div>
            ))}
            {addresses.length === 0 && editingId === null ? (
              <p className="text-sm text-stone-500">No saved addresses yet.</p>
            ) : null}
          </div>
        )}

        {editingId !== null ? (
          <div className="mt-5 rounded-2xl border border-dashed border-mithai-300 p-4">
            <h3 className="font-semibold text-maroon-900">{editingId === "new" ? "New address" : "Edit address"}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Label (Home, Work...)" value={form.label ?? ""} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
              <input className="rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
              <input className="sm:col-span-2 rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Address line 1" value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} />
              <input className="sm:col-span-2 rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Address line 2 (optional)" value={form.line2 ?? ""} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} />
              <input className="rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              <input className="rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
              <input className="sm:col-span-2 rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Landmark (optional)" value={form.landmark ?? ""} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} />
            </div>
            <div className="mt-3 flex gap-3">
              <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save address"}</PrimaryButton>
              <SecondaryButton onClick={() => setEditingId(null)}>Cancel</SecondaryButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
