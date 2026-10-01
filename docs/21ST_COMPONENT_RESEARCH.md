# 21st.dev Component Research & Architecture for NAYAN

This document details the exact 21st.dev motion primitives, community components, and scroll choreography mechanics researched, adapted, and implemented across the NAYAN urban intelligence platform.

---

## 1. Global & Hero Motion

### Scroll media expansion hero
- **SOURCE URL**: https://21st.dev/community/components/explore/scroll-animation-component
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`
- **MECHANISM**: Tracks viewport scroll progress `[0, 0.4]` on an outer container. Uses `useTransform` to expand media dimensions from an inset crop (`width: 82vw`, `border-radius: 16px`, `scale: 0.94`) to full bleed (`100vw`, `border-radius: 0px`, `scale: 1.0`). Headline translate operates at a faster parallax speed (`translateY: 0 -> -120px`).
- **WHAT IT LOOKS LIKE**: A framed, cinematic CCTV camera frame that expands seamlessly to occupy the entire viewport as the user begins scrolling down, drawing the viewer directly into the live optical feed.
- **WHERE NAYAN USES IT**: Landing Hero ([LandingPage.jsx](file:///c:/nayan/frontend/src/pages/Landing/LandingPage.jsx) / [Hero.jsx](file:///c:/nayan/frontend/src/landing/Hero.jsx)).
- **ADAPTATION NOTES**: Adapted for Vite + React 19. Pure Motion implementation avoiding Next.js image components; binds directly to native HTML5 video and WebP stills.

### Container Scroll Animation
- **SOURCE URL**: https://21st.dev/community/components/explore/scroll-animation-component
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`
- **MECHANISM**: 3D perspective rotation on X-axis (`rotateX: 20deg -> 0deg`) combined with scale interpolation (`scale: 0.88 -> 1.0`) inside a perspective container (`perspective: 1200px`).
- **WHAT IT LOOKS LIKE**: A tilted command terminal display that stands up vertically and docks flat against the viewport as you scroll into the section.
- **WHERE NAYAN USES IT**: Landing Page Hero container and Command Center primary overview.
- **ADAPTATION NOTES**: Built with restrained editorial damping (`editorialEase`) rather than excessive 3D bounce.

### Scroll Morph Hero
- **SOURCE URL**: https://21st.dev/community/components/explore/scroll-animation-component
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`, `useSpring`
- **MECHANISM**: Multi-card kinematic scattering that rearranges from a line or circle formation into an expanded grid strip based on scroll offset.
- **WHAT IT LOOKS LIKE**: Stills from 8 CCTV cameras scatter smoothly into an interactive surveillance filmstrip.
- **WHERE NAYAN USES IT**: Evidence & Testimonials section ([EvidenceCases.jsx](file:///c:/nayan/frontend/src/landing/EvidenceCases.jsx)).
- **ADAPTATION NOTES**: Kept non-blocking; supports reduced-motion fallback.

### Full Screen Scroll FX & Scroll Choreography
- **SOURCE URL**: https://21st.dev/community/components/explore/scroll-animation-component
- **DEPENDENCIES**: `motion/react`, `AnimatePresence`
- **MECHANISM**: Page-level exit and entrance coordination. Exiting page elements mask upwards (`y: 0 -> -30px`, `opacity: 1 -> 0`) behind a brief dark architectural curtain while incoming page titles reveal via clip-path masks.
- **WHAT IT LOOKS LIKE**: Seamless, cinematic tab and page transitions that feel like navigating high-end editorial documentary chapters rather than abrupt client-side route swaps.
- **WHERE NAYAN USES IT**: Product-wide page transitions in [App.jsx](file:///c:/nayan/frontend/src/App.jsx) and [pageTransitions.js](file:///c:/nayan/frontend/src/motion/pageTransitions.js).
- **ADAPTATION NOTES**: Standardized at 500ms duration with `editorialEase: [0.25, 1.0, 0.5, 1.0]`.

### Zoom Parallax
- **SOURCE URL**: https://21st.dev/community/components/explore/scroll-animation-component
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`
- **MECHANISM**: Pinned multi-layer container where nested media layers scale at differentiated exponential rates (`layer1: scale 1 -> 1.8`, `layer2: scale 1 -> 2.6`).
- **WHAT IT LOOKS LIKE**: Diving directly into an aerial satellite view down into an individual street junction camera.
- **WHERE NAYAN USES IT**: Landing page transition into Junction 2 detail.
- **ADAPTATION NOTES**: Optimized with `will-change: transform` to maintain 60 FPS on integrated GPUs.

