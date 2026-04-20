import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "xSignage | Dijital Tabela Yönetim Platformu — xShield",
  description:
    "xSignage; tüm dijital ekranlarınızı tek panelden yönetmenizi sağlar. Playlist oluşturun, medya yükleyin, Raspberry Pi veya Linux cihazlara WebSocket ile anlık push gönderin.",
  keywords: [
    "dijital tabela yönetimi", "digital signage Türkiye", "raspberry pi tabela",
    "ekran yönetim yazılımı", "xSignage", "xShield signage",
    "kurumsal dijital tabela", "playlist yönetimi ekran", "bilgi ekranı yazılımı",
  ],
  metadataBase: new URL("https://signage.xshield.com.tr"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "xSignage | Dijital Tabela Yönetim Platformu",
    description: "Tüm dijital ekranlarınızı tek panelden yönetin. Raspberry Pi destekli.",
    url: "https://signage.xshield.com.tr",
    siteName: "xSignage by xShield",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "xSignage | Dijital Tabela Yönetim Platformu",
    description: "WebSocket tabanlı gerçek zamanlı dijital tabela yönetimi.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
