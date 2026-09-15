import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { ProductImage } from "../../types";
import ImageUploader from "../../components/ImageUploader";

interface BlogPost {
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

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
}

const EMPTY: FormState = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  isPublished: false,
};

export default function AdminBlogForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api
      .get<BlogPost[]>("/blog?admin=true")
      .then((posts) => {
        const post = posts.find((p) => p.id === id);
        if (!post) {
          setError("Post not found.");
          return;
        }
        setForm({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          isPublished: post.isPublished,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/blog/${id}`, form);
      } else {
        await api.post("/blog", form);
      }
      navigate("/admin/blog");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/blog/${id}`);
      navigate("/admin/blog");
    } catch (err: any) {
      setError(err.message || "Failed to delete.");
    }
  }

  const coverImages: ProductImage[] = form.coverImage
    ? [{ id: "cover", url: form.coverImage }]
    : [];

  if (loading) return <p className="text-sm text-warmgray">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-3xl text-charcoal">
            {isEdit ? "Edit Post" : "New Post"}
          </h1>
          <p className="mt-1 text-sm text-warmgray">
            <Link to="/admin/blog" className="text-wine hover:underline">
              Blog
            </Link>{" "}
            / {isEdit ? "Edit" : "New"}
          </p>
        </div>
        {isEdit && (
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-700">Are you sure?</span>
                <button
                  onClick={handleDelete}
                  className="focus-ring rounded-sm bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="focus-ring rounded-sm px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-ivory-dark"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="focus-ring flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={15} /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Post Details</h2>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              className="focus-ring hairline w-full rounded-sm bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-warmgray"
              placeholder="e.g. 5 Ways to Style a Banarasi Saree"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">
              Excerpt
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              className="focus-ring hairline w-full rounded-sm bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-warmgray"
              placeholder="A short summary shown on the blog listing page"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">
              Content
            </label>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={12}
              className="focus-ring hairline w-full rounded-sm bg-white px-3 py-2.5 text-sm leading-relaxed text-charcoal placeholder:text-warmgray"
              placeholder="Write your blog post content here..."
            />
          </div>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Cover Image</h2>
          <ImageUploader
            images={coverImages}
            onChange={(imgs) => set("coverImage", imgs[0]?.url || "")}
          />
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Publishing</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set("isPublished", e.target.checked)}
              className="h-4 w-4 accent-wine"
            />
            <span className="text-sm text-charcoal">
              Published (visible on the website)
            </span>
          </label>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="focus-ring rounded-sm bg-wine px-6 py-2.5 text-sm font-semibold text-ivory transition hover:bg-wine-dark disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
          </button>
          <Link
            to="/admin/blog"
            className="focus-ring rounded-sm px-4 py-2.5 text-sm text-charcoal transition hover:bg-ivory-dark"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
