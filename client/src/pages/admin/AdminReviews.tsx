import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { api } from "../../lib/api";

interface ReviewWithProduct {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  productName: string;
  productSlug: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  function load() {
    setLoading(true);
    api
      .get<ReviewWithProduct[]>("/reviews")
      .then(setReviews)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleApproval(r: ReviewWithProduct) {
    const updated = await api.put<ReviewWithProduct>(`/reviews/${r.id}`, {
      approved: !r.approved,
    });
    setReviews((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, approved: updated.approved } : x))
    );
  }

  async function handleDelete(r: ReviewWithProduct) {
    if (!confirm(`Delete review by "${r.name}"?`)) return;
    await api.delete(`/reviews/${r.id}`);
    setReviews((prev) => prev.filter((x) => x.id !== r.id));
  }

  const filtered = reviews.filter((r) => {
    if (filter === "approved") return r.approved;
    if (filter === "pending") return !r.approved;
    return true;
  });

  const pending = reviews.filter((r) => !r.approved).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif-display text-3xl text-charcoal">Reviews</h1>
        <p className="mt-1 text-sm text-warmgray">
          Manage customer reviews across all products.
          {pending > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gold-soft/40 px-2.5 py-0.5 text-xs font-medium text-gold">
              {pending} pending
            </span>
          )}
        </p>
      </div>

      <div className="mb-5 flex gap-2">
        {(["all", "approved", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`focus-ring rounded-sm px-4 py-2 text-sm transition ${
              filter === f
                ? "bg-wine text-ivory"
                : "hairline text-charcoal hover:border-wine hover:text-wine"
            }`}
          >
            {f === "all" ? `All (${reviews.length})` : f === "approved" ? `Approved (${reviews.filter((r) => r.approved).length})` : `Pending (${pending})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-warmgray">Loading reviews...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-charcoal/15 py-12 text-center">
          <p className="text-warmgray">
            {reviews.length === 0
              ? "No reviews yet. Reviews will appear here when customers submit them."
              : "No reviews match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`hairline bg-ivory p-4 sm:p-5 ${!r.approved ? "border-l-4 border-l-gold" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-charcoal">{r.name}</span>
                    <span className="text-xs text-warmgray">on</span>
                    {r.productSlug ? (
                      <Link
                        to={`/sarees/${r.productSlug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-sm text-wine hover:underline"
                      >
                        {r.productName}
                        <ExternalLink size={12} />
                      </Link>
                    ) : (
                      <span className="text-sm text-warmgray">{r.productName}</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= r.rating ? "fill-gold text-gold" : "fill-none text-charcoal/15"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-warmgray">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[11px] font-medium ${
                        r.approved ? "bg-green-100 text-green-800" : "bg-gold-soft/40 text-gold"
                      }`}
                    >
                      {r.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-warmgray">{r.comment}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleApproval(r)}
                    title={r.approved ? "Unapprove" : "Approve"}
                    className={`focus-ring rounded-sm p-2 transition ${
                      r.approved
                        ? "text-green-700 hover:bg-green-50"
                        : "text-warmgray hover:bg-green-50 hover:text-green-700"
                    }`}
                  >
                    {r.approved ? <CheckCircle2 size={18} /> : <CheckCircle2 size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    title="Delete review"
                    className="focus-ring rounded-sm p-2 text-warmgray transition hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
