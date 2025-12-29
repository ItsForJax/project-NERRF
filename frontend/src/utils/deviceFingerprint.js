/**
 * Generate a device fingerprint based on browser characteristics
 * This creates a semi-unique identifier for the device/browser
 */

const generateDeviceFingerprint = async () => {
  const components = [];

  // Screen resolution
  components.push(`${window.screen.width}x${window.screen.height}`);
  components.push(`${window.screen.colorDepth}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform);

  // User Agent
  components.push(navigator.userAgent);

  // Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency || 'unknown');

  // Device memory (if available)
  components.push(navigator.deviceMemory || 'unknown');

  // Touch support
  components.push(navigator.maxTouchPoints || 0);

  // Canvas fingerprint (generates a unique signature based on how the browser renders)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Device Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device Fingerprint', 4, 17);

    components.push(canvas.toDataURL());
  } catch (e) {
    components.push('canvas-error');
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    components.push('webgl-error');
  }

  // Create hash from all components
  const fingerprint = await hashString(components.join('|||'));

  // Store in localStorage for consistency
  try {
    const stored = localStorage.getItem('device_fingerprint');
    if (stored) {
      return stored;
    }
    localStorage.setItem('device_fingerprint', fingerprint);
  } catch (e) {
    // LocalStorage not available, just use generated fingerprint
  }

  return fingerprint;
};

// Simple hash function using Web Crypto API
const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export default generateDeviceFingerprint;
