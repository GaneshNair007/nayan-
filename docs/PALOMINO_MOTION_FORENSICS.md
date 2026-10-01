# PALOMINO MOTION FORENSICS — EMPIRICAL MEASUREMENT SPECIFICATION

**Reference URL:** https://palominoprod.com/en  
**Studio Case Study:** https://metabole.studio/en/projects/palomino  
**Sampling Dataset:** `artifacts/palomino-motion/motion-samples.json` (210 samples @ 60ms interval, 8375px document height)  
**Reference Video Captures:**
- `artifacts/palomino-motion/reference-slow.webm`
- `artifacts/palomino-motion/reference-normal.webm`
- `artifacts/palomino-motion/reference-fast.webm`

---

## 1. Architectural Motion Framework & Stacking Rules

The Palomino homepage operates on an **editorial stacking card system** where sections are not separated by generic vertical margins. Instead, almost every major section is configured with `position: sticky; top: 0; background: #000000;`. Subsequent sections scroll directly over preceding sections, creating an organic layering rhythm:

```
[HEADER: fixed, z-index 50, mix-blend-mode / backdrop blur]
↓
[HERO: height 100vh, sticky top: 0, image contract: 1.6x -> 1.0x]
↓
[CLIENTS: sticky w-screen bg-black, marquee speed: ~42px/s]
↓
[SELECTED PROJECTS: sticky grid-cols-12, card hover scale: 1.0x -> 1.10x]
↓
[KEY FIGURES: sticky h: 603px, 6 numbered figures with viewport entry trigger]
↓
[SERVICES: sticky stack of 4 layers, h: 500px, bg: #111111, pinned at top: 0]
↓
[OUR STORY: sticky grid-cols-2, min-h: 900px, editorial text + image]
↓
[TESTIMONIALS / EVIDENCE: sticky h: 831px, horizontal carousel slide]
↓
[CTA "LET'S MAKE SOMETHING ICONIC": relative/sticky, h: 770px -> scrolls up]
↓
[FOOTER: sticky bottom: 0, height: 100vh, white background, revealed under CTA]
```

---

## 2. Element-by-Element Motion Mapping

### Section 01: Header & Duplicate-Label Navigation
- **Element:** Header fixed bar (`<header>`) and navigation links (`<a href="...">`).
- **Trigger:** Initial viewport entry & pointer hover (`mouseenter` / `mouseleave`).
- **Initial State:** 
  - Layer A (visible): `translate(0%, 0%)`, opacity `1.0`.
  - Layer B (duplicate hidden): `translate(-100%, 0%)`, opacity `1.0`.
- **Hover Motion Type:** Horizontal Staggered Letter Roll (Left-to-Right).
- **Movement Distance:** 100% horizontal translation per letter.
- **Letter Stagger:** ~25ms delay per glyph (`W` -> `O` -> `R` -> `K`).
- **Mid State (@120ms):**
  - Letter 1 (W): Layer A at `+64.3%`, Layer B at `-35.6%`.
  - Letter 2 (O): Layer A at `+46.1%`, Layer B at `-53.9%`.
  - Letter 3 (R): Layer A at `+29.6%`, Layer B at `-70.4%`.
  - Letter 4 (K): Layer A at `+17.6%`, Layer B at `-82.4%`.
- **Final State (@520ms):**
  - Layer A: `translate(100%, 0%)` (clipped out of view to the right).
  - Layer B: `translate(0%, 0%)` (centered in view).
- **Clipping:** `overflow: clip` / `overflow: hidden` on letter container.
- **Measured Easing:** `cubic-bezier(0.25, 1, 0.5, 1)` (Power4.out curve, ~520ms duration).
- **Scroll Response:** Minimal fixed bar remains visible with subtle backdrop blur (`rgba(0,0,0,0.85)`).

---

### Section 02: Hero Media & Headline
- **Element:** Hero Background Photography (`<img>`) & Hero Title (`<h1>`).
- **Trigger:** Continuous scroll linkage from `scrollY = 0` to `scrollY = 880px` (`scrollProgress: 0.0 -> 0.11`).
- **Initial State (@scrollY 0):**
  - Image Transform: `matrix(1.6, 0, 0, 1.6, 0, 0)` (Oversized scale: **1.60x**).
  - Image Position: `top: -290px`, `height: 1440px` inside `h-screen overflow: hidden`.
  - Headline Position: `top: 185px`, opacity `1.0`.
- **Mid State (@scrollY 400, Progress: 0.053):**
  - Image Transform: `matrix(1.084, 0, 0, 1.084, 0, 0)` (Scale contracted to **1.084x**).
  - Headline Position: `top: 5px`, opacity `1.0`.
- **Final State (@scrollY 880, Progress: 0.117):**
  - Image Transform: `matrix(1.0, 0, 0, 1.0, 0, 0)` (Scale settled at **1.00x**).
  - Image Position: `top: -420px`.
  - Headline Position: `top: -215px`, opacity `0.0` (exited viewport).
- **Measured Visual Inertia:** Image contracts from 1.6x down to 1.0x with heavy visual weight.
- **Spring Feel:** None (scroll-linked MotionValue transform, zero oscillation).
- **Overscan Wrapper:** Parent wrapper has `height: 100vh; overflow: hidden; position: relative;`.

