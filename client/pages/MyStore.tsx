import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyStore() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get client ID from JWT token
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const clientId = payload.id;
      
      if (clientId) {
        // Redirect to the client's public storefront
        navigate(`/store/${clientId}`, { replace: true });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to parse token:', error);
      navigate('/login');
    }
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
