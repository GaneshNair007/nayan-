import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import PageHero from '../../layout/PageHero';
import { editorialEase } from '../../motion/easing';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Maximize, 
  Cpu, 
  Eye, 
  EyeOff
} from 'lucide-react';

// Authoritative camera definitions with scenario-specific CV telemetry, bounding geometry, and 4-stage forensic evidence chains
const CAMERA_DEFINITIONS = {
  'CAM-01': {
    cameraId: 'CAM-01',
    scenario: 'Normal Urban Intersection',
    purpose: 'baseline_traffic',
    file: 'cam01_normal_intersection.mp4',
    duration: '30.0s',
    fps: 30,
    resolution: '1280x720',
    location: 'Main St & 1st Ave (JNC-01)',
    verificationState: 'NOMINAL FLOW (VERIFIED)',
    verificationColor: '#10b981',
    provenance: 'INFERENCE (YOLOv8n + ByteTrack)',
    eyebrow: 'BASELINE SENSOR · CAM-01',
    title: 'CAM-01 NORMAL URBAN INTERSECTION',
    subtitle: 'Monocular arterial telemetry running on NVIDIA RTX 4050. Continuous vehicle tracking, lane flow velocity calibration, and multi-approach level-of-service audit.',
    metrics: [
      { label: 'FLOW RATE', value: '38.2 veh/min', sub: 'Laminar dispersion' },
      { label: 'MEDIAN VELOCITY', value: '38.4 km/h', sub: 'Within speed limit' },
      { label: 'LANE OCCUPANCY', value: '32.0%', sub: 'Level of Service: A' },
      { label: 'CONFLICT RISK', value: '0.00 / 1.00', sub: 'Zero trajectory overlap' }
    ],
    technicalDetails: {
      checkpoint: 'artifacts/models/nayan_india_v2/best.pt',
      timing: '21.8 ms median · 45.8 FPS throughput',
      codec: '1280x720 · H.264 Baseline @ 30.0 FPS',
      tracking: 'Continuous ByteTrack with Multi-Class Indian Fleet Calibration'
    },
    calibratedOverlays: [
      {
        id: 'c1-v1',
        label: 'V-102 · CAR · 0.96 CONF',
        sub: 'v: 38.4 km/h · LANE 1',
        color: '#10b981',
        box: { top: '48%', left: '42%', width: '16%', height: '22%' }
      },
      {
        id: 'c1-v2',
        label: 'V-108 · AUTO_RICKSHAW · 0.93 CONF',
        sub: 'v: 28.1 km/h · LANE 2',
        color: '#00e5ff',
        box: { top: '38%', left: '60%', width: '12%', height: '18%' }
      }
    ],
    hudBadges: [
      { text: 'LANE 1 & 2 DISPERSION: NOMINAL', color: '#10b981' },
      { text: 'KINEMATIC ANOMALIES: ZERO', color: '#94a3b8' }
    ],
    evidenceSteps: [
      {
        step: '01',
        title: 'KINEMATIC STEADY-STATE',
        metric: 'VELOCITY VARIANCE: <3.2%',
        detail: 'ByteTrack trajectory smoothing confirms steady vehicle velocities across north-south approaches with zero abrupt braking events.'
      },
      {
        step: '02',
        title: 'HEADWAY COMPLIANCE',
        metric: 'SPATIAL GAP: >14.5 METERS',
        detail: 'Inter-vehicle spatial envelopes maintain safe stopping distances, conforming to standard IRC urban road design thresholds.'
      },
      {
        step: '03',
        title: 'CROSS-JUNCTION CLEARANCE',
        metric: 'GREEN WAVE UTILIZATION: 94.2%',
        detail: 'Signal phase progression at Junction 1 clears approach queues within single green splits with zero intersection box trapping.'
      },
      {
        step: '04',
        title: 'BASELINE AUDIT CONFIRMATION',
        metric: 'SAFETY SCORE: 0.99 / 1.00',
        detail: 'Continuous optical auditing confirms zero trajectory deviations. Detector background noise floor calibrated for daylight conditions.'
      }
    ],
    hypothesis: {
      score: '0.99 / 1.00',
      title: 'Nominal Intersection Safety Index: 0.99 / 1.00',
      detail: 'All approaches exhibit fluid laminar dispersion. Zero physical conflict vectors or deceleration anomalies detected across 900 processed frames.',
      incidentId: 'INC-CAM01-BASELINE',
      buttonLabel: 'VIEW INTERSECTION TELEMETRY →',
      targetTab: 'traffic'
    }
  },

  'CAM-02': {
    cameraId: 'CAM-02',
    scenario: 'Traffic Congestion & Queue Buildup',
    purpose: 'congestion',
    file: 'cam02_congestion.mp4',
    duration: '30.0s',
    fps: 30,
    resolution: '1280x720',
    location: 'Main St & 1st Ave South Approach (JNC-01)',
    verificationState: 'CONGESTION DETECTED (P2)',
    verificationColor: '#f59e0b',
    provenance: 'INFERENCE (DENSITY + VELOCITY ENGINE)',
    eyebrow: 'CONGESTION SENSOR · CAM-02',
    title: 'CAM-02 TRAFFIC CONGESTION & QUEUE BUILDUP',
    subtitle: 'Arterial choke-point observation. Real-time queue tail detection, headway compression, and dynamic signal phase extension recommendation.',
    metrics: [
      { label: 'QUEUE LENGTH', value: '120.0 m', sub: 'Backward propagation' },
      { label: 'MEAN VELOCITY', value: '12.4 km/h', sub: 'Severe slowdown' },
      { label: 'ROAD OCCUPANCY', value: '85.0%', sub: 'Bottleneck capacity' },
      { label: 'DELAY PENALTY', value: '+4.2 min', sub: 'Signal cycle backlog' }
    ],
    technicalDetails: {
      checkpoint: 'artifacts/models/nayan_india_v2/best.pt',
      timing: '24.1 ms median · 41.5 FPS throughput',
      codec: '1280x720 · H.264 Baseline @ 30.0 FPS',
      tracking: 'Density Flow Estimator + ByteTrack Occlusion Recovery'
    },
    calibratedOverlays: [
      {
        id: 'c2-q1',
        label: 'QUEUE CHOKE · 18 VEHICLES',
        sub: 'STOPPED > 45s · OCCUPANCY 85%',
        color: '#f59e0b',
        box: { top: '35%', left: '25%', width: '45%', height: '40%' }
      },
      {
        id: 'c2-v1',
        label: 'V-214 · BUS · 0.95 CONF',
        sub: 'v: 4.2 km/h · BOTTLENECK HEAD',
        color: '#ef4444',
        box: { top: '42%', left: '38%', width: '22%', height: '28%' }
      }
    ],
    hudBadges: [
      { text: 'LONGITUDINAL QUEUE: 120m', color: '#f59e0b' },
      { text: 'SPILLBACK SHOCKWAVE: -14.2 km/h', color: '#ef4444' }
    ],
    evidenceSteps: [
      {
        step: '01',
        title: 'HEADWAY COMPRESSION',
        metric: 'SEPARATION: <2.8 METERS',
        detail: 'Space headway collapsed below safe urban following distance as density surged past 48 veh/km along the southbound arterial.'
      },
      {
        step: '02',
        title: 'LONGITUDINAL BACKWARD WAVE',
        metric: 'SHOCKWAVE SPEED: -14.2 km/h',
        detail: 'Kinematic wave propagation detected traveling upstream toward Junction 1, creating spillback risks across feeder approaches.'
      },
      {
        step: '03',
        title: 'DOWNSTREAM BOTTLE-NECK',
        metric: 'THROUGHPUT DEFICIT: -42%',
        detail: 'Downstream lane starved of flow due to curb-side obstruction, reducing green-phase clearance efficiency.'
      },
      {
        step: '04',
        title: 'ADAPTIVE CYCLE TRIGGER',
        metric: 'RECOMMENDED EXTENSION: +18s GREEN',
        detail: 'Real-time signal optimizer calculated compensatory 18-second green-split extension to flush arterial queue before gridlock lock-in.'
      }
    ],
    hypothesis: {
      score: '0.85 / 1.00',
      title: 'Arterial Congestion Index: 0.85 / 1.00',
      detail: 'Severe queue buildup confirmed. Spatial propagation threatens feeder junction gridlock within 180 seconds if unmitigated.',
      incidentId: 'INC-CONGESTION-JNC02',
      buttonLabel: 'OPEN TRAFFIC MANAGEMENT →',
      targetTab: 'traffic'
    }
  },

  'CAM-03': {
    cameraId: 'CAM-03',
    scenario: 'Emergency Vehicle Transit',
    purpose: 'emergency_corridor',
    file: 'cam03_ambulance.mp4',
    duration: '13.4s',
    fps: 30,
    resolution: '1280x720',
    location: 'Central Expressway & 4th Cross East (JNC-02)',
    verificationState: 'ACTIVE PRIORITY CORRIDOR (P1)',
    verificationColor: '#f59e0b',
    provenance: 'INFERENCE (YOLOv8 + ACOUSTIC/VISUAL ENGINE)',
    eyebrow: 'CRITICAL CORRIDOR SENSOR · CAM-03',
    title: 'CAM-03 EMERGENCY VEHICLE TRANSIT',
    subtitle: 'Automated emergency preemption corridor. Monocular detection of Class 0 (Ambulance), beacon flicker frequency analysis, and automated dynamic green-wave clearance.',
    metrics: [
      { label: 'TARGET CLASS', value: 'AMBULANCE (Medic 01)', sub: 'Custom Class 0' },
      { label: 'APPROACH VELOCITY', value: '52.0 km/h', sub: 'High-speed transit' },
      { label: 'JUNCTION ARRIVAL', value: '8.4 SECONDS', sub: 'ETA to JNC-02 stop-line' },
      { label: 'PREEMPTION STATUS', value: 'ENGAGED (PHASE 3)', sub: 'Zero conflict hold' }
    ],
    technicalDetails: {
      checkpoint: 'artifacts/models/nayan_india_v2/best.pt (Custom India CV)',
      timing: '22.4 ms median · 44.6 FPS throughput',
      codec: '1280x720 · H.264 Baseline @ 30.0 FPS',
      tracking: 'YOLOv8 Class-0 Priority Filter + ByteTrack Emergency Interlock'
    },
    calibratedOverlays: [
      {
        id: 'c3-amb',
        label: 'AMBULANCE · MEDIC-01 · 0.98 CONF',
        sub: 'v: 52.0 km/h · PRIORITY VECTOR → JNC-02',
        color: '#f59e0b',
        box: { top: '38%', left: '32%', width: '30%', height: '36%' },
        pulse: true
      },
      {
        id: 'c3-lead',
        label: 'V-012 · CAR · 0.94 CONF',
        sub: 'v: 34.0 km/h · YIELDING TO CURB',
        color: '#38bdf8',
        box: { top: '52%', left: '68%', width: '16%', height: '24%' }
      }
    ],
    hudBadges: [
      { text: 'SIGNAL PREEMPTION: EXTENDED GREEN ACTIVE', color: '#10b981' },
      { text: 'DOWNSTREAM CLEARANCE: 140m SECURED', color: '#f59e0b' }
    ],
    evidenceSteps: [
      {
        step: '01',
        title: 'OPTICAL & BEACON SIGNATURE',
        metric: 'CLASS 0 CONFIDENCE: 98.2%',
        detail: 'Custom-trained YOLOv8 detector verified emergency ambulance livery and active top-beacon strobe flicker pattern.'
      },
      {
        step: '02',
        title: 'HIGH-VELOCITY APPROACH VECTOR',
        metric: 'TRANSIT SPEED: 52.0 km/h',
        detail: 'ByteTrack trajectory estimation projected vehicle arrival at Junction 2 stop line in 8.4 seconds with zero deceleration intent.'
      },
      {
        step: '03',
        title: 'CORRIDOR SAFETY INTERLOCK',
        metric: 'CLEARANCE DURATION: 12.0s',
        detail: 'Safety engine evaluated cross-traffic conflicts, verifying pedestrian phases are terminated before preempting vehicle signals.'
      },
      {
        step: '04',
        title: 'GREEN-WAVE SIGNAL PREEMPTION',
        metric: 'COMMAND: JNC-02 PHASE 3 GREEN',
        detail: 'FastAPI kernel issued real-time preemptive signal override, clearing 140 meters of downstream lane for unobstructed transit.'
      }
    ],
    hypothesis: {
      score: '0.96 / 1.00',
      title: 'Emergency Preemption Confidence: 0.96 / 1.00',
      detail: 'Medic 01 confirmed en route to City General Hospital. Signal preemption interlock engaged with zero lateral safety violations.',
      incidentId: 'INC-AMB03-CORRIDOR',
      buttonLabel: 'OPEN EMERGENCY CORRIDOR →',
      targetTab: 'corridor'
    }
  },

  'CAM-04': {
    cameraId: 'CAM-04',
    scenario: 'Multi-Vehicle Collision',
    purpose: 'collision',
    file: 'cam04_collision.mp4',
    duration: '35.0s',
    fps: 30,
    resolution: '1280x720',
    location: 'Central Expressway & 4th Cross Westbound (JNC-02)',
    verificationState: 'COLLISION CONFIRMED (P1 CRITICAL)',
    verificationColor: '#ef4444',
    provenance: 'INFERENCE (COLLISION KINEMATICS ENGINE)',
    eyebrow: 'INCIDENT FORENSICS SENSOR · CAM-04',
    title: 'CAM-04 MULTI-VEHICLE COLLISION',
    subtitle: 'High-speed lateral impact and kinetic transfer. Deceleration anomaly engine, trajectory conflict detection, and multi-agency response dispatch.',
    metrics: [
      { label: 'KINETIC DELTA-V', value: '38.0 km/h', sub: 'Impact severity index' },
      { label: 'DECELERATION SPIKE', value: '6.2 px/fr²', sub: 'Braking limit exceeded' },
      { label: 'LANE OBSTRUCTION', value: 'LANES 1 & 2', sub: 'Full westbound block' },
      { label: 'CASUALTY ESTIMATE', value: '4 OCCUPANTS', sub: 'Medical triage code 2' }
    ],
    technicalDetails: {
      checkpoint: 'artifacts/models/nayan_india_v2/best.pt',
      timing: '23.6 ms median · 42.3 FPS throughput',
      codec: '1280x720 · H.264 Baseline @ 30.0 FPS',
      tracking: 'Kinematic Conflict Invariant + Post-Collision Stoppage Verifier'
    },
    calibratedOverlays: [
      {
        id: 'c4-impact',
        label: 'IMPACT CLUSTER · 0.94 CONF',
        sub: 'v: 0.0 km/h · STOPPED > 3.2s',
        color: '#ef4444',
        box: { top: '34%', left: '38%', width: '28%', height: '32%' },
        pulse: true
      },
      {
        id: 'c4-v2',
        label: 'V-105 · CAR · 0.91 CONF',
        sub: 'LATERAL DEFORMATION · LANE 1',
        color: '#f59e0b',
        box: { top: '36%', left: '64%', width: '16%', height: '24%' }
      }
    ],
    hudBadges: [
      { text: 'COLLISION POINT: LANE 1 & 2 BLOCKED', color: '#ef4444' },
      { text: 'EMS & TRAFFIC PATROL DISPATCHED', color: '#38bdf8' }
    ],
    evidenceSteps: [
      {
        step: '01',
        title: 'TRAJECTORY CONFLICT',
        metric: 'CONVERGENCE RATE: 19.9 px/frame',
        detail: 'ByteTrack kinematic tracking observed two opposing vehicle vectors on colliding trajectories at Central Expressway.'
      },
      {
        step: '02',
        title: 'ABRUPT DECELERATION ANOMALY',
        metric: 'PEAK DECELERATION: 6.2 px/frame²',
        detail: 'Temporal feature engine measured negative acceleration exceeding nominal urban braking thresholds within a 0.25s window.'
      },
      {
        step: '03',
        title: 'PERSISTENT SPATIAL PROXIMITY',
        metric: 'STOPPAGE DURATION: >3.2 SECONDS',
        detail: 'Contact cluster maintained stationary spatial overlap with zero post-event egress, ruling out transient traffic occlusion.'
      },
      {
        step: '04',
        title: 'HYPOTHESIS STATE CONFIRMATION',
        metric: 'VERIFICATION: CONFIRMED (P1)',
        detail: 'Accumulated multi-signal evidence achieved a 0.88 evidence score, transitioning the incident deterministically from SUSPECTED to CONFIRMED.'
      }
    ],
    hypothesis: {
      score: '0.88 / 1.00',
      title: 'Deterministic Collision Score: 0.88 / 1.00',
      detail: 'Multi-signal convergence confirmed across 4 separate temporal metrics. Camera calibration validates obstacle placement in Lane 1 with zero ambiguous occlusions.',
      incidentId: 'INC-2026-001',
      buttonLabel: 'OPEN INCIDENT CASE STUDY →',
      targetTab: 'incident'
    }
  },

  'CAM-05': {
    cameraId: 'CAM-05',
    scenario: 'Night-Time Surveillance & Headlight Tracking',
    purpose: 'night_conditions',
    file: 'cam05_night_traffic.mp4',
    duration: '30.0s',
    fps: 30,
    resolution: '1280x720',
    location: 'Metro Plaza Flyover & Bridge Concourse (JNC-03)',
    verificationState: 'ACTIVE SURVEILLANCE (NIGHT MODE)',
    verificationColor: '#a855f7',
    provenance: 'INFERENCE (LOW-LIGHT ENHANCEMENT ENGINE)',
    eyebrow: 'ADVERSE LIGHTING SENSOR · CAM-05',
    title: 'CAM-05 NIGHT-TIME SURVEILLANCE & TRACKING',
    subtitle: 'Low-lux highway bridge surveillance. Dynamic gamma equalization, headlight bloom suppression, and vehicle speed estimation under low-visibility conditions.',
    metrics: [
      { label: 'AMBIENT LUX', value: '< 2.5 LUX', sub: 'Low-light regime' },
      { label: 'BLOOM SUPPRESSION', value: '94.0% ACTIVE', sub: 'Glare attenuation' },
      { label: 'TRACK INTEGRITY', value: '98.6%', sub: 'Headlight pair link' },
      { label: 'MEAN SPEED', value: '64.2 km/h', sub: 'Continuous corridor' }
    ],
    technicalDetails: {
      checkpoint: 'artifacts/models/nayan_india_v2/best.pt',
      timing: '25.2 ms median · 39.7 FPS throughput',
      codec: '1280x720 · H.264 Baseline @ 30.0 FPS',
      tracking: 'Bilateral Contrast Enhancer + Headlight Pair Clustering'
    },
    calibratedOverlays: [
      {
        id: 'c5-v1',
        label: 'V-082 · CAR (NIGHT TRACK)',
        sub: 'v: 64.2 km/h · HEADLIGHT PAIR #82',
        color: '#a855f7',
        box: { top: '44%', left: '46%', width: '18%', height: '20%' }
      },
      {
        id: 'c5-v2',
        label: 'V-086 · TRUCK (NIGHT TRACK)',
        sub: 'v: 51.0 km/h · RETROREFLECTIVE ID',
        color: '#00e5ff',
        box: { top: '36%', left: '26%', width: '20%', height: '24%' }
      }
    ],
    hudBadges: [
      { text: 'LOW-LUX COMPENSATION: ON', color: '#a855f7' },
      { text: 'HEADLIGHT BLOOM FILTER: 94% ACTIVE', color: '#00e5ff' }
    ],
    evidenceSteps: [
      {
        step: '01',
        title: 'CONTRAST EQUALIZATION',
        metric: 'DYNAMIC RANGE: +3.2 EV',
        detail: 'Dynamic histogram clipping highlights vehicle contours and retro-reflective lane markings in low-light environment.'
      },
      {
        step: '02',
        title: 'HEADLIGHT BLOOM SUPPRESSION',
        metric: 'GLARE ATTENUATION: 94.0%',
        detail: 'Point-spread function masking removes optical flare circles around headlights, preserving vehicle silhouette fidelity.'
      },
      {
        step: '03',
        title: 'PAIR CLUSTERING & TRACKING',
        metric: 'BEAM PAIR CORRELATION: 0.96',
        detail: 'ByteTrack clusters paired headlight vectors into single vehicle bounding bounding boxes, preventing split-track fragmentation.'
      },
      {
        step: '04',
        title: 'CONTINUOUS CORRIDOR AUDIT',
        metric: 'CORRIDOR SAFETY: 100% NOMINAL',
        detail: 'Flow velocities on bridge deck verified nominal; zero stranded vehicles or blacked-out obstacles detected.'
      }
    ],
    hypothesis: {
      score: '0.94 / 1.00',
      title: 'Night-Time Tracking Reliability: 0.94 / 1.00',
      detail: 'Sensor operating in adverse low-lux mode. High track continuity maintained across all lanes with zero false deceleration triggers.',
      incidentId: 'INC-NIGHT-05',
      buttonLabel: 'OPEN SURVEILLANCE AUDIT →',
      targetTab: 'command-center'
    }
  },

  'CAM-07': {
    cameraId: 'CAM-07',
    scenario: 'Pedestrian Crowd Movement & Density Growth',
    purpose: 'crowd_movement',
    file: 'cam07_crowd_growth.mp4',
    duration: '30.0s',
    fps: 30,
    resolution: '1280x720',
    location: 'Metro Plaza Concourse Entrance B (JNC-03)',
    verificationState: 'CROWD SURGE ANOMALY (P2)',
    verificationColor: '#38bdf8',
    provenance: 'INFERENCE (DENSITY + FLOW TURBULENCE)',
    eyebrow: 'PEDESTRIAN SAFETY SENSOR · CAM-07',
    title: 'CAM-07 PEDESTRIAN CROWD DENSITY SURGE',
    subtitle: 'Transit concourse density monitoring. Optical crowd flux estimation, directional entropy calculation, and stampede prevention threshold alerts.',
    metrics: [
      { label: 'PEDESTRIAN FLUX', value: '2.4 ped/m²', sub: 'Threshold: 1.8 p/m²' },
      { label: 'SURGE VELOCITY', value: '+32% / 30s', sub: 'Rapid accumulation' },
      { label: 'DIRECTIONAL ENTROPY', value: '0.84 (TURBULENT)', sub: 'Counter-flow vector' },
      { label: 'CONCOURSE DWELL', value: '90.0 SECONDS', sub: 'Egress bottleneck' }
    ],
    technicalDetails: {
      checkpoint: 'artifacts/models/nayan_india_v2/best.pt',
      timing: '24.8 ms median · 40.3 FPS throughput',
      codec: '1280x720 · H.264 Baseline @ 30.0 FPS',
      tracking: 'Pedestrian Density Grid Engine + Optical Flux Tracker'
    },
    calibratedOverlays: [
      {
        id: 'c7-surge',
        label: 'CROWD CLUSTER · 45 COMMUTERS',
        sub: 'DENSITY: 2.4 p/m² · SURGE ACTIVE',
        color: '#38bdf8',
        box: { top: '30%', left: '30%', width: '42%', height: '46%' },
        pulse: true
      },
      {
        id: 'c7-choke',
        label: 'CHOKE POINT · GATE B',
        sub: 'FLOW RESTRICTION: 82%',
        color: '#f59e0b',
        box: { top: '24%', left: '68%', width: '18%', height: '22%' }
      }
    ],
    hudBadges: [
      { text: 'SURGE WARNING: CONCOURSE GATE B SATURATED', color: '#f59e0b' },
      { text: 'PEDESTRIAN WALK PHASE EXTENDED (+20s)', color: '#10b981' }
    ],
    evidenceSteps: [
      {
        step: '01',
        title: 'CONCOURSE DENSITY SPIKE',
        metric: 'GROWTH RATE: +32.0%',
        detail: 'Perception engine detected abnormal accumulation of commuters entering concourse vestibule from commuter rail arrival.'
      },
      {
        step: '02',
        title: 'VECTOR TURBULENCE DISPERSION',
        metric: 'ENTROPY INDEX: 0.84',
        detail: 'Counter-flow directional turbulence observed between exiting train passengers and entering street commuters.'
      },
      {
        step: '03',
        title: 'PERSISTENT STATIONARY DWELL',
        metric: 'DWELL DURATION: 90.0 SECONDS',
        detail: 'Temporal association graph confirms pedestrian dwell time exceeded nominal throughput thresholds by 280%.'
      },
      {
        step: '04',
        title: 'CROWD SURGE CONFIRMATION',
        metric: 'STATE: CONFIRMED ANOMALY (P2)',
        detail: 'Deterministic multi-signal threshold exceeded; automated notification dispatched to transit concourse marshals.'
      }
    ],
    hypothesis: {
      score: '0.94 / 1.00',
      title: 'Crowd Surge Evidence Score: 0.94 / 1.00',
      detail: 'Abnormal pedestrian gathering confirmed at Metro entrance concourse. Automated pedestrian phase extended to clear egress corridor.',
      incidentId: 'INC-2026-002',
      buttonLabel: 'OPEN CROWD CASE STUDY →',
      targetTab: 'incident'
    }
  },

  'CAM-09': {
    cameraId: 'CAM-09',
    scenario: 'Camera Health & Baseline Verification',
    purpose: 'camera_health',
    file: 'cam09_normal_source.mp4',
    duration: '26.4s',
    fps: 30,
    resolution: '1280x720',
    location: 'Expressway Sensor Bay 9 (JNC-02)',
    verificationState: 'SENSOR HEALTH NOMINAL (100%)',
    verificationColor: '#10b981',
    provenance: 'DIAGNOSTICS (CV HEALTH ENGINE)',
    eyebrow: 'HARDWARE TELEMETRY SENSOR · CAM-09',
    title: 'CAM-09 CAMERA HEALTH & SIGNAL INTEGRITY',
    subtitle: 'Optical sensor diagnostics and tamper verification. Automated edge defocus detection, lens occlusion check, dropped frame telemetry, and signal-to-noise audit.',
    metrics: [
      { label: 'EDGE SHARPNESS', value: '0.98 (OPTIMAL)', sub: 'Laplacian variance' },
      { label: 'FRAME DROP RATE', value: '0.00% (0 / 791)', sub: 'Zero buffer loss' },
      { label: 'JITTER LATENCY', value: '1.2 ms', sub: 'RTSP transmission' },
      { label: 'HEALTH RATING', value: '100.0% (EXCELLENT)', sub: 'Hardware watchdog' }
    ],
    technicalDetails: {
      checkpoint: 'artifacts/models/nayan_india_v2/best.pt',
      timing: '21.2 ms median · 47.1 FPS throughput',
      codec: '1280x720 · H.264 Baseline @ 30.0 FPS',
      tracking: 'Laplacian Edge Sharpness Probe + Freeze Frame Sentinel'
    },
    calibratedOverlays: [
      {
        id: 'c9-crosshair',
        label: 'OPTICAL INTEGRITY: 100% · LENS CLEAN',
        sub: 'ZERO BLUR · ZERO OCCLUSION',
        color: '#10b981',
        box: { top: '25%', left: '25%', width: '50%', height: '50%' }
      }
    ],
    hudBadges: [
      { text: 'OPTICAL MTBF: 99.98% · SENSOR CERTIFIED', color: '#10b981' },
      { text: 'SIGNAL INTEGRITY: 100.0%', color: '#94a3b8' }
    ],
    evidenceSteps: [
      {
        step: '01',
        title: 'LAPLACIAN VARIANCE CHECK',
        metric: 'SHARPNESS INDEX: 0.98',
        detail: 'High-frequency spatial gradient analysis confirms crystal-clear optical focus without lens smudging or water spot distortion.'
      },
      {
        step: '02',
        title: 'TEMPORAL FREEZE PROBE',
        metric: 'INTER-FRAME DELTA: >1.8%',
        detail: 'Continuous frame delta monitoring confirms dynamic real-time image feed; zero frozen buffer or repeated frame anomalies.'
      },
      {
        step: '03',
        title: 'OCCLUSION & GLARE AUDIT',
        metric: 'DYNAMIC RANGE: 8.2 STOPS',
        detail: 'Full-field histogram analysis verifies zero physical camera coverage, spray paint tampering, or blinding directed light.'
      },
      {
        step: '04',
        title: 'HARDWARE CERTIFICATION',
        metric: 'AUDIT STATUS: 100% COMPLIANT',
        detail: 'Hardware watchdog validates sensor uptime, temperature, and video pipeline memory footprint within nominal operating bounds.'
      }
    ],
    hypothesis: {
      score: '1.00 / 1.00',
      title: 'Sensor Diagnostic Integrity: 1.00 / 1.00',
      detail: 'All physical and optical parameters operating within ISO surveillance tolerances. Sensor certified for autonomous corridor operations.',
      incidentId: 'INC-HEALTH-09',
      buttonLabel: 'OPEN HARDWARE DIAGNOSTICS →',
      targetTab: 'system'
    }
  },

  'CAM-11': {
    cameraId: 'CAM-11',
    scenario: 'Unattended Baggage & Luggage Separation',
    purpose: 'unattended_baggage',
    file: 'cam11_unattended_baggage.mp4',
    duration: '30.0s',
    fps: 30,
    resolution: '1280x720',
    location: 'Central Rail Terminal Checkpoint B (JNC-01)',
    verificationState: 'ANOMALY DETACHED (P2)',
    verificationColor: '#f59e0b',
    provenance: 'INFERENCE (OBJECT ATTACHMENT ENGINE)',
    eyebrow: 'TERMINAL SECURITY SENSOR · CAM-11',
    title: 'CAM-11 UNATTENDED BAGGAGE & SEPARATION',
    subtitle: 'Terminal baggage security audit. Spatiotemporal person-object association graph, owner departure vector tracking, and stationary duration threshold alarm.',
    metrics: [
      { label: 'TARGET OBJECT', value: 'SUITCASE / BAGGAGE', sub: 'Class: Luggage' },
      { label: 'STATIONARY DWELL', value: '180.0 SECONDS', sub: 'Threshold: 120s' },
      { label: 'CARRIER DISTANCE', value: '12.4 METERS', sub: 'Detached radius' },
      { label: 'SECURITY ALERT', value: 'CONFIRMED (P2)', sub: 'Station marshals' }
    ],
    technicalDetails: {
      checkpoint: 'artifacts/models/nayan_india_v2/best.pt',
      timing: '23.9 ms median · 41.8 FPS throughput',
      codec: '1280x720 · H.264 Baseline @ 30.0 FPS',
      tracking: 'Spatiotemporal Association Graph + Orphan State Machine'
    },
    calibratedOverlays: [
      {
        id: 'c11-bag',
        label: 'UNATTENDED BAGGAGE · 0.92 CONF',
        sub: 'STATIONARY: 180s · OWNER DETACHED: 12.4m',
        color: '#f59e0b',
        box: { top: '56%', left: '46%', width: '14%', height: '22%' },
        pulse: true
      },
      {
        id: 'c11-owner',
        label: 'CARRIER VECTOR #P-402',
        sub: 'DEPARTING → EXIT GATE',
        color: '#ef4444',
        box: { top: '32%', left: '72%', width: '12%', height: '30%' }
      }
    ],
    hudBadges: [
      { text: 'ORPHAN THRESHOLD EXCEEDED (>120s)', color: '#ef4444' },
      { text: 'TERMINAL POLICE ALERT LOGGED', color: '#f59e0b' }
    ],
    evidenceSteps: [
      {
        step: '01',
        title: 'PERSON-OBJECT CO-OCCURRENCE',
        metric: 'CO-OCCURRENCE DURATION: 45s',
        detail: 'Tracking graph initially paired luggage with carrier ID #P-402, observing continuous proximity under 0.6 meters.'
      },
      {
        step: '02',
        title: 'SPATIAL SEPARATION VECTOR',
        metric: 'SEPARATION DISTANCE: >12.4m',
        detail: 'Carrier trajectory departed towards exit gates while object remained stationary on terminal floor without custody transfer.'
      },
      {
        step: '03',
        title: 'TIME-OUT THRESHOLD EXCEEDED',
        metric: 'STATIONARY DWELL: >180 SECONDS',
        detail: 'Zero re-association attempts observed for 3 consecutive minutes; proximity radius remained vacant of owner.'
      },
      {
        step: '04',
        title: 'SECURITY ALERT ELEVATION',
        metric: 'STATE: CONFIRMED UNATTENDED (P2)',
        detail: 'Security protocol automatically triggered; keyframe thumbnail and bounding coordinates logged to audit trail.'
      }
    ],
    hypothesis: {
      score: '0.92 / 1.00',
      title: 'Unattended Baggage Score: 0.92 / 1.00',
      detail: 'Persistent unattended object confirmed. Spatiotemporal graph confirms owner detachment with zero return trajectory.',
      incidentId: 'INC-2026-003',
      buttonLabel: 'OPEN BAGGAGE CASE STUDY →',
      targetTab: 'incident'
    }
  }
};

