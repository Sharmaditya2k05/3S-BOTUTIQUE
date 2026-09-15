import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { Product, Category, ProductImage } from "../../types";
import ImageUploader from "../../components/ImageUploader";

interface FormState {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  price: string;
  originalPrice: string;
  fabric: string;
  color: string;
  pattern: string;
  occasion: string;
  sareeLength: string;
  blouseLength: string;
  images: ProductImage[];
  videoUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  isPublished: boolean;
  inventoryStatus: string;
  tagsInput: string;
}

const EMPTY: FormState = {
  name: "",
  sku: "",
  categoryId: "",
  description: "",
  price: "",
  originalPrice: "",
  fabric: "",
  color: "",
  pattern: "",
  occasion: "",
  sareeLength: "",
  blouseLength: "",
  images: [],
  videoUrl: "",
  isAvailable: true,
  isFeatured: false,
  isNewArrival: false,
  isBestseller: false,
  isPublished: true,
  inventoryStatus: "in_stock",
  tagsInput: "",
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories);
  }, []);

  // fetch by id for edit mode (products route is slug-based publicly, so use admin list + find)
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api
      .get<Product[]>("/products?admin=true")
      .then((res) => {
        const p = res.find((x) => x.id === id);
        if (!p) {
          setError("Saree not found.");
          return;
        }
        setForm({
          name: p.name,
          sku: p.sku,
          categoryId: p.categoryId,
          description: p.description,
          price: String(p.price),
          originalPrice: p.originalPrice ? String(p.originalPrice) : "",
          fabric: p.fabric,
          color: p.color,
          pattern: p.pattern,
          occasion: p.occasion,
          sareeLength: p.sareeLength,
          blouseLength: p.blouseLength,
          images: p.images,
          videoUrl: p.videoUrl || "",
          isAvailable: p.isAvailable,
          isFeatured: p.isFeatured,
          isNewArrival: p.isNewArrival,
          isBestseller: p.isBestseller,
          isPublished: p.isPublished,
          inventoryStatus: p.inventoryStatus || "in_stock",
          tagsInput: (p.tags || []).join(", "),
        });
      })
      .finally(() => setLoading(false));
  }, [isEdit, id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price || !form.categoryId) {
      setError("Please fill in the saree name, price and category.");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { tagsInput, ...rest } = form;
      const payload = {
        ...rest,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        tags,
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      navigate("/admin/products");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    await api.delete(`/products/${id}`);
    navigate("/admin/products");
  }

  if (loading) return <p className="text-sm text-warmgray">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif-display text-3xl text-charcoal">
        {isEdit ? "Edit Saree" : "Add Saree"}
      </h1>
      <p className="mt-1 text-sm text-warmgray">
        {isEdit ? "Update the details for this saree." : "Add a new saree to your catalog in a few steps."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="hairline bg-ivory p-5">
          <h2 className="mb-4 text-sm font-semibold text-charcoal">Photos</h2>
          <ImageUploader images={form.images} onChange={(imgs) => set("images", imgs)} />
          <div className="mt-4">
            <Field label="Product Video URL">
              <input
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
                placeholder="Paste video URL (e.g. https://example.com/video.mp4)"
              />
            </Field>
            <p className="mt-1 text-xs text-warmgray">Optional. Video will appear as a tab in the product gallery.</p>
          </div>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Basic Information</h2>
          <Field label="Saree Name" required>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              placeholder="e.g. Banarasi Floral Silk Saree"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product ID / SKU">
              <input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
                placeholder="Auto-generated if left blank"
              />
            </Field>
            <Field label="Category" required>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              placeholder="Describe the saree — fabric feel, weave, occasion..."
            />
          </Field>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (₹)" required>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              />
            </Field>
            <Field label="Original Price (₹) — optional">
              <input
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={(e) => set("originalPrice", e.target.value)}
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              />
            </Field>
          </div>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Product Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fabric">
              <input value={form.fabric} onChange={(e) => set("fabric", e.target.value)} className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm" placeholder="e.g. Pure Silk" />
            </Field>
            <Field label="Color">
              <input value={form.color} onChange={(e) => set("color", e.target.value)} className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm" placeholder="e.g. Wine Red" />
            </Field>
            <Field label="Pattern / Design">
              <input value={form.pattern} onChange={(e) => set("pattern", e.target.value)} className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm" placeholder="e.g. Floral" />
            </Field>
            <Field label="Occasion">
              <input value={form.occasion} onChange={(e) => set("occasion", e.target.value)} className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm" placeholder="e.g. Wedding, Festive" />
            </Field>
            <Field label="Saree Length">
              <input value={form.sareeLength} onChange={(e) => set("sareeLength", e.target.value)} className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm" placeholder="e.g. 5.5 meters" />
            </Field>
            <Field label="Blouse Length">
              <input value={form.blouseLength} onChange={(e) => set("blouseLength", e.target.value)} className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm" placeholder="e.g. 0.8 meters" />
            </Field>
          </div>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Inventory &amp; Tags</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inventory Status">
              <select
                value={form.inventoryStatus}
                onChange={(e) => set("inventoryStatus", e.target.value)}
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="made_to_order">Made to Order</option>
              </select>
            </Field>
            <Field label="Tags (comma-separated)">
              <input
                value={form.tagsInput}
                onChange={(e) => set("tagsInput", e.target.value)}
                className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
                placeholder="e.g. wedding, silk, festive, zari"
              />
            </Field>
          </div>
        </section>

        <section className="hairline bg-ivory p-5">
          <h2 className="mb-4 text-sm font-semibold text-charcoal">Status</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Checkbox label="Available" checked={form.isAvailable} onChange={(v) => set("isAvailable", v)} />
            <Checkbox label="Featured" checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} />
            <Checkbox label="New Arrival" checked={form.isNewArrival} onChange={(v) => set("isNewArrival", v)} />
            <Checkbox label="Bestseller" checked={form.isBestseller} onChange={(v) => set("isBestseller", v)} />
          </div>
          <div className="mt-3">
            <Checkbox label="Published (visible on website)" checked={form.isPublished} onChange={(v) => set("isPublished", v)} />
          </div>
        </section>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="focus-ring bg-wine px-7 py-3 text-sm font-semibold text-ivory hover:bg-wine-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Publish Saree"}
            </button>
            <Link to="/admin/products" className="focus-ring hairline px-6 py-3 text-sm text-charcoal">
              Cancel
            </Link>
          </div>
          {isEdit && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="focus-ring flex items-center gap-1.5 text-sm text-red-700 hover:underline"
            >
              <Trash2 size={15} /> Delete Saree
            </button>
          )}
        </div>
      </form>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 px-5">
          <div className="w-full max-w-sm bg-ivory p-6">
            <h3 className="font-serif-display text-xl text-charcoal">Delete Saree?</h3>
            <p className="mt-2 text-sm text-warmgray">
              Are you sure you want to delete this saree? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(false)} className="focus-ring hairline px-4 py-2 text-sm text-charcoal">
                Cancel
              </button>
              <button onClick={handleDelete} className="focus-ring bg-red-700 px-4 py-2 text-sm text-ivory hover:bg-red-800">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-charcoal">
        {label} {required && <span className="text-wine">*</span>}
      </span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-wine"
      />
      {label}
    </label>
  );
}
