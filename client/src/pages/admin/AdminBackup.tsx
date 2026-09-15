import { useState, useRef } from "react";
import { Download, Upload, HardDrive } from "lucide-react";
import { api } from "../../lib/api";

export default function AdminBackup() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    setError("");
    setMessage("");
    try {
      const data = await api.get<any>("/backup/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `3s-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage("Backup exported successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to export backup.");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a JSON backup file.");
      return;
    }

    setImporting(true);
    setError("");
    setMessage("");

    try {
      const text = await file.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Invalid JSON file. Please select a valid backup.");
        setImporting(false);
        return;
      }

      await api.post("/backup/import", data);
      setMessage("Backup imported successfully. Refresh the page to see changes.");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Failed to import backup.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif-display text-3xl text-charcoal">Backup &amp; Restore</h1>
      <p className="mt-1 text-sm text-warmgray">
        Export your entire store data or restore from a previous backup.
      </p>

      <div className="mt-8 space-y-6">
        <section className="hairline space-y-4 bg-ivory p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-800">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Export Backup</h2>
              <p className="text-xs text-warmgray">Download all your store data as a JSON file.</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="focus-ring bg-wine px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-wine-dark disabled:opacity-60"
          >
            {exporting ? "Exporting..." : "Export Backup"}
          </button>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-light text-wine">
              <Upload size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Import Backup</h2>
              <p className="text-xs text-warmgray">
                Restore your store from a previously exported JSON backup. This will replace all current data.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="text-sm text-warmgray file:mr-3 file:rounded-sm file:border-0 file:bg-ivory-dark file:px-3 file:py-2 file:text-xs file:font-medium file:text-charcoal"
            />
            <button
              onClick={handleImport}
              disabled={importing}
              className="focus-ring hairline px-5 py-2.5 text-sm font-medium text-charcoal hover:border-wine hover:text-wine disabled:opacity-60"
            >
              {importing ? "Importing..." : "Import Backup"}
            </button>
          </div>
        </section>

        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}

        <section className="hairline bg-ivory p-5">
          <div className="flex items-center gap-3">
            <HardDrive size={18} className="text-warmgray" />
            <div>
              <p className="text-xs text-warmgray">
                Backups include all products, categories, settings, reviews, testimonials, customers, and events.
                Images uploaded to the server are not included in the backup file.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
