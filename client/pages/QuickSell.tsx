import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated, getCurrentUser, getAuthToken } from '@/lib/auth';
import type { Vendor } from '@shared/types';

export default function QuickSell() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    // TODO: Set vendor info here if needed
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;

    try {
      let uploadedUrl = image;
      if (file) {
        const { url } = await api.uploadImage(file);
        uploadedUrl = url;
        setImage(url);
      }

      console.log('Creating product for vendor:', vendor.id);
      const product = await api.createProduct({
        title,
        description,
        price: parseFloat(price),
        images: uploadedUrl ? [uploadedUrl] : [],
        vendorId: vendor.id,
        category: 'other',
        condition: 'new',
        quantity: 1,
        status: 'active',
        createdAt: Date.now(),
        views: 0,
        favorites: 0,
        tags: [],
        featured: false,
        updatedAt: Date.now(),
      } as any);

      console.log('Product created:', product);



      toast({ title: 'تم الإضافة', description: 'تم إضافة منتجك بنجاح إلى متجرك.' });
      navigate(`/vendor/dashboard/${vendor.id}`);
    } catch (err) {
      console.error('Failed to create product:', err);
      toast({ title: 'خطأ', description: 'فشل إضافة المنتج: ' + (err as any).message });
    }
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">إضافة منتج إلى متجرك</h1>
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
            <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://example.com/image.jpg" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (!e.target.files || e.target.files.length === 0) return;
                setFile(e.target.files[0]);
                setImage(URL.createObjectURL(e.target.files[0]));
              }}
              className="mt-2"
            />
          </div>
          <Button type="submit">أضف المنتج</Button>
          <div className="mt-4">
            <button type="button" onClick={() => navigate(`/vendor/dashboard/${vendor.id}`)} className="text-sm text-primary underline">
              العودة إلى لوحة التحكم
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
