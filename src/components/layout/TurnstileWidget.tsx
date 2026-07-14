import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void },
      ) => string;
    };
  }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

let scriptLoadPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Turnstile script'));
      document.head.appendChild(script);
    });
  }
  return scriptLoadPromise;
}

/**
 * Renders Cloudflare Turnstile and reports the verification token via {@link onToken}. Falls
 * back to a plain notice (no widget) when {@code VITE_TURNSTILE_SITE_KEY} is unset — the backend's
 * CaptchaVerifier is equally permissive until its own secret key is configured, so local/dev
 * submissions still work end-to-end without either side having real keys yet.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: onToken,
          'error-callback': () => setLoadFailed(true),
        });
      })
      .catch(() => setLoadFailed(true));
    return () => {
      cancelled = true;
    };
  }, [onToken]);

  if (!SITE_KEY) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
        CAPTCHA is not configured for this environment — submissions go through unverified (dev only).
      </p>
    );
  }

  if (loadFailed) {
    return <p className="text-xs text-red-600">Couldn&apos;t load the verification widget. Please refresh and try again.</p>;
  }

  return <div ref={containerRef} />;
}
