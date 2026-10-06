import { useEffect, useState } from 'react';

const FALLBACK_RATE = 3925;
const CACHE_KEY = 'print-garage-usd-ugx-rate';
const CACHE_TTL = 24 * 60 * 60 * 1000;

type RatePayload = {
  rate: number;
  date: string;
  source: string;
};

type CachedRate = RatePayload & { savedAt: number };

function readCache(): RatePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedRate;
    if (Date.now() - cached.savedAt > CACHE_TTL || !cached.rate) return null;
    return { rate: cached.rate, date: cached.date, source: cached.source };
  } catch {
    return null;
  }
}

function writeCache(payload: RatePayload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }));
  } catch {
    // Storage can be unavailable in private browsing; the live result still works.
  }
}

export function useExchangeRate() {
  // Match prerendered HTML on first render, regardless of browser cache or
  // the day the static page is viewed. Restore cache only after hydration.
  const [payload, setPayload] = useState<RatePayload>({
    rate: FALLBACK_RATE,
    date: '',
    source: 'fallback',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setPayload(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const endpoints = [
        async (): Promise<RatePayload | null> => {
          const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          if (!response.ok) return null;
          const data = await response.json() as { rates?: { UGX?: number }; date?: string };
          const rate = data.rates?.UGX;
          if (!rate) return null;
          return {
            rate,
            date: data.date
              ? new Intl.DateTimeFormat('en-UG', { timeZone: 'Africa/Kampala', dateStyle: 'medium' }).format(new Date(`${data.date}T12:00:00Z`))
              : new Intl.DateTimeFormat('en-UG', { timeZone: 'Africa/Kampala', dateStyle: 'medium' }).format(new Date()),
            source: 'ExchangeRate-API',
          };
        },
        async (): Promise<RatePayload | null> => {
          const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=UGX');
          if (!response.ok) return null;
          const data = await response.json() as { rates?: { UGX?: number }; date?: string };
          const rate = data.rates?.UGX;
          if (!rate) return null;
          return {
            rate,
            date: data.date
              ? new Intl.DateTimeFormat('en-UG', { timeZone: 'Africa/Kampala', dateStyle: 'medium' }).format(new Date(`${data.date}T12:00:00Z`))
              : new Intl.DateTimeFormat('en-UG', { timeZone: 'Africa/Kampala', dateStyle: 'medium' }).format(new Date()),
            source: 'Frankfurter',
          };
        },
      ];

      let result: RatePayload | null = null;
      for (const endpoint of endpoints) {
        try {
          result = await endpoint();
          if (result) break;
        } catch {
          // Try the next source, then use the transparent guide fallback.
        }
      }
      const next = result ?? {
        rate: FALLBACK_RATE,
        date: new Intl.DateTimeFormat('en-UG', { timeZone: 'Africa/Kampala', dateStyle: 'medium' }).format(new Date()),
        source: 'guide fallback',
      };
      if (!cancelled) {
        setPayload(next);
        setLoading(false);
        if (result) writeCache(result);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  return { ...payload, loading, fallbackRate: FALLBACK_RATE };
}