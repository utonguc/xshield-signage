import Link from "next/link";

const features = [
  {
    icon: "📺",
    title: "Çoklu Ekran Yönetimi",
    desc: "Farklı konumlardaki tüm dijital ekranlarınızı tek bir panelden yönetin. Cihaz durumunu anlık olarak izleyin.",
  },
  {
    icon: "🎬",
    title: "Playlist & Medya Builder",
    desc: "Görsel, video ve web içeriklerini sürükle-bırak ile düzenleyin. Her içeriğe özel süre ayarı.",
  },
  {
    icon: "⚡",
    title: "Anlık Push Güncellemesi",
    desc: "Playlist değişikliklerini bağlı cihazlara tek tıkla gönderin. WebSocket ile sıfır gecikme.",
  },
  {
    icon: "🥧",
    title: "Raspberry Pi Agent",
    desc: "Chromium kiosk modunda çalışan hafif Python agent. Çevrimdışı yedekleme, otomatik yeniden başlatma.",
  },
  {
    icon: "📡",
    title: "Gerçek Zamanlı İzleme",
    desc: "Hangi cihazların çevrimiçi olduğunu anlık görün. Bağlantı kesilince sistem sizi bilgilendirir.",
  },
  {
    icon: "🗓️",
    title: "Zamanlama & Öncelik",
    desc: "İçerikleri belirli günler ve saatler için planlayın. Öncelik sıralamasıyla kampanya yönetimi.",
  },
];

const steps = [
  { n: "01", icon: "➕", title: "Cihaz Ekle", desc: "Panelden yeni cihaz oluşturun, benzersiz API anahtarınızı alın." },
  { n: "02", icon: "📦", title: "Agent Kur", desc: "Raspberry Pi veya Linux PC'ye tek komutla agent'ı yükleyin." },
  { n: "03", icon: "🎬", title: "Playlist Oluştur", desc: "Medya yükleyin, sıralayın, süreleri ayarlayın." },
  { n: "04", icon: "📡", title: "Yayına Al", desc: "Cihaza atayın, push gönderin — ekran anında güncellenir." },
];

const useCases = [
  { icon: "🏢", title: "Kurumsal Ofisler", desc: "Lobi ekranları, toplantı odası bilgi panelleri, duyuru ekranları." },
  { icon: "🛒", title: "Perakende & Mağazalar", desc: "Ürün tanıtımları, kampanya reklamları, fiyat panelleri." },
  { icon: "🏥", title: "Klinik & Hastaneler", desc: "Bekleme odası bilgilendirme, sıra takip, sağlık içerikleri." },
  { icon: "✂️", title: "Kuaför & Güzellik", desc: "Hizmet listesi, promosyon kampanyaları, sosyal medya içerikleri." },
  { icon: "🍽️", title: "Kafe & Restoranlar", desc: "Dijital menü, günün özel yemekleri, kampanya duyuruları." },
  { icon: "🏋️", title: "Spor Tesisleri", desc: "Ders programları, duyurular, motivasyon içerikleri." },
];

