import { useRef, useState } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import { api } from "../lib/api";
import { ProductImage } from "../types";

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("images", f));
      const res = await api.post<{ images: ProductImage[] }>("/upload/images", formData);
      onChange([...images, ...res.images]);
    } catch (err: any) {
      setError(err.message || "Unable to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  function updateLabel(id: string, label: string) {
    onChange(images.map((img) => (img.id === id ? { ...img, label } : img)));
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(null);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="hairline flex flex-col items-center justify-center gap-2 border-dashed bg-ivory-dark/50 px-6 py-10 text-center"
      >
        <Upload size={22} className="text-warmgray" />
        <p className="text-sm text-charcoal">
          Drag & drop photos here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="focus-ring font-medium text-wine underline"
          >
            browse files
          </button>
        </p>
        <p className="text-xs text-warmgray">JPG, PNG or WEBP — up to 8MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploading && <p className="mt-2 text-xs text-gold">Uploading photos...</p>}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="group relative aspect-[4/5] cursor-move overflow-hidden hairline bg-ivory-dark"
            >
              <img src={img.url} alt={img.label || ""} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 bg-wine px-1.5 py-0.5 text-[9px] font-medium text-ivory">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                aria-label="Remove image"
                className="focus-ring absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/70 text-ivory opacity-0 transition group-hover:opacity-100"
              >
                <X size={12} />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-charcoal/60 px-1.5 py-1">
                <GripVertical size={11} className="flex-shrink-0 text-ivory/70" />
                <input
                  value={img.label || ""}
                  onChange={(e) => updateLabel(img.id, e.target.value)}
                  placeholder="Label (e.g. Border)"
                  className="w-full bg-transparent text-[10px] text-ivory placeholder:text-ivory/60 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