---

## 2. Typography & Letter Motion

### Letter Swap & Random Letter Swap Navigation (Flip Links)
- **SOURCE URL**: https://21st.dev/community/components/explore/motion-primatives
- **DEPENDENCIES**: `motion/react`
- **MECHANISM**: Each nav link contains two identical text layers stacked inside an overflow-hidden mask. On pointer hover, letters stagger upward: the top letter translates from `y: 0% -> -100%` while the duplicate bottom letter enters from `y: 100% -> 0%`.
- **WHAT IT LOOKS LIKE**: Sharp, kinetic typography swap characteristic of Palomino’s luxury editorial navigation.
- **WHERE NAYAN USES IT**: [AppHeader.jsx](file:///c:/nayan/frontend/src/layout/AppHeader.jsx), primary CTA buttons, and audit category filters.
- **ADAPTATION NOTES**: Implemented as `<LetterSwapLink />`. Supports custom stagger timings and monospaced font preservation.

### Split Reveal Text & Text Roll
- **SOURCE URL**: https://21st.dev/community/components/explore/motion-primatives
- **DEPENDENCIES**: `motion/react`, `useInView`
- **MECHANISM**: Text strings are split by words or lines into nested `inline-block` wrappers with `overflow: hidden`. Lines slide vertically upward (`y: 105% -> 0%`) when scrolled into view.
- **WHAT IT LOOKS LIKE**: Headlines rise authoritatively out of invisible baseline slots.
- **WHERE NAYAN USES IT**: PageHero titles, section headers, and "WHY THIS ALERT?" narrative headlines.
- **ADAPTATION NOTES**: Implemented as `<SplitRevealText />`. Supports `once: true` to prevent repetitive re-triggering.

---

## 3. Media, Galleries & Hover Interactions

### Project Showcase & Hover Image Gallery
- **SOURCE URL**: https://21st.dev/community/components/explore/image-gallery-component
- **DEPENDENCIES**: `motion/react`, `useMotionValue`, `useSpring`
- **MECHANISM**: Editorial list rows where hovering an item triggers an absolute floating media preview that tracks pointer coordinates with damped spring inertia (`stiffness: 250`, `damping: 25`).
- **WHAT IT LOOKS LIKE**: Gliding cursor previewing live CCTV thumbnails over incident and camera list rows without cluttering the screen with static card grids.
- **WHERE NAYAN USES IT**: [SelectedIntelligence.jsx](file:///c:/nayan/frontend/src/landing/SelectedIntelligence.jsx), Command Center incident rows, and Camera selector.
- **ADAPTATION NOTES**: Implemented as `<HoverMediaPreview />`. Completely decoupled from cards.

### Image Trail (by Daniel Petho)
- **SOURCE URL**: https://21st.dev/community/components/explore/image-gallery-component
- **DEPENDENCIES**: `motion/react`, Pointer velocity tracking
- **MECHANISM**: When mouse travels across designated interactive zones with velocity $> 250 px/s$, recent frame snapshots spawn sequentially at pointer coordinates and fade/scale down over 600ms.
- **WHAT IT LOOKS LIKE**: A temporal visual ribbon of surveillance evidence frames echoing cursor movement.
- **WHERE NAYAN USES IT**: Selected Intelligence container on Landing Page.
- **ADAPTATION NOTES**: Disabled automatically on touch devices and when `useReducedMotion()` is active.

### Immersive Scroll Gallery
- **SOURCE URL**: https://21st.dev/community/components/explore/image-gallery-component
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`
- **MECHANISM**: Multi-column asynchronous vertical gallery where before-event, key-impact, and post-event crops scroll at alternating velocities (`[0, 1] -> [-50px, 80px]`).
- **WHAT IT LOOKS LIKE**: Magazine-grade forensic breakdown of multi-angle crash footage.
- **WHERE NAYAN USES IT**: Incident Detail Page ([IncidentPage.jsx](file:///c:/nayan/frontend/src/pages/Incident/IncidentPage.jsx)).
- **ADAPTATION NOTES**: Retains 100% genuine CCTV footage from NAYAN Indian surveillance benchmark.

---

## 4. Stack, Deck & Card Motion

### Sticky Scroll Cards Section / Animated Cards Stack / Card Curtain Reveal
- **SOURCE URL**: https://21st.dev/community/components/explore/sticky-scroll-reveal
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`
- **MECHANISM**: A parent container of $400\text{vh}$ with four sticky stacked panels (`01 DETECT`, `02 VERIFY`, `03 RESPOND`, `04 SIMULATE`). Each card pins at a measured top offset. As user scrolls down:
  1. Card $k$ is pinned at full scale.
  2. Card $k+1$ translates up from `translateY: 100% -> 0%`.
  3. As card $k+1$ covers card $k$, card $k$ scales down (`scale: 1.0 -> 0.95`), shifts slightly upward (`y: 0 -> -2vh`), and dims (`brightness: 1 -> 0.75`), leaving an exposed top deck edge.
  4. Sequence repeats through Card 04, which then releases into the following section.
- **WHAT IT LOOKS LIKE**: A weighted physical card deck sliding and stacking under your fingers, communicating the core 4-step autonomous pipeline.
- **WHERE NAYAN USES IT**: [ScrollDeck.jsx](file:///c:/nayan/frontend/src/motion/ScrollDeck.jsx) replacing the static capability section on Landing Page.
- **ADAPTATION NOTES**: Each panel is composed of 65% high-contrast real media and 35% bold typography, completely rejecting SaaS card layouts.

---

## 5. Storytelling & Narrative Motion

### Interactive Scrolling Story Component & Sticky Scroll Reveal
- **SOURCE URL**: https://21st.dev/community/components/explore/sticky-scroll-reveal
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`
- **MECHANISM**: Two-column layout: Sticky media container (left or right, `position: sticky; top: 100px; height: 75vh`) paired with a long narrative stream. As narrative stages scroll through the trigger zone, the active stage index updates, causing the sticky media to crossfade (`opacity: 0 -> 1`, `scale: 1.04 -> 1.0`) and trigger annotation state changes.
- **WHAT IT LOOKS LIKE**: An investigative journalism piece where the map, CCTV feed, or junction diagram stays locked in place while the evidence unfolds alongside it.
- **WHERE NAYAN USES IT**:
  - Command Center ([CommandCenterPage.jsx](file:///c:/nayan/frontend/src/pages/Command/CommandCenterPage.jsx))
  - Camera "WHY THIS ALERT?" ([CameraPage.jsx](file:///c:/nayan/frontend/src/pages/Camera/CameraPage.jsx))
  - Traffic Signal Progression ([TrafficPage.jsx](file:///c:/nayan/frontend/src/pages/Traffic/TrafficPage.jsx))
  - Corridor Formation ([CorridorPage.jsx](file:///c:/nayan/frontend/src/pages/Corridor/CorridorPage.jsx))
- **ADAPTATION NOTES**: Implemented as `<StickyStory />` with responsive single-column collapse for mobile screens.

---

## 6. Comparison Sliders

### Image Comparison Slider (by Le Thanh) / Compare Slider
- **SOURCE URL**: https://contact_2a72bbaa.21st.dev/@diceui/components/compare-slider/compare-slider-vertical-demo
- **DEPENDENCIES**: `motion/react`, `useMotionValue`
- **MECHANISM**: Dual image/canvas layers clipped via CSS `clip-path: inset(0 (100 - X)% 0 0)`. A custom draggable handle tracks pointer movement or keyboard arrow keys (`ArrowLeft`, `ArrowRight`). Supports spring snap and touch events.
- **WHAT IT LOOKS LIKE**: An ultra-clean hairline slider that cuts between "Standard Fixed Time Baseline" (heavy red arterial queue) and "NAYAN Adaptive AI Green Wave" (fluid green corridor), letting the evaluator physically wipe between the two realities.
- **WHERE NAYAN USES IT**: Digital Twin Page ([DigitalTwinPage.jsx](file:///c:/nayan/frontend/src/pages/DigitalTwin/DigitalTwinPage.jsx)).
- **ADAPTATION NOTES**: Implemented as `<ComparisonSlider />`. Both images use identical camera angles, dimensions, and Indian arterial topology.

---

## 7. Metrics & Animated Numbers

### Animated Number / Animated Counter / Sliding Number
- **SOURCE URL**: https://21st.dev/community/components/explore/motion-primatives
- **DEPENDENCIES**: `motion/react`, `useSpring`, `useInView`, `useTransform`
- **MECHANISM**: Wraps integer and floating-point metrics in a Motion spring (`stiffness: 80`, `damping: 20`). Triggers once when the metric enters the viewport. Interpolates values from 0 to target with unit suffixes (e.g. `0 -> 98.2%`, `0 -> 42.1 FPS`).
- **WHAT IT LOOKS LIKE**: Large, bold editorial numerals counting smoothly into place without layout shift.
- **WHERE NAYAN USES IT**: Key figures, Digital Twin comparison metrics, Camera telemetry, and Command Center HUD.
- **ADAPTATION NOTES**: Implemented as `<AnimatedMetric />`.

---

## 8. Timelines & SVG Path Following

### Modern Timeline & Timeline-02
- **SOURCE URL**: https://21st.dev/community/components/explore/motion-primatives
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`
- **MECHANISM**: Full-viewport vertical line rendered via SVG with `pathLength: 0 -> 1` tied to scroll progress. Each milestone occupies $35\text{--}50\text{vh}$ with staggered reveals on entry.
- **WHAT IT LOOKS LIKE**: A commanding editorial log filling the entire screen, with each decision, AI reasoning event, and camera inference milestone clearly articulated.
- **WHERE NAYAN USES IT**: Audit Trail Page ([AuditPage.jsx](file:///c:/nayan/frontend/src/pages/Audit/AuditPage.jsx)) and Connected Junctions in Traffic.
- **ADAPTATION NOTES**: Replaces the former cramped table with a full-height cinematic narrative timeline.

### SVG Follow Scroll
- **SOURCE URL**: https://21st.dev/community/components/explore/scroll-animation-component
- **DEPENDENCIES**: `motion/react`, `useScroll`, `useTransform`
- **MECHANISM**: An SVG arterial route vector with animated `pathLength`. An emergency vehicle glyph coordinates along the spline `[x, y]` coordinates as scroll advances from step 01 to step 09.
- **WHAT IT LOOKS LIKE**: An emergency corridor clearing ahead of the ambulance as you scroll.
- **WHERE NAYAN USES IT**: Emergency Corridor Page ([CorridorPage.jsx](file:///c:/nayan/frontend/src/pages/Corridor/CorridorPage.jsx)).
- **ADAPTATION NOTES**: Coordinates directly with junction green-wave signals.

---

## 9. AI Interaction & Approval

### AI Reasoning & AI Approval
- **SOURCE URL**: https://21st.dev/community/components/explore/motion-primatives
- **DEPENDENCIES**: `motion/react`, `AnimatePresence`
- **MECHANISM**: Structured editorial status pipeline with staged text transitions:
  1. `READING INCIDENT STATE`
  2. `CROSS-REFERENCING CCTV TRACKS`
  3. `VALIDATING SAFETY ENVELOPE`
  4. `ACTION READY FOR OPERATOR`
  Approval button expands with confirmation state, calling the backend dispatch API and transitioning seamlessly into the authorized audit record.
- **WHAT IT LOOKS LIKE**: Mission-critical air-traffic-control grade AI co-pilot, rejecting generic chatbot speech bubbles.
- **WHERE NAYAN USES IT**: AI Copilot Page ([AIPage.jsx](file:///c:/nayan/frontend/src/pages/AI/AIPage.jsx)).
- **ADAPTATION NOTES**: Tied directly to FastAPI `/api/copilot` and incident dispatch endpoints.

---

## 10. Motion Footer

### Motion Footer (Curtain Reveal)
- **SOURCE URL**: https://news.21st.dev/blog/react-footer-design-examples
- **DEPENDENCIES**: `motion/react`, `sticky/fixed` positioning architecture
- **MECHANISM**: The footer sits with `position: fixed; bottom: 0; z-index: 1; height: 500px;`. The main foreground content container has `position: relative; z-index: 2; margin-bottom: 500px; background: var(--bg-primary);`. As the user scrolls past the last section, the foreground slides upward, uncovering the footer like a theater curtain.
- **WHAT IT LOOKS LIKE**: An enormous masked NAYAN typographic wordmark uncurtains behind the page, accompanied by a technology marquee and magnetic action trigger.
- **WHERE NAYAN USES IT**: Product-wide Master Footer ([MotionFooter.jsx](file:///c:/nayan/frontend/src/motion/MotionFooter.jsx)).
- **ADAPTATION NOTES**: Handles mobile heights gracefully with CSS clamp.
