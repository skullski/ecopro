import { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const isStorefrontPage = location.pathname.startsWith('/store/');
  const isAdminChat = location.pathname === '/platform-admin/chats' || location.pathname === '/platform-admin/chat';
  const isChatPage = location.pathname === '/chat';
  const isFullScreenChat = isAdminChat || isChatPage;

  if (isStorefrontPage) {
    // Do not show platform header/footer on public storefront pages
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className={isFullScreenChat ? "flex flex-col h-screen overflow-hidden" : "min-h-screen flex flex-col"}>
      <Header />
      <main className={isFullScreenChat ? "flex-1 overflow-hidden" : "flex-1"}>
        {children}
      </main>
      {!isFullScreenChat && <Footer />}
    </div>
  );
}
