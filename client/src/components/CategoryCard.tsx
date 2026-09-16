import { Link } from "react-router-dom";
import { Category } from "../types";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/sarees?category=${category.slug}`}
      className="focus-ring group block text-center"
    >
      <div className="img-zoom-wrap relative aspect-[3/4] overflow-hidden rounded-sm bg-ivory-dark">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="img-zoom h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif-display text-lg text-warmgray/50">
              {category.name}
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-charcoal group-hover:text-wine transition-colors">
        {category.name}
      </p>
      {typeof category.productCount === "number" && (
        <p className="text-xs text-warmgray">{category.productCount} sarees</p>
      )}
    </Link>
  );
}
