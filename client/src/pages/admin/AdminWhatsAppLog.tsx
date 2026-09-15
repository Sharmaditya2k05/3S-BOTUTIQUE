import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { api } from "../../lib/api";

interface WhatsAppEvent {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string;
  productImage: string;
  createdAt: string;
}

export default function AdminWhatsAppLog() {
  const [events, setEvents] = useState<WhatsAppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<WhatsAppEvent[]>("/analytics/whatsapp-log")
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-warmgray">Loading WhatsApp log...</p>;

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-charcoal">WhatsApp Enquiry Log</h1>
      <p className="mt-1 text-sm text-warmgray">
        Recent WhatsApp enquiry clicks from customers browsing your sarees.
      </p>

      {events.length === 0 ? (
        <div className="mt-10 text-center">
          <MessageCircle className="mx-auto text-warmgray/40" size={48} strokeWidth={1} />
          <p className="mt-3 text-sm text-warmgray">No WhatsApp enquiries yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-xs font-semibold uppercase tracking-wider text-warmgray">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Date &amp; Time</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-charcoal/5 hover:bg-ivory-dark/30">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      {ev.productImage ? (
                        <img
                          src={ev.productImage}
                          alt={ev.productName}
                          className="h-10 w-8 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-8 items-center justify-center rounded-sm bg-ivory-dark text-warmgray">
                          <MessageCircle size={14} />
                        </div>
                      )}
                      <span className="font-medium text-charcoal">{ev.productName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-warmgray">
                    {new Date(ev.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    {ev.productSlug ? (
                      <Link
                        to={`/sarees/${ev.productSlug}`}
                        className="text-wine hover:underline"
                        target="_blank"
                      >
                        View Product
                      </Link>
                    ) : (
                      <span className="text-warmgray">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
