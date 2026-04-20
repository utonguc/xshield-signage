"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Plus, Trash2, Send, RefreshCw, Copy, ChevronDown } from "lucide-react";
import type { Device, Playlist } from "@/lib/api";
import { createDevice, deleteDevice, updateDevice, pushPlaylist, regenApiKey } from "@/lib/api";

interface Props {
  initialDevices: Device[];
  playlists: Playlist[];
  token: string;
}

export default function DevicesClient({ initialDevices, playlists, token }: Props) {
  const router   = useRouter();
  const [devices, setDevices] = useState(initialDevices);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLoc,  setNewLoc]  = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function addDevice() {
    if (!newName.trim()) return;
    setLoading("add");
    const d = await createDevice(token, { name: newName.trim(), location: newLoc.trim() || undefined });
    setDevices(prev => [...prev, d]);
    setNewName(""); setNewLoc(""); setShowAdd(false); setLoading(null);
  }

  async function assignPlaylist(deviceId: string, playlistId: string) {
    const d = await updateDevice(token, deviceId, {
      current_playlist_id: playlistId || "",
    });
    setDevices(prev => prev.map(x => x.id === deviceId ? d : x));
  }

  async function handlePush(deviceId: string) {
    setLoading(deviceId + "_push");
    try { await pushPlaylist(token, deviceId); } catch { alert("Cihaz çevrimdışı"); }
    setLoading(null);
  }

  async function handleDelete(deviceId: string) {
    if (!confirm("Cihazı sil?")) return;
    await deleteDevice(token, deviceId);
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  }

  async function handleRegenKey(deviceId: string) {
    if (!confirm("API anahtarını yenile?")) return;
    const { api_key } = await regenApiKey(token, deviceId);
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, api_key } : d));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cihazlar</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
          <Plus size={15} /> Yeni Cihaz
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Yeni Cihaz Ekle</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Cihaz adı (örn. Lobi Ekranı)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            <input value={newLoc} onChange={e => setNewLoc(e.target.value)}
              placeholder="Konum (isteğe bağlı)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <div className="flex gap-2">
            <button onClick={addDevice} disabled={loading === "add"}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-50">
              {loading === "add" ? "Ekleniyor…" : "Ekle"}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">İptal</button>
          </div>
        </div>
      )}

      {/* Device list */}
      <div className="space-y-3">
        {devices.map(d => (
          <div key={d.id} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${d.status === "online" ? "bg-green-500" : "bg-gray-300"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{d.name}</span>
                  {d.location && <span className="text-xs text-gray-400">{d.location}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    d.status === "online" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>{d.status === "online" ? "Çevrimiçi" : "Çevrimdışı"}</span>
                  {d.resolution && <span className="text-xs text-gray-400">{d.resolution}</span>}
                </div>

                {/* API Key */}
                <div className="mt-2 flex items-center gap-2">
                  <code className="text-[11px] bg-gray-50 border rounded px-2 py-0.5 text-gray-600 font-mono truncate max-w-xs">
                    {d.api_key}
                  </code>
                  <button onClick={() => navigator.clipboard.writeText(d.api_key)} title="Kopyala"
                    className="text-gray-400 hover:text-gray-600"><Copy size={13} /></button>
                  <button onClick={() => handleRegenKey(d.id)} title="Yenile"
                    className="text-gray-400 hover:text-gray-600"><RefreshCw size={13} /></button>
                </div>

                {/* Install hint */}
                <div className="mt-2">
                  <code className="text-[10px] bg-gray-50 border rounded px-2 py-1 text-gray-500 font-mono block">
                    SIGNAGE_DEVICE_ID={d.id} SIGNAGE_API_KEY={d.api_key} python3 agent.py
                  </code>
                </div>

                {/* Playlist selector */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <label className="text-xs text-gray-500">Playlist:</label>
                  <select
                    value={d.current_playlist_id ?? ""}
                    onChange={e => assignPlaylist(d.id, e.target.value)}
                    className="text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">— Seç —</option>
                    {playlists.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button onClick={() => handlePush(d.id)}
                    disabled={loading === d.id + "_push" || d.status !== "online"}
                    title="Şimdi gönder"
                    className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1.5 rounded-lg hover:bg-indigo-100 disabled:opacity-40 transition-colors">
                    <Send size={12} /> Gönder
                  </button>
                </div>
              </div>

              <button onClick={() => handleDelete(d.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!devices.length && (
          <div className="text-center py-16 text-gray-400">
            <Monitor size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Henüz cihaz eklenmedi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
