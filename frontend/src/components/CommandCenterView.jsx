import { useState } from 'react';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import { Metric, SectionHead, Status, Notice } from './UI';
import { human } from '../design/api';
function Feed({ feed, onSelect }) {
  const [failed, setFailed] = useState(false);
  return <button className="feed-tile" onClick={onSelect} aria-label={`Inspect ${feed.cameraId}`}><div className="feed-image">{!failed ? <video src={feed.video_url || `/api/videos/file/${feed.file}`} muted playsInline preload="metadata" onError={() => setFailed(true)} /> : <div className="feed-missing">MEDIA UNAVAILABLE</div>}</div><div className="feed-caption"><span>{feed.cameraId}</span><small>{human(feed.purpose)}</small></div></button>;
}
function CityMap({ cameras, junctions, resources, incidents, corridorPlan, onSelectCamera, onSelectIncident }) {
  const [zoom, setZoom] = useState(1);
  const points = [...cameras, ...junctions, ...resources, ...incidents].filter(item => Number.isFinite(item.location?.lat) && Number.isFinite(item.location?.lon));
  const lats = points.map(item => item.location.lat), lons = points.map(item => item.location.lon);
  const latMin = Math.min(...lats), latMax = Math.max(...lats), lonMin = Math.min(...lons), lonMax = Math.max(...lons);
  const project = location => [90 + (location.lon - lonMin) / Math.max(lonMax - lonMin, .001) * 620, 330 - (location.lat - latMin) / Math.max(latMax - latMin, .001) * 260];
  const node = (item, kind, index) => {
    if (!Number.isFinite(item.location?.lat) || !Number.isFinite(item.location?.lon)) return null;
    const [x, y] = project(item.location);
    const click = kind === 'incident' ? () => onSelectIncident(item.id) : kind === 'camera' ? () => onSelectCamera(item.id) : null;
    const colour = kind === 'incident' ? '#ff6e66' : kind === 'resource' ? '#a7cfb0' : '#ddd';
    return <g key={`${kind}-${item.id}`} transform={`translate(${x},${y})`} className={click ? 'map-node' : ''} role={click ? 'button' : undefined} tabIndex={click ? 0 : undefined} aria-label={click ? `${kind} ${item.id}` : undefined} onClick={click || undefined} onKeyDown={click ? event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); click(); } } : undefined}>
      <title>{`${item.id}: ${item.status || item.verification_state || item.name || 'Junction'} / ${item.provenance || 'N/A'}`}</title>
      <circle r={kind === 'incident' ? 10 : 5} fill={kind === 'junction' ? '#111' : colour} stroke={colour} strokeWidth="1.5" />
      <text x="12" y={index % 2 ? 17 : -12} fill={colour}>{item.id}</text>
    </g>;
  };
  const geometry = corridorPlan?.route?.geometry_geojson || [];
  const routePoints = geometry.map(([lon, lat]) => project({ lon, lat }).join(',')).join(' ');
  return <div className="schematic"><div className="map-controls"><button aria-label="Zoom in" onClick={() => setZoom(value => Math.min(2, value + .25))}><Plus size={14} /></button><button aria-label="Zoom out" onClick={() => setZoom(value => Math.max(.75, value - .25))}><Minus size={14} /></button></div>
    <svg viewBox="0 0 800 400" aria-label="Backend coordinates plotted on an offline schematic map"><defs><pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#242424" strokeWidth="1" /></pattern></defs><rect width="800" height="400" fill="url(#map-grid)" />
      <g transform={`translate(400,200) scale(${zoom}) translate(-400,-200)`}>
        {junctions.filter(item => item.location).map((junction, index, list) => { const [x, y] = project(junction.location); const next = list[index + 1]; const [nx, ny] = next ? project(next.location) : [x, y]; return <path key={junction.id} d={`M${x} ${y}L${nx} ${ny}`} stroke="#444" strokeWidth="16" fill="none" />; })}
        {routePoints && <polyline points={routePoints} stroke="#a7cfb0" strokeWidth="3" fill="none" strokeDasharray="5 5" />}
        {junctions.map((item, index) => node(item, 'junction', index))}{cameras.map((item, index) => node(item, 'camera', index))}{resources.map((item, index) => node(item, 'resource', index))}{incidents.map((item, index) => node(item, 'incident', index))}
      </g>
    </svg><div className="map-caption"><span>OFFLINE SCHEMATIC / NOT A STREET MAP</span><span>● CAMERAS &nbsp; ● RESOURCES &nbsp; ● INCIDENTS</span></div></div>;
}
export default function CommandCenterView({ incidents, cameras, junctions, resources, videoCatalogue, available, onSelectCamera, onSelectIncident, corridorPlan }) {
  const active = incidents.filter(incident => !['CLOSED'].includes(incident.response_state) && incident.verification_state !== 'FALSE_ALARM');
  const queue = [...active].sort((a, b) => (a.priority_tier || 'P9').localeCompare(b.priority_tier || 'P9') || (b.priority_score || 0) - (a.priority_score || 0));
  const critical = active.filter(incident => incident.priority_tier === 'P1').length;
  const feeds = [...videoCatalogue].sort((a, b) => (a.cameraId === 'CAM-04' ? -1 : b.cameraId === 'CAM-04' ? 1 : 0)).slice(0, 4);
  return <>
    <div className="metrics"><Metric index="00" label="CITY STATUS" value={!available ? 'N/A' : critical ? 'URGENT' : active.length ? 'REVIEW' : 'CLEAR'} source="BACKEND SNAPSHOT" /><Metric index="01" label="ACTIVE INCIDENTS" value={available ? String(active.length).padStart(2, '0') : 'N/A'} source="BACKEND SNAPSHOT" /><Metric index="02" label="CRITICAL / P1" value={available ? String(critical).padStart(2, '0') : 'N/A'} source="BACKEND SNAPSHOT" /><Metric index="03" label="CAMERAS ACTIVE" value={available ? `${cameras.filter(camera => camera.status === 'ACTIVE').length} / ${cameras.length}` : 'N/A'} source={cameras[0]?.provenance} /></div>
    <div className="command-layout"><section><SectionHead index="01" title="NETWORK OVERVIEW"><span>{resources.length} RESOURCES / {junctions.length} JUNCTIONS</span></SectionHead><CityMap cameras={cameras} incidents={active} resources={resources} junctions={junctions} corridorPlan={corridorPlan} onSelectCamera={onSelectCamera} onSelectIncident={onSelectIncident} />
      <SectionHead index="02" title="CAMERA CONTACT SHEET"><span>RECORDED SOURCE MEDIA</span></SectionHead><div className="feed-mosaic">{feeds.map(feed => <Feed key={feed.cameraId} feed={feed} onSelect={() => onSelectCamera(feed.cameraId)} />)}</div>{feeds.length === 0 && <Notice title="CAMERA CATALOGUE UNAVAILABLE">Camera media will appear when the backend catalogue is available.</Notice>}
    </section><section className="command-queue"><SectionHead index="03" title="PRIORITY QUEUE"><span>{available ? queue.length : 'N/A'} CASES</span></SectionHead>
      {!queue.length && <Notice title={available ? 'NO ACTIVE INCIDENTS' : 'AWAITING INCIDENT SNAPSHOT'}>{available ? 'Start a replay scenario to inspect evidence and response coordination.' : 'The backend has not supplied an available incident snapshot.'}</Notice>}
      <div className="incident-list">{queue.map((incident, index) => <button key={incident.id} className="incident-row" onClick={() => onSelectIncident(incident.id)}><div className="row-top"><span className="mono">{String(index + 1).padStart(2, '0')} / {incident.camera_id}</span><Status value={incident.priority_tier} /></div><h3>{human(incident.type)}</h3><p>{incident.title || incident.description}</p><Status value={incident.verification_state} source={incident.provenance} /><div className="row-bottom"><span>{human(incident.response_state)}</span><ArrowUpRight size={15} aria-hidden="true" /></div></button>)}</div>
    </section></div>
  </>;
}
