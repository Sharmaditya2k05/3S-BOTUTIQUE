import { useEffect, useState } from "react";
import { Plus, Copy, Trash2, Pencil, X, Send } from "lucide-react";
import { api } from "../../lib/api";
import { getWhatsAppLink } from "../../lib/whatsapp";
import { useSettings } from "../../context/SettingsContext";

interface WhatsAppTemplate {
  id: string;
  title: string;
  message: string;
  order: number;
  createdAt: string;
}

export default function AdminWhatsAppTemplates() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { settings } = useSettings();

  async function fetchTemplates() {
    try {
      const data = await api.get<WhatsAppTemplate[]>("/whatsapp-templates");
      setTemplates(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  function startEdit(t: WhatsAppTemplate) {
    setEditingId(t.id);
    setTitle(t.title);
    setMessage(t.message);
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setTitle("");
    setMessage("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setTitle("");
    setMessage("");
  }

  async function handleSave() {
    if (!title.trim() || !message.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await api.put<WhatsAppTemplate>(
          `/whatsapp-templates/${editingId}`,
          { title, message }
        );
        setTemplates((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t))
        );
      } else {
        const created = await api.post<WhatsAppTemplate>("/whatsapp-templates", {
          title,
          message,
        });
        setTemplates((prev) => [...prev, created]);
      }
      cancelForm();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    try {
      await api.delete(`/whatsapp-templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // ignore
    }
  }

  async function handleCopy(t: WhatsAppTemplate) {
    await navigator.clipboard.writeText(t.message);
    setCopied(t.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleSendWhatsApp(t: WhatsAppTemplate) {
    const link = getWhatsAppLink(settings.whatsappNumber, t.message);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Message Templates</h1>
          <p className="mt-1 text-sm text-warmgray">
            Pre-written WhatsApp messages for quick replies.
          </p>
        </div>
        <button
          onClick={startNew}
          className="focus-ring inline-flex items-center gap-2 bg-wine px-4 py-2.5 text-sm font-medium text-ivory transition hover:bg-wine-dark"
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-sm border border-charcoal/10 bg-ivory p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-charcoal">
              {editingId ? "Edit Template" : "New Template"}
            </h2>
            <button onClick={cancelForm} className="focus-ring text-warmgray hover:text-charcoal">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Order Confirmation"
                className="focus-ring hairline w-full bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-warmgray"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type the WhatsApp message..."
                className="focus-ring hairline w-full resize-y bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-warmgray"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim() || !message.trim()}
                className="focus-ring bg-wine px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-wine-dark disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                onClick={cancelForm}
                className="focus-ring hairline px-5 py-2.5 text-sm text-warmgray hover:text-charcoal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-sm bg-ivory-dark" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-warmgray">No templates yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between gap-4 rounded-sm border border-charcoal/10 bg-ivory p-4"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-charcoal">{t.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-warmgray whitespace-pre-line">
                  {t.message}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button
                  onClick={() => handleCopy(t)}
                  aria-label="Copy message"
                  className="focus-ring flex h-8 w-8 items-center justify-center text-warmgray hover:text-charcoal"
                >
                  <Copy size={15} />
                </button>
                {copied === t.id && (
                  <span className="text-xs text-gold">Copied!</span>
                )}
                <button
                  onClick={() => handleSendWhatsApp(t)}
                  aria-label="Send on WhatsApp"
                  className="focus-ring flex h-8 w-8 items-center justify-center text-[#25D366] hover:text-[#1fb855]"
                >
                  <Send size={15} />
                </button>
                <button
                  onClick={() => startEdit(t)}
                  aria-label="Edit template"
                  className="focus-ring flex h-8 w-8 items-center justify-center text-warmgray hover:text-charcoal"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  aria-label="Delete template"
                  className="focus-ring flex h-8 w-8 items-center justify-center text-warmgray hover:text-wine"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
