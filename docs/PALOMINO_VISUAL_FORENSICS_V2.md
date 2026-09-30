# Palomino Visual Forensics v2 (Empirically Measured & Reconstructed)

Observed live from `https://palominoprod.com/en` on October 1, 2026 using automated Chromium/Edge headless instrumentation across 6 viewports and 21 scroll sequence checkpoints (0%–100% in 5% increments, 7,475px total scroll height).

---

## 1. Measured Viewport Baselines & Assets

Artifacts saved in `artifacts/pal_reference/`:
- `viewport_1920x1080.png`
- `viewport_1600x900.png`
- `viewport_1440x900.png`
- `viewport_1280x800.png`
- `viewport_1024x768.png`
- `viewport_390x844_mobile.png`
- `scroll_1440x900/scroll_000pct_0px.png` through `scroll_100pct_7475px.png` (21 frames)
- `palomino_computed_metrics.json` (Full DOM computed tree)

---

## 2. Macro Section Sequence & NAYAN Mapping

| Palomino Section | Reference Behavior & Classes | NAYAN Equivalent |
| :--- | :--- | :--- |
| **01. Header / Nav** | Fixed `h-[75px]`, `px-5`, `bg-linear-to-b from-black/50 to-black/0`, character-swap links (`WORK WORK`, `ABOUT ABOUT`, `CONTACT CONTACT`) | `COMMAND COMMAND`, `CAMERAS CAMERAS`, `SYSTEM SYSTEM` + Enter Command Center button |
| **02. Hero** | `sticky top-0 h-screen overflow-hidden`, `h1 text-[12vw] font-medium leading-none`: `SPORTS / INTO / STORIES` | Full-screen CCTV video, `CAMERAS / INTO / INTELLIGENCE`, line-height 1.0, 12vw |
| **03. Clients** | `sticky w-screen bg-black pt-[72px]`, moving logo strip | Monochrome NAYAN technology & capability marks: `YOLO`, `PYTORCH`, `CUDA`, `BYTETRACK`, `FASTAPI`, `OPENCV`, `SUMO`, `OSRM` |
| **04. Selected Projects** | Left 1/3 rail: `SELECTED PROJECTS` + 30.7px copy; Right 2/3: Asymmetric film cards (row 1: 505/295; row 2: 295/505), caption translateY(100% -> 0) | Left 1/3 rail: `SELECTED LIVE INTELLIGENCE`; Right 2/3: `CAM-04 (Collision)`, `CAM-03 (Ambulance)`, `CAM-07 (Crowd)`, `CAM-11 (Baggage)` |
| **05. Key Figures** | Inset panel grid (3 cols x 2 rows), tabular numbers aligned right, small index left | 6 verified metrics: `98.8% mAP50`, `40.7 FPS`, `23.6ms Latency`, `98.0% Amb Precision`, `8 Nodes`, `100% Provenance` |
| **06. Services (4 Layers)** | 4 layered stacked panels (`BRAND CAMPAIGNS`, `ATHLETES & STORYTELLING`, `EVENT & LIVE COVERAGE`, `STRATEGY`), media ~380px left, editorial copy center, capabilities list right | 4 layered stacked panels: `01 DETECT`, `02 VERIFY`, `03 RESPOND`, `04 SIMULATE` with exact 3-column composition |
| **07. Our Story** | Asymmetric 2-column editorial layout with portrait visual and negative space | `HOW NAYAN WORKS`: Bridging what happens between CCTV frames |
| **08. Testimonials** | Centered quote typography, horizontal & vertical rules, previous/next zone controls | Forensic case explanations: `"Confirmation required trajectory conflict, deceleration and persistent obstruction across multiple frames."` |
| **09. Closing Statement** | Sticky black section with massive display type: `LET’S MAKE SOMETHING ICONIC.` | Sticky black section with massive display type: `ENTER THE LIVE COMMAND CENTER.` |
| **10. Footer** | `w-screen bg-white text-black h-screen sticky bottom-0`, 5 columns (`INFOS`, `PAGES`, `SOCIALS`, `LEGALS`, `CREDITS`), giant bottom wordmark `P A L O M I N O` | `bg-white text-black`, 5 technical columns, giant bottom wordmark `N A Y A N` across the full viewport width |

---

## 3. Micro-Interaction & Motion Mechanics

1. **Navigation Character-Swap Hover**:
   - Each link contains two duplicate text layers in clipped wrappers (`overflow: clip`).
   - Layer 1 (`char-primary`): `translate(0%, 0%)` -> on hover translates to `+100% X`.
   - Layer 2 (`char-secondary`): `translate(-100%, 0%)` -> on hover translates to `0% X`.
   - Timing: `0.45s` with per-character stagger delay (`idx * 0.015s`).
2. **Project Card Hover**:
   - Card container has `overflow: hidden`.
   - Media: `transform: scale(1.0)` -> on hover scales gently to `scale(1.03)`.
   - Caption: `transform: translateY(100%)` -> on hover slides up to `translateY(0%)` using cubic-bezier(0.2, 1, 0.3, 1).
3. **Cursor-Follow Preview**:
   - Subtle floating media capsule tracking pointer position with RAF/linear interpolation (`quickTo` style). Clamped to viewport boundaries.
4. **Stacked Service Panels**:
   - 4 sequential panels pin at `top: 0` / `top: 100px`. As scroll continues, subsequent panels slide up and stack over prior panels.
5. **Footer Sticky Reveal**:
   - White footer is pinned `sticky bottom-0 h-screen`, revealed as the black closing section scrolls up and away from it.

---

## 4. Typography & Color Specifications

- **Primary Font**: `HostGrotesk, sans-serif` (Google Fonts: `Host Grotesk`).
- **Display Weights**:
  - Large Hero Display: `600`, line-height `1.0`, letter-spacing `normal`.
  - Section Labels: `300` or `400`, `16px`, line-height `1.2`.
  - Project Titles: `400`, `20px`, line-height `1.2`.
  - Service Titles: `600`, `43.2px`, uppercase, line-height `1.2`.
  - Key Figures: `600`/`700`, tabular numerals, right-aligned.
- **Palette**:
  - Dominant Background: `#000000` (Pure black) / `#08090d` (near black).
  - Editorial Footer Background: `#ffffff` (Pure white).
  - Footer Text: `#000000`.
  - Body Text: `#ffffff` (White) / `rgba(255, 255, 255, 0.7)` (Neutral warm gray).
  - Accents: Strictly monochrome / subtle warm white, with status indicators constrained to small semantic dots. Zero neon, zero cyan hero gradients, zero scanlines.
