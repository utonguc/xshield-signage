"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    setLoading(false);
    if (res.ok) router.push("/dashboard");
    else setError("Geçersiz kullanıcı adı veya şifre");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-brand">x</span>
          <span className="text-3xl font-bold text-gray-900">Signage</span>
          <p className="text-xs text-gray-400 mt-1">by xShield</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <h1 className="text-xl font-bold text-gray-900">Giriş Yap</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input name="email" type="email" required autoComplete="email"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input name="password" type="password" required autoComplete="current-password"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-colors">
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
