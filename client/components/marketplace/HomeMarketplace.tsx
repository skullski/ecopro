import React from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, User, Grid, Car, Smartphone, Shirt, Home, Trophy, Gamepad, Tag, Heart, Star, ShoppingCart, MessageCircle, Phone, BadgeCheck, Share2 } from "lucide-react";

// Dummy data
const banners = [
  "/demo/banner1.jpg",
  "/demo/banner2.jpg",
  "/demo/banner3.jpg",
];
const categories = [
  { name: "Cars", icon: <Car className="w-6 h-6" /> },
  { name: "Electronics", icon: <Smartphone className="w-6 h-6" /> },
  { name: "Fashion", icon: <Shirt className="w-6 h-6" /> },
  { name: "Home", icon: <Home className="w-6 h-6" /> },
  { name: "Sports", icon: <Trophy className="w-6 h-6" /> },
  { name: "Accessories", icon: <Gamepad className="w-6 h-6" /> },
];
const sellers = [
  { name: "Auto Plus", logo: "/demo/seller1.png" },
  { name: "ElectroShop", logo: "/demo/seller2.png" },
  { name: "Fashionista", logo: "/demo/seller3.png" },
];
const products = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  image: `/demo/product${(i % 6) + 1}.jpg`,
  title: `Product ${i + 1}`,
  price: (1000 + i * 100) + " DZD",
  location: "Algiers",
  seller: sellers[i % sellers.length].name,
  sellerLogo: sellers[i % sellers.length].logo,
}));

export default function HomeMarketplace() {
  return (
    <div className="w-full min-h-screen bg-[#18191b] text-white">
      {/* ...header/navbar removed as requested... */}
      {/* Search Bar */}
      <div className="flex justify-center py-6 px-2">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full max-w-xl py-3 px-5 rounded-full bg-[#232325] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary text-lg shadow"
        />
      </div>
      {/* Banners */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-6 scrollbar-hide">
        {banners.map((src, i) => (
          <img key={i} src={src} alt="Banner" className="h-36 md:h-48 w-full max-w-2xl object-cover rounded-xl shadow-lg" />
        ))}
      </div>
      {/* Featured Carousel */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold mb-2">Today's Picks</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {products.slice(0, 6).map(product => (
            <div key={product.id} className="min-w-[260px] max-w-xs bg-[#232325] border border-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden group">
              <img src={product.image} alt={product.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200" />
              <div className="flex-1 flex flex-col p-3">
                <div className="font-bold text-base mb-1 line-clamp-2">{product.title}</div>
                <div className="mb-1 text-lg font-bold text-accent-400">{product.price}</div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <User className="w-4 h-4" /> {product.seller}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <Button size="icon" variant="ghost"><Phone className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><MessageCircle className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><Heart className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><Share2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Categories */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold mb-2">Categories</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <div key={cat.name} className="flex flex-col items-center gap-2 px-4 py-3 bg-[#232325] border border-gray-700 rounded-xl min-w-[110px]">
              {cat.icon}
              <span className="text-sm font-medium">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Dealers/Sellers */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold mb-2">Top Dealers</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {sellers.map(seller => (
            <div key={seller.name} className="flex flex-col items-center gap-2 px-4 py-3 bg-[#232325] border border-gray-700 rounded-xl min-w-[110px]">
              <img src={seller.logo} alt={seller.name} className="w-12 h-12 rounded-full object-cover border border-primary" />
              <span className="text-sm font-medium">{seller.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Product Grid */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold mb-2">All Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(product => (
            <div key={product.id} className="relative bg-[#232325] border border-gray-800 rounded-xl shadow card hover:shadow-lg transition flex flex-col overflow-hidden group min-h-[320px]">
              <img src={product.image} alt={product.title} className="w-full h-36 md:h-40 object-cover group-hover:scale-105 transition-transform duration-200" />
              <div className="flex-1 flex flex-col p-3 md:p-4">
                <div className="font-bold text-base md:text-lg mb-1 line-clamp-2">{product.title}</div>
                <div className="mb-1 text-lg font-bold text-accent-400">{product.price}</div>
                <div className="mb-1 text-xs text-primary-400 font-medium flex gap-2 items-center">
                  <Tag className="w-4 h-4" /> Accessories
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <User className="w-4 h-4" /> {product.seller}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <Button size="icon" variant="ghost"><Phone className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><MessageCircle className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><Heart className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><Share2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* More of what you love */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold mb-2">More of what you love</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {products.slice(6, 12).map(product => (
            <div key={product.id} className="min-w-[260px] max-w-xs bg-[#232325] border border-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden group">
              <img src={product.image} alt={product.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200" />
              <div className="flex-1 flex flex-col p-3">
                <div className="font-bold text-base mb-1 line-clamp-2">{product.title}</div>
                <div className="mb-1 text-lg font-bold text-accent-400">{product.price}</div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <User className="w-4 h-4" /> {product.seller}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <Button size="icon" variant="ghost"><Phone className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><MessageCircle className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><Heart className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><Share2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
