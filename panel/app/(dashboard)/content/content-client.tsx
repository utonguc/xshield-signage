"use client";
import { useState, useRef } from "react";
import { Image, Video, FileCode, Upload, Trash2, X } from "lucide-react";
import type { Content } from "@/lib/api";
import { uploadContent, deleteContent } from "@/lib/api";
import clsx from "clsx";

const API_URL = "";  // same-origin via nginx proxy

function FileTypeIcon({ type }: { type: string }) {
  if (type === "video") return <Video size={16} className="text-violet-500" />;
  if (type === "html")  return <FileCode size={16} className="text-amber-500" />;
  return <Image size={16} className="text-blue-500" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props { initialContent: Content[]; token: string; }

export default function ContentClient({ initialContent, token }: Props) {
  const [items, setItems]     = useState(initialContent);
  const [uploading, setUpl]   = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUpl(true);
    for (const file of Array.from(files)) {
      setProgress(file.name);
      try {
        const c = await uploadContent(token, file);
        setItems(prev => [c, ...prev]);
      } catch (e) {
        alert(`${file.name} yüklenemedi`);
      }
    }
    setProgress(null);
    setUpl(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("İçeriği sil?")) return;
    await deleteContent(token, id);
    setItems(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">İçerik Kütüphanesi</h1>
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-50 transition-colors">
          <Upload size={15} /> Yükle
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*,text/html"
          className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-6 text-center hover:border-brand/40 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <p className="text-sm text-brand font-medium">Yükleniyor: {progress}</p>
        ) : (
          <>
            <Upload size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">Dosyaları buraya sürükleyin veya tıklayın</p>
            <p className="text-xs text-gray-300 mt-1">JPG, PNG, GIF, WebP, MP4, WebM, HTML</p>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {items.map(c => (
          <div key={c.id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
            {/* Thumbnail */}
            <div className="relative bg-gray-50 aspect-video flex items-center justify-center">
              {c.file_type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/media/${c.file_path}`} alt={c.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-300">
                  <FileTypeIcon type={c.file_type} />
                  <span className="text-xs uppercase">{c.file_type}</span>
                </div>
              )}
              <button onClick={() => handleDelete(c.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/80 rounded-full items-center justify-center hidden group-hover:flex hover:bg-red-50 hover:text-red-600 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-gray-800 truncate" title={c.name}>{c.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <FileTypeIcon type={c.file_type} />
                <span className="text-[10px] text-gray-400">{formatBytes(c.file_size)}</span>
                {c.width && <span className="text-[10px] text-gray-400">{c.width}×{c.height}</span>}
              </div>
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="col-span-5 text-center py-16 text-gray-400">
            <Image size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">İçerik kütüphanesi boş.</p>
          </div>
        )}
      </div>
    </div>
  );
}
