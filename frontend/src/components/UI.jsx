import { ArrowUpRight } from 'lucide-react';
import { human } from '../design/api';

export function Action({ children, className = '', ...props }) {
  return <button className={`action ${className}`} {...props}><span>{children}</span><ArrowUpRight size={17} aria-hidden="true" /></button>;
}
export function Status({ value = 'N/A', source, className = '' }) {
  const tone = /FAILED|CRITICAL|P1|OFFLINE|FALSE_ALARM/.test(value) ? 'danger' : /ACTIVE|CONFIRMED|CLEARED|READY|CONNECTED/.test(value) ? 'success' : /VERIFY|FORMING|COMPRESS|SUSPECT|STALE/.test(value) ? 'warning' : '';
  return <span className={`status ${tone} ${className}`}><span aria-hidden="true">●</span>{human(value)}{source && <small className="source">{source}</small>}</span>;
}
export function SectionHead({ index, title, children }) {
  return <div className="section-head"><h2><span className="mono">{index} / </span>{title}</h2>{children}</div>;
}
export function Metric({ index, label, value, source, hint }) {
  return <div className="metric"><span className="eyebrow">{index} / {label}</span><strong key={String(value)} className="metric-value">{value ?? 'N/A'}</strong><span className="metric-note">{hint || source || 'N/A'}{hint && source && <small className="source">{source}</small>}</span></div>;
}
export function Notice({ title, children, error = false, onRetry }) {
  return <div className={`notice ${error ? 'notice-error' : ''}`} role={error ? 'alert' : 'status'}><span className="eyebrow">{title}</span>{children && <p>{children}</p>}{onRetry && <Action onClick={onRetry}>Retry connection</Action>}</div>;
}
export function Tooltip({ label, children }) {
  return <span className="tooltip"><button type="button" aria-label={label} className="help">?</button><span role="tooltip">{children}</span></span>;
}
