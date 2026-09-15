import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<BlogPost[]>("/blog")
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="border-b border-charcoal/10 bg-ivory-dark py-14 text-center">
        <p className="mb-2 text-xs font-medium tracking-[0.2em] text-gold">
          STORIES & INSPIRATION
        </p>
        <h1 className="font-serif-display text-4xl text-charcoal sm:text-5xl">
          Blog & Lookbook
        </h1>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        {loading ? (
          <p className="text-center text-sm text-warmgray">Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-warmgray">
              No posts yet. Check back soon for style tips and inspiration.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="focus-ring group"
              >
                <div className="aspect-[4/3] overflow-hidden bg-ivory-dark">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-warmgray">
                      No Image
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-xs text-warmgray">
                    {new Date(post.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-1 font-serif-display text-xl text-charcoal transition-colors group-hover:text-wine">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-warmgray">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="mt-3 inline-block text-xs font-semibold tracking-wide text-wine">
                    READ MORE
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
