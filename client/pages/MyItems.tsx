import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';

export default function MyItems() {
  const [email, setEmail] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSearch() {
    setLoading(true);
    try {
      const res = await api.getProductsByOwnerEmail(email);
      setItems(res);
      if (res.length === 0) toast({ title: 'No items', description: 'No items found for that email' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch items' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    // find ownerKey from local storage
    const myKeys = JSON.parse(localStorage.getItem('myOwnerKeys') || '[]');
    const found = myKeys.find((k: any) => k.productId === id);
    if (!found) {
      toast({ title: 'Missing key', description: 'Owner key was not found locally. Cannot delete.' });
      return;
    }
    try {
      await api.deletePublicProduct(id, found.ownerKey);
      setItems(items.filter(i => i.id !== id));
      toast({ title: 'Deleted', description: 'Item deleted' });
    } catch (err) {
      toast({ title: 'Error', description: 'Delete failed' });
    }
  }

  return (
    <section className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">إدارة العناصر الخاصة بي</h1>
        <div className="flex gap-2 items-center mb-4">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="بريدك الإلكتروني" />
          <Button onClick={handleSearch} disabled={loading}>بحث</Button>
        </div>

        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.id} className="p-4 border rounded-md flex justify-between items-center">
              <div>
                <div className="font-semibold">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.description}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleDelete(it.id)} variant="destructive">حذف</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
