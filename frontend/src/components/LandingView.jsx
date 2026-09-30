import { useState } from 'react';
import { Action } from './UI';
import { modules } from './Navigation';
export default function LandingView({ videoCatalogue, onSelectTab }) {
  const feed = videoCatalogue.find(video => video.cameraId === 'CAM-04') || videoCatalogue[0];
  const [failed, setFailed] = useState(false);
  return <div className="landing">
    <div className="landing-meta eyebrow"><span>NETWORKED AI FOR<br />YIELDING ALERTS & NAVIGATION</span><span>COMPUTER VISION /<br />URBAN INTELLIGENCE</span></div>
    <h1 className="landing-wordmark">NAYAN</h1>
    <div className="landing-frame scroll-media">
      {feed && !failed ? <video src={feed.video_url || `/api/videos/file/${feed.file}`} autoPlay loop muted playsInline aria-label={`${feed.cameraId} staged CCTV video`} onError={() => setFailed(true)} /> : <div className="feed-missing"><span className="eyebrow">CAMERA NETWORK / {failed ? 'MEDIA UNAVAILABLE' : 'AWAITING CATALOGUE'}</span></div>}
      <span className="eyebrow">{feed?.cameraId || 'N/A'} / STAGED CCTV / {feed?.provenance || 'N/A'}</span>
      <div className="landing-overlay"><h2>FROM OBSERVATION<br />TO ORCHESTRATION.</h2><Action onClick={() => onSelectTab('command-center')}>Enter command center</Action></div>
    </div>
    <div className="landing-statement"><span className="eyebrow muted">01 / THE OPERATING PRINCIPLE</span><p>See the event.<br />Verify the evidence.<br />Make room for the response.</p></div>
    {[
      ['02', 'UNDERSTAND', 'Temporal evidence turns an observation into a case. Every confidence score, state and source stays visible.'],
      ['03', 'RESPOND', 'Review the incident, authorize the response and dispatch an available resource through the simulation.'],
      ['04', 'CLEAR', 'Read the road segment by segment. Inspect compression, minimum passage width and the decision to reroute.'],
      ['05', 'SIMULATE', 'Compare fixed and adaptive timing with transparently labelled backend demonstration results.'],
    ].map(([index, title, description]) => <section className="story-row" key={index}><span className="eyebrow muted">{index} /</span><h3>{title}</h3><p>{description}</p></section>)}
    <footer className="landing-footer"><div className="footer-links">{modules.map(tab => <button key={tab.id} onClick={() => onSelectTab(tab.id)}>{tab.label} ↗</button>)}</div><div className="footer-wordmark" aria-hidden="true">NAYAN</div></footer>
  </div>;
}
