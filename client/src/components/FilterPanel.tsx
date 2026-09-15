import { Category } from "../types";

export interface Filters {
  category: string;
  minPrice: string;
  maxPrice: string;
  color: string;
  fabric: string;
  occasion: string;
  available: boolean;
}

interface FilterPanelProps {
  categories: Category[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

const COLORS = [
  { name: "Wine Red", hex: "#5f1526" },
  { name: "Mustard", hex: "#c99a1f" },
  { name: "Blue", hex: "#2f4e8c" },
  { name: "Green", hex: "#3f6b46" },
  { name: "Pink", hex: "#cf9ea3" },
  { name: "Purple", hex: "#5c3a6e" },
  { name: "Beige", hex: "#c9b28a" },
];

const FABRICS = ["Silk", "Cotton", "Organza", "Chiffon", "Georgette", "Linen"];
const OCCASIONS = ["Wedding", "Festive", "Party Wear", "Daily Wear", "Office"];

export default function FilterPanel({
  categories,
  filters,
  onChange,
  onClear,
}: FilterPanelProps) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 text-sm font-medium text-charcoal">Category</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-warmgray">
            <input
              type="radio"
              name="category"
              checked={filters.category === ""}
              onChange={() => set("category", "")}
              className="accent-wine"
            />
            All Categories
          </label>
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-warmgray"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === c.slug}
                onChange={() => set("category", c.slug)}
                className="accent-wine"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-charcoal">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
            className="focus-ring hairline w-full bg-ivory px-2.5 py-1.5 text-sm"
          />
          <span className="text-warmgray">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
            className="focus-ring hairline w-full bg-ivory px-2.5 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-charcoal">Color</h4>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => set("color", filters.color === c.name ? "" : c.name)}
              aria-label={c.name}
              aria-pressed={filters.color === c.name}
              className={`focus-ring h-7 w-7 rounded-full border-2 transition ${
                filters.color === c.name ? "border-wine" : "border-transparent"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-charcoal">Fabric</h4>
        <div className="space-y-2">
          {FABRICS.map((f) => (
            <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-warmgray">
              <input
                type="checkbox"
                checked={filters.fabric === f}
                onChange={() => set("fabric", filters.fabric === f ? "" : f)}
                className="accent-wine"
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-charcoal">Occasion</h4>
        <div className="space-y-2">
          {OCCASIONS.map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-2 text-sm text-warmgray">
              <input
                type="checkbox"
                checked={filters.occasion === o}
                onChange={() => set("occasion", filters.occasion === o ? "" : o)}
                className="accent-wine"
              />
              {o}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-charcoal">Availability</h4>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-warmgray">
          <input
            type="checkbox"
            checked={filters.available}
            onChange={(e) => set("available", e.target.checked)}
            className="accent-wine"
          />
          In Stock Only
        </label>
      </div>

      <button
        onClick={onClear}
        className="focus-ring hairline w-full py-2.5 text-sm text-warmgray hover:text-wine"
      >
        Clear Filters
      </button>
    </div>
  );
}
