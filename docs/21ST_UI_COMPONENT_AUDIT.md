# 21st.dev interaction audit

Reviewed 2026-09-30. Patterns are independently implemented in the existing React/CSS stack; no third-party component source is copied, so no unverified licensing claim or attribution removal is involved. URLs below identify the reviewed sources. Catalogue previews/source availability varied; dependency descriptions refer to the reviewed examples, not a vendored package audit.

| Purpose | Candidate / source URL | Dependencies | Decision / reason | NAYAN location | Adaptation |
|---|---|---|---|---|---|
| Navigation | [CascadeText](https://21st.dev/community/components/aayush-duhan/cascade-text/default) | React + styling | Select vertical repeated-label idea; readable and close to Palomino | Global navigation | CSS transform; hide duplicate from accessibility; focus mirrors hover |
| Navigation alternative | [Fluid menu](https://21st.dev/@deepaksslibra/components/fluid-menu) | React / animation | Reject circular expanding geometry | None | Would compete with editorial structure |
| Media reveal | [Scroll media expansion collection](https://21st.dev/community/components/explore/scroll-driven-hero-template) | Candidates vary: Motion, GSAP, WebGL | Select expanding-media mechanics; reject shaders/3D | Landing CCTV | CSS view timeline progressive enhancement, native scroll, reduced-motion fallback |
| Text entrance | [Text animation guidance](https://docs.21st.dev/blog/react-animated-text-components) | Motion in Text Effect examples | Select one-time clipped/translated reveal; reject typewriter and particles | Module heading | Full text present immediately; 650ms CSS entrance |
| Counters | [Count-up guidance](https://docs.21st.dev/blog/unlumen-ui-components) | React / motion depends on example | Select only data-change emphasis; don't interpolate false numbers | Command telemetry and Twin results | Actual value always in DOM; key-based short reveal on changes |
| Drawer | [Modal/drawer guidance](https://news.21st.dev/blog/react-modal-dialog-components) | Radix / Vaul in compared patterns | Select focus-managed sheet mechanics | Incident detail | Native modal dialog, Escape, focus restore, backdrop click, no extra runtime |
| Loading | [Text animation guidance](https://docs.21st.dev/blog/react-animated-text-components) | Motion for Text Shimmer | Select contextual text; reject gradient shimmer | Camera/model/stream/twin | Static descriptive loading text and quiet line; aria-live |
| Footer | [Footer comparison](https://docs.21st.dev/blog/react-footer-design-examples) | GSAP / Motion in compared examples | Select oversized wordmark; reject magnetic/curtain choreography | Landing footer | CSS typography and module links |

Shared CSS motion tokens live in src/design/motion.js and index.css. No Tailwind, Three.js, GSAP or Motion dependency is justified for these bounded interactions. Native dialog supplies focus behaviour. No continuously animated telemetry, decorative grids or default component-library cards.
