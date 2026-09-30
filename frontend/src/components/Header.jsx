import { useEffect, useState } from 'react';
import { Status } from './UI';
export default function Header({ capabilities, wsConnected, lastEventAt, onHome }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const age = lastEventAt ? Math.max(0, (now - lastEventAt) / 1000) : null;
  return <header className="app-header">
    <button className="brand" onClick={onHome} aria-label="NAYAN home"><span className="brand-mark" aria-hidden="true" />NAYAN</button>
    <div className="header-status">
      <span className="eyebrow">DEMO / SIMULATION</span>
      <span className="eyebrow hardware">{capabilities?.gpu?.device?.toUpperCase() || 'HARDWARE / N/A'}</span>
      <Status value={wsConnected ? 'CONNECTED' : 'RECONNECTING'} />
      <span className="eyebrow muted">{age === null ? 'NO EVENTS YET' : age > 5 ? `EVENT DATA STALE / ${Math.round(age)}S` : `LAST EVENT / ${age.toFixed(1)}S`}</span>
      <time className="header-clock" dateTime={new Date(now).toISOString()}>{new Date(now).toLocaleTimeString('en-GB', { timeZone: 'UTC' })} UTC</time>
    </div>
  </header>;
}
