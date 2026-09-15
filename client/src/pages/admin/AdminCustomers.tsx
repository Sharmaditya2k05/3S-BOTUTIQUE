import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../../lib/api";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  wishlistCount: number;
  createdAt: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get<CustomerRow[]>("/customers")
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          (c.phone || "").includes(query) ||
          (c.city || "").toLowerCase().includes(query)
      )
    : customers;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif-display text-3xl text-charcoal">Customers</h1>
        <p className="mt-1 text-sm text-warmgray">
          {customers.length} registered customer{customers.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-5">
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-warmgray"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, city..."
            className="focus-ring hairline w-full rounded-sm bg-white py-2.5 pl-9 pr-3 text-sm text-charcoal placeholder:text-warmgray"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-warmgray">Loading customers...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-charcoal/15 py-12 text-center">
          <p className="text-warmgray">
            {customers.length === 0
              ? "No customers have registered yet."
              : "No customers match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-xs font-semibold tracking-wide text-warmgray">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3 pr-4">City</th>
                <th className="pb-3 pr-4 text-center">Wishlist</th>
                <th className="pb-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-charcoal/5 transition hover:bg-ivory-dark"
                >
                  <td className="py-3 pr-4 font-medium text-charcoal">
                    {c.name}
                  </td>
                  <td className="py-3 pr-4 text-warmgray">{c.email}</td>
                  <td className="py-3 pr-4 text-warmgray">{c.phone || "-"}</td>
                  <td className="py-3 pr-4 text-warmgray">{c.city || "-"}</td>
                  <td className="py-3 pr-4 text-center text-warmgray">
                    {c.wishlistCount}
                  </td>
                  <td className="py-3 text-warmgray">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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
