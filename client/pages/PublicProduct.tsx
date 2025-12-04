import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Share2, Eye, Star, 
  Package, Check, ArrowLeft, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PublicProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  images?: string[];
  category?: string;
  stock_quantity: number;
  status: string;
  is_featured: boolean;
  views: number;
  client_id: number;
  store_name?: string;
  primary_color?: string;
  secondary_color?: string;
}

export default function PublicProduct() {
  // Support both legacy route params (:clientId/:slug) and new ones (:storeSlug/:productSlug)
  const params = useParams();
  const storeSlug = (params.storeSlug as string) || (params.clientId as string);
  const productSlug = (params.productSlug as string) || (params.slug as string);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Customer info form state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadProduct();
  }, [storeSlug, productSlug]);

  const loadProduct = async () => {
    try {
      console.debug('[PublicProduct] fetching', { storeSlug, productSlug });
      const res = await fetch(`/api/store/${storeSlug}/${productSlug}`);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Product not found');
      }
      const data = await res.json();
      setProduct(data);
    } catch (err: any) {
      console.error('[PublicProduct] load error:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleBuyNow = () => {
    setShowCheckout(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !storeSlug) return;
    
    setSubmitting(true);
    try {
      const totalPrice = product.price * quantity;
      
      const res = await fetch(`/api/storefront/${storeSlug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          total_price: totalPrice,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const data = await res.json();
      
      toast({
        title: 'Order Placed Successfully!',
        description: `Your order has been submitted. The seller will contact you soon.`,
      });

      // Reset form and close modal
      setShowCheckout(false);
      setCustomerInfo({ name: '', email: '', phone: '', address: '' });
      setQuantity(1);
      
    } catch (err: any) {
      toast({
        title: 'Order Failed',
        description: err.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-black">
        <div className="text-center space-y-4 p-6 bg-card dark:bg-gray-900 border dark:border-gray-700 rounded-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-muted-foreground">
            {error || 'This product may have been removed or is no longer available.'}
          </p>
          <div className="text-xs text-muted-foreground bg-muted/40 rounded-md p-3">
            <div>storeSlug: <span className="font-mono">{storeSlug || 'null'}</span></div>
            <div>productSlug: <span className="font-mono">{productSlug || 'null'}</span></div>
          </div>
          <Button onClick={() => navigate('/marketplace')}>
            Browse Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = product?.primary_color || '#3b82f6';
  const priceNum = Number(product?.price ?? 0);
  const originalPriceNum = Number(product?.original_price ?? 0);
  const hasOriginal = !!product?.original_price && originalPriceNum > 0 && originalPriceNum >= priceNum;
  let discount = 0;
  if (hasOriginal) {
    const d = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
    discount = Number.isFinite(d) && d > 0 ? d : 0;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-black">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/marketplace')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Eye className="w-3 h-3" />
                {product.views} views
              </Badge>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden border dark:bg-gray-900 dark:border-gray-700">
                {Array.isArray(product.images) && product.images[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title || 'Product'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-muted-foreground opacity-20" />
                  </div>
                )}
                {product.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-yellow-500">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-500">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {Array.isArray(product.images) && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        idx === selectedImage
                          ? 'border-primary scale-95'
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={`${product.title || 'Product'} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Package className="w-6 h-6 text-muted-foreground opacity-30" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Store Name */}
              {product?.store_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Sold by</p>
                  <p className="text-lg font-semibold" style={{ color: primaryColor }}>
                    {product.store_name}
                  </p>
                </div>
              )}

              {/* Title & Category */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product?.title || 'Product'}</h1>
                {product?.category && (
                  <Badge variant="secondary">{product.category}</Badge>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold" style={{ color: primaryColor }}>
                  ${Number.isFinite(priceNum) ? priceNum.toFixed(2) : '0.00'}
                </span>
                {hasOriginal && (
                  <span className="text-2xl text-muted-foreground line-through">
                    ${originalPriceNum.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg dark:bg-gray-800/60">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Stock Status</p>
                  <p className="text-sm text-muted-foreground">
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} units available`
                      : 'Contact seller for availability'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  size="lg"
                  className="w-full text-lg"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                  disabled={product.stock_quantity === 0}
                  onClick={handleBuyNow}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock_quantity > 0 ? 'Buy Now' : 'Out of Stock'}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="lg" className="w-full">
                    <Heart className="w-5 h-5 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={handleShare}>
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Buyer protection guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Direct from seller</span>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-6 border dark:border-gray-700">
                <h3 className="font-semibold mb-2">Interested in this product?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact the seller directly or explore more products on our marketplace
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/marketplace')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Browse More Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Fill in your information to place your order
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Product Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{product?.title}</span>
                <span className="font-semibold">${product?.price.toFixed(2)}</span>
              </div>
              
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <Label htmlFor="quantity">Quantity:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product?.stock_quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product?.stock_quantity || 1, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  ${((product?.price || 0) * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  required
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder="Street address, city, state, zip code"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowCheckout(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
                disabled={submitting}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
