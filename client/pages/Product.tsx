import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { ShoppingCart, Star, Heart, Share2, Package } from "lucide-react";

const SAMPLE_PRODUCTS = [
  { id: "1", name: "قميص قطن", price: 19, desc: "قميص مريح عالي الجودة" },
  { id: "2", name: "حذاء رياضي", price: 59, desc: "حذاء خفيف للركض والمشي" },
  { id: "3", name: "قلم ذكي", price: 9, desc: "قلم عملي واستخدامي" },
];

export default function Product() {
  const { id } = useParams();
  const p = SAMPLE_PRODUCTS.find((x) => x.id === id);
  if (!p) return <div className="container mx-auto py-20">المنتج غير موجود</div>;

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(p);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("تمت إضافة المنتج للسلة");
  }

  return (
    <section className="relative min-h-screen py-20 overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/10">
      <FloatingShapes variant="section" colors="warm" />
      
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card/90 via-card to-card/90 backdrop-blur-sm shadow-2xl overflow-hidden">
            {/* Product Image */}
            <div className="relative h-96 w-full bg-gradient-to-br from-primary/30 via-accent/30 to-orange-500/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-32 w-32 text-primary/40" />
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                </button>
                <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-lg">
                  <Share2 className="h-5 w-5 text-primary" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 bg-gradient-to-r from-accent to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-xl">
                منتج مميز ⭐
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
                    {p.name}
                  </h1>
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground mr-2">(128 تقييم)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                    ${p.price}
                  </div>
                  <div className="text-sm text-muted-foreground line-through">
                    ${(p.price * 1.3).toFixed(0)}
                  </div>
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {p.desc}
              </p>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="text-2xl mb-1">🚚</div>
                  <div className="text-sm font-medium">شحن مجاني</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="text-sm font-medium">ضمان الجودة</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-sm font-medium">توصيل سريع</div>
                </div>
              </div>

              <Button 
                onClick={addToCart}
                className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-white text-lg py-6 shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all"
              >
                <ShoppingCart className="h-6 w-6 mr-2" />
                أضف إلى السلة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
