import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "../../lib/api";
import { Category } from "../../types";
import ImageUploader from "../../components/ImageUploader";
import { ProductImage } from "../../types";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get<Category[]>("/categories?withCounts=true")
      .then(setCategories)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.delete(`/categories/${c.id}`);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif-display text-3xl text-charcoal">Categories</h1>
        <button
          onClick={() => setCreating(true)}
          className="focus-ring inline-flex items-center gap-2 bg-wine px-5 py-2.5 text-sm font-medium text-ivory hover:bg-wine-dark"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-warmgray">Loading categories...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <div key={c.id} className="hairline bg-ivory">
              <div className="aspect-[4/3] overflow-hidden bg-ivory-dark">
                {c.image && <img src={c.image} alt={c.name} className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-charcoal">{c.name}</p>
                <p className="text-xs text-warmgray">{c.productCount ?? 0} sarees</p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setEditing(c)}
                    className="focus-ring flex items-center gap-1 text-xs text-wine hover:underline"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="focus-ring flex items-center gap-1 text-xs text-red-700 hover:underline"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <CategoryModal
          category={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [images, setImages] = useState<ProductImage[]>(
    category?.image ? [{ id: "current", url: category.image }] : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { name, description, image: images[0]?.url || "" };
      if (category) {
        await api.put(`/categories/${category.id}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 px-5">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-ivory p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif-display text-xl text-charcoal">
            {category ? "Edit Category" : "Add Category"}
          </h3>
          <button onClick={onClose} aria-label="Close" className="focus-ring text-charcoal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              placeholder="e.g. Banarasi Silk"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">Category Image</label>
            <ImageUploader images={images} onChange={(imgs) => setImages(imgs.slice(-1))} />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="focus-ring hairline px-4 py-2 text-sm text-charcoal">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="focus-ring bg-wine px-5 py-2 text-sm font-medium text-ivory hover:bg-wine-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
