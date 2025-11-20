
import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import type { MarketplaceProduct, Vendor } from "@shared/types";
import { Link } from "react-router-dom";
import { Search, Tag, User, Heart, Star, ShoppingCart, MessageCircle, Phone, BadgeCheck, Car, Smartphone, Shirt, Home, Trophy, Gamepad, Building, Briefcase, User as UserIcon, Grid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import HomeMarketplace from "@/components/marketplace/HomeMarketplace";


// Demo banners and category icons
const DEMO_BANNERS = [
  "/demo/banner1.jpg",
  "/demo/banner2.jpg",
  "/demo/banner3.jpg",
];
const CATEGORY_ICONS: Record<string, JSX.Element> = {
  Automobiles: <Car className="w-5 h-5" />,
  Electronics: <Smartphone className="w-5 h-5" />,
  Fashion: <Shirt className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Sports: <Trophy className="w-5 h-5" />,
  Toys: <Gamepad className="w-5 h-5" />,
  "Real Estate": <Building className="w-5 h-5" />,
  Services: <Briefcase className="w-5 h-5" />,
  Jobs: <UserIcon className="w-5 h-5" />,
  Others: <Grid className="w-5 h-5" />,
};

export default function Marketplace() {
  // Show the new modular homepage inside the site
  return <HomeMarketplace />;
}
