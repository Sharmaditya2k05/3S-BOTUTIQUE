import { useEffect, useState } from "react";
import { Ticket, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { api } from "../../lib/api";

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  discountType: "percentage" as "percentage" | "flat",
  discountValue: 0,
  minOrderValue: 0,
  maxUses: 0,
  expiresAt: "",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get<Coupon[]>("/coupons")
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(c: Coupon) {
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setEditingId(c.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue),
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt ? new Date(form.expiresAt + "T23:59:59").toISOString() : "",
      };
      if (editingId) {
        const updated = await api.put<Coupon>(`/coupons/${editingId}`, payload);
        setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await api.post<Coupon>("/coupons", payload);
        setCoupons((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Coupon) {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    await api.delete(`/coupons/${c.id}`);
    setCoupons((prev) => prev.filter((x) => x.id !== c.id));
  }

  async function toggleActive(c: Coupon) {
    const updated = await api.put<Coupon>(`/coupons/${c.id}`, {
      isActive: !c.isActive,
    });
    setCoupons((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-3xl text-charcoal">Coupons</h1>
          <p className="mt-1 text-sm text-warmgray">
            Create and manage discount codes for your customers.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="focus-ring flex items-center gap-2 bg-wine px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-wine-dark"
          >
            <Plus size={16} /> New Coupon
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="hairline mb-8 space-y-4 bg-ivory p-5"
        >
          <h2 className="text-sm font-semibold text-charcoal">
            {editingId ? "Edit Coupon" : "New Coupon"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-charcoal">
                Coupon Code
              </span>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                placeholder="e.g. FESTIVE20"
                required
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm uppercase"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-charcoal">
                Discount Type
              </span>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discountType: e.target.value as "percentage" | "flat",
                  }))
                }
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-charcoal">
                Discount Value
              </span>
              <input
                type="number"
                min={0}
                step={form.discountType === "percentage" ? 1 : 0.01}
                value={form.discountValue || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))
                }
                required
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-charcoal">
                Min Order Value (₹)
              </span>
              <input
                type="number"
                min={0}
                value={form.minOrderValue || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minOrderValue: Number(e.target.value) }))
                }
                placeholder="0 = no minimum"
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-charcoal">
                Max Uses
              </span>
              <input
                type="number"
                min={0}
                value={form.maxUses || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))
                }
                placeholder="0 = unlimited"
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              />
            </label>
          </div>

          <label className="block sm:w-1/2">
            <span className="mb-1.5 block text-xs font-medium text-charcoal">
              Expiry Date (optional)
            </span>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, expiresAt: e.target.value }))
              }
              className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
            />
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="focus-ring bg-wine px-6 py-2.5 text-sm font-semibold text-ivory hover:bg-wine-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="focus-ring hairline px-6 py-2.5 text-sm font-medium text-charcoal hover:bg-taupe/20"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-warmgray">Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <div className="hairline flex flex-col items-center justify-center bg-ivory py-16 text-center">
          <Ticket size={40} className="mb-3 text-warmgray/50" />
          <p className="text-sm text-warmgray">No coupons yet.</p>
          <p className="mt-1 text-xs text-warmgray">
            Create your first coupon code to offer discounts.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-taupe/30 text-xs font-semibold uppercase tracking-wider text-warmgray">
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Discount</th>
                <th className="px-3 py-3">Min Order</th>
                <th className="px-3 py-3">Uses</th>
                <th className="px-3 py-3">Expires</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired =
                  c.expiresAt && new Date(c.expiresAt) < new Date();
                const exhausted =
                  c.maxUses > 0 && c.usedCount >= c.maxUses;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-taupe/15 hover:bg-ivory/50"
                  >
                    <td className="px-3 py-3 font-mono font-semibold text-charcoal">
                      {c.code}
                    </td>
                    <td className="px-3 py-3 text-charcoal">
                      {c.discountType === "percentage"
                        ? `${c.discountValue}%`
                        : `₹${c.discountValue}`}
                    </td>
                    <td className="px-3 py-3 text-warmgray">
                      {c.minOrderValue > 0 ? `₹${c.minOrderValue}` : "---"}
                    </td>
                    <td className="px-3 py-3 text-warmgray">
                      {c.usedCount}
                      {c.maxUses > 0 ? ` / ${c.maxUses}` : " / Unlimited"}
                    </td>
                    <td className="px-3 py-3 text-warmgray">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-3 py-3">
                      {!c.isActive ? (
                        <span className="rounded-sm bg-warmgray/15 px-2 py-0.5 text-xs font-medium text-warmgray">
                          Inactive
                        </span>
                      ) : expired ? (
                        <span className="rounded-sm bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                          Expired
                        </span>
                      ) : exhausted ? (
                        <span className="rounded-sm bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Exhausted
                        </span>
                      ) : (
                        <span className="rounded-sm bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(c)}
                          title={c.isActive ? "Deactivate" : "Activate"}
                          className="focus-ring rounded-sm p-1.5 text-warmgray hover:bg-ivory hover:text-charcoal"
                        >
                          {c.isActive ? (
                            <ToggleRight size={16} className="text-green-600" />
                          ) : (
                            <ToggleLeft size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => startEdit(c)}
                          title="Edit"
                          className="focus-ring rounded-sm p-1.5 text-warmgray hover:bg-ivory hover:text-charcoal"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          title="Delete"
                          className="focus-ring rounded-sm p-1.5 text-warmgray hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
