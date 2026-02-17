"use client";

import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";

interface UploadAreaProps {
  label: string;
  accept?: string;
  onFileSelect?: (file: File) => void;
  showPreview?: boolean;
  compact?: boolean;
}

export default function UploadArea({
  label,
  accept = "image/*,.pdf",
  onFileSelect,
  showPreview = false,
  compact = false,
}: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    onFileSelect?.(selected);

    if (showPreview && selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
            file
              ? "bg-accent-pale text-accent-dark"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          {file ? (
            <>
              <CheckCircle className="w-4 h-4" />
              {file.name.length > 20
                ? file.name.slice(0, 17) + "..."
                : file.name}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {label}
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          file
            ? "border-accent bg-accent-pale/30"
            : "border-gray-200 hover:border-accent/50 bg-gray-50/50"
        }`}
      >
        {previewUrl ? (
          <div className="space-y-3">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="max-h-48 mx-auto rounded-lg shadow-sm"
            />
            <p className="text-sm text-accent-dark font-semibold">
              {file?.name}
            </p>
          </div>
        ) : file ? (
          <div className="space-y-2">
            <FileText className="w-10 h-10 mx-auto text-accent" />
            <p className="text-sm text-accent-dark font-semibold">
              {file.name}
            </p>
            <p className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            <p className="text-xs text-gray-400">
              Arrastra o haz clic para seleccionar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
