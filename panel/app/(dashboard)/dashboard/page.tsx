import { getToken } from "@/lib/auth";
import { getDevices, getPlaylists, getContent } from "@/lib/api";
import { Monitor, ListVideo, Image, Wifi } from "lucide-react";

export default async function DashboardPage() {
  const token     = await getToken();
  const [devices, playlists, content] = await Promise.all([
    getDevices(token), getPlaylists(token), getContent(token),
  ]);
  const online = devices.filter(d => d.status === "online").length;

  const stats = [
    { label: "Toplam Cihaz",    value: devices.length,   icon: Monitor,   color: "text-indigo-600",  bg: "bg-indigo-50" },
    { label: "Çevrimiçi",       value: online,            icon: Wifi,      color: "text-green-600",   bg: "bg-green-50"  },
    { label: "Playlist",        value: playlists.length,  icon: ListVideo, color: "text-violet-600",  bg: "bg-violet-50" },
    { label: "İçerik Dosyası",  value: content.length,    icon: Image,     color: "text-amber-600",   bg: "bg-amber-50"  },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Device grid */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Cihaz Durumları</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {devices.map(d => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
            <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${d.status === "online" ? "bg-green-500" : "bg-gray-300"}`} />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{d.name}</p>
              <p className="text-xs text-gray-400">{d.location || "—"}</p>
              {d.resolution && <p className="text-xs text-gray-400 mt-0.5">{d.resolution}</p>}
            </div>
            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
              d.status === "online" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {d.status === "online" ? "Çevrimiçi" : "Çevrimdışı"}
            </span>
          </div>
        ))}
        {!devices.length && (
          <p className="text-sm text-gray-400 col-span-3">Henüz kayıtlı cihaz yok.</p>
        )}
      </div>
    </div>
  );
}
