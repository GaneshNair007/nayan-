import { useEffect, useState } from 'react';
import { Metric, Notice, SectionHead, Status, Tooltip } from './UI';
import { request, number, human } from '../design/api';
export default function EmergencyCorridorView({ resources, auditEvents, corridorPlan }) {
  const [selectedId, setSelectedId] = useState(null), [remotePlan, setRemotePlan] = useState(null), [error, setError] = useState(''), [pendingId, setPendingId] = useState(null);
  const ids = [...new Set([corridorPlan?.id, ...auditEvents.map(event => event.details?.corridor_id)].filter(Boolean))];
  const id = ids.includes(selectedId) ? selectedId : ids[0];
  const plan = id === corridorPlan?.id ? corridorPlan : remotePlan?.id === id ? remotePlan : null;
  useEffect(() => {
    if (!id || id === corridorPlan?.id) return;
    let disposed = false, timer;
    const controller = new AbortController();
    const poll = async () => {
      try { const next = await request(`/api/corridors/${id}`, { signal: controller.signal }); if (!disposed) { setRemotePlan(next); setError(''); } }
      catch (failure) { if (!disposed) setError(failure.message); }
      finally { if (!disposed) { setPendingId(id); timer = setTimeout(poll, 3000); } }
    };
    poll(); return () => { disposed = true; controller.abort(); clearTimeout(timer); };
  }, [id, corridorPlan?.id]);
  return <div className="corridor-layout"><aside><SectionHead index="01" title="RESPONSE FLEET" /><div className="selector-list">{resources.map(resource => <div className="selector" key={resource.id}><span className="selector-title">{resource.id}</span><small>{resource.callsign}</small><Status value={resource.status} source={resource.provenance} /><small>{resource.location?.address}</small></div>)}</div>
    {ids.length > 1 && <><SectionHead index="02" title="CORRIDOR PLANS" />{ids.map(item => <button key={item} className="selector" aria-pressed={id === item} onClick={() => setSelectedId(item)}>{item}</button>)}</>}
  </aside><section>{id && pendingId !== id && !plan && <Notice title="READING CORRIDOR PLAN" />}{error && <Notice error title="CORRIDOR UNAVAILABLE">{error}</Notice>}{!plan ? <Notice title="NO CORRIDOR PLANNED">Open a confirmed incident, acknowledge it, request its response plan, authorize it and dispatch a resource. The backend then creates the corridor.</Notice> : <>
    <div className="corridor-head"><div><span className="eyebrow muted">{plan.id}</span><h2>{plan.resource_id}</h2></div><Status value={plan.status} source={plan.provenance} /></div>
    <div className="metrics" style={{ marginTop: 25 }}><Metric index="01" label="ROUTE DURATION" value={number(plan.route?.duration_seconds, 0, ' s')} source={plan.route?.provenance} /><Metric index="02" label="DISTANCE" value={number(plan.route?.distance_meters, 0, ' m')} source={plan.route?.provenance} /><Metric index="03" label="SEGMENTS" value={plan.segment_sequence?.length} source={plan.provenance} /><Metric index="04" label="ROUTING" value={plan.is_rerouted ? 'REROUTED' : 'DIRECT'} source={plan.provenance} /></div>
    <SectionHead index="02" title="DYNAMIC GRID SLICING"><Tooltip label="Explain corridor clearance">Backend simulation reports each segment’s available passage width and compression state. Cell occupancy is not supplied, so the marks show segment states rather than measured vehicle positions.</Tooltip></SectionHead>
    <p className="eyebrow muted">SEGMENT STATE DIAGRAM / CELL OCCUPANCY UNAVAILABLE / SIMULATION ONLY</p>
    <div className="segments">{plan.segment_sequence?.map(segment => <section key={segment.segment_id} className={`segment ${segment.traffic_compression_state === 'FAILED' ? 'danger' : segment.traffic_compression_state === 'CLEARED' ? 'success' : 'warning'}`}><span className="eyebrow">{segment.camera_id || 'CAMERA N/A'}</span><h3>{segment.segment_id}</h3><div className="segment-symbol" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div><Status value={segment.traffic_compression_state} /><div className="clearance">{number(segment.clearance_width_meters, 1, 'm')}</div><p>{human(segment.upstream_signal_state)}</p><p>CCTV FLAG / {segment.verified_by_cctv ? 'VERIFIED BY BACKEND' : 'NOT VERIFIED'}</p><small className="source">{plan.provenance}</small></section>)}</div>
    {plan.is_rerouted && <Notice title="ROUTE REVISED">The backend marked this corridor as rerouted. Inspect failed segments and their clearance before relying on the proposed route.</Notice>}
    <SectionHead index="03" title="JUNCTION PRE-CLEAR SEQUENCE" /><div className="route-timeline">{plan.junction_sequence?.map(junction => <div className="route-stop" key={junction.junction_id}><h3>{junction.junction_id}</h3><Status value={junction.readiness} /><p>{junction.junction_name}</p><p className="mono">ETA {number(junction.eta_seconds, 0, ' s')}</p></div>)}</div>
    <SectionHead index="04" title="DESTINATION" /><p className="muted">{plan.route?.destination?.address || 'N/A'}</p><p className="eyebrow muted" style={{ marginTop: 22 }}>EXTEND / RELEASE CONTROLS ARE NOT AVAILABLE IN THE CURRENT BACKEND</p>
  </>}</section></div>;
}
