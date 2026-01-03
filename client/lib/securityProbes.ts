/**
 * Client-Side Security Probes
 * 
 * Collects browser fingerprint and detects:
 * - WebRTC IP leaks
 * - Canvas/WebGL fingerprint
 * - Audio fingerprint
 * - Incognito mode
 * - Bot indicators
 * 
 * Sends data to /api/intel/fingerprint
 */

// Generate a hash from string
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// Generate visitor ID from multiple fingerprint components
async function generateVisitorId(components: Record<string, any>): Promise<string> {
  const str = JSON.stringify(components);
  return await hashString(str);
}

// Get WebRTC IPs (detects VPN leaks)
async function getWebRTCIPs(): Promise<{ localIP: string | null; publicIP: string | null }> {
  return new Promise((resolve) => {
    const result = { localIP: null as string | null, publicIP: null as string | null };
    
    try {
      const RTCPeerConnection = (window as any).RTCPeerConnection || 
                                (window as any).webkitRTCPeerConnection || 
                                (window as any).mozRTCPeerConnection;
      
      if (!RTCPeerConnection) {
        resolve(result);
        return;
      }
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      const timeout = setTimeout(() => {
        pc.close();
        resolve(result);
      }, 3000);
      
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        
        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
        
        if (ipMatch) {
          const ip = ipMatch[0];
          // Check if private IP
          if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
            result.localIP = ip;
          } else if (ip !== '0.0.0.0') {
            result.publicIP = ip;
          }
        }
      };
      
      pc.createDataChannel('probe');
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(() => {
          clearTimeout(timeout);
          pc.close();
          resolve(result);
        });
      
      // Give some time for ICE candidates
      setTimeout(() => {
        clearTimeout(timeout);
        pc.close();
        resolve(result);
      }, 2500);
      
    } catch (err) {
      resolve(result);
    }
  });
}

// Canvas fingerprint
async function getCanvasFingerprint(): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Draw various elements
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('sahla-E FP 🔒', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Security Probe', 4, 35);
    
    const dataURL = canvas.toDataURL();
    return await hashString(dataURL);
  } catch {
    return null;
  }
}

// WebGL fingerprint
function getWebGLFingerprint(): { hash: string | null; vendor: string | null; renderer: string | null } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return { hash: null, vendor: null, renderer: null };
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null;
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null;
    
    return {
      hash: null, // Could compute full hash but vendor/renderer is usually enough
      vendor: vendor || null,
      renderer: renderer || null,
    };
  } catch {
    return { hash: null, vendor: null, renderer: null };
  }
}

// Audio fingerprint
async function getAudioFingerprint(): Promise<string | null> {
  // Audio fingerprinting triggers browser warnings in modern Chrome:
  // - ScriptProcessorNode is deprecated (AudioWorklet recommended)
  // - AudioContext often requires a user gesture to start
  // For now, skip this probe to keep the console clean and avoid noisy warnings.
  return null;

  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return null;
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const processor = context.createScriptProcessor(4096, 1, 1);
    
    gain.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(processor);
    processor.connect(gain);
    gain.connect(context.destination);
    
    oscillator.start(0);
    
    return new Promise((resolve) => {
      setTimeout(async () => {
        const array = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(array);
        oscillator.stop();
        context.close();
        
        const hash = await hashString(array.slice(0, 100).toString());
        resolve(hash);
      }, 100);
    });
  } catch {
    return null;
  }
}

// Detect incognito mode
async function detectIncognito(): Promise<boolean> {
  // Chrome/Edge
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { quota } = await navigator.storage.estimate();
    if (quota && quota < 120000000) return true;
  }
  
  // Firefox
  try {
    const db = indexedDB.open('test');
    db.onerror = () => true;
  } catch {
    return true;
  }
  
  return false;
}

// Detect bot indicators
function detectBot(): number {
  let score = 0;
  
  // No plugins
  if (navigator.plugins.length === 0) score += 0.2;
  
  // Webdriver
  if ((navigator as any).webdriver) score += 0.5;
  
  // PhantomJS
  if ((window as any).callPhantom || (window as any)._phantom) score += 0.5;
  
  // Headless Chrome
  if (/HeadlessChrome/.test(navigator.userAgent)) score += 0.5;
  
  // No languages
  if (!navigator.languages || navigator.languages.length === 0) score += 0.2;
  
  // Selenium
  if ((document as any).__selenium_unwrapped || (document as any).__webdriver_evaluate) score += 0.5;
  
  return Math.min(1, score);
}

