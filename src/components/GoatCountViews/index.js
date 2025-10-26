import React, {useEffect, useState} from 'react';
import LogoIcon from '@site/src/components/LogoIcon';

export default function GoatCounterViews({path: explicitPath}) {
  const [text, setText] = useState(null);

  useEffect(() => {
    let done = false;
    const controller = new AbortController();

    const locale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    const format = n => new Intl.NumberFormat(locale).format(n);

    const normalizePath = (p) => {
      if (!p) return p;
      try {
        const u = new URL(p, location.origin);
        return u.pathname + u.search;
      } catch {
        return p;
      }
    };

    const getBase = () => {
      const el = document.querySelector('script[data-goatcounter]');
      const data = el?.getAttribute('data-goatcounter');
      if (data) {
        try {
          const u = new URL(data);               // https://SUB.goatcounter.com/count
          return `${u.protocol}//${u.host}`;     // https://SUB.goatcounter.com
        } catch {}
      }
      return null;
    };

    const getPath = () => {
      if (explicitPath) return normalizePath(explicitPath);
      try {
        const p = window.goatcounter?.get_data?.()?.p;
        if (p) return p;
      } catch {}
      return location.pathname;
    };

    (async () => {
      try {
        const base = getBase();
        const path = getPath();
        if (!base || !path) throw new Error('missing base or path');

        const res = await fetch(`${base}/counter/${encodeURIComponent(path)}.json`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store',
          signal: controller.signal,
        });
  // 404 case: unknown path in GoatCounter -> page never seen in production
        if (res.status === 404) {
          const isLocal = /^(localhost|127\.0\.0\.1|::1)$/i.test(location.hostname);
            if (!done) setText('New!');
          done = true;
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();

          const digits = String(json?.count ?? '').replace(/\D/g, '');
          if (digits) {
            const value = Number(digits);
            if (done) return;
            // Rule: < 100 => "New!", otherwise formatted value
            setText(value < 100 ? 'New!' : format(value));
            done = true;
            return;
          }
          throw new Error('empty count');
      } catch (e) {
        // Abort: do nothing
        if (e?.name === 'AbortError') return;
        // Other errors (network, blocking, CORS, etc.)
        setTimeout(() => {
          if (done) return;
          const isLocal = /^(localhost|127\.0\.0\.1|::1)$/i.test(location.hostname);
          // In dev: show 0 for visibility; in prod: render nothing (null) when unavailable/blocked
          setText(isLocal ? format(0) : null);
          done = true;
        }, 300);
      }
    })();

    return () => {
      done = true;
      controller.abort();
    };
  }, [explicitPath]);

  if (text == null) return null;

  return (
    <span aria-label="views" title="views">
      <LogoIcon name="twemoji:eyes" size={12} />{' '}{text}
    </span>
  );
}