export default function CameraPage({
  selectedCameraId = 'CAM-04',
  onSelectCamera,
  videoCatalogue = [],
  onOpenIncident,
  onNavigateTab
}) {
  // Active selected camera definition
  const currentCam = CAMERA_DEFINITIONS[selectedCameraId] || CAMERA_DEFINITIONS['CAM-04'];

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [activeEvidenceStep, setActiveEvidenceStep] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  // Live GPU Inference State
  const [isGpuActive, setIsGpuActive] = useState(false);
  const [gpuStatus, setGpuStatus] = useState(null);
  const [gpuTracks, setGpuTracks] = useState([]);
  const [loadingGpu, setLoadingGpu] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Reset active evidence step to 1 when camera changes
  useEffect(() => {
    setActiveEvidenceStep(1);
    setCurrentTime(0);
  }, [selectedCameraId]);

  // Robust video initialization on feed switch
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Browser autoplay policy requires muted property explicitly set on DOM node
    video.muted = isMuted;
    video.defaultMuted = isMuted;
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Autoplay prevented or deferred:', err);
          setIsPlaying(false);
        });
    }
  }, [currentCam.file, reloadKey, isMuted]);

  // Video event listeners for progress & duration
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    setReloadKey(k => k + 1);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  // GPU Live Inference Toggle
  const handleToggleGpu = async () => {
    if (loadingGpu) return;
    setLoadingGpu(true);

    if (!isGpuActive) {
      try {
        await fetch('/api/videos/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ camera_id: currentCam.cameraId, loop_video: true })
        });
        setIsGpuActive(true);
      } catch (err) {
        console.error('Failed to start GPU analysis:', err);
      } finally {
        setLoadingGpu(false);
      }
    } else {
      try {
        await fetch('/api/videos/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ camera_id: currentCam.cameraId })
        });
        setIsGpuActive(false);
        setGpuTracks([]);
        setGpuStatus(null);
      } catch (err) {
        console.error('Failed to stop GPU analysis:', err);
      } finally {
        setLoadingGpu(false);
      }
    }
  };

  // Poll GPU telemetry when GPU inference is active
  useEffect(() => {
    if (!isGpuActive) return;
    let isMounted = true;

    const pollInference = async () => {
      try {
        const [statRes, trackRes] = await Promise.all([
          fetch(`/api/videos/status/${currentCam.cameraId}`),
          fetch(`/api/videos/tracks/${currentCam.cameraId}`)
        ]);

        if (statRes.ok && isMounted) {
          const s = await statRes.json();
          setGpuStatus(s);
        }
        if (trackRes.ok && isMounted) {
          const t = await trackRes.json();
          setGpuTracks(t.tracks || []);
        }
      } catch (e) {
        // Silently continue polling
      }
    };

    pollInference();
    const interval = setInterval(pollInference, 400);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isGpuActive, currentCam.cameraId]);

  // Render Live GPU Canvas Bounding Boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!isGpuActive || gpuTracks.length === 0) return;

    const scaleX = width / 1280.0;
    const scaleY = height / 720.0;

    gpuTracks.forEach((t) => {
      const [x1, y1, x2, y2] = t.bbox;
      const sx1 = x1 * scaleX;
      const sy1 = y1 * scaleY;
      const sw = (x2 - x1) * scaleX;
      const sh = (y2 - y1) * scaleY;

      let color = currentCam.verificationColor || '#00e5ff';
      if (t.domain_type === 'ambulance') color = '#f59e0b';
      if (t.stationary_duration_s > 2.0) color = '#ef4444';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(sx1, sy1, sw, sh);

      const label = `${t.domain_type?.toUpperCase() || 'OBJ'} · ${Math.round(t.confidence * 100)}%`;
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(sx1, Math.max(0, sy1 - 18), ctx.measureText(label).width + 8, 16);
      ctx.fillStyle = color;
      ctx.fillText(label, sx1 + 4, Math.max(12, sy1 - 6));
    });
  }, [gpuTracks, isGpuActive, currentCam.verificationColor]);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectFeed = (camId) => {
    if (onSelectCamera) {
      onSelectCamera(camId);
    }
    // Smooth scroll back to video player
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleActionClick = () => {
    if (currentCam.hypothesis.targetTab && onNavigateTab) {
      onNavigateTab(currentCam.hypothesis.targetTab);
    } else if (onOpenIncident) {
      onOpenIncident(currentCam.hypothesis.incidentId);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero - Accurately Tailored to this Camera Feed */}
      <PageHero
        eyebrow={currentCam.eyebrow}
        title={currentCam.title}
        subtitle={currentCam.subtitle}
        meta={
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              className="text-micro"
              style={{
                color: currentCam.verificationColor,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: currentCam.verificationColor,
                  boxShadow: `0 0 8px ${currentCam.verificationColor}`
                }}
              />
              VERIFICATION: {currentCam.verificationState}
            </span>
            <span className="text-micro" style={{ color: 'var(--text-secondary)' }}>
              LOCATION: {currentCam.location}
            </span>
            <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
              PROVENANCE: {currentCam.provenance}
            </span>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '24px', paddingBottom: '120px' }}>
        
        {/* Quick Telemetry Strip (4 Metrics Tailored to this Camera Feed) */}
        <div
          style={{
            maxWidth: '1600px',
            margin: '0 auto 24px auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}
        >
          {currentCam.metrics.map((m, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px 20px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                {m.label}
              </span>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)'
                }}
              >
                {m.value}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {m.sub}
              </span>
            </div>
          ))}
        </div>

        {/* Primary Camera Media Container */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            maxWidth: '1600px',
            margin: '0 auto 64px auto',
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: currentCam.verificationColor,
                  boxShadow: `0 0 10px ${currentCam.verificationColor}`
                }}
              />
              <span className="text-micro" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                FEED: {currentCam.file} · {currentCam.scenario.toUpperCase()}
              </span>
              {isGpuActive && (
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    color: '#10b981',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Cpu size={12} />
                  CUDA INFERENCE LIVE
                </span>
              )}
            </div>

            {/* Quick Action Controls in Header */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Live GPU Inference Button */}
              <button
                onClick={handleToggleGpu}
                disabled={loadingGpu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isGpuActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${isGpuActive ? '#ef4444' : '#10b981'}`,
                  color: isGpuActive ? '#ef4444' : '#10b981',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Runs real YOLOv8 + ByteTrack CUDA inference on your NVIDIA RTX 4050"
              >
                <Cpu size={13} />
                <span>{loadingGpu ? 'INITIALIZING...' : (isGpuActive ? 'STOP GPU INFERENCE' : 'START GPU INFERENCE (RTX 4050)')}</span>
              </button>

              {/* Toggle Overlays */}
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: showOverlays ? 'var(--text-primary)' : 'var(--text-muted)',
                  padding: '5px 10px',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {showOverlays ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>{showOverlays ? 'OVERLAYS ON' : 'OVERLAYS OFF'}</span>
              </button>

              {/* Technical Metadata Drawer Toggle */}
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '5px 10px',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {showTechnicalDetails ? 'HIDE METADATA' : 'TECHNICAL DETAILS +'}
              </button>
            </div>
          </div>

          {/* Video Container with Dynamic CV Overlays */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 'clamp(440px, 60vh, 850px)',
              backgroundColor: '#000',
              overflow: 'hidden'
            }}
          >
            {/* HTML5 Video Element - with unique key per file to guarantee remount */}
            <video
              key={`${currentCam.file}-${reloadKey}`}
              ref={videoRef}
              autoPlay={isPlaying}
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000',
                display: 'block'
              }}
            >
              {/* Dual source paths for resilient delivery */}
              <source src={`/api/videos/file/${currentCam.file}`} type="video/mp4" />
              <source src={`/media/nayan/feeds/${currentCam.file}`} type="video/mp4" />
              Your browser does not support HTML5 video streaming.
            </video>

            {/* GPU Live Inference HTML5 Canvas Overlay */}
            {isGpuActive && (
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 10
                }}
              />
            )}

            {/* Respective Calibrated CV Bounding Box Overlays */}
            {showOverlays && !isGpuActive && (
              <>
                {currentCam.calibratedOverlays.map((ov) => (
                  <div
                    key={ov.id}
                    style={{
                      position: 'absolute',
                      top: ov.box.top,
                      left: ov.box.left,
                      width: ov.box.width,
                      height: ov.box.height,
                      border: `2px solid ${ov.color}`,
                      boxShadow: ov.pulse ? `0 0 16px ${ov.color}88` : `0 0 6px ${ov.color}44`,
                      pointerEvents: 'none',
                      zIndex: 8,
                      animation: ov.pulse ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {/* Top Label Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-20px',
                        left: 0,
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: ov.color,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        border: `1px solid ${ov.color}`,
                        padding: '1px 6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {ov.label}
                    </div>

                    {/* Bottom Telemetry Tag */}
                    {ov.sub && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-18px',
                          left: 0,
                          fontSize: '9px',
                          fontFamily: 'monospace',
                          color: '#fff',
                          backgroundColor: 'rgba(0,0,0,0.85)',
                          padding: '1px 5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {ov.sub}
                      </div>
                    )}

                    {/* Corner Reticle Accents */}
                    <span style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '6px', borderTop: `2px solid #fff`, borderLeft: `2px solid #fff` }} />
                    <span style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', borderTop: `2px solid #fff`, borderRight: `2px solid #fff` }} />
                    <span style={{ position: 'absolute', bottom: 0, left: 0, width: '6px', height: '6px', borderBottom: `2px solid #fff`, borderLeft: `2px solid #fff` }} />
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: '6px', height: '6px', borderBottom: `2px solid #fff`, borderRight: `2px solid #fff` }} />
                  </div>
                ))}
              </>
            )}

            {/* Top-Left Live HUD Badge Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none',
                zIndex: 9
              }}
            >
              {currentCam.hudBadges.map((badge, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(10, 12, 16, 0.85)',
                    border: `1px solid ${badge.color}66`,
                    padding: '4px 10px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    color: badge.color,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Bottom-Right Live Telemetry HUD */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                backgroundColor: 'rgba(10, 12, 16, 0.85)',
                border: '1px solid var(--border-subtle)',
                padding: '6px 12px',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                pointerEvents: 'none',
                zIndex: 9
              }}
            >
              <span>FPS: <strong style={{ color: '#10b981' }}>{gpuStatus?.fps?.toFixed(1) || currentCam.fps}</strong></span>
              <span>RES: <strong style={{ color: '#fff' }}>{currentCam.resolution}</strong></span>
              <span>GPU: <strong style={{ color: '#38bdf8' }}>RTX 4050</strong></span>
              <span>FRAME: <strong style={{ color: '#fff' }}>{gpuStatus?.frame_idx || Math.round(currentTime * currentCam.fps)}</strong></span>
            </div>
          </div>

          {/* Full HTML5 Video Controls Bar */}
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: 'rgba(10, 10, 12, 0.95)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* Timeline Scrubber */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', minWidth: '45px' }}>
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flex: 1,
                  accentColor: currentCam.verificationColor,
                  cursor: 'pointer',
                  height: '4px'
                }}
              />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: '45px' }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Button Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Play / Pause */}
                <button
                  onClick={handleTogglePlay}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                {/* Mute / Unmute */}
                <button
                  onClick={handleToggleMute}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >
                  {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
                </button>

                {/* Restart */}
                <button
                  onClick={handleRestart}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                  title="Reload and restart stream"
                >
                  <RotateCcw size={13} />
                  <span>RESET</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                  SENSOR STATUS: ACTIVE
                </span>
                <button
                  onClick={handleFullscreen}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Toggle Fullscreen"
                >
                  <Maximize size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Technical Metadata Drawer */}
          {showTechnicalDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.35, ease: editorialEase }}
              style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '24px',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px'
              }}
            >
              <div>
                <span className="text-micro">INFERENCE CHECKPOINT</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
                  {currentCam.technicalDetails.checkpoint}
                </p>
              </div>
              <div>
                <span className="text-micro">FRAME TIMING (RTX 4050)</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
                  {currentCam.technicalDetails.timing}
                </p>
              </div>
              <div>
                <span className="text-micro">RESOLUTION & CODEC</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
                  {currentCam.technicalDetails.codec}
                </p>
              </div>
              <div>
                <span className="text-micro">TRACKING ENGINE</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  {currentCam.technicalDetails.tracking}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Section: "WHY THIS ALERT?" — Respective Scenario Narrative */}
        <div style={{ marginTop: '72px', borderTop: '1px solid var(--border-strong)', paddingTop: '56px' }}>
          <div style={{ maxWidth: '850px', marginBottom: '48px' }}>
            <span className="text-micro" style={{ color: currentCam.verificationColor }}>
              TEMPORAL FORENSIC EVIDENCE CHAIN · {currentCam.cameraId}
            </span>
            <h2 className="text-display-lg" style={{ margin: '8px 0 16px 0' }}>
              WHY THIS ALERT?
            </h2>
            <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
              NAYAN rejects single-frame false alarms. State machine transitions require cumulative physical kinematic evidence:
              cross-trajectory vectors, deceleration differentials, and sustained spatial persistence.
            </p>
          </div>

          <div className="grid-12" style={{ alignItems: 'flex-start' }}>
            {/* Left Narrative Stepper (Tailored to active camera) */}
            <div className="col-span-6" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {currentCam.evidenceSteps.map((ev, idx) => {
                const isActive = activeEvidenceStep === idx + 1;
                return (
                  <div
                    key={ev.step}
                    onClick={() => setActiveEvidenceStep(idx + 1)}
                    style={{
                      borderLeft: `2px solid ${isActive ? currentCam.verificationColor : 'var(--border-subtle)'}`,
                      paddingLeft: '24px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                      paddingTop: '8px',
                      paddingBottom: '8px'
                    }}
                  >
                    <span
                      className="text-micro"
                      style={{
                        color: isActive ? currentCam.verificationColor : 'var(--text-muted)',
                        fontWeight: 600
                      }}
                    >
                      STAGE {ev.step} / {ev.metric}
                    </span>
                    <h3
                      style={{
                        margin: '6px 0 8px 0',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {ev.title}
                    </h3>
                    <p className="text-body" style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                      {ev.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Forensic Detail Callout (Tailored to active camera) */}
            <div
              className="col-span-6"
              style={{
                border: '1px solid var(--border-subtle)',
                padding: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                position: 'sticky',
                top: '90px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="text-micro" style={{ color: currentCam.verificationColor }}>
                  HYPOTHESIS EVALUATION · {currentCam.cameraId}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    backgroundColor: `${currentCam.verificationColor}22`,
                    border: `1px solid ${currentCam.verificationColor}66`,
                    color: currentCam.verificationColor
                  }}
                >
                  SCORE: {currentCam.hypothesis.score}
                </span>
              </div>

              <h4 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>
                {currentCam.hypothesis.title}
              </h4>

              <p className="text-body" style={{ margin: '0 0 24px 0', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {currentCam.hypothesis.detail}
              </p>

              {/* Active Step Metric Spotlight */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '24px'
                }}
              >
                <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                  ACTIVE EVIDENCE STAGE {currentCam.evidenceSteps[activeEvidenceStep - 1]?.step} SPOTLIGHT
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {currentCam.evidenceSteps[activeEvidenceStep - 1]?.metric}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {currentCam.evidenceSteps[activeEvidenceStep - 1]?.detail}
                </p>
              </div>

              <hr className="editorial-rule" style={{ marginBottom: '20px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span className="text-micro">ASSOCIATED RECORD</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>
                    {currentCam.hypothesis.incidentId}
                  </p>
                </div>

                <button
                  onClick={handleActionClick}
                  style={{
                    padding: '10px 18px',
                    border: `1px solid ${currentCam.verificationColor}`,
                    background: `${currentCam.verificationColor}15`,
                    color: currentCam.verificationColor,
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {currentCam.hypothesis.buttonLabel}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Feed Switcher Rows (Palomino Editorial Rows - All 8 CCTV Feeds) */}
        <div style={{ marginTop: '100px', borderTop: '1px solid var(--border-strong)', paddingTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <span className="text-micro" style={{ display: 'block', marginBottom: '8px' }}>
                OPTICAL SENSOR REGISTRY
              </span>
              <h2 className="text-heading" style={{ margin: 0, textTransform: 'uppercase' }}>
                AVAILABLE CCTV FEEDS
              </h2>
            </div>
            <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
              8 TELEMETRY STREAMS REPRODUCIBLE IN REAL TIME
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {Object.values(CAMERA_DEFINITIONS).map((cam, idx) => {
              const num = String(idx + 1).padStart(2, '0');
              const isSelected = cam.cameraId === selectedCameraId;

              return (
                <div
                  key={cam.cameraId}
                  onClick={() => handleSelectFeed(cam.cameraId)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    paddingLeft: isSelected ? '16px' : '0',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
                    <span className="text-micro" style={{ color: isSelected ? cam.verificationColor : 'var(--text-muted)' }}>
                      {num}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: 500,
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                          }}
                        >
                          {cam.cameraId} — {cam.scenario}
                        </h3>
                        <span
                          style={{
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            padding: '1px 6px',
                            border: `1px solid ${cam.verificationColor}66`,
                            color: cam.verificationColor,
                            backgroundColor: `${cam.verificationColor}15`
                          }}
                        >
                          {cam.verificationState}
                        </span>
                      </div>
                      <span className="text-micro" style={{ marginTop: '6px', display: 'block', color: 'var(--text-muted)' }}>
                        PURPOSE: {cam.purpose.toUpperCase()} · DURATION: {cam.duration} · FILE: {cam.file}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'monospace',
                      color: isSelected ? cam.verificationColor : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isSelected ? (
                      <>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cam.verificationColor }} />
                        ACTIVE VIEW
                      </>
                    ) : (
                      'SELECT FEED →'
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
