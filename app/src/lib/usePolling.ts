/**
 * usePolling – lightweight polling hook for dashboard real-time feel.
 *
 * Calls `fetcher` immediately then at `intervalMs` intervals.
 * Returns { data, error, loading, refresh }.
 * Automatically pauses when the tab is hidden (saves bandwidth).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_INTERVAL = 30_000; // 30 seconds

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs = DEFAULT_INTERVAL,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => doFetch(false), [doFetch]);

  useEffect(() => {
    doFetch(true);

    const start = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => doFetch(false), intervalMs);
    };

    const stop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        doFetch(false);
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [doFetch, intervalMs]);

  return { data, error, loading, refresh };
}