export default function LandingPage() {
  return (
    <div style={{ background: "#060d1f", color: "#f1f5f9", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(6,13,31,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(14,165,233,0.15)",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 15, color: "#fff",
          }}>x</div>
          <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.5px" }}>
            x<span style={{ color: "#38bdf8" }}>Signage</span>
            <span style={{ color: "#475569", fontSize: 12, fontWeight: 400, marginLeft: 6 }}>by xShield</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#ozellikler" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Özellikler</a>
          <a href="#nasil-calisir" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Nasıl Çalışır?</a>
          <a href="#kullanim" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Kullanım Alanları</a>
          <Link href="/login" style={{
            padding: "8px 20px",
            background: "rgba(14,165,233,0.12)",
            border: "1px solid rgba(14,165,233,0.35)",
            borderRadius: 8, color: "#38bdf8", textDecoration: "none",
            fontSize: 13, fontWeight: 600,
          }}>Giriş Yap</Link>
          <a href="#iletisim" style={{
            padding: "8px 20px",
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            borderRadius: 8, color: "#fff", textDecoration: "none",
            fontSize: 13, fontWeight: 600,
            boxShadow: "0 3px 14px rgba(14,165,233,0.4)",
          }}>Demo Talep Et</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden", paddingTop: 100,
        background: "linear-gradient(160deg, #060d1f 0%, #0a1628 50%, #061220 100%)",
      }}>
        <div style={{
          position: "absolute", top: "8%", right: "3%",
          width: 560, height: 560,
          background: "radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", left: "0%",
          width: 420, height: 420,
          background: "radial-gradient(circle, rgba(2,132,199,0.09) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(14,165,233,0.1)",
                border: "1px solid rgba(14,165,233,0.25)",
                fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 24,
              }}>
                <span>📺</span> Dijital Tabela Yönetim Platformu
              </div>
              <h1 style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 900,
                lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20, color: "#f1f5f9",
              }}>
                Tüm Ekranlarınızı<br />
                <span style={{
                  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>Tek Panelden</span><br />
                Yönetin
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 17, lineHeight: 1.8, marginBottom: 36, maxWidth: 460 }}>
                Dijital tabelalarınızı merkezi olarak kontrol edin. Playlist oluşturun,
                medya yükleyin ve Raspberry Pi veya Linux cihazlara anlık push gönderin.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="/login" style={{
                  padding: "14px 32px",
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  borderRadius: 10, color: "#fff", textDecoration: "none",
                  fontSize: 15, fontWeight: 700,
                  boxShadow: "0 6px 28px rgba(14,165,233,0.4)",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                  Panele Git
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <a href="#ozellikler" style={{
                  padding: "14px 32px",
                  background: "rgba(14,165,233,0.1)",
                  border: "1px solid rgba(14,165,233,0.3)",
                  borderRadius: 10, color: "#38bdf8", textDecoration: "none",
                  fontSize: 15, fontWeight: 600,
                }}>Özellikleri Gör</a>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
                {[
                  { value: "WebSocket", label: "Gerçek zamanlı" },
                  { value: "Raspberry Pi", label: "Agent desteği" },
                  { value: "200 MB", label: "Medya yükleme limiti" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#38bdf8" }}>{s.value}</div>
                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock dashboard UI */}
            <div style={{
              background: "rgba(13,27,46,0.8)",
              border: "1px solid rgba(14,165,233,0.2)",
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(14,165,233,0.08)",
            }}>
              <div style={{
                padding: "12px 16px",
                background: "rgba(14,165,233,0.08)",
                borderBottom: "1px solid rgba(14,165,233,0.15)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {["#ef4444","#f59e0b","#22c55e"].map(c => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
                ))}
                <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: 8 }}>xSignage — Cihaz Yönetimi</span>
              </div>
              <div style={{ padding: "20px 16px" }}>
                {/* device rows */}
                {[
                  { name: "Lobi Ekranı", loc: "Giriş", online: true },
                  { name: "Toplantı Odası A", loc: "2. Kat", online: true },
                  { name: "Yemekhane Ekranı", loc: "Bodrum", online: false },
                ].map((d) => (
                  <div key={d.name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10, marginBottom: 8,
                    background: "rgba(14,165,233,0.05)",
                    border: "1px solid rgba(14,165,233,0.1)",
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: d.online ? "#22c55e" : "#475569",
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ color: "#64748b", fontSize: 11 }}>{d.loc}</div>
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                      background: d.online ? "rgba(34,197,94,0.15)" : "rgba(71,85,105,0.3)",
                      color: d.online ? "#22c55e" : "#64748b",
                    }}>{d.online ? "Çevrimiçi" : "Çevrimdışı"}</div>
                  </div>
                ))}
                {/* playlist push button */}
                <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>Marka Tanıtım — v2</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>3 içerik · Aktif playlist</div>
                  </div>
                  <div style={{
                    padding: "5px 14px", borderRadius: 7,
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    color: "#fff", fontSize: 11, fontWeight: 700,
                  }}>Push Gönder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ÖZELLİKLER ── */}
      <section id="ozellikler" style={{ padding: "96px 24px", background: "rgba(10,22,40,0.8)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)",
              fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16,
            }}><span>⚙️</span> Özellikler</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>
              Dijital Tabelanızı Güçlendirin
            </h2>
            <p style={{ color: "#64748b", fontSize: 17, maxWidth: 520, margin: "0 auto" }}>
              Kurumsal dijital tabela yönetimi için ihtiyacınız olan her şey tek platformda.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} style={{
                padding: "28px 24px", borderRadius: 16,
                background: "rgba(13,27,46,0.7)",
                border: "1px solid rgba(14,165,233,0.12)",
                transition: "border-color 0.2s",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 16,
                  background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "#64748b", fontSize: 13.5, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section id="nasil-calisir" style={{ padding: "96px 24px", background: "#060d1f" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)",
              fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16,
            }}><span>🗺️</span> Süreç</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>
              4 Adımda Yayına Alın
            </h2>
            <p style={{ color: "#64748b", fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
              Kurulum kılavuzumuz sayesinde dakikalar içinde cihazlarınızı bağlayabilirsiniz.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {steps.map((s) => (
              <div key={s.n} style={{ textAlign: "center", padding: "0 8px" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "rgba(14,165,233,0.12)", border: "2px solid rgba(14,165,233,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  }}>{s.icon}</div>
                  <div style={{
                    position: "absolute", top: -4, right: -4,
                    width: 24, height: 24, borderRadius: "50%",
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800, color: "#fff",
                  }}>{s.n}</div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "#64748b", fontSize: 13.5, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KULLANIM ALANLARI ── */}
      <section id="kullanim" style={{ padding: "96px 24px", background: "rgba(10,22,40,0.8)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)",
              fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16,
            }}><span>🏢</span> Kullanım Alanları</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>
              Her Sektöre Uygun
            </h2>
            <p style={{ color: "#64748b", fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
              Küçük ölçekli mağazalardan büyük kurumsal yapılara, xSignage her ortamda çalışır.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {useCases.map((u) => (
              <div key={u.title} style={{
                display: "flex", gap: 16, padding: "20px",
                borderRadius: 14, background: "rgba(13,27,46,0.7)",
                border: "1px solid rgba(14,165,233,0.1)",
              }}>
                <div style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: 11,
                  background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{u.icon}</div>
                <div>
                  <h4 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{u.title}</h4>
                  <p style={{ color: "#64748b", fontSize: 12.5, lineHeight: 1.65 }}>{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "96px 24px",
        background: "linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(2,132,199,0.07) 100%)",
        borderTop: "1px solid rgba(14,165,233,0.18)", borderBottom: "1px solid rgba(14,165,233,0.18)",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>📺</div>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
            Ekranlarınızı{" "}
            <span style={{
              background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Hemen Yönetmeye</span> Başlayın
          </h2>
          <p style={{ color: "#64748b", fontSize: 16, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.75 }}>
            Demo hesabı oluşturun ya da bize ulaşın — dijital tabelalarınızı bugün kontrol altına alın.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{
              padding: "15px 36px",
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              borderRadius: 10, color: "#fff", textDecoration: "none",
              fontSize: 15, fontWeight: 700,
              boxShadow: "0 6px 28px rgba(14,165,233,0.4)",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              Panele Git
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="mailto:info@xshield.com.tr" style={{
              padding: "15px 28px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, color: "#94a3b8", textDecoration: "none", fontSize: 15, fontWeight: 500,
            }}>info@xshield.com.tr</a>
          </div>
        </div>
      </section>

      {/* ── İLETİŞİM ── */}
      <section id="iletisim" style={{ padding: "96px 24px", background: "#060d1f" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 999,
            background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)",
            fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16,
          }}><span>📬</span> İletişim</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>
            Demo veya Bilgi Alın
          </h2>
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 36 }}>
            xSignage hakkında daha fazla bilgi almak veya demo talebinde bulunmak için bize yazın.
          </p>
          <div style={{
            padding: "36px 32px", borderRadius: 20,
            background: "rgba(13,27,46,0.8)", border: "1px solid rgba(14,165,233,0.15)",
            textAlign: "left",
          }}>
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Ad Soyad", "text", "Ahmet Yılmaz"], ["Firma", "text", "Şirket A.Ş."]].map(([label, type, ph]) => (
                  <div key={label}>
                    <label style={{ display: "block", color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                    <input type={type} placeholder={ph} style={{
                      width: "100%", padding: "10px 12px", boxSizing: "border-box",
                      background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.2)",
                      borderRadius: 8, color: "#e2e8f0", fontSize: 13, outline: "none",
                    }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>E-posta</label>
                <input type="email" placeholder="ahmet@firma.com" style={{
                  width: "100%", padding: "10px 12px", boxSizing: "border-box",
                  background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.2)",
                  borderRadius: 8, color: "#e2e8f0", fontSize: 13, outline: "none",
                }} />
              </div>
              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Mesajınız</label>
                <textarea placeholder="Kaç ekranınız var? Hangi sektörde faaliyet gösteriyorsunuz?" rows={4} style={{
                  width: "100%", padding: "10px 12px", boxSizing: "border-box",
                  background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.2)",
                  borderRadius: 8, color: "#e2e8f0", fontSize: 13, outline: "none", resize: "vertical",
                }} />
              </div>
              <button type="submit" style={{
                padding: "13px 24px",
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                borderRadius: 9, color: "#fff", border: "none", fontSize: 14, fontWeight: 700,
                cursor: "pointer", boxShadow: "0 4px 18px rgba(14,165,233,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Mesaj Gönder
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8l10 0M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "28px 24px", borderTop: "1px solid rgba(14,165,233,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 13, color: "#fff",
          }}>x</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#94a3b8" }}>
            xSignage <span style={{ color: "#334155" }}>by xShield</span>
          </span>
        </div>
        <div style={{ color: "#334155", fontSize: 12 }}>
          © {new Date().getFullYear()} xShield. Tüm hakları saklıdır.
        </div>
        <a href="https://xshield.com.tr" style={{ color: "#475569", textDecoration: "none", fontSize: 12 }}>
          xshield.com.tr →
        </a>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          #hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
