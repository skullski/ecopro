import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AddressForm, AddressFormValue } from "@/components/AddressForm";
import { useTranslation } from "../lib/i18n";

type User = {
  id: string;
  name: string;
  email?: string;
  addresses: any[];
  defaultAddressId?: string;
};

export default function BuyerInfo() {
  const [me, setMe] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState<AddressFormValue>({
    line1: "",
    city: "",
    postalCode: "",
    country: "",
  } as AddressFormValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<User>("/api/me").then((u) => {
      setMe(u);
      setName(u.name || "");
      setEmail(u.email || "");
      const def = u.addresses?.find((a) => a.id === u.defaultAddressId) || u.addresses?.[0];
      if (def) setAddr({ line1: def.line1, line2: def.line2, city: def.city, state: def.state, postalCode: def.postalCode, country: def.country, phone: def.phone });
    });
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const addresses = [
        {
          id: me?.defaultAddressId,
          ...addr,
        },
      ];
      const next = await apiFetch<User>("/api/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
          addresses,
          defaultAddressId: me?.defaultAddressId || addresses[0]?.id,
        }),
      });
      setMe(next);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-semibold">{t('buyerInfo.title')}</h1>
      <div className="grid gap-3">
        <input className="input input-bordered" placeholder={t('buyerInfo.fullNamePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input input-bordered" placeholder={t('buyerInfo.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">{t('buyerInfo.defaultShippingAddress')}</h2>
        <AddressForm value={addr} onChange={setAddr} />
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? t('buyerInfo.saving') : t('buyerInfo.save')}
        </button>
        {saved && <div className="text-green-600 self-center">{t('buyerInfo.saved')}</div>}
      </div>
    </div>
  );
}
