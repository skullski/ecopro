import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, Plus, Edit, Trash2, DollarSign, Store as StoreIcon } from "lucide-react";

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem("products") || "[]"));
  }, []);

  function save(p:any) {
    const all = JSON.parse(localStorage.getItem("products") || "[]");
    if (p.id) {
      const idx = all.findIndex((x:any)=>x.id===p.id);
      all[idx] = p;
    } else {
      p.id = Date.now().toString();
      all.push(p);
    }
    localStorage.setItem("products", JSON.stringify(all));
    setProducts(all);
    setEditing(null);
  }

  function remove(id:string) {
    const all = JSON.parse(localStorage.getItem("products") || "[]");
    const next = all.filter((x:any)=>x.id!==id);
    localStorage.setItem("products", JSON.stringify(next));
    setProducts(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            المنتجات
          </h2>
        </div>
        <Button 
          onClick={()=>setEditing({})}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          إنشاء منتج
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {products.map((p, idx)=>(
          <div 
            key={p.id} 
            className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-gradient-to-r from-card/80 to-card/50 backdrop-blur-sm p-4 hover:border-accent/50 hover:shadow-lg transition-all"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-bold text-lg">{p.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <span className="text-lg font-extrabold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                    ${p.price}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={()=>setEditing(p)}
                className="hover:bg-primary/10 border-primary/30"
              >
                <Edit className="h-4 w-4 mr-1" />
                تعديل
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={()=>remove(p.id)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editing && <ProductForm product={editing} onSave={save} onCancel={()=>setEditing(null)} />}
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }: any) {
  const [title, setTitle] = useState(product?.title||"");
  const [price, setPrice] = useState(product?.price||0);
  const [desc, setDesc] = useState(product?.desc||"");
  const [storeId, setStoreId] = useState(product?.storeId||"");
  const [stores, setStores] = useState<any[]>([]);

  useEffect(()=>{
    setStores(JSON.parse(localStorage.getItem('stores')||'[]'));
  },[]);

  function submit(e:any){
    e.preventDefault();
    onSave({ ...product, title, price: Number(price), desc, storeId });
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {product?.id ? 'تعديل المنتج' : 'منتج جديد'}
      </h3>
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">اسم المنتج</label>
          <input 
            value={title} 
            onChange={(e)=>setTitle(e.target.value)} 
            className="w-full rounded-lg border-2 border-primary/20 bg-background px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors" 
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">السعر</label>
          <input 
            type="number" 
            value={price} 
            onChange={(e)=>setPrice(e.target.value)} 
            className="w-full rounded-lg border-2 border-accent/20 bg-background px-4 py-3 focus:border-accent/50 focus:outline-none transition-colors" 
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">الوصف</label>
          <textarea 
            value={desc} 
            onChange={(e)=>setDesc(e.target.value)} 
            className="w-full rounded-lg border-2 border-primary/20 bg-background px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors min-h-[100px]" 
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">تبعاً لأي متجر</label>
          <select 
            value={storeId} 
            onChange={(e)=>setStoreId(e.target.value)} 
            className="w-full rounded-lg border-2 border-primary/20 bg-background px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors"
          >
            <option value="">عام (غير مقيّد)</option>
            {stores.map(s=> (
              <option key={s.id} value={s.id}>{s.name} — {s.id}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Button 
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
          >
            حفظ
          </Button>
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel}
            className="flex-1 border-2 border-muted hover:bg-muted/50"
          >
            إلغاء
          </Button>
        </div>
      </div>
    </form>
  );
}
