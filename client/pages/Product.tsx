import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, MapPin, Truck, Shield, ArrowLeft, ChevronLeft, ChevronRight, Share2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product as ProductType } from '@shared/api';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        console.error('Product not found');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
  const rating = (Math.random() * 2 + 3).toFixed(1); // Mock rating
  const reviews = Math.floor(Math.random() * 500) + 10; // Mock reviews

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-black">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-3 md:gap-4">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-elevated dark:bg-gray-900 dark:border dark:border-gray-700">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={`${product.title} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-muted-foreground opacity-20" />
                </div>
              )}
              {product.condition === 'new' && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0">
                  New
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 right-4 bg-primary text-white border-0">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex
                        ? 'border-primary shadow-md'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-3 md:space-y-4">
            {/* Title & Price */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">{product.title}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(+rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {rating} ({reviews} reviews)
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-green-600 font-medium">{product.views} views</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl md:text-xl md:text-2xl font-bold text-primary">${product.price}</span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.original_price}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-4">
                {product.stock > 0 ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/30">
                    Out of Stock
                  </Badge>
                )}
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  {product.condition}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-b py-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Seller & Location Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{product.location || 'Not specified'}</span>
              </div>
              {product.shipping_available && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Free shipping available</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">Buyer Protection</span>
              </div>
            </div>

            {/* Seller Info */}
            {product.seller_name && (
              <div className="bg-card border rounded-xl p-4 shadow-elevated dark:bg-gray-900 dark:border-gray-700">
                <h4 className="font-semibold mb-2">Seller Information</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">{product.seller_name}</span>
                </p>
                {product.seller_email && (
                  <p className="text-sm text-muted-foreground">{product.seller_email}</p>
                )}
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                  disabled={product.stock === 0}
                  onClick={() => navigate(`/guest-checkout/${product.id}`)}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                </Button>
                
                <div className="flex gap-3">
                  <Button size="lg" variant="outline" className="border-2">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-red-500 hover:text-red-600">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 md:mt-4 md:mt-6 grid md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-card border rounded-xl p-6 shadow-elevated text-center dark:bg-gray-900 dark:border-gray-700">
            <Truck className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Fast Delivery</h4>
            <p className="text-sm text-muted-foreground">
              Get your products delivered quickly and safely
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6 shadow-elevated text-center dark:bg-gray-900 dark:border-gray-700">
            <Shield className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Buyer Protection</h4>
            <p className="text-sm text-muted-foreground">
              Your purchase is protected with our guarantee
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6 shadow-elevated text-center dark:bg-gray-900 dark:border-gray-700">
            <Star className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Quality Verified</h4>
            <p className="text-sm text-muted-foreground">
              All products are verified by our team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
