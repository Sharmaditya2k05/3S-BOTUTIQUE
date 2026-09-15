import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="font-serif-display text-7xl text-wine">404</p>
      <h1 className="mt-4 font-serif-display text-2xl text-charcoal">
        Page Not Found
      </h1>
      <p className="mt-2 text-warmgray">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="focus-ring mt-8 inline-flex items-center rounded-sm bg-wine px-7 py-3 text-sm font-semibold text-ivory transition hover:bg-wine-dark"
      >
        Back to Home
      </Link>
    </div>
  );
}
