import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, ChevronDown } from "lucide-react";
import { api } from "../../lib/api";
import { Product, Category } from "../../types";
import EmptyState from "../../components/EmptyState";

const INVENTORY_BADGE: Record<string, { label: string; cls: string }> = {
  in_stock: { label: "In Stock", cls: "bg-green-100 text-green-800" },
  low_stock: { label: "Low Stock", cls: "bg-amber-100 text-amber-800" },
  out_of_stock: { label: "Out of Stock", cls: "bg-charcoal/10 text-charcoal" },
  made_to_order: { label: "Made to Order", cls: "bg-blue-50 text-blue-700" },
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      api.get<Product[]>("/products?admin=true&sort=newest"),
      api.get<Category[]>("/categories"),
    ])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name || "—";
  }

  async function togglePublish(p: Product) {
    const updated = await api.put<Product>(`/products/${p.id}`, {
      isPublished: !p.isPublished,
    });
    setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${confirmDelete.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(confirmDelete.id);
        return next;
      });
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  }

  async function handleBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    setBulkLoading(true);
    try {
      await api.post("/products/bulk-action", {
        ids: Array.from(selected),
        action: bulkAction,
      });
      setSelected(new Set());
      setBulkAction("");
      load();
    } finally {
      setBulkLoading(false);
    }
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      categoryName(p.categoryId).toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif-display text-3xl text-charcoal">All Sarees</h1>
        <Link
          to="/admin/products/new"
          className="focus-ring inline-flex items-center gap-2 bg-wine px-5 py-2.5 text-sm font-medium text-ivory hover:bg-wine-dark"
        >
          <Plus size={16} /> Add Saree
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 hairline max-w-sm bg-ivory px-3 py-2 flex-1 min-w-[200px]">
          <Search size={15} className="text-warmgray" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category..."
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-warmgray">{selected.size} selected</span>
            <div className="relative">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="focus-ring hairline appearance-none bg-ivory pl-3 pr-8 py-2 text-sm text-charcoal"
              >
                <option value="">Bulk Actions...</option>
                <option value="publish">Publish</option>
                <option value="unpublish">Unpublish</option>
                <option value="feature">Feature</option>
                <option value="unfeature">Unfeature</option>
                <option value="delete">Delete</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-warmgray" />
            </div>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkLoading}
              className="focus-ring bg-wine px-4 py-2 text-sm text-ivory hover:bg-wine-dark disabled:opacity-60"
            >
              {bulkLoading ? "Applying..." : "Apply"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-warmgray">Loading sarees...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? "No sarees added yet." : "No matches found"}
          action={
            products.length === 0 && (
              <Link to="/admin/products/new" className="focus-ring bg-wine px-6 py-2.5 text-sm text-ivory">
                + Add Your First Saree
              </Link>
            )
          }
        />
      ) : (
        <div className="hairline overflow-x-auto bg-ivory">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-xs uppercase tracking-wide text-warmgray">
                <th className="p-4 font-normal">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-wine"
                  />
                </th>
                <th className="p-4 font-normal">Image</th>
                <th className="p-4 font-normal">Name / SKU</th>
                <th className="p-4 font-normal">Category</th>
                <th className="p-4 font-normal">Price</th>
                <th className="p-4 font-normal">Inventory</th>
                <th className="p-4 font-normal">Tags</th>
                <th className="p-4 font-normal">Published</th>
                <th className="p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const inv = INVENTORY_BADGE[p.inventoryStatus] || INVENTORY_BADGE.in_stock;
                return (
                  <tr key={p.id} className="border-b border-charcoal/5">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="h-4 w-4 accent-wine"
                      />
                    </td>
                    <td className="p-4">
                      <img src={p.images[0]?.url} alt="" className="h-14 w-11 rounded-sm object-cover" />
                    </td>
                    <td className="p-4">
                      <p className="text-charcoal">{p.name}</p>
                      <p className="text-xs text-warmgray">{p.sku}</p>
                    </td>
                    <td className="p-4 text-warmgray">{categoryName(p.categoryId)}</td>
                    <td className="p-4 text-charcoal">{"₹"}{p.price.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 text-xs ${inv.cls}`}>
                        {inv.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(p.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block bg-charcoal/5 px-1.5 py-0.5 text-[10px] text-warmgray"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePublish(p)}
                        role="switch"
                        aria-checked={p.isPublished}
                        aria-label="Toggle published"
                        className={`focus-ring relative h-5 w-9 rounded-full transition ${
                          p.isPublished ? "bg-wine" : "bg-charcoal/20"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-ivory transition ${
                            p.isPublished ? "left-4" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          aria-label={`Edit ${p.name}`}
                          className="focus-ring text-charcoal hover:text-wine"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(p)}
                          aria-label={`Delete ${p.name}`}
                          className="focus-ring text-charcoal hover:text-red-700"
                        >
                          <Trash2 size={16} />
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

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 px-5">
          <div className="w-full max-w-sm bg-ivory p-6">
            <h3 className="font-serif-display text-xl text-charcoal">Delete Saree?</h3>
            <p className="mt-2 text-sm text-warmgray">
              Are you sure you want to delete "{confirmDelete.name}"? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="focus-ring hairline px-4 py-2 text-sm text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="focus-ring bg-red-700 px-4 py-2 text-sm text-ivory hover:bg-red-800 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
