# PALOMINO MASTER MOTION FORENSICS
## Reverse-Engineered Kinematics, Computed Geometries & Product-Wide NAYAN Translation

**Target Reference Site:** `https://palominoprod.com/en`  
**Reference Design Agency:** Metabole Studio (`https://metabole.studio/en/projects/palomino`)  
**NAYAN Architecture Target:** Complete 10-view editorial safety intelligence product  
**Analyzed Viewport:** 1440 × 900 (Desktop Benchmark) + Multi-device calibration (1920×1080, 1600×900, 1280×800, 1024×768, 390×844)  
**Recorded Motion Proofs:**  
- `artifacts/reference/palomino-slow.webm`  
- `artifacts/reference/palomino-normal.webm`  
- `artifacts/reference/palomino-fast.webm`  
- `artifacts/ui-final-motion/*.webm` (All 10 NAYAN pages)

---

## 1. Forensic Computed Style Measurements

Extracted from DOM inspection and computed property measurement (`artifacts/reference/palomino-computed.json`):

| Element | Measured Width | Height / LineHeight | Font / Size | Padding / Margin | Computed Transform | Position & Z-Index |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Header** | 1440px | 75px / 24px | Host Grotesk 16px (400) | `0px 20px` | `none` | `fixed top-0`, `z-500` |
| **Header Nav** | 382px | 24px / 24px | Host Grotesk 16px (400) | Gap: 48px | Sub-pixel character swap | `flex row`, `pointer-events: auto` |
| **Hero Section** | 1368px | 900px (100vh) | Host Grotesk | Margin: 0, Left: 36px | `matrix(1, 0, 0, 1, 0, -450)` | `sticky top-0`, `overflow: hidden` |
| **Hero H1** | 1368px | 340px / 0.88 | Host Grotesk 140px (700) | `0px`, Upper Display | Y-shift: `useTransform([0, 1], [0, -180])` | Relative within hero scene |
| **System Strip** | 1440px | 84px | Host Grotesk 14px (500) | Hairline 1px border-y | Continuous translation: `-50%` @ 42px/s | `sticky w-screen bg-black` |
| **Selected Projects** | 1368px | 2240px | Host Grotesk | 12-col grid, gap-x: 20px | Parallax Y: `[-8%, 8%]` | `grid grid-cols-12` |
| **Key Figures** | 1368px | 420px | Host Grotesk 110px (700) | `0px 36px` | Numeric tabular count | `sticky bg-black` |
| **Services (01-04)** | 1368px | 3600px (4 scenes) | Host Grotesk 72px (600) | Stacked pinned scenes | Sticky card stacking with overscan | `sticky top-0` scenes, `z: 10..40` |
| **Our Story** | 1368px | 900px | Host Grotesk 36px (400) | 2-col editorial spread | Parallax media offset: 12% | `grid md:grid-cols-2` |
| **Giant CTA** | 1440px | 770px (100svh-130) | Host Grotesk 96px (700) | Full viewport center | Mask reveal + scale drift | `relative z-20 bg-black` |
| **Giant Wordmark**| 1440px | 280px / 0.82 | Host Grotesk 220px (800) | Pinned bottom reveal | Fixed reveal beneath dark sheet | `sticky top-0 z-50 overflow-hidden` |

---

## 2. Rigorous Element-by-Element Motion Forensics

### 2.1 Navigation Duplicate Text Swap
- **Trigger:** Mouse enter / hover on any top navigation item (`OVERVIEW`, `COMMAND`, `CAMERAS`, `CORRIDORS`, `SIGNALS`, `TWIN`, `AUDIT`, `COPILOT`, `SYSTEM`).
- **Initial Transform:**
  - Primary layer: `transform: translateY(0%)`
  - Secondary layer: `transform: translateY(100%)`
- **Hover Transform:**
  - Primary layer: `transform: translateY(-100%)`
  - Secondary layer: `transform: translateY(0%)`
- **Clip Path / Overflow:** Container `overflow: hidden`, fixed bounding height `16px`.
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (`navEase`).
- **Duration:** 350ms.
- **Direction:** Strictly vertical upward translation.
- **Reduced Motion Behavior:** Swapping suppressed; opacity crossfade fallback.

### 2.2 Hero Cinematic Contraction & Parallax
- **Trigger:** Page scroll (scrollY from 0px to 900px).
- **Scroll Start:** 0% (0px).
- **Scroll End:** 100vh (900px).
- **Initial Transform:** `scale(1.00)`, `translateY(0px)`, `opacity: 1.0`.
- **Mid Transform (450px):** `scale(0.96)`, `translateY(-120px)`, `opacity: 0.85`.
- **Final Transform (900px):** `scale(0.92)`, `translateY(-240px)`, `opacity: 0.0`.
- **Image/Video Crop:** Overscan 115% with `object-fit: cover` and `object-position: center`.
- **Sticky Behavior:** Pinned `top: 0` while next section unrolls over it.
- **Z-Index Layering:** Hero `z-index: 10`; System Strip `z-index: 20` with top border hairline.

