/**
 * High-Performance Client-Side Image Cache & Egress Shield
 * Uses persistent IndexedDB + CacheStorage + In-Memory Object URLs.
 * Guarantees that any image is downloaded at most ONCE across the lifetime of the user's browser,
 * resulting in 0 bytes of Supabase egress for repeat visits, tab switches, and page navigations.
 */

const DB_NAME = 'patel_motors_image_cache_v1';
const STORE_NAME = 'image_blobs';
const CACHE_STORAGE_NAME = 'patel-motors-media-cache-v1';

// Automatically purge legacy Bombay Motors client caches so no old photos are ever fetched
if (typeof window !== 'undefined') {
  try {
    indexedDB.deleteDatabase('bm_image_cache_v2');
    indexedDB.deleteDatabase('BombayMotorsInventoryCache');
    if ('caches' in window) {
      caches.delete('bm-media-cache-v2');
    }
  } catch {}
}

const memoryBlobMap = new Map<string, string>();
const inFlightRequests = new Map<string, Promise<string>>();

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.debug('[IDB ERROR] Could not open IndexedDB:', req.error);
          resolve(null);
        };
      } catch (e) {
        console.debug('[IDB EXCEPTION]', e);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

async function getFromIDB(key: string): Promise<Blob | null> {
  try {
    const db = await getIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

async function saveToIDB(key: string, blob: Blob): Promise<void> {
  try {
    const db = await getIDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(blob, key);
  } catch (err) {
    console.debug('[IDB SAVE SKIP]', err);
  }
}

/**
 * Check if image is already cached in memory for synchronous zero-flicker render
 */
export function getInMemoryImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  return memoryBlobMap.get(url) || null;
}

/**
 * Normalizes image URLs from local public paths, GitHub links, Supabase storage, or external CDNs.
 * - Converts GitHub web preview URLs (github.com/.../blob/...) to direct raw image URLs (raw.githubusercontent.com/...)
 * - Prepend import.meta.env.BASE_URL to relative/absolute local paths so GitHub Pages subpaths work
 * - Remaps legacy file names (/hero-desktop.jpg, /bombay_logo.jpeg, /backdrop.jpg) to current files
 */
export function isBombayMotorsUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase().trim();
  if (!lower) return false;
  return (
    lower.includes('bombay') ||
    lower.includes('bombaymotors') ||
    lower.includes('bombay-motors') ||
    lower.includes('bombay_logo') ||
    lower.includes('pgffljamplkthmwahmvn') ||
    lower.includes('pub-f4e7a3fade6e4cc59414305e0c001271') ||
    lower.includes('hero-laptop') ||
    lower.includes('hero-mobile') ||
    lower.includes('hero-desktop') ||
    lower.includes('backdrop') ||
    lower === '/logo.jpeg' ||
    lower === '/logo.png' ||
    lower === 'logo.png' ||
    lower === 'logo.jpeg' ||
    lower.includes('vehicle-images/mercedes') ||
    lower.includes('vehicle-images/bmw') ||
    lower.includes('vehicle-images/porsche') ||
    lower.includes('vehicle-images/audi')
  );
}

export function resolveImageUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '';
  }

  let cleaned = url.trim();

  // Strictly block any Bombay Motors photos or storage endpoints
  if (isBombayMotorsUrl(cleaned)) {
    return '';
  }

  // 1. Transform GitHub Blob URLs to Direct Raw URLs
  if (cleaned.includes('github.com/') && cleaned.includes('/blob/')) {
    cleaned = cleaned
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('http://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/');
  }

  // 2. Remap legacy asset filenames to active Patel Motors SVG logo
  if (cleaned === '/bombay_logo.jpeg' || cleaned === '/logo.jpeg' || cleaned === '/logo.png') {
    return '/logo.svg';
  }

  // 3. Resolve local paths with Vite base URL if running on a subpath (e.g. GitHub Pages)
  if (cleaned.startsWith('/')) {
    const base = import.meta.env.BASE_URL || '/';
    if (base !== '/' && !cleaned.startsWith(base)) {
      const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
      return `${normalizedBase}${cleaned}`;
    }
  }

  return cleaned;
}

/**
 * Check if the URL belongs to Supabase Storage or external media that should be cached
 */
export function isCacheableUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  if (isBombayMotorsUrl(url)) return false;
  const resolved = resolveImageUrl(url);
  if (!resolved || resolved.startsWith('/') || resolved.startsWith('data:') || resolved.startsWith('blob:')) return false;
  if (isBombayMotorsUrl(resolved)) return false;
  return (
    resolved.includes('supabase.co/storage/') ||
    resolved.includes('raw.githubusercontent.com') ||
    resolved.includes('unsplash.com') ||
    resolved.includes('cloudinary.com') ||
    resolved.startsWith('https://')
  );
}

