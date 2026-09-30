import { useState, useEffect, useRef } from 'react';
import { Action, Metric, Notice, SectionHead, Status, Tooltip } from './UI';
import { request, post, number, percent, human } from '../design/api';
export default function CameraIntelligenceView({ selectedCameraId, onSelectCamera, videoCatalogue, incidents, capabilities, onOpenIncident }) {
  const id = selectedCameraId;
  const [telemetry, setTelemetry] = useState({ id: null, status: null, tracks: [], hardware: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const videoRef = useRef(null), canvasRef = useRef(null);
  const status = telemetry.id === id ? telemetry.status : null;
  const tracks = telemetry.id === id ? telemetry.tracks : [];
  const hardware = telemetry.id === id ? telemetry.hardware : null;
  const feed = videoCatalogue.find(video => video.cameraId === id);
  const incident = incidents.find(item => item.id === status?.active_incident_id) || incidents.find(item => item.camera_id === id);
  const running = status?.is_running === true;
  useEffect(() => {
    let disposed = false, timer;
    const controller = new AbortController();
    setLoading(true); setError(''); setMediaFailed(false);
    const poll = async () => {
      try {
        const [nextStatus, nextTracks] = await Promise.all([request(`/api/videos/status/${id}`, { signal: controller.signal }), request(`/api/videos/tracks/${id}`, { signal: controller.signal })]);
        if (!disposed) { setTelemetry({ id, status: nextStatus, tracks: nextTracks.tracks || [], hardware: nextTracks.hardware }); setError(''); }
      } catch (failure) { if (!disposed) setError(failure.message); }
      finally { if (!disposed) { setLoading(false); timer = setTimeout(poll, 600); } }
    };
    poll();
    return () => { disposed = true; controller.abort(); clearTimeout(timer); };
  }, [id]);
  const analyze = async start => {
    setBusy(true); setError('');
    try {
      await post(start ? '/api/videos/analyze' : '/api/videos/stop', { camera_id: id, video_file: feed?.file, loop_video: true });
      // Backend polling, rather than an optimistic success flag, owns running state.
      if (start) videoRef.current?.play().catch(() => {});
    } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!running || error) return;
    tracks.forEach(track => {
      if (!Array.isArray(track.bbox) || track.bbox.length !== 4) return;
      const [x1, y1, x2, y2] = track.bbox;
      const colour = track.stationary_duration_s > 2 ? '#ff6e66' : '#f5f5f0';
      ctx.strokeStyle = colour; ctx.lineWidth = 2; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const label = `${track.track_id} / ${percent(track.confidence)}`;
      ctx.font = '12px monospace'; ctx.fillStyle = '#080808cc'; ctx.fillRect(x1, Math.max(0, y1 - 22), ctx.measureText(label).width + 12, 20);
      ctx.fillStyle = colour; ctx.fillText(label, x1 + 6, Math.max(14, y1 - 7));
    });
  }, [telemetry, running, error]);
  const states = ['OBSERVED', 'SUSPECTED', 'VERIFYING', 'CONFIRMED'];
  const currentIndex = states.indexOf(status?.verification_state);
  const device = hardware?.device || capabilities?.gpu?.device || 'N/A';
  return <div className="work-layout"><aside><SectionHead index="01" title="SOURCE FEEDS"><span>{videoCatalogue.length}</span></SectionHead><div className="selector-list">{videoCatalogue.map(video => <button key={video.cameraId} className="selector" aria-pressed={id === video.cameraId} onClick={() => onSelectCamera(video.cameraId)}><span className="selector-title">{video.cameraId}</span><small>{video.scenario}</small><small className="mono">{number(video.duration, 0, 'S')} / {human(video.purpose)}</small></button>)}</div>{!videoCatalogue.length && <Notice title="NO FEEDS AVAILABLE">Connect the backend to load the catalogue.</Notice>}</aside>
    <div className="camera-main"><div className="camera-heading"><div><h2>{id}</h2><p>{feed?.scenario || 'SOURCE UNAVAILABLE'}</p></div><Action className={running ? 'action-danger' : 'action-fill'} disabled={busy || !feed || loading || !!error} onClick={() => analyze(!running)}>{busy ? 'Requesting analysis…' : running ? 'Stop inference' : 'Start inference'}</Action></div>
      {loading && <Notice title="INITIALIZING CAMERA TELEMETRY" />}{error && <Notice error title="CAMERA TELEMETRY UNAVAILABLE">{error}</Notice>}
      <div className="video-stage">{feed && !mediaFailed ? <video key={feed.file} ref={videoRef} src={feed.video_url || `/api/videos/file/${feed.file}`} autoPlay muted loop playsInline controls onError={() => setMediaFailed(true)} aria-label={`${id} recorded CCTV source video`} /> : <div className="feed-missing"><span className="eyebrow">{id} / SIGNAL UNAVAILABLE</span><span>{mediaFailed ? 'Video could not be loaded' : 'No source in catalogue'}</span></div>}
        <canvas ref={canvasRef} width={1280} height={720} aria-hidden="true" /><div className="video-label">{id} / RECORDED SOURCE / {running ? 'BACKEND TRACKS' : 'INFERENCE IDLE'}</div>
      </div><p className="eyebrow muted" style={{ marginTop: 12 }}>{feed?.license || 'LICENSE / N/A'} · SOURCE MEDIA / {feed?.sourceType || 'N/A'} · OVERLAYS ARE CURRENT BACKEND TRACKS, NOT FRAME-SYNCHRONIZED EVIDENCE</p>
      <div className="metrics camera-metrics"><Metric index="00" label="LATENCY" value={!error ? number(status?.latency_ms, 1, ' ms') : 'N/A'} source="INFERENCE" /><Metric index="01" label="THROUGHPUT" value={!error ? number(status?.fps, 1, ' fps') : 'N/A'} source="INFERENCE" /><Metric index="02" label="ACTIVE TRACKS" value={!error && status ? tracks.length : 'N/A'} source="INFERENCE" /><Metric index="03" label="DEVICE" value={device.toUpperCase()} hint={hardware?.gpu_name || capabilities?.gpu?.name || 'N/A'} /></div>
      <div className="evidence-layout"><section><SectionHead index="02" title="VERIFICATION"><Tooltip label="Explain evidence score">Strength of accumulated temporal signals supporting this incident; separate from instantaneous model confidence.</Tooltip></SectionHead><Status value={error ? 'OFFLINE' : status?.verification_state} source={incident?.provenance} />
        <div className="lifecycle" aria-label="Verification lifecycle">{states.map((state, index) => <div className={`lifecycle-step ${index <= currentIndex && !error ? 'done' : ''}`} key={state}>{state}</div>)}</div>
        <div className="comparison"><div className="comparison-side"><span className="eyebrow muted">MODEL CONFIDENCE</span><h3>{percent(incident?.model_confidence)}</h3><small className="source">{incident?.provenance || 'N/A'}</small></div><div className="comparison-side"><span className="eyebrow muted">EVIDENCE SCORE</span><h3>{!error ? percent(status?.evidence_score) : 'N/A'}</h3><small className="source">INFERENCE</small></div></div>
        {incident && <Action onClick={() => onOpenIncident(incident.id)}>Open {incident.id}</Action>}
        <SectionHead index="03" title="CORRIDOR OBSERVATION" /><p className="eyebrow muted">{human(status?.corridor_action)} / CLEARANCE {number(status?.segment_clearance, 1, 'm')} / {human(status?.segment_compression)}</p>
      </section><section><SectionHead index="04" title="WHY THIS ALERT EXISTS" />{incident?.evidence?.length ? incident.evidence.map((evidence, index) => <div className="evidence-item" key={evidence.id || index}><h3>{human(evidence.type)}</h3><p>{evidence.source}</p><dl>{Object.entries(evidence.details || {}).map(([key, value]) => <div key={key}><dt>{human(key)}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}</dl><Status value={evidence.provenance} /><time className="source">{evidence.timestamp?.slice(11, 19) || 'N/A'} UTC</time></div>) : <Notice title="NO EVIDENCE RECEIVED">Evidence appears only when the backend reports an incident for this camera.</Notice>}</section></div>
    </div>
  </div>;
}