// Get all fonts (simplified)
async function getFontsFingerprint(): Promise<string | null> {
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Lucida Console'
  ];
  
  const detected: string[] = [];
  
  for (const font of testFonts) {
    try {
      const loaded = await (document as any).fonts?.check?.(`12px "${font}"`);
      if (loaded) detected.push(font);
    } catch {
      // Font API not available
    }
  }
  
  if (detected.length === 0) return null;
  return await hashString(detected.join(','));
}

export interface FingerprintData {
  visitor_id: string;
  platform: string;
  screen_resolution: string;
  timezone: string;
  language: string;
  color_depth: number;
  hardware_concurrency: number;
  device_memory: number | null;
  touch_support: boolean;
  canvas_hash: string | null;
  webgl_vendor: string | null;
  webgl_renderer: string | null;
  audio_hash: string | null;
  fonts_hash: string | null;
  webrtc_local_ip: string | null;
  webrtc_public_ip: string | null;
  confidence_score: number;
  bot_probability: number;
  incognito_detected: boolean;
}

// Main fingerprint collection function
export async function collectFingerprint(): Promise<FingerprintData> {
  const [webrtc, canvas, webgl, audio, fonts, incognito] = await Promise.all([
    getWebRTCIPs(),
    getCanvasFingerprint(),
    Promise.resolve(getWebGLFingerprint()),
    getAudioFingerprint(),
    getFontsFingerprint(),
    detectIncognito(),
  ]);
  
  const botProbability = detectBot();
  
  const components = {
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory || null,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    canvas,
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    audio,
  };
  
  const visitorId = await generateVisitorId(components);
  
  // Confidence based on how many components we collected
  let confidence = 0.5;
  if (canvas) confidence += 0.1;
  if (webgl.vendor) confidence += 0.1;
  if (audio) confidence += 0.1;
  if (fonts) confidence += 0.1;
  if (webrtc.publicIP || webrtc.localIP) confidence += 0.1;
  
  return {
    visitor_id: visitorId,
    platform: navigator.platform,
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    color_depth: screen.colorDepth,
    hardware_concurrency: navigator.hardwareConcurrency || 0,
    device_memory: (navigator as any).deviceMemory || null,
    touch_support: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    canvas_hash: canvas,
    webgl_vendor: webgl.vendor,
    webgl_renderer: webgl.renderer,
    audio_hash: audio,
    fonts_hash: fonts,
    webrtc_local_ip: webrtc.localIP,
    webrtc_public_ip: webrtc.publicIP,
    confidence_score: confidence,
    bot_probability: botProbability,
    incognito_detected: incognito,
  };
}

// Send fingerprint to server
export async function sendFingerprint(): Promise<{ ok: boolean; webrtc_leak_detected?: boolean; server_fingerprint?: string }> {
  try {
    const fingerprint = await collectFingerprint();
    
    const response = await fetch('/api/intel/fingerprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fingerprint),
    });
    
    if (!response.ok) {
      console.warn('[SecurityProbe] Failed to send fingerprint:', response.status);
      return { ok: false };
    }
    
    return await response.json();
  } catch (err) {
    console.warn('[SecurityProbe] Error sending fingerprint:', err);
    return { ok: false };
  }
}

// Check current visitor security status
export async function checkSecurityStatus(): Promise<{
  decision: 'allow' | 'block' | 'challenge' | 'flag';
  reason: string | null;
  intel: any;
} | null> {
  try {
    const response = await fetch('/api/intel/check');
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Auto-initialize on page load (can be disabled)
let initialized = false;

export function initSecurityProbes(options?: { autoSend?: boolean }) {
  if (initialized) return;
  initialized = true;
  
  const autoSend = options?.autoSend ?? true;
  
  if (autoSend && typeof window !== 'undefined') {
    // Send fingerprint after page loads
    if (document.readyState === 'complete') {
      setTimeout(() => sendFingerprint(), 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => sendFingerprint(), 1000);
      });
    }
  }
}
