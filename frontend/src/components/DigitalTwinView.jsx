import { useCallback, useEffect, useState } from 'react';
import { Action, Notice, SectionHead, Status } from './UI';
import { request, number } from '../design/api';
export default function DigitalTwinView() {
  const [result, setResult] = useState(null), [busy, setBusy] = useState(true), [error, setError] = useState('');
  const load = useCallback(async signal => {
    setBusy(true); setError('');
    try { const next = await request('/api/demo/digital-twin?mode=MOCK', { signal }); if (!signal?.aborted) setResult(next); }
    catch (failure) { if (!signal?.aborted) setError(failure.message); } finally { if (!signal?.aborted) setBusy(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); request('/api/demo/digital-twin?mode=MOCK', { signal: controller.signal }).then(setResult).catch(failure => { if (!controller.signal.aborted) setError(failure.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); }); return () => controller.abort(); }, []);
  const metrics = [['Emergency travel time', 'emergency_travel_time_fixed_s', 'emergency_travel_time_adaptive_s', 's'], ['Mean vehicle delay', 'mean_vehicle_delay_fixed_s', 'mean_vehicle_delay_adaptive_s', 's'], ['Mean queue length', 'mean_queue_length_fixed_m', 'mean_queue_length_adaptive_m', 'm'], ['Total stopped time', 'total_stopped_time_fixed_s', 'total_stopped_time_adaptive_s', 's'], ['Completed trips', 'completed_trips_fixed', 'completed_trips_adaptive', 'trips']];
  return <>
    <div className="filter-bar"><div><Status value={result?.simulation_mode || 'UNAVAILABLE'} source={result?.provenance} /><p className="muted" style={{ fontSize: 11, marginTop: 10 }}>{result?.source_label || 'Reading the digital twin adapter.'}</p></div><Action disabled={busy} onClick={() => load()}>{busy ? 'Reading comparison…' : 'Refresh comparison'}</Action></div>
    {error && <Notice error title="SIMULATION UNAVAILABLE" onRetry={() => load()}>{error}</Notice>}
    {busy && !result && <Notice title="INITIALIZING DIGITAL TWIN COMPARISON" />}
    <SectionHead index="01" title="EMERGENCY TRAVEL TIME"><span>IDENTICAL DEMAND / SOURCE {result?.provenance || 'N/A'}</span></SectionHead>
    <div className="comparison"><div className="comparison-side"><span className="eyebrow muted">FIXED TIMING</span><strong key={result?.emergency_travel_time_fixed_s} className="comparison-number">{number(result?.emergency_travel_time_fixed_s)}<small>s</small></strong></div><div className="comparison-side"><span className="eyebrow muted">ADAPTIVE TIMING</span><strong key={result?.emergency_travel_time_adaptive_s} className="comparison-number">{number(result?.emergency_travel_time_adaptive_s)}<small>s</small></strong></div></div>
    <SectionHead index="02" title="COMPARISON RECORD"><span>SEED / {result?.seed ?? 'N/A'}</span></SectionHead><div className="table-wrap"><table className="data-table"><thead><tr><th>Metric</th><th>Fixed</th><th>Adaptive</th><th>Source</th></tr></thead><tbody>{metrics.map(([label, fixed, adaptive, unit]) => <tr key={fixed}><td>{label}</td><td className="mono">{number(result?.[fixed], 1)} {unit}</td><td className="mono">{number(result?.[adaptive], 1)} {unit}</td><td><Status value={result?.provenance} /></td></tr>)}</tbody></table></div>
    <Notice title={result?.is_mocked ? 'MOCKED DEMONSTRATION' : 'BACKEND COMPARISON'}>{result?.name || 'No comparison received.'}<br />Reported vehicle-delay reduction: {number(result?.delay_reduction_pct, 1, '%')}. These are the existing backend adapter’s returned values. Refresh does not launch a SUMO simulation.</Notice>
    <p className="eyebrow muted">RESULT TIMESTAMP / {result?.simulated_at || 'N/A'}</p>
  </>;
}
