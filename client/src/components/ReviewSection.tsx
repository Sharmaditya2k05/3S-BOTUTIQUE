import { useEffect, useState, useRef } from "react";
import { Star, MessageSquarePlus, ThumbsUp, Camera, X } from "lucide-react";
import { api } from "../lib/api";
import { Review } from "../types";

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={
              (hover || value) >= star
                ? "fill-gold text-gold"
                : "fill-none text-charcoal/20"
            }
          />
        </button>
      ))}
    </div>
  );
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

interface Breakdown {
  star: number;
  count: number;
}

export default function ReviewSection({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [avg, setAvg] = useState(0);
  const [breakdown, setBreakdown] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    setSubmitted(false);
    setShowForm(false);
    api
      .get<{ reviews: Review[]; total: number; averageRating: number; breakdown: Breakdown[] }>(
        `/reviews/${productId}`
      )
      .then((res) => {
        setReviews(res.reviews);
        setTotal(res.total);
        setAvg(res.averageRating);
        setBreakdown(res.breakdown || []);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 5 - reviewImages.length;
    if (remaining <= 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        formData.append("images", files[i]);
      }
      const res = await fetch("/api/reviews/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setReviewImages((prev) => [...prev, ...data.urls]);
    } catch {
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const review = await api.post<Review>(`/reviews/${productId}`, {
        name: name.trim(),
        rating,
        comment: comment.trim(),
        images: reviewImages,
      });
      setReviews((prev) => [review, ...prev]);
      setTotal((t) => t + 1);
      setAvg((prev) =>
        total > 0
          ? Math.round(((prev * total + rating) / (total + 1)) * 10) / 10
          : rating
      );
      setBreakdown((prev) =>
        prev.map((b) =>
          b.star === rating ? { ...b, count: b.count + 1 } : b
        )
      );
      setSubmitted(true);
      setShowForm(false);
      setName("");
      setComment("");
      setRating(5);
      setReviewImages([]);
    } catch (err: any) {
      setError(err?.error || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-charcoal/10 pt-10" id="reviews">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 sm:items-center">
        <div>
          <h2 className="font-serif-display text-2xl text-charcoal sm:text-3xl">
            Customer Reviews
          </h2>
          {total > 0 && (
            <p className="mt-1.5 text-sm text-warmgray">
              Based on {total} review{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="focus-ring flex items-center gap-2 rounded-lg bg-wine px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-wine-dark active:scale-[0.98]"
          >
            <MessageSquarePlus size={16} />
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {!loading && total > 0 && (
        <div className="mb-8 rounded-xl bg-gradient-to-br from-ivory-dark/80 to-ivory-dark/40 p-5 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            {/* Big score */}
            <div className="flex flex-col items-center text-center sm:min-w-[120px]">
              <span className="font-serif-display text-5xl text-charcoal">{avg}</span>
              <StarRating value={Math.round(avg)} readonly size={18} />
              <p className="mt-1.5 text-xs text-warmgray">
                {total} review{total !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Breakdown bars */}
            <div className="flex-1 space-y-2">
              {breakdown.map((b) => {
                const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
                return (
                  <div key={b.star} className="flex items-center gap-3 text-sm">
                    <span className="w-7 text-right text-warmgray">{b.star}</span>
                    <Star size={12} className="fill-gold text-gold" />
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-charcoal/8">
                      <div
                        className="h-full rounded-full bg-gold transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-warmgray">{b.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {submitted && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 px-5 py-4 text-sm text-green-800">
          <ThumbsUp size={16} />
          Thank you for your review! It has been posted successfully.
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-up mb-8 rounded-xl border border-charcoal/10 bg-ivory p-5 shadow-sm sm:p-6"
        >
          <h3 className="mb-5 text-base font-medium text-charcoal">
            Share your experience with "{productName}"
          </h3>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-charcoal">Your Rating</label>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="review-name" className="mb-1.5 block text-sm text-warmgray">
                Your Name
              </label>
              <input
                id="review-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya S."
                required
                minLength={2}
                className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-warmgray/50"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="review-comment" className="mb-1.5 block text-sm text-warmgray">
              Your Review
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about this saree? How was the fabric, drape, colour?"
              required
              minLength={5}
              maxLength={1000}
              rows={4}
              className="focus-ring w-full resize-none rounded-lg border border-charcoal/15 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-warmgray/50"
            />
            <p className="mt-1 text-right text-xs text-warmgray">{comment.length}/1000</p>
          </div>

          {/* Photo upload */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm text-warmgray">
              Add Photos (optional, up to 5)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {reviewImages.map((url, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-charcoal/15">
                  <img src={url} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setReviewImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal text-ivory"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {reviewImages.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="focus-ring flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-charcoal/20 text-warmgray transition hover:border-wine hover:text-wine disabled:opacity-50"
                >
                  <Camera size={18} />
                  <span className="text-[10px]">{uploading ? "..." : "Add"}</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring rounded-lg bg-wine px-6 py-2.5 text-sm font-medium text-ivory transition hover:bg-wine-dark disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="focus-ring rounded-lg px-5 py-2.5 text-sm text-warmgray transition hover:text-charcoal"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-ivory-dark/50 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-ivory-dark" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded bg-ivory-dark" />
                  <div className="h-3 w-20 rounded bg-ivory-dark" />
                </div>
              </div>
              <div className="mt-3 h-14 rounded bg-ivory-dark" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !submitted ? (
        <div className="rounded-xl border border-dashed border-charcoal/15 bg-ivory-dark/30 px-6 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-wine/10">
            <MessageSquarePlus size={22} className="text-wine" />
          </div>
          <p className="text-sm font-medium text-charcoal">No reviews yet</p>
          <p className="mt-1 text-xs text-warmgray">
            Be the first to share your experience with this saree!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="focus-ring mt-4 rounded-lg bg-wine px-5 py-2 text-sm font-medium text-ivory transition hover:bg-wine-dark"
          >
            Write a Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-charcoal/8 bg-ivory p-4 transition hover:shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wine/10 text-sm font-semibold text-wine sm:h-11 sm:w-11">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{review.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <StarRating value={review.rating} readonly size={13} />
                      <span className="text-xs text-warmgray">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-warmgray">{timeAgo(review.createdAt)}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-warmgray">{review.comment}</p>
              {review.images && review.images.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {review.images.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightboxImage(url)}
                      className="focus-ring h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-charcoal/10 transition hover:opacity-80"
                    >
                      <img src={url} alt={`Review photo ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Photo lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[85vh] max-w-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="focus-ring absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ivory text-charcoal shadow-lg"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <img
              src={lightboxImage}
              alt="Review photo"
              className="max-h-[85vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </section>
  );
}
