import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Action, Metric, Notice, SectionHead, Status, Tooltip } from './UI';
import { post, request, number, percent, human, downloadJson } from '../design/api';
export default function IncidentDrawer({ incident, resources, onClose, onAuthorizeResponse, onDispatched }) {
  const dialog = useRef(null), heading = useRef(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [timeline, setTimeline] = useState([]), [timelineError, setTimelineError] = useState('');
  const [resourceId, setResourceId] = useState('');
  const confirmed = incident.verification_state === 'CONFIRMED';
  const response = incident.response_state;
  const nextAction = { UNACKNOWLEDGED: ['acknowledge', 'Acknowledge incident'], ACKNOWLEDGED: ['propose-response', 'Request response plan'], RESPONSE_PROPOSED: ['authorize-response', 'Authorize response'], AUTHORIZED: ['dispatch', 'Dispatch & form corridor'] }[response];
  const available = resources.filter(resource => resource.status === 'AVAILABLE');
  useEffect(() => {
    const modal = dialog.current, previous = document.activeElement;
    modal.showModal(); heading.current?.focus();
    return () => { modal.close(); previous?.focus(); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    request(`/api/incidents/${incident.id}/audit`, { signal: controller.signal }).then(setTimeline).catch(failure => { if (!controller.signal.aborted) setTimelineError(failure.message); });
    return () => controller.abort();
  }, [incident.id, response]);
  const act = async () => {
    setBusy(true); setError('');
    try {
      const result = await post(`/api/incidents/${incident.id}/${nextAction[0]}`, nextAction[0] === 'dispatch' ? { resource_id: resourceId || undefined } : undefined);
      if (nextAction[0] === 'dispatch') await onDispatched(result); else await onAuthorizeResponse();
    } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  };
  const exportCase = async () => {
    setBusy(true); setError('');
    try { downloadJson(await request(`/api/incidents/${incident.id}/export`), `nayan-${incident.id}.json`); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  };
  const capsule = incident.evidence_capsule;
  return <dialog ref={dialog} className="drawer" aria-labelledby="incident-title" onCancel={onClose} onClick={event => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right) onClose(); } }}>
    <div className="drawer-head"><div><span className="eyebrow muted">CASE / {incident.id}</span><h2 id="incident-title" ref={heading} tabIndex={-1}>{human(incident.type)}</h2><p className="muted">{incident.title || incident.description}</p></div><button className="icon-button" aria-label="Close incident" onClick={onClose}><X size={18} /></button></div>
    <div className="drawer-state"><div><span className="eyebrow muted">VERIFICATION</span><Status value={incident.verification_state} /></div><div><span className="eyebrow muted">RESPONSE</span><Status value={response} /></div></div>
    <div className="metrics"><Metric index="01" label="CONFIDENCE" value={percent(incident.model_confidence)} source={incident.provenance} /><Metric index="02" label="EVIDENCE" value={percent(incident.evidence_score)} source={incident.provenance} /><Metric index="03" label="SEVERITY" value={incident.severity} /><Metric index="04" label="PRIORITY" value={incident.priority_tier} hint={`${number(incident.priority_score)} / 100`} /></div>
    <SectionHead index="01" title="WHY THIS ALERT EXISTS"><Tooltip label="Explain confidence and evidence">Confidence measures a detector observation. Evidence combines temporal signals. High confidence alone does not confirm the incident.</Tooltip></SectionHead>
    {incident.evidence?.length ? incident.evidence.map(evidence => <div className="evidence-item" key={evidence.id}><h3>{human(evidence.type)}</h3><p>{evidence.source}</p><dl>{Object.entries(evidence.details || {}).map(([key, value]) => <div key={key}><dt>{human(key)}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}</dl><Status value={evidence.provenance} source={`${percent(evidence.confidence_score)} confidence`} /></div>) : <Notice title="NO EVIDENCE AVAILABLE">No supporting signals have been received for this incident.</Notice>}
    <SectionHead index="02" title="IMPACT & PRIORITY" /><div className="evidence-item"><p>{incident.location?.address || 'Location N/A'} / {incident.camera_id}</p><p>Affected lanes: {incident.affected_lanes?.join(', ') || 'N/A'} · Estimated people: {incident.estimated_people_affected ?? 'N/A'}</p>{incident.priority_reasons?.map(reason => <p key={reason}>{reason}</p>)}</div>
    <SectionHead index="03" title="EVIDENCE CAPSULE" /><p className="muted" style={{ fontSize: 11 }}>{capsule?.summary_text || 'Evidence capsule unavailable.'}</p><div className="capsule">{[['Before', capsule?.before_clip_url], ['Event', capsule?.event_clip_url], ['After', capsule?.after_clip_url]].map(([label, url]) => <span key={label} className="eyebrow muted">{label}<br />{url ? 'REFERENCE IN EXPORT' : 'NO CLIP'}</span>)}</div>
    <SectionHead index="04" title="DECISION TRAIL" />{timelineError && <Notice error title="AUDIT UNAVAILABLE">{timelineError}</Notice>}{timeline.map(event => <div className="evidence-item" key={event.id}><time className="eyebrow muted">{event.timestamp?.slice(11, 19)} UTC / {event.actor}</time><p>{event.action}</p><p>{event.previousState || '—'} → {event.nextState || '—'}</p><small className="source">{event.provenance}</small></div>)}
    <div className="drawer-actions"><span className="eyebrow muted">OPERATOR DECISION / SIMULATION ONLY</span>{error && <Notice error title="ACTION FAILED">{error}</Notice>}
      {response === 'AUTHORIZED' && <label className="eyebrow">Available resource<select className="search" value={resourceId} onChange={event => setResourceId(event.target.value)}><option value="">Nearest available</option>{available.map(resource => <option key={resource.id} value={resource.id}>{resource.id} / {resource.callsign}</option>)}</select></label>}
      {nextAction ? <Action className="action-fill" disabled={busy || !confirmed || (response === 'AUTHORIZED' && !available.length)} onClick={act}>{busy ? 'Sending operator decision…' : nextAction[1]}</Action> : <Status value={response} />}
      {!confirmed && <p className="muted" style={{ fontSize: 11 }}>Response actions require a confirmed incident.</p>}
      {response === 'AUTHORIZED' && !available.length && <p className="muted" style={{ fontSize: 11 }}>No available resources. Dispatch is unavailable.</p>}
      <Action disabled={busy} onClick={exportCase}>Export case & evidence</Action>
    </div>
  </dialog>;
}
