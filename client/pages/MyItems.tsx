
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function MyItems() {
  const [email, setEmail] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSearch() {
    setLoading(true);
    try {
      // Fetch items from server by owner email
      const res = await fetch(`/api/items?ownerEmail=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
      if (data.length === 0) toast({ title: 'No items', description: 'No items found for that email' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch items' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
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
