import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Heart, Star, MapPin, Phone, Mail, Edit3, LogOut, Package, ChevronRight } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { api } from "../lib/api";
import { Product } from "../types";

interface ReviewWithProduct {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  productName: string;
  productSlug: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= count ? "fill-gold text-gold" : "fill-none text-charcoal/15"}
        />
      ))}
    </div>
  );
}

export default function Profile() {
  const { customer, logout, updateProfile, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"wishlist" | "reviews" | "settings">("wishlist");
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !customer) {
      navigate("/login");
    }
  }, [authLoading, customer, navigate]);

  useEffect(() => {
    if (!customer) return;
    setLoadingData(true);
    Promise.all([
      api.get<Product[]>("/customers/wishlist").catch(() => []),
      api.get<ReviewWithProduct[]>("/customers/my-reviews").catch(() => []),
    ]).then(([wl, rv]) => {
      setWishlistProducts(wl);
      setReviews(rv);
      setLoadingData(false);
    });
  }, [customer]);

  useEffect(() => {
    if (customer) {
      setEditForm({ name: customer.name, phone: customer.phone, city: customer.city });
    }
  }, [customer]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(editForm);
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-wine border-t-transparent" />
      </div>
    );
  }

  if (!customer) return null;

  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5 lg:px-8 lg:py-12">
      {/* Profile Header */}
      <div className="rounded-xl bg-gradient-to-br from-wine to-wine-dark p-6 text-ivory sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ivory/20 text-2xl font-bold sm:h-20 sm:w-20 sm:text-3xl">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-serif-display text-2xl sm:text-3xl">{customer.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-rose-light">
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {customer.phone}
                </span>
              )}
              {customer.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {customer.city}
                </span>
              )}
            </div>
            {memberSince && (
              <p className="mt-1.5 text-xs text-rose-light/70">Member since {memberSince}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="focus-ring flex items-center gap-2 self-start rounded-lg border border-ivory/30 px-4 py-2 text-sm text-ivory transition hover:bg-ivory/10"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-ivory/15 pt-5">
          <div className="text-center">
            <p className="font-serif-display text-2xl">{wishlistProducts.length}</p>
            <p className="text-xs text-rose-light">Wishlist</p>
          </div>
          <div className="text-center">
            <p className="font-serif-display text-2xl">{reviews.length}</p>
            <p className="text-xs text-rose-light">Reviews</p>
          </div>
          <div className="text-center">
            <p className="font-serif-display text-2xl">
              {reviews.length > 0
                ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                : "—"}
            </p>
            <p className="text-xs text-rose-light">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-charcoal/10">
        {[
          { id: "wishlist" as const, label: "Wishlist", icon: Heart, count: wishlistProducts.length },
          { id: "reviews" as const, label: "My Reviews", icon: Star, count: reviews.length },
          { id: "settings" as const, label: "Settings", icon: User },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`focus-ring -mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              tab === t.id
                ? "border-wine text-wine"
                : "border-transparent text-warmgray hover:text-charcoal"
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="rounded-full bg-wine/10 px-2 py-0.5 text-xs text-wine">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loadingData ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-ivory-dark/50" />
            ))}
          </div>
        ) : tab === "wishlist" ? (
          wishlistProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-charcoal/15 bg-ivory-dark/30 px-6 py-14 text-center">
              <Heart size={32} className="mx-auto mb-3 text-warmgray/40" />
              <p className="text-sm font-medium text-charcoal">Your wishlist is empty</p>
              <p className="mt-1 text-xs text-warmgray">Save sarees you love by tapping the heart icon</p>
              <Link
                to="/sarees"
                className="focus-ring mt-4 inline-flex rounded-lg bg-wine px-5 py-2 text-sm font-medium text-ivory hover:bg-wine-dark"
              >
                Browse Sarees
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {wishlistProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/sarees/${p.slug}`}
                  className="group overflow-hidden rounded-xl border border-charcoal/8 bg-ivory transition hover:shadow-md"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={p.images[0]?.url || ""}
                      alt={p.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-charcoal line-clamp-1">{p.name}</h3>
                    <p className="mt-1 font-serif-display text-sm text-wine">
                      ₹{p.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : tab === "reviews" ? (
          reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-charcoal/15 bg-ivory-dark/30 px-6 py-14 text-center">
              <Star size={32} className="mx-auto mb-3 text-warmgray/40" />
              <p className="text-sm font-medium text-charcoal">No reviews yet</p>
              <p className="mt-1 text-xs text-warmgray">Share your thoughts on sarees you've purchased</p>
              <Link
                to="/sarees"
                className="focus-ring mt-4 inline-flex rounded-lg bg-wine px-5 py-2 text-sm font-medium text-ivory hover:bg-wine-dark"
              >
                Browse Sarees
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-charcoal/8 bg-ivory p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/sarees/${r.productSlug}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-charcoal hover:text-wine"
                      >
                        <Package size={14} className="text-warmgray" />
                        {r.productName}
                        <ChevronRight size={14} className="text-warmgray" />
                      </Link>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Stars count={r.rating} />
                        <span className="text-xs text-warmgray">{r.rating}.0</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-warmgray">{timeAgo(r.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-warmgray">{r.comment}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Settings tab */
          <div className="max-w-lg">
            {!editing ? (
              <div className="rounded-xl border border-charcoal/8 bg-ivory p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-charcoal">Profile Details</h3>
                  <button
                    onClick={() => setEditing(true)}
                    className="focus-ring flex items-center gap-1.5 text-sm text-wine hover:text-wine-dark"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                </div>
                <dl className="mt-4 divide-y divide-charcoal/8 text-sm">
                  <div className="flex justify-between py-3">
                    <dt className="text-warmgray">Name</dt>
                    <dd className="text-charcoal">{customer.name}</dd>
                  </div>
                  <div className="flex justify-between py-3">
                    <dt className="text-warmgray">Email</dt>
                    <dd className="text-charcoal">{customer.email}</dd>
                  </div>
                  <div className="flex justify-between py-3">
                    <dt className="text-warmgray">Phone</dt>
                    <dd className="text-charcoal">{customer.phone || "—"}</dd>
                  </div>
                  <div className="flex justify-between py-3">
                    <dt className="text-warmgray">City</dt>
                    <dd className="text-charcoal">{customer.city || "—"}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="rounded-xl border border-charcoal/8 bg-ivory p-5 sm:p-6">
                <h3 className="mb-4 text-base font-medium text-charcoal">Edit Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="mb-1.5 block text-sm text-warmgray">Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      minLength={2}
                      className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-2.5 text-sm text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-warmgray">Email</label>
                    <input
                      type="email"
                      value={customer.email}
                      disabled
                      className="w-full rounded-lg border border-charcoal/10 bg-ivory-dark px-4 py-2.5 text-sm text-warmgray"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-phone" className="mb-1.5 block text-sm text-warmgray">Phone</label>
                    <input
                      id="edit-phone"
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-2.5 text-sm text-charcoal"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-city" className="mb-1.5 block text-sm text-warmgray">City</label>
                    <input
                      id="edit-city"
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-2.5 text-sm text-charcoal"
                    />
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="focus-ring rounded-lg bg-wine px-5 py-2.5 text-sm font-medium text-ivory hover:bg-wine-dark disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="focus-ring rounded-lg px-4 py-2.5 text-sm text-warmgray hover:text-charcoal"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
