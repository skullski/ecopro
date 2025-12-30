import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyStore() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/client/store/settings');
        if (res.status === 401 || res.status === 403) {
          navigate('/login');
          return;
        }

        if (!res.ok) {
          navigate('/dashboard');
          return;
        }

        const data = await res.json().catch(() => ({} as any));
        const storeSlug = data?.store_slug;
        if (storeSlug) {
          navigate(`/store/${storeSlug}`, { replace: true });
          return;
        }

        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to load store settings:', error);
        navigate('/dashboard');
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your store...</p>
      </div>
    </div>
  );
}
