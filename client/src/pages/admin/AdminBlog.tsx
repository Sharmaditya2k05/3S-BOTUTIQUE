import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { api } from "../../lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get<BlogPost[]>("/blog?admin=true")
      .then(setPosts)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function togglePublish(post: BlogPost) {
    const updated = await api.put<BlogPost>(`/blog/${post.id}`, {
      isPublished: !post.isPublished,
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isPublished: updated.isPublished } : p))
    );
  }

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    await api.delete(`/blog/${post.id}`);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  }

  const published = posts.filter((p) => p.isPublished).length;
  const drafts = posts.length - published;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl text-charcoal">Blog / Lookbook</h1>
          <p className="mt-1 text-sm text-warmgray">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
            {drafts > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gold-soft/40 px-2.5 py-0.5 text-xs font-medium text-gold">
                {drafts} draft{drafts !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="focus-ring inline-flex items-center gap-2 rounded-sm bg-wine px-5 py-2.5 text-sm font-semibold text-ivory transition hover:bg-wine-dark"
        >
          <PlusCircle size={16} /> Add Post
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-warmgray">Loading posts...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-charcoal/15 py-12 text-center">
          <p className="text-warmgray">
            No blog posts yet. Click "Add Post" to write your first article.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`hairline bg-ivory p-4 sm:p-5 ${!post.isPublished ? "border-l-4 border-l-gold" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-1 items-start gap-4">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt=""
                      className="hidden h-16 w-16 rounded-sm object-cover sm:block"
                    />
                  )}
                  <div className="flex-1">
                    <Link
                      to={`/admin/blog/${post.id}/edit`}
                      className="text-sm font-medium text-charcoal hover:text-wine"
                    >
                      {post.title}
                    </Link>
                    {post.excerpt && (
                      <p className="mt-1 line-clamp-1 text-xs text-warmgray">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs text-warmgray">
                        {new Date(post.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[11px] font-medium ${
                          post.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gold-soft/40 text-gold"
                        }`}
                      >
                        {post.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(post)}
                    title={post.isPublished ? "Unpublish" : "Publish"}
                    className={`focus-ring rounded-sm p-2 transition ${
                      post.isPublished
                        ? "text-green-700 hover:bg-green-50"
                        : "text-warmgray hover:bg-green-50 hover:text-green-700"
                    }`}
                  >
                    {post.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <Link
                    to={`/admin/blog/${post.id}/edit`}
                    title="Edit post"
                    className="focus-ring rounded-sm p-2 text-warmgray transition hover:bg-ivory-dark hover:text-charcoal"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post)}
                    title="Delete post"
                    className="focus-ring rounded-sm p-2 text-warmgray transition hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
