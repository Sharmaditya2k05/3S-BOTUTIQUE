import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "../lib/api";
import { Product, Category } from "../types";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import SortDropdown from "../components/SortDropdown";
import FilterPanel, { Filters } from "../components/FilterPanel";
import { useMeta } from "../lib/useMeta";

const EMPTY_FILTERS: Filters = {
  category: "",
  minPrice: "",
  maxPrice: "",
  color: "",
  fabric: "",
  occasion: "",
  available: false,
};

export default function SareesListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const featured = searchParams.get("featured") === "true";
  const newArrival = searchParams.get("newArrival") === "true";

  const filters: Filters = {
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    color: searchParams.get("color") || "",
    fabric: searchParams.get("fabric") || "",
    occasion: searchParams.get("occasion") || "",
    available: searchParams.get("available") === "true",
  };

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (featured) params.set("featured", "true");
    if (newArrival) params.set("newArrival", "true");
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.color) params.set("color", filters.color);
    if (filters.fabric) params.set("fabric", filters.fabric);
    if (filters.occasion) params.set("occasion", filters.occasion);
    if (filters.available) params.set("available", "true");

    api
      .get<Product[] | { products: Product[] }>(`/products?${params.toString()}`)
      .then((res) => setProducts(Array.isArray(res) ? res : res.products ?? []))
      .finally(() => setLoading(false));
  }, [searchParams]);

  function updateFilters(next: Filters) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === "" || value === false) params.delete(key);
      else params.set(key, String(value));
    });
    setSearchParams(params, { replace: true });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams);
    (Object.keys(EMPTY_FILTERS) as (keyof Filters)[]).forEach((k) => params.delete(k));
    setSearchParams(params, { replace: true });
  }

  function updateSort(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    setSearchParams(params, { replace: true });
  }

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (featured) return "Featured Sarees";
    if (newArrival) return "New Arrivals";
    if (filters.category) {
      const cat = categories.find((c) => c.slug === filters.category);
      return cat?.name || "Saree Collection";
    }
    return "Saree Collection";
  }, [search, featured, newArrival, filters.category, categories]);

  return (
    <div>
      <div className="border-b border-charcoal/10 bg-ivory-dark py-10 text-center">
        <h1 className="font-serif-display text-4xl text-charcoal sm:text-5xl">{heading}</h1>
        <p className="mt-2 text-warmgray">Explore our handpicked collection of sarees.</p>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <FilterPanel
              categories={categories}
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="focus-ring hairline inline-flex items-center gap-2 px-4 py-2 text-sm text-charcoal lg:hidden"
                >
                  <SlidersHorizontal size={15} /> Filters
                </button>
                <p className="text-sm text-warmgray">
                  {loading ? "Loading..." : `Showing ${products.length} sarees`}
                </p>
              </div>
              <SortDropdown value={sort} onChange={updateSort} />
            </div>

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No sarees found"
                description="Try changing your filters or search."
                action={
                  <button
                    onClick={clearFilters}
                    className="focus-ring hairline px-6 py-2.5 text-sm text-wine hover:bg-wine hover:text-ivory"
                  >
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-ivory p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif-display text-xl text-wine">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="focus-ring text-charcoal"
              >
                <X size={22} />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
            />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="focus-ring mt-8 bg-wine py-3 text-sm font-semibold text-ivory"
            >
              Show {products.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
