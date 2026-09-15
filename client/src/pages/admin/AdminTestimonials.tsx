import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Star, Eye, EyeOff } from "lucide-react";
import { api } from "../../lib/api";
import { Testimonial } from "../../types";

interface FormData {
  name: string;
  city: string;
  rating: number;
  comment: string;
}

const EMPTY: FormData = { name: "", city: "", rating: 5, comment: "" };

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<(Testimonial & { isVisible: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<(Testimonial & { isVisible: boolean })[]>("/testimonials/all")
      .then(setTestimonials)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      await api.put(`/testimonials/${editId}`, form);
    } else {
      await api.post("/testimonials", form);
    }
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY);
    load();
  }

  function startEdit(t: Testimonial & { isVisible: boolean }) {
    setForm({ name: t.name, city: t.city, rating: t.rating, comment: t.comment });
    setEditId(t.id);
    setShowForm(true);
  }

  async function toggleVisibility(t: Testimonial & { isVisible: boolean }) {
    await api.put(`/testimonials/${t.id}`, { isVisible: !t.isVisible });
    load();
  }

  async function handleDelete(t: Testimonial) {
    if (!confirm(`Delete testimonial from "${t.name}"?`)) return;
    await api.delete(`/testimonials/${t.id}`);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif-display text-3xl text-charcoal">Testimonials</h1>
        <button
          onClick={() => {
            setForm(EMPTY);
            setEditId(null);
            setShowForm(true);
          }}
          className="focus-ring inline-flex items-center gap-2 bg-wine px-5 py-2.5 text-sm font-medium text-ivory hover:bg-wine-dark"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-lg border border-charcoal/10 bg-ivory p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-charcoal">
              {editId ? "Edit Testimonial" : "New Testimonial"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-warmgray hover:text-charcoal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-warmgray">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="focus-ring w-full border border-charcoal/15 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-warmgray">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="focus-ring w-full border border-charcoal/15 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm text-warmgray">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, rating: s })}
                >
                  <Star
                    size={22}
                    className={
                      form.rating >= s
                        ? "fill-gold text-gold"
                        : "fill-none text-charcoal/20"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm text-warmgray">Comment</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              required
              rows={3}
              className="focus-ring w-full resize-none border border-charcoal/15 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="focus-ring bg-wine px-6 py-2.5 text-sm font-medium text-ivory hover:bg-wine-dark"
            >
              {editId ? "Update" : "Add"} Testimonial
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-sm text-warmgray hover:text-charcoal"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-warmgray">Loading...</p>
      ) : testimonials.length === 0 ? (
        <div className="rounded-lg border border-dashed border-charcoal/15 py-12 text-center">
          <p className="text-warmgray">
            No testimonials yet. Add customer testimonials to display on the homepage.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`flex items-start justify-between rounded-lg border p-4 ${
                t.isVisible ? "border-charcoal/10 bg-ivory" : "border-charcoal/5 bg-ivory-dark/50 opacity-60"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-charcoal">{t.name}</span>
                  {t.city && (
                    <span className="text-xs text-warmgray">from {t.city}</span>
                  )}
                </div>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s <= t.rating ? "fill-gold text-gold" : "text-charcoal/15"}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-sm text-warmgray">"{t.comment}"</p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <button
                  onClick={() => toggleVisibility(t)}
                  aria-label={t.isVisible ? "Hide" : "Show"}
                  className="focus-ring text-warmgray hover:text-charcoal"
                  title={t.isVisible ? "Hide from homepage" : "Show on homepage"}
                >
                  {t.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => startEdit(t)}
                  aria-label="Edit"
                  className="focus-ring text-warmgray hover:text-wine"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  aria-label="Delete"
                  className="focus-ring text-warmgray hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
