import { Link } from "react-router-dom";
import { Category } from "../types";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/sarees?category=${category.slug}`}
      className="focus-ring group block text-center"
    >
      <div className="img-zoom-wrap relative aspect-[4/5] overflow-hidden rounded-sm bg-ivory-dark">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="img-zoom h-full w-full object-cover"
        />
      </div>
      <p className="mt-3 text-sm text-charcoal">{category.name}</p>
      {typeof category.productCount === "number" && (
        <p className="text-xs text-warmgray">{category.productCount} sarees</p>
      )}
    </Link>
  );
}
