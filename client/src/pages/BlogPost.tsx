import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../lib/api";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get<BlogPostData>(`/blog/${slug}`)
      .then(setPost)
      .catch((err) => setError(err.message || "Post not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-warmgray">Loading...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif-display text-3xl text-charcoal">
          Post Not Found
        </h1>
        <p className="mt-2 text-warmgray">{error || "This post does not exist."}</p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-wine hover:underline"
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div>
      {post.coverImage && (
        <div className="mx-auto max-w-4xl px-5 pt-10 lg:px-8">
          <div className="aspect-[16/7] overflow-hidden bg-ivory-dark">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      <article className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <Link
          to="/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-wine hover:underline"
        >
          <ArrowLeft size={14} /> BACK TO BLOG
        </Link>

        <p className="text-xs text-warmgray">
          {new Date(post.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <h1 className="mt-2 font-serif-display text-3xl text-charcoal sm:text-4xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 text-lg italic leading-relaxed text-warmgray">
            {post.excerpt}
          </p>
        )}

        <div className="prose mt-8 max-w-none">
          {post.content.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p
                key={i}
                className="mb-4 leading-relaxed text-warmgray"
              >
                {paragraph}
              </p>
            ) : null
          )}
        </div>
      </article>
    </div>
  );
}
