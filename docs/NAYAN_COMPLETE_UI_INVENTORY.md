# NAYAN Complete UI Inventory & Surface Audit

This inventory catalogues every reachable route, view, drawer, modal, and state across the NAYAN frontend to guarantee 100% Palomino editorial coverage, zero surviving legacy dashboard screens, zero dead controls, and complete 21st.dev motion choreography.

---

## 1. Primary Page Surfaces

| Route / View ID | Component File | Entry Method | Current Design Status | Backend Dependencies | Redesign Status | 21st.dev Effect | Palomino Design Pattern |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `landing` | [LandingPage.jsx](file:///c:/nayan/frontend/src/pages/Landing/LandingPage.jsx) | Default route, Nav brand click, Footer link | Complete Editorial Reconstruction | None (Initial snapshot), `/api/videos` | **COMPLETE** | Scroll Morph Hero, ScrollDeck, Project Showcase, Motion Footer | Asymmetric editorial grid, massive typography, photographic dominance |
| `command-center` | [CommandCenterPage.jsx](file:///c:/nayan/frontend/src/pages/Command/CommandCenterPage.jsx) | Nav link `COMMAND`, Landing CTA | Interactive Sticky Story | `/api/incidents`, `/api/cameras`, `/api/corridors`, WebSocket | **COMPLETE** | Interactive Scrolling Story + Sticky Scroll Reveal | Monocular split-pane, high-contrast monochrome mapping |
| `camera-intel` | [CameraPage.jsx](file:///c:/nayan/frontend/src/pages/Camera/CameraPage.jsx) | Nav link `CAMERAS`, Feed row click | Full Multi-Feed Intelligence | `/api/videos/file/*`, `/api/videos/tracks/*`, `/api/videos/analyze` | **COMPLETE** | Mask Reveal + Sticky Story + Real CUDA Overlays | Inset 720p media canvas, 4-stage evidence chain, editorial stepper |
| `incident` | [IncidentPage.jsx](file:///c:/nayan/frontend/src/pages/Incident/IncidentPage.jsx) | Incident click from Command or Camera | Immersive Case Study | `/api/incidents/{id}`, `/api/incidents/{id}/dispatch` | **COMPLETE** | Immersive Scroll Gallery + Modern Timeline | Investigative documentary case study, asymmetric frame offsets |
| `traffic` | [TrafficPage.jsx](file:///c:/nayan/frontend/src/pages/Traffic/TrafficPage.jsx) | Nav link `SIGNALS`, Camera action | Interactive Signal Story | `/api/mobility/junctions`, `/api/mobility/junctions/{id}/phase` | **COMPLETE** | Sticky Signal Story + SVG Network PathLength | Full-screen dynamic junction canvas, thin hairline rules, zero box clutter |
| `corridor` | [CorridorPage.jsx](file:///c:/nayan/frontend/src/pages/Corridor/CorridorPage.jsx) | Nav link `CORRIDORS`, Ambulance CTA | SVG Follow Scroll + Dynamic Grid | `/api/mobility/corridor/active`, `/api/mobility/corridor/request` | **COMPLETE** | SVG Follow Scroll + Scroll Choreography | Real road-space elasticity grid, dynamic preemption spline |
| `digital-twin` | [DigitalTwinPage.jsx](file:///c:/nayan/frontend/src/pages/DigitalTwin/DigitalTwinPage.jsx) | Nav link `TWIN` | Image Comparison Slider | `/api/mobility/simulation/status`, `/api/mobility/simulation/run` | **COMPLETE** | Image Comparison Slider by Le Thanh + Animated Numbers | Full-width before/after drag wipe, matched Indian traffic topology |
| `audit` | [AuditPage.jsx](file:///c:/nayan/frontend/src/pages/Audit/AuditPage.jsx) | Nav link `AUDIT` | Modern Timeline | `/api/audit/events`, WebSocket stream | **COMPLETE** | Modern Timeline + Text Reveal + Stagger Reveals | Full-viewport vertical chronological progress line, zero dead space |
| `ai-copilot` | [AIPage.jsx](file:///c:/nayan/frontend/src/pages/AI/AIPage.jsx) | Nav link `COPILOT`, Incident AI CTA | Structured AI Reasoning | `/api/copilot/chat`, `/api/copilot/status`, `/api/incidents/{id}/dispatch` | **COMPLETE** | AI Reasoning + AI Approval Interaction | Air-traffic-control dispatch console, zero conversational chat bubbles |

---

## 2. Global Drawers, Modals & Navigation Overlays

| Component | File | Entry Method | Purpose & Content | 21st.dev Motion Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **AppHeader** | [AppHeader.jsx](file:///c:/nayan/frontend/src/layout/AppHeader.jsx) | Persistent top fixed | Navigation across all 9 views, WebSocket live pulse, Drawer triggers | Letter Swap Navigation (Flip Links) |
| **SystemDrawer** | [SystemDrawer.jsx](file:///c:/nayan/frontend/src/layout/SystemDrawer.jsx) | Header `SYSTEM` button | Full-height architectural overlay with Model, GPU, CUDA, DB, WS health | Shared layout mask reveal + Large metric typography |
| **ScenarioDrawer** | [ScenarioDrawer.jsx](file:///c:/nayan/frontend/src/layout/ScenarioDrawer.jsx) | Header `SCENARIOS +` button | 1-Click trigger for Golden Demo, Ambulance, Collision, Baggage, Reset | Editorial drawer slide with AnimatePresence |
| **MotionFooter** | [MotionFooter.jsx](file:///c:/nayan/frontend/src/motion/MotionFooter.jsx) | Persistent bottom | Theatrical curtain reveal, oversized NAYAN wordmark, magnetic trigger | Motion Footer (curtain reveal architecture) |

---

## 3. Application State Coverage Matrix

All application states are rendered with the strict Palomino editorial visual language (high contrast, black `#000000`, off-white `#F4F3EE`, subtle rules, zero browser alert boxes):

| Application State | Handling Component / Pattern | Visual Representation |
| :--- | :--- | :--- |
| **Loading** | Inline editorial pulse ring + monospaced latency indicator | Minimalist typography with hairline progress bar |
| **Empty State** | Editorial empty plate with clear prompt | Monospaced coordinate tag, subtle hairline boundary, actionable button |
| **Offline / WS Disconnected** | Amber persistent status indicator in header (`OFFLINE RECONNECTING`) | Non-blocking reconnect backoff with retry action |
| **CUDA Active** | Emerald badge `CUDA:0 (RTX 4050)` with real frame latency | JetBrains Mono telemetry display with real-time FPS count |
| **Model Fallback** | Honest provenance tag: `REPLAY_FIXTURE` vs `INFERENCE` | Full cryptographic model SHA-256 transparency in System Drawer |
| **Action Succeeded** | Soft emerald transition with state machine advancement | Instant audit event logging and timeline update |
| **Action Failed** | Structured red indicator with exact API error detail | Non-intrusive recovery action button |

---

## 4. Clickable Controls & Interactive Inventory

| Control ID / Name | Host Component | Action Triggered | Motion & Feedback |
| :--- | :--- | :--- | :--- |
| **Start Live GPU Inference** | `CameraPage.jsx` | Calls `POST /api/videos/analyze` | Button transitions to red `STOP`, live canvas overlay activates |
| **Timeline Scrubber** | `CameraPage.jsx` | Seeks video `currentTime` | Damped range slider with dynamic `mm:ss` counter |
| **Feed Selection Rows (1–8)** | `CameraPage.jsx` | Switches selected camera ID | Smooth scroll focus, dynamic video remount, tailored evidence swap |
| **4-Stage Evidence Stepper** | `CameraPage.jsx` | Selects active evidence stage (1–4) | Active border-left highlight, metric spotlight update |
| **Comparison Slider Handle** | `ComparisonSlider.jsx` | Drags baseline vs adaptive split | Spring-damped dual clip-path wipe, keyboard arrow support |
| **Signal Phase Stepper** | `TrafficPage.jsx` | Scrolls through 7-stage signal cycle | Real-time traffic light glow transition, SVG route drawing |
| **Corridor Spline Tracker** | `CorridorPage.jsx` | Advances emergency transit step | Ambulance icon tracks SVG spline via `pathLength` |
| **AI Action Authorization** | `AIPage.jsx` | Calls `POST /api/incidents/{id}/dispatch` | Expanding confirmation drawer, visual state transition |
| **Golden Demo Quick-Launch** | `ScenarioDrawer.jsx` | Simulates multi-vehicle collision | WebSocket broadcast, incident drawer notification |
| **Emergency Corridor Launch** | `ScenarioDrawer.jsx` | Initiates ambulance preemption corridor | JNC-02 signal preemption override, map re-routing |
| **System Diagnostic Drawer** | `AppHeader.jsx` | Opens full-height diagnostic drawer | AnimatePresence mask slide with hardware metrics |
| **Letter Swap Navigation** | `AppHeader.jsx` | Switches view tab | Kinetic vertical text swap on hover |
| **Scroll Cards Deck (01–04)** | `ScrollDeck.jsx` | Scrolls through 4 capability decks | Stacking physics: card $k$ scales down to 0.96 as card $k+1$ rises |
