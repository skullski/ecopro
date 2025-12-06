import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function StoreHeaderAuth() {
  const [storeSettings, setStoreSettings] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/client/store/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStoreSettings(data || {});
        }
      } catch (e) {
        // Non-fatal
      }
    };
    fetchSettings();
  }, []);

  return null;
}