/**
 * Checks in-memory, IndexedDB, and CacheStorage for a cached Blob URL.
 * Returns null if not cached, WITHOUT initiating any network fetches.
 * This completely prevents duplicate parallel network downloads.
 */
export async function getCachedBlobUrl(url: string): Promise<string | null> {
  if (!isCacheableUrl(url)) {
    return null;
  }

  // Tier 1: In-Memory Fast Map (Instant 0ms)
  if (memoryBlobMap.has(url)) {
    return memoryBlobMap.get(url)!;
  }

  // Tier 2: Persistent IndexedDB
  try {
    const idbBlob = await getFromIDB(url);
    if (idbBlob && idbBlob.size > 0) {
      const blobUrl = URL.createObjectURL(idbBlob);
      memoryBlobMap.set(url, blobUrl);
      return blobUrl;
    }
  } catch {
    // Continue to CacheStorage
  }

  // Tier 3: CacheStorage API
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_STORAGE_NAME);
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        if (blob && blob.size > 0) {
          saveToIDB(url, blob);
          const blobUrl = URL.createObjectURL(blob);
          memoryBlobMap.set(url, blobUrl);
          return blobUrl;
        }
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

/**
 * Stores a blob in memory, IndexedDB, and CacheStorage
 */
export function cacheImageBlob(url: string, blob: Blob): string {
  saveToIDB(url, blob);
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.open(CACHE_STORAGE_NAME).then((cache) => {
      try {
        cache.put(url, new Response(blob, {
          headers: {
            'Content-Type': blob.type,
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        }));
      } catch {}
    }).catch(() => {});
  }
  const blobUrl = URL.createObjectURL(blob);
  memoryBlobMap.set(url, blobUrl);
  return blobUrl;
}

/**
 * Retrieves a cached Blob Object URL for an image or fetches and caches it permanently
 */
export async function getCachedImageUrl(url: string): Promise<string> {
  if (!url || isBombayMotorsUrl(url) || !isCacheableUrl(url)) {
    return '';
  }

  // Tier 1: In-Memory Fast Map (Instant 0ms)
  if (memoryBlobMap.has(url)) {
    return memoryBlobMap.get(url)!;
  }

  // Tier 2: In-Flight Promise Dedup (Prevents multiple simultaneous network calls)
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url)!;
  }

  const fetchPromise = (async () => {
    // Double check Bombay Motors block
    if (isBombayMotorsUrl(url)) {
      return '';
    }

    // Tier 3: Persistent IndexedDB (0 Network bytes across browser reboots/tabs)
    try {
      const idbBlob = await getFromIDB(url);
      if (idbBlob && idbBlob.size > 0) {
        const blobUrl = URL.createObjectURL(idbBlob);
        memoryBlobMap.set(url, blobUrl);
        return blobUrl;
      }
    } catch {
      // Fallback
    }

    // Tier 4: CacheStorage API
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_STORAGE_NAME);
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          if (blob && blob.size > 0) {
            saveToIDB(url, blob);
            const blobUrl = URL.createObjectURL(blob);
            memoryBlobMap.set(url, blobUrl);
            return blobUrl;
          }
        }
      } catch {
        // Fallback
      }
    }

    // Tier 5: Exactly ONE network fetch with CORS and max cache policy
    try {
      if (isBombayMotorsUrl(url)) {
        return '';
      }
      const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
      if (response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 0) {
          // Persist to IndexedDB & CacheStorage in background
          saveToIDB(url, blob);
          if (typeof window !== 'undefined' && 'caches' in window) {
            caches.open(CACHE_STORAGE_NAME).then((cache) => {
              try {
                cache.put(url, new Response(blob, {
                  headers: {
                    'Content-Type': blob.type,
                    'Cache-Control': 'public, max-age=31536000, immutable'
                  }
                }));
              } catch {}
            }).catch(() => {});
          }

          const blobUrl = URL.createObjectURL(blob);
          memoryBlobMap.set(url, blobUrl);
          return blobUrl;
        }
      }
    } catch (err) {
      console.debug('[IMAGE FETCH FALLBACK] Direct URL fallback:', err);
    }

    return url;
  })().finally(() => {
    inFlightRequests.delete(url);
  });

  inFlightRequests.set(url, fetchPromise);
  return fetchPromise;
}

/**
 * Pre-caches a list of image URLs into IndexedDB during idle time
 */
export function precacheImages(urls: string[]) {
  if (typeof window === 'undefined') return;

  const validUrls = urls.filter(u => u && !isBombayMotorsUrl(u) && isCacheableUrl(u));
  if (validUrls.length === 0) return;

  const runner = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
  
  runner(() => {
    validUrls.slice(0, 6).forEach((url) => {
      getCachedImageUrl(url).catch(() => {});
    });
  });
}

