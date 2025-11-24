import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function SellerSignup() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function slugify(str: string) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/--+/g, '-');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      businessName: form.storeName,
      storeSlug: slugify(form.storeName) + "--" + Date.now(),
      password: form.password
    };
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Signup failed");
      }
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e]">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-center">{t("Create Seller Account")}</h2>
        <input
          className="input"
          placeholder={t("Full Name")}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder={t("Email")}
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder={t("Phone")}
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        />
        <input
          className="input"
          placeholder={t("Store Name")}
          value={form.storeName}
          onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder={t("Password")}
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{t("Signup successful! Please log in.")}</div>}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={submitting}
        >
          {submitting ? t("Submitting...") : t("Create Account")}
        </button>
      </form>
    </div>
  );
}
