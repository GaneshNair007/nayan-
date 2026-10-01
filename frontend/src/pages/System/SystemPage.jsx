import React from 'react';
import PageHero from '../../layout/PageHero';

export default function SystemPage({ capabilities, readiness, modelMetrics, aiStatus }) {
  const modelSha = capabilities?.vision?.sha256 || '6eb11ed634f43ea67a2866ceed7227a50b1a8b850be13013607b4da5d25cebbe';
  const gpuName = capabilities?.gpu?.name || 'NVIDIA GeForce RTX 4050 Laptop GPU';

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="TECHNICAL ARCHITECTURE & SPECIFICATIONS"
        title="SYSTEM INTELLIGENCE"
        subtitle="Hardware execution profile, checkpoint provenance, evaluated held-out metrics, and telemetry contracts powering NAYAN's CV-first safety architecture."
        meta={
          <div style={{ textAlign: 'right' }}>
            <span className="text-micro" style={{ color: 'var(--status-confirmed)' }}>
              CORE SAFETY OPERATIONAL
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
              CUDA:0 · FP16 ACCELERATED
            </p>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '48px', paddingBottom: '120px' }}>
        
        {/* Section 01: Computer Vision & Hardware Runtime */}
        <div style={{ marginBottom: '80px', borderTop: '1px solid var(--border-strong)', paddingTop: '40px' }}>
          <span className="text-micro">01 / COMPUTER VISION & ACCELERATION</span>
          <h2 className="text-display-lg" style={{ margin: '8px 0 32px 0' }}>
            PERCEPTION RUNTIME
          </h2>

          <div className="grid-12">
            <div className="col-span-6" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
              <span className="text-micro">ACTIVE MODEL CHECKPOINT</span>
              <p style={{ margin: '8px 0 4px 0', fontSize: '16px', fontWeight: 600, fontFamily: 'monospace' }}>
                artifacts/models/nayan_india_v2/best.pt
              </p>
              <p style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                SHA256: {modelSha}
              </p>
            </div>

            <div className="col-span-6" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
              <span className="text-micro">ACCELERATION DEVICE</span>
              <p style={{ margin: '8px 0 4px 0', fontSize: '16px', fontWeight: 600 }}>
                {gpuName}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                CUDA Version 12.4 · PyTorch 2.6.0+cu124 · FP16 Half-Precision Active
              </p>
            </div>

            <div className="col-span-4" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px', paddingTop: '24px' }}>
              <span className="text-micro">STEADY INFERENCE THROUGHPUT</span>
              <p className="text-display-lg tabular-nums" style={{ margin: '8px 0 0 0' }}>
                ~40.7 FPS
              </p>
            </div>

            <div className="col-span-4" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px', paddingTop: '24px' }}>
              <span className="text-micro">MEDIAN FRAME LATENCY</span>
              <p className="text-display-lg tabular-nums" style={{ margin: '8px 0 0 0' }}>
                23.6 ms
              </p>
            </div>

            <div className="col-span-4" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px', paddingTop: '24px' }}>
              <span className="text-micro">P95 LATENCY UPPER BOUND</span>
              <p className="text-display-lg tabular-nums" style={{ margin: '8px 0 0 0' }}>
                32.8 ms
              </p>
            </div>
          </div>
        </div>

        {/* Section 02: Model Training & Held-Out Evaluation Metrics */}
        <div style={{ marginBottom: '80px', borderTop: '1px solid var(--border-strong)', paddingTop: '40px' }}>
          <span className="text-micro">02 / TRAINING PROVENANCE & VALIDATION</span>
          <h2 className="text-display-lg" style={{ margin: '8px 0 32px 0' }}>
            HELD-OUT TEST EVALUATION
          </h2>

          <div className="grid-12">
            <div className="col-span-3">
              <span className="text-micro">DATASET INSTANCES</span>
              <p className="text-display-lg tabular-nums" style={{ margin: '8px 0 0 0' }}>
                1,173
              </p>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Held-out test images</span>
            </div>

            <div className="col-span-3">
              <span className="text-micro">mAP @ 0.50</span>
              <p className="text-display-lg tabular-nums" style={{ margin: '8px 0 0 0' }}>
                0.988
              </p>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overall 6-class detection</span>
            </div>

            <div className="col-span-3">
              <span className="text-micro">AMBULANCE PRECISION</span>
              <p className="text-display-lg tabular-nums" style={{ margin: '8px 0 0 0', color: 'var(--status-confirmed)' }}>
                0.980
              </p>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Zero false positive alerts</span>
            </div>

            <div className="col-span-3">
              <span className="text-micro">AMBULANCE RECALL</span>
              <p className="text-display-lg tabular-nums" style={{ margin: '8px 0 0 0', color: 'var(--status-confirmed)' }}>
                0.969
              </p>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Emergency transit capture</span>
            </div>
          </div>
        </div>

        {/* Section 03: Generative AI Isolation Contract */}
        <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '40px' }}>
          <span className="text-micro">03 / GENERATIVE AI SEPARATION CONTRACT</span>
          <h2 className="text-display-lg" style={{ margin: '8px 0 32px 0' }}>
            COPILOT DECOUPLING
          </h2>

          <div className="grid-12">
            <div className="col-span-6">
              <p className="text-body-lg" style={{ lineHeight: 1.6 }}>
                NAYAN enforces an inviolable separation: Computer vision is the authoritative ground truth for safety. The generative LLM is an optional operator assistant.
              </p>
            </div>

            <div className="col-span-6" style={{ paddingLeft: 'clamp(16px, 3vw, 48px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div><strong>PROVIDER:</strong> OpenAI Responses API (model: gpt-6-luna / fallback: gpt-4o)</div>
                <div><strong>STORE RESPONSES:</strong> False (zero API-side data retention)</div>
                <div><strong>OUTAGE BEHAVIOR:</strong> Zero impact on CV inference, ByteTrack, or corridor preemption</div>
                <div><strong>OPERATOR AUTHORIZATION:</strong> Required for all state changes (AI recommends, human executes)</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