---

### Section 03: Client Strip / Continuous Marquee
- **Element:** Client logo band (`<div class="flex ...">`).
- **Trigger:** Continuous time-based translation (unlinked to scroll).
- **Measured Speed:** 42px / second steady translation to the left.
- **Track Structure:** Dual duplicate tracks with `gap: 60px`.
- **Loop Reset:** Exact translation from `0%` to `-50%` before seamless loop reset.
- **Reduced Motion:** Marquee pauses on hover or when `prefers-reduced-motion: reduce` is active.

---

### Section 04: Selected Projects (Editorial Media Cards)
- **Element:** 4 featured project cards in a 12-column asymmetric grid.
- **Grid Layout:**
  - Card 1: `col-span-8 md:col-span-7 h-[450px]`
  - Card 2: `col-span-4 md:col-span-5 h-[350px]`
  - Card 3: `col-span-5 md:col-span-6 h-[480px]`
  - Card 4: `col-span-7 md:col-span-6 h-[400px]`
- **Scroll Behavior:**
  - Entire section is `position: sticky; top: 0;`.
  - Parallax on inner media: `translateY: -5% -> +5%` mapped to `useScroll({ target: cardRef, offset: ["start end", "end start"] })`.
- **Hover Motion (Card Scale Zoom):**
  - Initial State: `scale(1.0)`.
  - Hover State: `scale(1.10)` on inner media wrapper (`overflow: hidden`).
  - Duration: `600ms`.
  - Easing: `cubic-bezier(0.25, 1, 0.5, 1)` (`ease-power4-out`).
- **Cursor / Floating Image:**
  - Palomino does **not** float arbitrary thumbnails across the screen on the homepage.
  - Instead, a minimal custom difference-dot cursor (`mix-blend-difference`) tracks pointer position, while the image itself scales inside its card slot.

---

### Section 05: Key Figures
- **Element:** 6 numbered benchmark figures (`01`, `02`, `03`, `04`, `05`, `06`).
- **Trigger:** Viewport entrance triggered once via `useInView(ref, { once: true, margin: "-10% 0px" })`.
- **Counter Motion:** Numeric value animates from 0 to target over `1200ms`.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (Expo.out).
- **Label Motion:** Staggered line rise (`translateY: 20px -> 0px`, `opacity: 0 -> 1`) with 80ms stagger.

---

### Section 06: Four Services (Stacked Sticky Scenes)
- **Element:** 4 major service layers (01 BRAND CAMPAIGNS, 02 ATHLETES, 03 EVENT, 04 STRATEGY).
- **Trigger:** Continuous scroll through `height: ~2200px` container.
- **Card-Stack Structure:**
  - Each item is `position: sticky; top: 80px; height: 500px; background: #111111; origin: top center;`.
  - Service 01 pins at `top: 80px`.
  - As user scrolls, Service 02 rises from bottom and pins on top of Service 01 (`z-index: 2`).
  - Service 01 scales down slightly to `0.96` with `opacity: 0.7`.
  - Service 03 pins on top of Service 02 (`z-index: 3`).
  - Service 04 pins on top of Service 03 (`z-index: 4`).
- **Internal Parallax:** Media inside the active service shifts `translateY: -8% -> +8%`.

---

### Section 07: Our Story
- **Element:** Two-column editorial section with massive headline and documentary photograph.
- **Trigger:** Scroll progression from `top: 4973px`.
- **Sticky / Stacking:** `position: sticky; min-h: 900px;`.
- **Media Motion:** Parallax offset `translateY: -6% -> +6%`.
- **Text Reveal:** Paragraph lines reveal from clip masks.

---

### Section 08: Testimonials / Forensic Evidence Cases
- **Element:** Full-width testimonial carousel / case switcher.
- **Trigger:** Click tab / slide trigger.
- **Transition Architecture:** `AnimatePresence` with direction-aware sliding:
  - Entering: `x: direction > 0 ? 40 : -40`, `opacity: 0`.
  - Active: `x: 0`, `opacity: 1`.
  - Exiting: `x: direction > 0 ? -40 : 40`, `opacity: 0`.
  - Duration: `450ms`, Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.

---

### Section 09: Massive CTA ("LET'S MAKE SOMETHING ICONIC")
- **Element:** Full-screen typography banner.
- **Height:** `calc(100svh - 130px)` (~770px).
- **Position:** `position: relative; z-index: 20; background: #000000;`.
- **Scroll Behavior:**
  - As user scrolls past, the CTA layer translates upward: `top: -135px -> -295px -> -455px -> -770px`.
  - It acts like a rising stage curtain, pulling back to expose the fixed white footer underneath.

---

### Section 10: Footer Sticky Reveal Underlay
- **Element:** White footer (`<footer>`).
- **Classes:** `w-screen bg-white pt-32 text-black sticky bottom-0 h-screen select-none`.
- **Z-Index:** `z-index: 10` (Underneath CTA's `z-index: 20`).
- **Initial State:** Pinned at `bottom: 0`, completely obscured by black CTA curtain.
- **Reveal Transition:**
  - As the black CTA section scrolls upward off-screen, the white footer is revealed in place without translating down.
  - Huge brand wordmark `PALOMINO` (NAYAN: `NAYAN`) fills the bottom horizontal span with massive scale.
