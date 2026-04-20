"use client";
import { useState } from "react";
import { ListVideo, Plus, Trash2, Clock, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import type { Playlist, Content } from "@/lib/api";
import {
  createPlaylist, deletePlaylist, addItemToPlaylist,
  removeItemFromPlaylist, updatePlaylistItem, reorderPlaylist,
} from "@/lib/api";

interface Props { initialPlaylists: Playlist[]; allContent: Content[]; token: string; }

export default function PlaylistsClient({ initialPlaylists, allContent, token }: Props) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [openId,    setOpenId]    = useState<string | null>(null);
  const [newName,   setNewName]   = useState("");
  const [adding,    setAdding]    = useState(false);
  const [addContent, setAddContent] = useState("");
  const [addDuration, setAddDuration] = useState(10);

  async function handleCreate() {
    if (!newName.trim()) return;
    const p = await createPlaylist(token, newName.trim());
    setPlaylists(prev => [p, ...prev]);
    setNewName(""); setAdding(false);
    setOpenId(p.id);
  }

  async function handleDelete(id: string) {
    if (!confirm("Playlist'i sil?")) return;
    await deletePlaylist(token, id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (openId === id) setOpenId(null);
  }

  async function handleAddItem(playlistId: string) {
    if (!addContent) return;
    const p = await addItemToPlaylist(token, playlistId, {
      content_id: addContent,
      duration:   addDuration,
    });
    setPlaylists(prev => prev.map(x => x.id === playlistId ? p : x));
    setAddContent("");
  }

  async function handleRemoveItem(playlistId: string, itemId: string) {
    await removeItemFromPlaylist(token, playlistId, itemId);
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, items: p.items.filter(i => i.id !== itemId) };
    }));
  }

  async function handleDurationChange(playlistId: string, itemId: string, duration: number) {
    const p = await updatePlaylistItem(token, playlistId, itemId, { duration });
    setPlaylists(prev => prev.map(x => x.id === playlistId ? p : x));
  }

  function totalDuration(pl: Playlist) {
    return pl.items.reduce((s, i) => s + i.duration, 0);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Playlistler</h1>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
          <Plus size={15} /> Yeni Playlist
        </button>
      </div>

      {/* Create form */}
      {adding && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 shadow-sm flex items-center gap-3">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="Playlist adı" autoFocus
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          <button onClick={handleCreate} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark">Oluştur</button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600">İptal</button>
        </div>
      )}

      {/* Playlist list */}
      <div className="space-y-3">
        {playlists.map(pl => (
          <div key={pl.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                 onClick={() => setOpenId(openId === pl.id ? null : pl.id)}>
              {openId === pl.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              <ListVideo size={16} className="text-brand" />
              <span className="font-semibold text-gray-900 flex-1">{pl.name}</span>
              <span className="text-xs text-gray-400">{pl.items.length} öğe · {totalDuration(pl)}s</span>
              <button onClick={e => { e.stopPropagation(); handleDelete(pl.id); }}
                className="text-gray-300 hover:text-red-500 transition-colors ml-2">
                <Trash2 size={15} />
              </button>
            </div>

            {/* Items */}
            {openId === pl.id && (
              <div className="border-t border-gray-50 px-5 py-4 space-y-2">
                {pl.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                    <GripVertical size={14} className="text-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.content.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{item.content.file_type}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock size={12} className="text-gray-400" />
                      <input
                        type="number" min={1} max={3600}
                        value={item.duration}
                        onChange={e => handleDurationChange(pl.id, item.id, Number(e.target.value))}
                        className="w-14 border rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <span className="text-xs text-gray-400">sn</span>
                    </div>
                    <button onClick={() => handleRemoveItem(pl.id, item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {!pl.items.length && (
                  <p className="text-sm text-gray-400 text-center py-3">Henüz öğe yok. Aşağıdan ekleyin.</p>
                )}

                {/* Add item */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <select value={addContent} onChange={e => setAddContent(e.target.value)}
                    className="flex-1 border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="">— İçerik seç —</option>
                    {allContent.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.file_type})</option>
                    ))}
                  </select>
                  <input type="number" min={1} max={3600} value={addDuration}
                    onChange={e => setAddDuration(Number(e.target.value))}
                    className="w-16 border rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand" />
                  <span className="text-xs text-gray-400 shrink-0">sn</span>
                  <button onClick={() => handleAddItem(pl.id)} disabled={!addContent}
                    className="flex items-center gap-1 bg-brand text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-40">
                    <Plus size={13} /> Ekle
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {!playlists.length && (
          <div className="text-center py-16 text-gray-400">
            <ListVideo size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Henüz playlist oluşturulmadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