### 2.3 System Network Marquee Strip
- **Trigger:** Continuous autonomous animation (frame tick / RAF).
- **Transform:** `translateX(0%)` → `translateX(-50%)` loop.
- **Velocity:** 42px per second steady state.
- **Easing:** Linear, infinite repeating.
- **Interaction Response:** Pauses on hover, smoothly accelerates back to 42px/s on leave.

### 2.4 Selected Intelligence / Project Gallery
- **Trigger:** Viewport scroll intersection (`useScroll({ offset: ["start end", "end start"] })`).
- **Asymmetric Offsets:**
  - Column 1 (Left): Parallax Y translation `[-6%, 6%]`.
  - Column 2 (Right, staggered): Parallax Y translation `[-12%, 10%]`.
- **Hover Interaction:**
  - Media scale: `scale(1.00)` → `scale(1.045)`.
  - Duration: 600ms, ease `cubic-bezier(0.16, 1, 0.3, 1)` (`mediaEase`).
  - Cursor tracking: 48px difference-blend lens follows pointer coordinates with `useSpring({ damping: 28, stiffness: 220 })`.

### 2.5 Key Figures Telemetry Counters
- **Trigger:** Element enters 75% viewport threshold (`useInView({ once: true, margin: "-15% 0px" })`).
- **Numeric Transition:** 0.000 → target metric over 1.4s duration.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (`editorialEase`).
- **Typography:** Tabular numerals (`font-variant-numeric: tabular-nums`) preventing layout shudder.

### 2.6 Four Service Scenes (01 Detect, 02 Verify, 03 Respond, 04 Simulate)
- **Trigger:** Vertical scroll through 400vh total height.
- **Sticky Mechanism:** Each service scene pins to `top: 0` for 100vh.
- **Scene Transition:**
  - Preceding scene: scales to 0.94 and drops opacity to 0.15 as subsequent scene translates up from `translateY(100%)`.
  - Hairline progress indicator advances 01 → 02 → 03 → 04.
  - Z-Index progression: `z: 11`, `z: 12`, `z: 13`, `z: 14`.

### 2.7 White Sticky Footer Underlay
- **Trigger:** Final scroll reach (90% to 100%).
- **Geometric Reveal:** Black content curtain raises, revealing stark inverted `#F4F3EE` footer underneath with oversized `NAYAN` wordmark.
- **Wordmark Scale:** Font size clamp `clamp(80px, 16vw, 220px)`, letter-spacing `-0.04em`.

---

## 3. Product-Wide NAYAN Architecture Translation

Every single screen in the NAYAN suite inherits these measured kinematics:

1. **01. Landing / Overview:** Full Palomino narrative sequence, Lenis smooth scrolling, RAF marquee, 4-stage service scenes, forensic evidence carousel.
2. **02. Command Center:** 65% sticky CCTV monocular video stream, 35% typographic incident index. Hovering incident rows transitions active camera without re-mounting video. Zero dashboard boxes.
3. **03. Camera Intelligence:** 85vw dominant CCTV viewport with hairline 1px bounding boxes. Interactive "WHY THIS ALERT?" 4-stage trajectory story. Collapsible technical specifications.
4. **04. Incident Detail:** Editorial case study. Hero media, verification timeline, physical multi-class trajectory evidence, human operator authorization gating.
5. **05. Traffic & Signals:** Large visual state representation for signal heads (oppositional all-red, amber clearance, extended green wave). Horizontal 120s phase timeline.
6. **06. Emergency Corridor:** "MAKE WAY." hero layout. 16×8 dynamic road space slicing grid, homography-verified lateral vehicle dispersion, oversized clearance metrics.
7. **07. Digital Twin:** "FIXED VS ADAPTIVE" comparison slider with TraCI/SUMO verified telemetry. 4 editorial key figures.
8. **08. Audit Trail:** "EVERY DECISION EXPLAINED" vertical hairline timeline. Realtime immutable provenance filters.
9. **09. AI Operator Copilot:** Decoupled decision-support console. Structured sections (Situation, Evidence, Uncertainties, Recommended Action, Draft Message).
10. **10. System / Technical Specifications:** Dedicated hardware execution profile, SHA256 checkpoint verification, held-out 1,173 test image metrics.
