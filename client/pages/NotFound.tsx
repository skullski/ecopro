import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background">
      <div className="text-center">
        <h1 className="text-2xl md:text-xl md:text-2xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{t('notfound.message')}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('notfound.cta')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
