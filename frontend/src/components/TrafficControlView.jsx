import { useState } from 'react';
import { Action, Notice, SectionHead, Status, Tooltip } from './UI';
import { post, number, percent, human } from '../design/api';
export default function TrafficControlView({ junctions, onRefresh }) {
  const [selected, setSelected] = useState('JNC-02');
  const [recommendation, setRecommendation] = useState(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const junction = junctions.find(item => item.id === selected) || junctions[0];
  const proposal = recommendation?.junction_id === junction?.id ? recommendation : null;
  const proposedPhase = proposal?.recommended_phase || junction?.proposed_phase;
  const recommend = async () => {
    setBusy(true); setError('');
    try { setRecommendation(await post(`/api/junctions/${junction.id}/signal-recommendation`, { override_reason: 'Operator requested adaptive recommendation based on current junction pressure' })); await onRefresh(); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  };
  return <div className="work-layout"><aside><SectionHead index="01" title="JUNCTIONS" /><div className="selector-list">{junctions.map(item => <button key={item.id} className="selector" aria-pressed={item.id === junction?.id} onClick={() => { setSelected(item.id); setError(''); }}><span className="selector-title">{item.id}</span><small>{item.name}</small><Status value={item.mode} source={percent(item.pressure)} /></button>)}</div></aside>
    <section>{!junction ? <Notice title="NO JUNCTION SNAPSHOT">Connect the backend to inspect approaches and recommendations.</Notice> : <>
      <div className="camera-heading"><div><h2>{junction.id} / {junction.name}</h2><p>{human(junction.mode)} / {junction.provenance}</p></div><Status value="SIMULATION ONLY" /></div>
      <SectionHead index="02" title="APPROACH PRESSURE"><Tooltip label="Explain junction pressure">Backend measure of queue and occupancy pressure. A recommendation is separate from applying a physical signal change.</Tooltip></SectionHead>
      <div className="approaches">{junction.approaches.map(approach => <section key={approach.name} className="approach"><h3>{approach.name}</h3><dl><div><dt>QUEUE</dt><dd>{number(approach.queue_length_meters, 1, ' m')}</dd></div><div><dt>VEHICLES</dt><dd>{number(approach.vehicle_count)}</dd></div><div><dt>AVG. SPEED</dt><dd>{number(approach.average_speed_kmh, 1, ' km/h')}</dd></div><div><dt>OCCUPANCY</dt><dd>{number(approach.occupancy_pct, 0, '%')}</dd></div></dl><Status value={approach.occupancy_pct > 70 ? 'CONGESTED' : 'FLOWING'} source={approach.provenance} /></section>)}</div>
      <div className="comparison"><section className="comparison-side"><span className="eyebrow muted">CURRENT PHASE</span><h3>{junction.current_phase?.name || 'N/A'}</h3><p className="mono">{number(junction.current_phase?.duration_seconds, 0, ' s')}</p></section><section className="comparison-side"><span className="eyebrow muted">PROPOSED PHASE</span><h3>{proposedPhase?.name || 'NO PROPOSAL'}</h3><p className="mono">{number(proposedPhase?.duration_seconds, 0, ' s')}</p></section></div>
      <Action className="action-fill" onClick={recommend} disabled={busy}>{busy ? 'Computing recommendation…' : 'Request adaptive recommendation'}</Action>{error && <Notice error title="RECOMMENDATION UNAVAILABLE">{error}</Notice>}
      {proposal && <Notice title={proposal.safety_validated ? 'SAFETY VALIDATED' : 'SAFETY VALIDATION FAILED'}>{proposal.explanation}<br />Source: {proposal.provenance}. Recommended pressure reduction: {number(proposal.pressure_reduction_pct, 1, '%')}. The API supplies a recommendation; no signal-application endpoint is available.</Notice>}
      <SectionHead index="03" title="SAFETY INVARIANTS" /><div className="safety-list">{[['MIN GREEN', 'min_green_seconds'], ['MAX GREEN', 'max_green_seconds'], ['YELLOW CLEARANCE', 'yellow_clearance_seconds'], ['ALL RED CLEARANCE', 'all_red_clearance_seconds']].map(([label, key]) => <div key={key}><span className="eyebrow muted">{label}</span><strong>{number(junction.safety_constraints?.[key], 0, ' s')}</strong></div>)}</div>
      {proposal && <div className="evidence-item">{Object.entries(proposal.safety_invariants_met || {}).map(([key, passed]) => <p key={key}>{passed ? '✓' : '✕'} {human(key)}</p>)}</div>}
      <p className="eyebrow muted">SIMULATION ONLY / NO CONNECTION TO MUNICIPAL CONTROLLERS</p>
    </>}</section>
  </div>;
}
