import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function QuickSell() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { product, ownerKey } = await api.createPublicProduct({
        title,
        description,
        price: parseFloat(price),
        images: image ? [image] : [],
  vendorId: '',
  ownerEmail,
        isExportedToMarketplace: true,
        featured: false,
        updatedAt: Date.now(),
        createdAt: Date.now(),
      } as any);

  // Save ownerKey and email locally (user can manage items later)
      const myKeys = JSON.parse(localStorage.getItem('myOwnerKeys') || '[]');
      myKeys.push({ productId: product.id, ownerKey });
      localStorage.setItem('myOwnerKeys', JSON.stringify(myKeys));
  const myEmails = JSON.parse(localStorage.getItem('myOwnerEmails') || '[]');
  myEmails.push({ productId: product.id, ownerEmail });
  localStorage.setItem('myOwnerEmails', JSON.stringify(myEmails));

      toast({ title: 'تم الإضافة', description: 'تم إضافة منتجك بنجاح. احتفظ بمفتاح المطابقة في حال أردت التحكم لاحقًا.' });
      navigate('/');
    } catch (err) {
      toast({ title: 'خطأ', description: 'فشل إضافة المنتج' });
    }
  }

  return (
    <section className="container mx-auto py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">إضافة منتج سريع (بدون حساب)</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>عنوان المنتج</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>السعر</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div>
            <Label>صورة (رابط)</Label>
            <Input value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
          <div>
            <Label>بريدك الإلكتروني (لإدارة العناصر لاحقًا)</Label>
            <Input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} type="email" required />
          </div>
          <Button type="submit">أضف المنتج بدون حساب</Button>
        </form>
      </div>
    </section>
  );
}
