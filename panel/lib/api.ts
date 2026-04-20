const API_URL = process.env.API_URL ?? "http://signage_api:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function apiFetch<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginApi = (email: string, password: string) =>
  apiFetch<{ token: string; email: string }>("/v1/admin/auth/login", null, {
    method: "POST", body: JSON.stringify({ email, password }),
  });

// ── Devices ───────────────────────────────────────────────────────────────────
export interface Device {
  id: string; name: string; location: string | null; description: string | null;
  api_key: string; status: "online" | "offline"; last_seen: string | null;
  current_playlist_id: string | null; orientation: string; resolution: string | null;
  created_at: string;
}

export const getDevices     = (token: string) => apiFetch<Device[]>("/v1/admin/devices", token);
export const createDevice   = (token: string, body: object) =>
  apiFetch<Device>("/v1/admin/devices", token, { method: "POST", body: JSON.stringify(body) });
export const updateDevice   = (token: string, id: string, body: object) =>
  apiFetch<Device>(`/v1/admin/devices/${id}`, token, { method: "PUT", body: JSON.stringify(body) });
export const deleteDevice   = (token: string, id: string) =>
  fetch(`${API_URL}/v1/admin/devices/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
export const pushPlaylist   = (token: string, id: string) =>
  apiFetch<{ ok: boolean }>(`/v1/admin/devices/${id}/push`, token, { method: "POST" });
export const regenApiKey    = (token: string, id: string) =>
  apiFetch<{ api_key: string }>(`/v1/admin/devices/${id}/regenerate-key`, token, { method: "POST" });

// ── Content ───────────────────────────────────────────────────────────────────
export interface Content {
  id: string; name: string; file_path: string; file_type: "image" | "video" | "html";
  mime_type: string; file_size: number; width: number | null; height: number | null;
  duration: number | null; created_at: string;
}

export const getContent   = (token: string) => apiFetch<Content[]>("/v1/admin/content", token);
export const deleteContent = (token: string, id: string) =>
  fetch(`${API_URL}/v1/admin/content/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });

export async function uploadContent(token: string, file: File, name?: string): Promise<Content> {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);
  const res = await fetch(`${API_URL}/v1/admin/content`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

// ── Playlists ─────────────────────────────────────────────────────────────────
export interface PlaylistItem {
  id: string; order_index: number; duration: number;
  content: { id: string; name: string; file_type: string; file_path: string; width: number | null; height: number | null };
}
export interface Playlist {
  id: string; name: string; created_at: string; items: PlaylistItem[];
}

export const getPlaylists    = (token: string) => apiFetch<Playlist[]>("/v1/admin/playlists", token);
export const getPlaylist     = (token: string, id: string) => apiFetch<Playlist>(`/v1/admin/playlists/${id}`, token);
export const createPlaylist  = (token: string, name: string) =>
  apiFetch<Playlist>("/v1/admin/playlists", token, { method: "POST", body: JSON.stringify({ name }) });
export const renamePlaylist  = (token: string, id: string, name: string) =>
  apiFetch<Playlist>(`/v1/admin/playlists/${id}`, token, { method: "PUT", body: JSON.stringify({ name }) });
export const deletePlaylist  = (token: string, id: string) =>
  fetch(`${API_URL}/v1/admin/playlists/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
export const addItemToPlaylist = (token: string, id: string, body: object) =>
  apiFetch<Playlist>(`/v1/admin/playlists/${id}/items`, token, { method: "POST", body: JSON.stringify(body) });
export const removeItemFromPlaylist = (token: string, id: string, itemId: string) =>
  fetch(`${API_URL}/v1/admin/playlists/${id}/items/${itemId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
export const reorderPlaylist = (token: string, id: string, order: string[]) =>
  apiFetch<Playlist>(`/v1/admin/playlists/${id}/reorder`, token, { method: "PUT", body: JSON.stringify(order) });
export const updatePlaylistItem = (token: string, id: string, itemId: string, body: object) =>
  apiFetch<Playlist>(`/v1/admin/playlists/${id}/items/${itemId}`, token, { method: "PUT", body: JSON.stringify(body) });
