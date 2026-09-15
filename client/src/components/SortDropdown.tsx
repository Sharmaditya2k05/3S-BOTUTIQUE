interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Popular" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-charcoal">
      <span className="hidden text-warmgray sm:inline">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring hairline bg-ivory px-3 py-2 text-sm text-charcoal"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
