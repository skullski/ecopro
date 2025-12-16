import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function SellerStore() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/seller/store/settings', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (e) {
        console.error('Failed to fetch seller settings', e);
      } finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/seller/store/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          store_name: settings.store_name || null,
          store_description: settings.store_description || null,
          store_logo: settings.store_logo || null,
          template: settings.template || 'classic'
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }
      const updated = await res.json().catch(() => null);
      if (updated) setSettings(updated);
      alert('Saved');
    } catch (e) {
      console.error(e);
      alert('Save failed: ' + ((e as any).message || e));
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Seller Store Settings</h2>
      <div className="mb-3">
        <label className="block text-sm">Store Name</label>
        <Input value={settings.store_name || ''} onChange={e => setSettings((s:any)=>({...s, store_name: e.target.value}))} />
      </div>
      <div className="mb-3">
        <label className="block text-sm">Store Description</label>
        <Textarea value={settings.store_description || ''} onChange={e => setSettings((s:any)=>({...s, store_description: e.target.value}))} />
      </div>
      <div className="mb-3">
        <label className="block text-sm">Store Logo URL</label>
        <Input value={settings.store_logo || ''} onChange={e => setSettings((s:any)=>({...s, store_logo: e.target.value}))} />
      </div>
      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </div>
  );
}
