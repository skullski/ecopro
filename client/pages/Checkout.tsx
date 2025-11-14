import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { ShoppingCart, CreditCard, Trash2, Package, CheckCircle } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((s:any,i:any)=>s + (i.price || 0), 0);

  function placeOrder(){
    const orders = JSON.parse(localStorage.getItem('orders')||'[]');
    const id = Date.now().toString();
    const order = { id, items: cart, total, status: 'pending', createdAt: Date.now() };
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.removeItem('cart');
    navigate(`/order-success/${id}`);
  }

  if (!cart.length) return (
    <section className="relative min-h-screen py-20 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-primary/10">
      <FloatingShapes variant="section" colors="primary" />
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-md text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
            <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">عربة التسوق فارغة</h2>
            <p className="text-muted-foreground">أضف بعض المنتجات للمتابعة</p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <section className="relative min-h-screen py-20 overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/10">
      <FloatingShapes variant="section" colors="accent" />
      
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              الدفع
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((i:any, idx:number)=> (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-card/80 to-card/50 backdrop-blur-sm hover:border-accent/50 transition-all"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{i.name}</div>
                    <div className="text-sm text-muted-foreground">كمية: 1</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                      ${i.price}
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  ملخص الطلب
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">المنتجات ({cart.length})</span>
                    <span className="font-medium">${total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الشحن</span>
                    <span className="font-medium text-green-500">مجاني</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">المجموع</span>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      ${total}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={placeOrder}
                  className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-white text-lg py-6 shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  تأكيد الطلب
                </Button>

                <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                  <p className="text-xs text-center text-green-600 font-medium">
                    🔒 عملية دفع آمنة ومشفرة
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
