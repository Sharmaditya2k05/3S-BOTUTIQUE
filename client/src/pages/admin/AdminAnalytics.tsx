import { useEffect, useState } from "react";
import { Eye, MessageCircle, TrendingUp, Package, Search, Share2 } from "lucide-react";
import { api } from "../../lib/api";

interface OverviewData {
  totalProducts: number;
  totalViews: number;
  totalWhatsappClicks: number;
  totalEvents: number;
  eventsByType: Record<string, number>;
}

interface TopProduct {
  id: string;
  name: string;
  slug: string;
  views: number;
  whatsappClicks: number;
  price: number;
  image: string;
}

interface SearchTerm {
  term: string;
  count: number;
}

export default function AdminAnalytics() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topEnquiries, setTopEnquiries] = useState<TopProduct[]>([]);
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<OverviewData>("/analytics/overview"),
      api.get<TopProduct[]>("/analytics/top-products"),
      api.get<TopProduct[]>("/analytics/top-enquiries"),
      api.get<SearchTerm[]>("/analytics/search-terms"),
    ])
      .then(([ov, tp, te, st]) => {
        setOverview(ov);
        setTopProducts(tp);
        setTopEnquiries(te);
        setSearchTerms(st);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-warmgray">Loading analytics...</p>;
  if (!overview) return null;

  const totalShares = overview.eventsByType["product_share"] || 0;

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-charcoal">Business Intelligence</h1>
      <p className="mt-1 text-sm text-warmgray">
        Track how customers browse, enquire and share your sarees.
      </p>

      {/* Overview Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="hairline flex items-center gap-4 bg-ivory p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-light text-wine">
            <Package size={18} />
          </div>
          <div>
            <p className="font-serif-display text-2xl text-charcoal">{overview.totalProducts}</p>
            <p className="text-xs text-warmgray">Total Products</p>
          </div>
        </div>
        <div className="hairline flex items-center gap-4 bg-ivory p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Eye size={18} />
          </div>
          <div>
            <p className="font-serif-display text-2xl text-charcoal">{overview.totalViews.toLocaleString("en-IN")}</p>
            <p className="text-xs text-warmgray">Total Views</p>
          </div>
        </div>
        <div className="hairline flex items-center gap-4 bg-ivory p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-800">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="font-serif-display text-2xl text-charcoal">{overview.totalWhatsappClicks.toLocaleString("en-IN")}</p>
            <p className="text-xs text-warmgray">WhatsApp Enquiries</p>
          </div>
        </div>
        <div className="hairline flex items-center gap-4 bg-ivory p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft/40 text-gold">
            <Share2 size={18} />
          </div>
          <div>
            <p className="font-serif-display text-2xl text-charcoal">{totalShares.toLocaleString("en-IN")}</p>
            <p className="text-xs text-warmgray">Total Shares</p>
          </div>
        </div>
      </div>

      {/* Conversion Rate Banner */}
      <div className="mt-4 hairline bg-ivory p-4 flex items-center gap-3">
        <TrendingUp size={18} className="text-wine" />
        <span className="text-sm text-charcoal">
          View-to-Enquiry Rate:{" "}
          <span className="font-semibold">
            {overview.totalViews > 0
              ? (Math.round((overview.totalWhatsappClicks / overview.totalViews) * 1000) / 10)
              : 0}%
          </span>
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Most Viewed Sarees */}
        <div className="hairline bg-ivory p-5">
          <h2 className="mb-4 font-serif-display text-lg text-charcoal">Most Viewed Sarees</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-warmgray">No product views yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10 text-xs uppercase tracking-wide text-warmgray">
                    <th className="pb-2 pr-3 font-normal">#</th>
                    <th className="pb-2 pr-3 font-normal">Saree</th>
                    <th className="pb-2 pr-3 font-normal text-right">Views</th>
                    <th className="pb-2 font-normal text-right">Enquiries</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.id} className="border-b border-charcoal/5">
                      <td className="py-2.5 pr-3 text-warmgray">{i + 1}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          {p.image && (
                            <img src={p.image} alt="" className="h-8 w-6 rounded-sm object-cover" />
                          )}
                          <span className="text-charcoal">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-right text-charcoal">{p.views.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right text-warmgray">{p.whatsappClicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Most Enquired Sarees */}
        <div className="hairline bg-ivory p-5">
          <h2 className="mb-4 font-serif-display text-lg text-charcoal">Most Enquired Sarees</h2>
          {topEnquiries.length === 0 ? (
            <p className="text-sm text-warmgray">No enquiries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10 text-xs uppercase tracking-wide text-warmgray">
                    <th className="pb-2 pr-3 font-normal">#</th>
                    <th className="pb-2 pr-3 font-normal">Saree</th>
                    <th className="pb-2 pr-3 font-normal text-right">Enquiries</th>
                    <th className="pb-2 font-normal text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topEnquiries.map((p, i) => (
                    <tr key={p.id} className="border-b border-charcoal/5">
                      <td className="py-2.5 pr-3 text-warmgray">{i + 1}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          {p.image && (
                            <img src={p.image} alt="" className="h-8 w-6 rounded-sm object-cover" />
                          )}
                          <span className="text-charcoal">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-right text-charcoal">{p.whatsappClicks.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right text-warmgray">{p.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Popular Search Terms */}
        <div className="hairline bg-ivory p-5 lg:col-span-2">
          <h2 className="mb-4 font-serif-display text-lg text-charcoal flex items-center gap-2">
            <Search size={16} className="text-warmgray" />
            Popular Search Terms
          </h2>
          {searchTerms.length === 0 ? (
            <p className="text-sm text-warmgray">No searches recorded yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {searchTerms.map((s) => (
                <span
                  key={s.term}
                  className="inline-flex items-center gap-1.5 bg-ivory-dark px-3 py-1.5 text-sm text-charcoal"
                >
                  {s.term}
                  <span className="text-xs text-warmgray">({s.count})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
