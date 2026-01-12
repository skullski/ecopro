import { useEffect, useState } from 'react';

interface PixelConfig {
  facebook_pixel_id: string | null;
  tiktok_pixel_id: string | null;
  is_facebook_enabled: boolean;
  is_tiktok_enabled: boolean;
}

interface PixelScriptsProps {
  storeSlug: string;
}

// Declare global types for pixel SDKs
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    ttq: any;
    TiktokAnalyticsObject: string;
  }
}

/**
 * PixelScripts - Injects Facebook and TikTok pixel scripts based on store settings
 * This component should be included in the storefront layout
 */
export default function PixelScripts({ storeSlug }: PixelScriptsProps) {
  const [config, setConfig] = useState<PixelConfig | null>(null);

  // Fetch pixel config on mount
  useEffect(() => {
    if (!storeSlug) return;
    
    fetch(`/api/pixels/config/${storeSlug}`)
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Failed to load pixel config:', err));
  }, [storeSlug]);

  // Inject Facebook Pixel
  useEffect(() => {
    if (!config?.facebook_pixel_id || !config.is_facebook_enabled) return;
    
    const pixelId = config.facebook_pixel_id;
    
    // Check if already loaded
    if (window.fbq) {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      return;
    }

    // Facebook Pixel base code
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);

    console.log('[Pixel] Facebook Pixel initialized:', pixelId);

    return () => {
      // Cleanup on unmount (though usually stays)
    };
  }, [config?.facebook_pixel_id, config?.is_facebook_enabled]);

  // Inject TikTok Pixel
  useEffect(() => {
    if (!config?.tiktok_pixel_id || !config.is_tiktok_enabled) return;
    
    const pixelId = config.tiktok_pixel_id;
    
    // Check if already loaded
    if (window.ttq) {
      window.ttq.load(pixelId);
      window.ttq.page();
      return;
    }

    // TikTok Pixel base code
    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);

    console.log('[Pixel] TikTok Pixel initialized:', pixelId);

    return () => {
      // Cleanup on unmount
    };
  }, [config?.tiktok_pixel_id, config?.is_tiktok_enabled]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Helper functions to track events from other components
 */
export function trackFacebookEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
}

export function trackTikTokEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(eventName, params);
  }
}

export function trackAllPixels(eventName: string, params?: Record<string, any>) {
  trackFacebookEvent(eventName, params);
  trackTikTokEvent(eventName, params);
}

// Event name mappings for common events
export const PixelEvents = {
  PAGE_VIEW: 'PageView',
  VIEW_CONTENT: 'ViewContent',
  ADD_TO_CART: 'AddToCart',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  PURCHASE: 'Purchase',
  SEARCH: 'Search',
  ADD_TO_WISHLIST: 'AddToWishlist',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
  LEAD: 'Lead',
};
