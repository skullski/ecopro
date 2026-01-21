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

  // Set current store slug for backend tracking
  useEffect(() => {
    if (storeSlug) {
      setCurrentStoreSlug(storeSlug);
    }
  }, [storeSlug]);

  // Fetch pixel config on mount
  useEffect(() => {
    if (!storeSlug) return;
    
    fetch(`/api/pixels/config/${storeSlug}`)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setBackendPixelPreferenceFromConfig(data);
        // Track PageView to our backend when pixel config loads (only once per page)
        if (data.is_facebook_enabled || data.is_tiktok_enabled) {
          // Prevent duplicate PageView on same URL
          const lastPageViewKey = sessionStorage.getItem('last_pageview_key');
          // Only use pathname for de-dupe so changing query params (fbclid/ttclid/utm) don't inflate views.
          const currentKey = `${storeSlug}|${window.location.pathname}`;
          if (lastPageViewKey !== currentKey) {
            sessionStorage.setItem('last_pageview_key', currentKey);
            trackPageView(storeSlug);
          }
        }
      })
      .catch(err => console.error('Failed to load pixel config:', err));
  }, [storeSlug]);

  // Inject Facebook Pixel (supports multiple comma-separated IDs)
  useEffect(() => {
    if (!config?.facebook_pixel_id || !config.is_facebook_enabled) return;

    // Support storing multiple pixel IDs as comma-separated values
    const ids = String(config.facebook_pixel_id).split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return;

    // Check if fbq already loaded - initialize each id and track pageview
    if (window.fbq) {
      ids.forEach(id => {
        try { window.fbq('init', id); } catch (e) { /* ignore */ }
      });
      try { window.fbq('track', 'PageView'); } catch (e) { /* ignore */ }
      return;
    }

    // Facebook Pixel base code (load once) then init all ids
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
    `;
    document.head.appendChild(script);

    // Initialize each pixel id and fire pageview
    ids.forEach(id => {
      try { window.fbq('init', id); } catch (e) { /* ignore */ }
    });
    try { window.fbq('track', 'PageView'); } catch (e) { /* ignore */ }

    // Add noscript fallbacks for each id
    const noscript = document.createElement('noscript');
    ids.forEach(id => {
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
    });
    document.body.appendChild(noscript);

    console.log('[Pixel] Facebook Pixel initialized:', ids.join(','));

    return () => {
      // Cleanup not required in most SPA flows
    };
  }, [config?.facebook_pixel_id, config?.is_facebook_enabled]);

  // Inject TikTok Pixel (supports multiple comma-separated IDs)
  useEffect(() => {
    if (!config?.tiktok_pixel_id || !config.is_tiktok_enabled) return;

    const ids = String(config.tiktok_pixel_id).split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return;

    // If ttq exists, load/instantiate each id
    if (window.ttq) {
      ids.forEach(id => {
        try { window.ttq.load(id); } catch (e) { /* ignore */ }
      });
      try { window.ttq.page(); } catch (e) { /* ignore */ }
      return;
    }

    // TikTok Pixel base code (load once) then load each id
    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
    `;
    document.head.appendChild(script);

    ids.forEach(id => {
      try { window.ttq.load(id); } catch (e) { /* ignore */ }
    });
    try { window.ttq.page(); } catch (e) { /* ignore */ }

    console.log('[Pixel] TikTok Pixel initialized:', ids.join(','));

    return () => {
      // Cleanup not required
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

/**
 * Send event to our backend for statistics tracking
 * Only sends ONE event per call (not duplicated per pixel type)
 */
function trackToBackend(storeSlug: string, eventName: string, params?: Record<string, any>) {
  if (!storeSlug) return;

  const pixelType = backendPixelTypePreference || 'facebook';

  const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
  const utm_source = url?.searchParams.get('utm_source') || '';
  const utm_medium = url?.searchParams.get('utm_medium') || '';
  const utm_campaign = url?.searchParams.get('utm_campaign') || '';
  const fbclid = url?.searchParams.get('fbclid') || '';
  const ttclid = url?.searchParams.get('ttclid') || '';
  const gclid = url?.searchParams.get('gclid') || '';

  const referrer = typeof document !== 'undefined' ? document.referrer || '' : '';
  const refLower = (referrer || '').toLowerCase();
  const derivedSource =
    utm_source ||
    (fbclid || refLower.includes('facebook.com') || refLower.includes('fb.com') ? 'facebook' : '') ||
    (ttclid || refLower.includes('tiktok.com') ? 'tiktok' : '') ||
    (gclid ? 'google' : '') ||
    'direct';
  
  fetch('/api/pixels/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      store_slug: storeSlug,
      pixel_type: pixelType,
      event_name: eventName,
      event_data: {
        ...(params || {}),
        page_path: typeof window !== 'undefined' ? window.location.pathname : '',
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        fbclid,
        ttclid,
        gclid,
        source: derivedSource,
      },
      page_url: window.location.href,
      product_id: params?.content_ids?.[0],
      order_id: params?.order_id,
      revenue: params?.value,
      currency: params?.currency || 'DZD',
      session_id: getSessionId(),
      visitor_id: getVisitorId()
    })
  }).catch(err => console.error('[Pixel] Backend tracking failed:', err));
}

/**
 * Track PageView - only one event per page navigation
 */
function trackPageView(storeSlug: string) {
  trackToBackend(storeSlug, 'PageView', { page_url: window.location.href });
}

// Get or create session ID (per browser session)
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('pixel_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('pixel_session_id', sessionId);
  }
  return sessionId;
}

// Get or create visitor ID (persistent across sessions)
function getVisitorId(): string {
  let visitorId = localStorage.getItem('pixel_visitor_id');
  if (!visitorId) {
    visitorId = 'vis_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('pixel_visitor_id', visitorId);
  }
  return visitorId;
}

// Store the current store slug for backend tracking
let currentStoreSlug = '';

// Used to choose the backend pixel_type for analytics buckets.
// We intentionally keep ONE backend record per event.
let backendPixelTypePreference: 'facebook' | 'tiktok' | '' = '';

function setBackendPixelPreferenceFromConfig(data: PixelConfig) {
  if (data?.is_facebook_enabled && data?.facebook_pixel_id) {
    backendPixelTypePreference = 'facebook';
    return;
  }
  if (data?.is_tiktok_enabled && data?.tiktok_pixel_id) {
    backendPixelTypePreference = 'tiktok';
    return;
  }
  backendPixelTypePreference = '';
}

export function setCurrentStoreSlug(slug: string) {
  currentStoreSlug = slug;
  // Also save to localStorage for other pages
  if (slug) localStorage.setItem('currentStoreSlug', slug);
}

export function trackAllPixels(eventName: string, params?: Record<string, any>) {
  // Track to Facebook and TikTok SDKs (client-side)
  trackFacebookEvent(eventName, params);
  trackTikTokEvent(eventName, params);
  
  // Track to our backend for statistics (only ONE event, not duplicated)
  const storeSlug = currentStoreSlug || localStorage.getItem('currentStoreSlug') || '';
  if (storeSlug && eventName !== 'PageView') {
    // PageView is handled separately with deduplication
    trackToBackend(storeSlug, eventName, params);
  }
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
