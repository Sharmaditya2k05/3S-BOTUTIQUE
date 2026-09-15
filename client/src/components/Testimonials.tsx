import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { api } from "../lib/api";
import { Testimonial } from "../types";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= count ? "fill-gold text-gold" : "fill-none text-charcoal/15"}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Testimonial[]>("/testimonials")
      .then(setTestimonials)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-ivory-dark/50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto h-3 w-32 animate-pulse rounded bg-ivory-dark" />
            <div className="mx-auto mt-4 h-8 w-64 animate-pulse rounded bg-ivory-dark" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg bg-ivory p-6">
                <div className="h-4 w-1/2 rounded bg-ivory-dark" />
                <div className="mt-3 h-16 rounded bg-ivory-dark" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-ivory-dark/50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.2em] text-gold">
            WHAT OUR CUSTOMERS SAY
          </p>
          <h2 className="font-serif-display text-3xl text-charcoal sm:text-4xl">
            Loved by Saree Enthusiasts
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="relative rounded-lg bg-ivory p-6 shadow-sm transition hover:shadow-md"
            >
              <Quote
                size={28}
                className="absolute right-5 top-5 text-wine/10"
                strokeWidth={1.5}
              />
              <Stars count={t.rating} />
              <p className="mt-3 text-sm leading-relaxed text-warmgray">
                "{t.comment}"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-wine/10 text-sm font-medium text-wine">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">{t.name}</p>
                  {t.city && (
                    <p className="text-xs text-warmgray">{t.city}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
