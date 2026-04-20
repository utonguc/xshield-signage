"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Monitor, Image, ListVideo, LayoutDashboard, LogOut } from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/devices",   label: "Cihazlar",   icon: Monitor },
  { href: "/content",   label: "İçerik",     icon: Image },
  { href: "/playlists", label: "Playlistler", icon: ListVideo },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-brand">x</span>
        <span className="text-xl font-bold text-gray-900">Signage</span>
        <p className="text-[10px] text-gray-400 mt-0.5">by xShield</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-brand/10 text-brand"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <LogOut size={16} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
