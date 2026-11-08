const STORAGE_KEY = 'device_fingerprint';

let cachedFingerprint: string | null = null;
let loadingPromise: Promise<string> | null = null;

function createFallbackId(): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  return `fb_${rand}`;
}

/**
 * 取得瀏覽器持久 fingerprint（優先 FingerprintJS，失敗則本地生成並緩存）
 */
export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  const stored = uni.getStorageSync(STORAGE_KEY);
  if (stored && typeof stored === 'string') {
    cachedFingerprint = stored;
    return stored;
  }

  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    let visitorId = '';

    if (typeof window !== 'undefined') {
      try {
        const { load } = await import('@fingerprintjs/fingerprintjs');
        const agent = await load();
        const result = await agent.get();
        visitorId = result.visitorId;
      } catch (e) {
        console.warn('FingerprintJS load failed, using fallback id', e);
      }
    }

    if (!visitorId) {
      visitorId = createFallbackId();
    }

    cachedFingerprint = visitorId;
    uni.setStorageSync(STORAGE_KEY, visitorId);
    return visitorId;
  })().finally(() => {
    loadingPromise = null;
  });

  return loadingPromise;
}

/** visitor_id = userId_fingerprint */
export async function buildVisitorId(userId: string | number | undefined | null): Promise<string> {
  const fingerprint = await getFingerprint();
  const id = userId === undefined || userId === null || userId === '' ? '0' : String(userId);
  return `${id}_${fingerprint}`;
}

/** 為客服連結追加 visitor_id */
export function appendVisitorIdToUrl(url: string, visitorId: string): string {
  if (!url) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}visitor_id=${visitorId}`;
}
