# Palomino first-page forensics

Observed live on 2026-10-01 at https://palominoprod.com/en before implementation of the scoped NAYAN landing page. No reference code or media is included in the application.

## Evidence and scope

Eleven viewport screenshots cover approximately 0–100% of scroll in 10% steps (actual scroll offsets saved in reference-scroll-measurements.json). Separate navigation and project hover captures are saved in outputs/visual-comparison. Browser automation exposes screenshots, scrolling and read-only rendered DOM inspection; it does not expose a screen recorder or a free pointer-move action. Hover was observed by moving the scroll target over links with a subpixel wheel delta. These captures establish states, not calibrated frame timing.

Requested viewport overrides: 1920×1080, 1440×900, 1280×800, 390×844. The browser accepted all four but continued reporting and rendering 1280×720, including after reload and a fresh tab. viewport-control-audit.json records this. Therefore only 1280×720 is visually verified. Requested responsive reference views and exact frame-by-frame timing remain unverified; neither is claimed complete.

## Measured composition at actual 1280×720

| Region | Approximate geometry | Typography / treatment |
|---|---|---|
| Header | Fixed x0 y0 w1280 h75; horizontal padding20; z500 | White text, black-to-transparent backdrop; brand at20; navigation near520,633,749; 16px labels |
| Hero | Full viewport, 1280×720; sticky top0 desktop; overflow hidden | h1 153.6px (12vw), line-height1, reported weight600; three lines aligned left/center/right; no letter spacing |
| Hero support | x20, lower-left, ~400px width | 16px; three compact lines |
| Modules/client strip | Starts y720, h262 | Centered small label; moving horizontal logo strip; black background |
| Selected work | Starts y982, h978; outer padding20; 20px column gap | Label and 30.7px editorial copy in left third; media on right two thirds |
| Media grid | Right area x440–1260; first row widths505/295; second295/505; each450 high, gap20 | Rectangular clipped films; captions reveal at bottom on hover; no floating image follows the pointer here |
| Key figures | y1960, h539 | Six cells, three columns by two rows, near-black inset panels; number aligned toward right; small index left; large tabular numerals |
| Services | y2499, h2166 | Four layered sticky panels. Panel inset20, padding20. Three columns: media~380, editorial~505, list~295. Image ~450px high; image title38.4px; copy30.7/20px |
| Story | y4665, h900; padding80 desktop | Asymmetric two columns, portrait media, substantial negative space and editorial copy |
| Evidence/testimonials | y5565, h809 | Centered label; horizontal rule and vertical rules at about1/6 and5/6; centered quote~26px; next/previous side controls |
| Closing call to action | y6373, ~590px scroll allocation | Enormous multi-line linked type in black section; fixed/sticky visual as footer enters |
| Footer | Final white viewport; h720; inset20; top information ~130px | Five editorial columns; huge bottom wordmark (nearly whole viewport width), imagery clipped into letters; black final panel retreats above it |

The first page does not have a standalone mission section before clients. Its substantial introductory copy is within the selected-work left rail. NAYAN can place its mission there while retaining this pacing.

## Animation matrix

Durations marked estimated are engineering approximations, not measured frame timings.

| Element | Trigger | Start → end | Duration / easing | Mode / observations |
|---|---|---|---|---|
| Entrance | Initial load | Light reference loader/grid → media and text | Timing unverified; brief finite entrance | NAYAN brief explicitly substitutes a black bootstrap curtain |
| Hero lines | Load | Clipped/offset → aligned visible lines | Estimated 0.8–1.1s, eased out | Sequential line entry; do not animate every paragraph |
| Hero | Scroll | Full screen → covered by following black section | Scroll driven | Sticky viewport; avoid large arbitrary zoom. Subtle media translation is an approximation |
| Navigation | Hover | First character layer exits to +100% X, second enters to0 | Estimated ~0.45s; character stagger | **Observed horizontal per-character swap**, not a vertical whole-word roll. Clipped character wrappers, two layers |
| Client strip | Continuous | Horizontal repeated marks move through clipped region | Speed not frame-calibrated | Linear marquee; pause on user request/reduced motion |
| Work media | Intersection | Clipped/zoomed image → visible crop | Estimated ~0.8s out | Rectangular masks; different grid widths |
| Work caption | Hover | translateY(100%) →0 | Computed 0.6s cubic-bezier(0.3,1,0.7,1) | Caption below clipping edge rises into media; no full image popup observed on homepage |
| Cursor | Pointer | Small white ring/dot follows pointer; expands to text circle at testimonial side | Estimated ~0.15s follow | White circle with dark label observed for Next; normal pointer remains fallback |
| Numbers | Intersection |0 → final value | Estimated1.2s out | Counts once, not continuously. NAYAN instead animates known prior values to fresh backend values |
| Services | Scroll | Panel enters → pins around y100; prior panels scale/dim underneath | Scrubbed | Stacked panels, not an accordion; prior media remains behind the next panel |
| Story | Scroll | Portrait image and text enter | Estimated0.8s reveal, subtle parallax | Vertical flow, not horizontal carousel |
| Testimonials | Controls / rotation | Current content → another item | Timing uncalibrated | Centered text, bottom identity; prev/next zones |
| Closing panel/footer | Scroll | Black closing composition → white footer | Scrubbed sticky reveal | Footer appears from underneath, huge wordmark ending |

## NAYAN reconstruction decisions

- Keep React/Vite and all existing operational pages. Only an entry wrapper and initial-selection props connect the landing page to the existing app.
- Match measured desktop gutters, full-viewport hero, left/center/right type, horizontal module rhythm, six figures, stacked three-column services, story, ruled evidence section and white oversized footer.
- Use real backend-served CCTV with extracted poster frames; explicitly label recorded/demo footage. Never portray scroll-driven conceptual stages as actual incident transitions.
- User specifically requests four editorial camera rows and a persistent cursor-follow preview. This is an **intentional product adaptation**: the current reference homepage uses an asymmetric media grid with caption reveal, not those rows. Preserve a large inline film field and the same 1/3–2/3 composition. Use clipped, crossfading preview with constrained coordinates; disable pointer-follow on touch/reduced motion.
- Implement horizontal character-swap navigation based on direct observation, despite the brief's hypothetical vertical example.
- Independent CSS with landing scope; no changes to backend contracts or existing operational screen styles.
- GSAP/ScrollTrigger owns reveal and scroll transforms; Lenis only on fine-pointer desktop with reduced motion off. One shared ticker; native touch; cleanup on route change.
- Host Grotesk from the public Google Fonts distribution is a licensed substitute, not a downloaded reference font file. Original NAYAN wordmark and diagram; no reference media or written copy.

## Remaining limits

Responsive reference measurements, exact easing/timings for JS-only animations, complete hover edge-case automation, and true video scroll recording are not available from this browser interface. The implementation and final report must distinguish verified desktop states from approximations and unverified checks. This document completes the available pre-implementation investigation; it does not assert that all requested forensic evidence has been obtained.
