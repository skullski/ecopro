import { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import MarketplaceHeader from "./MarketplaceHeader";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const isMarketplacePage = location.pathname.startsWith('/marketplace') || 
                            location.pathname.startsWith('/seller/');

  return (
    <div className={isMarketplacePage ? "min-h-screen flex flex-col futuristic-gradient text-foreground" : "min-h-screen flex flex-col"}>
      {isMarketplacePage ? <MarketplaceHeader /> : <Header />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
