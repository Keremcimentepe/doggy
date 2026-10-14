import { useEffect, useState } from 'react';

type ApiState = 'checking' | 'online' | 'offline';

const apiLabel: Record<ApiState, string> = {
  checking: 'Checking API…',
  online: 'API online',
  offline: 'API offline',
};

export function App() {
  const [api, setApi] = useState<ApiState>('checking');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then((response) => setApi(response.ok ? 'online' : 'offline'))
      .catch(() => {
        if (!controller.signal.aborted) setApi('offline');
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          <h1>Doggy</h1>
        </a>
        <span className={`status status--${api}`} role="status">
          {apiLabel[api]}
        </span>
      </header>
      <main className="placeholder">
        <p className="eyebrow">Under construction</p>
        <p className="lede">Videos worth a wag. The first feed lands in phase&nbsp;1.</p>
      </main>
    </div>
  );
}
