import { useState } from 'react';
import { Action, Notice, SectionHead, Status } from './UI';
import { downloadJson } from '../design/api';
export default function AuditView({ auditEvents }) {
  const [query, setQuery] = useState('');
  const filtered = auditEvents.filter(event => [event.action, event.entityId, event.actor, event.reason, event.provenance].some(value => value?.toLowerCase().includes(query.toLowerCase())));
  return <>
    <div className="filter-bar"><label><span className="eyebrow muted" style={{ display: 'block' }}>SEARCH DECISIONS</span><input className="search" type="search" placeholder="Action, incident, operator or source" aria-label="Search audit trail" value={query} onChange={event => setQuery(event.target.value)} /></label><Action onClick={() => downloadJson(filtered, `nayan-audit-${new Date().toISOString().slice(0, 10)}.json`)}>Export {query ? 'filtered ' : ''}JSON</Action></div>
    <SectionHead index="01" title="APPEND-ONLY EVENT RECORD"><span>{filtered.length} RECORDS</span></SectionHead>
    {!filtered.length && <Notice title="NO MATCHING EVENTS">{query ? 'Adjust your search to find another decision.' : 'Start a scenario or make an operator decision to populate the audit trail.'}</Notice>}
    <div className="audit-timeline">{filtered.map(event => <article key={event.id} className="audit-event"><time dateTime={event.timestamp}>{event.timestamp?.slice(11, 19) || 'N/A'}<br />UTC</time><div><h3>{event.action}</h3>{event.reason && <p>{event.reason}</p>}<p className="mono">{event.previousState || '—'} → {event.nextState || '—'}</p><span className="eyebrow muted">{event.entityId || 'N/A'} / {event.source || 'N/A'}</span></div><aside><Status value={event.provenance} /><small>{event.actor || 'N/A'}</small><small>{event.result || 'N/A'}</small></aside></article>)}</div>
  </>;
}
