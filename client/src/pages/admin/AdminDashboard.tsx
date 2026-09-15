import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, CheckCircle2, XCircle, Star, Plus, Eye, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";
import { Product, Category } from "../../types";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Product[]>("/products?admin=true"),
      api.get<Category[]>("/categories"),
      api.get<Product[]>("/notifications/low-stock").catch(() => [] as Product[]),
    ])
      .then(([p, c, ls]) => {
        setProducts(p);
        setCategories(c);
        setLowStockItems(ls);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = products.length;
  const available = products.filter((p) => p.isAvailable).length;
  const outOfStock = total - available;
  const featured = products.filter((p) => p.isFeatured).length;
  const recent = products.slice(0, 5);

  const stats = [
    { label: "Total Sarees", value: total, icon: Package, tint: "bg-rose-light text-wine" },
    { label: "Available", value: available, icon: CheckCircle2, tint: "bg-green-100 text-green-800" },
    { label: "Out of Stock", value: outOfStock, icon: XCircle, tint: "bg-charcoal/10 text-charcoal" },
    { label: "Featured", value: featured, icon: Star, tint: "bg-gold-soft/40 text-gold" },
  ];

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name || "—";
  }

  if (loading) {
    return <p className="text-sm text-warmgray">Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif-display text-3xl text-charcoal">
          {greeting()}, Boutique Owner 👋
        </h1>
        <p className="mt-1 text-sm text-warmgray">
          Here's what's happening with your store.
        </p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-sm border border-amber-300 bg-amber-50 px-5 py-4">
          <AlertTriangle size={20} className="shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Low Stock Alert: {lowStockItems.length} product{lowStockItems.length > 1 ? "s" : ""} need attention
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              {lowStockItems.filter((p) => p.inventoryStatus === "out_of_stock").length} out of stock,{" "}
              {lowStockItems.filter((p) => p.inventoryStatus === "low_stock").length} low stock
            </p>
          </div>
          <Link
            to="/admin/products?status=low_stock"
            className="focus-ring shrink-0 text-xs font-medium text-amber-800 underline hover:text-amber-950"
          >
            View Products
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="hairline bg-ivory p-5">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${s.tint}`}>
              <s.icon size={17} />
            </div>
            <p className="font-serif-display text-3xl text-charcoal">{s.value}</p>
            <p className="mt-0.5 text-xs text-warmgray">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="hairline bg-ivory p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif-display text-xl text-charcoal">Recent Products</h2>
            <Link to="/admin/products" className="focus-ring text-xs text-wine">
              View All →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-warmgray">No sarees added yet.</p>
              <Link
                to="/admin/products/new"
                className="focus-ring mt-4 inline-flex items-center gap-1.5 bg-wine px-5 py-2.5 text-sm text-ivory"
              >
                <Plus size={14} /> Add Your First Saree
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10 text-xs uppercase tracking-wide text-warmgray">
                    <th className="pb-2 font-normal">Image</th>
                    <th className="pb-2 font-normal">Name</th>
                    <th className="pb-2 font-normal">Category</th>
                    <th className="pb-2 font-normal">Price</th>
                    <th className="pb-2 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id} className="border-b border-charcoal/5">
                      <td className="py-2.5">
                        <img
                          src={p.images[0]?.url}
                          alt=""
                          className="h-12 w-10 rounded-sm object-cover"
                        />
                      </td>
                      <td className="py-2.5 pr-3 text-charcoal">
                        <Link to={`/admin/products/${p.id}/edit`} className="focus-ring hover:text-wine">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-2.5 text-warmgray">{categoryName(p.categoryId)}</td>
                      <td className="py-2.5 text-charcoal">₹{p.price.toLocaleString("en-IN")}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 text-xs ${
                            p.isAvailable ? "bg-green-100 text-green-800" : "bg-charcoal/10 text-charcoal"
                          }`}
                        >
                          {p.isAvailable ? "Available" : "Out of Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="hairline space-y-3 bg-ivory p-5">
          <h2 className="mb-1 font-serif-display text-xl text-charcoal">Quick Actions</h2>
          <Link
            to="/admin/products/new"
            className="focus-ring flex items-center justify-center gap-2 bg-wine px-4 py-3 text-sm font-medium text-ivory hover:bg-wine-dark"
          >
            <Plus size={16} /> Add Saree
          </Link>
          <Link
            to="/sarees"
            target="_blank"
            className="focus-ring hairline flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-charcoal hover:border-wine hover:text-wine"
          >
            <Eye size={16} /> View Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
