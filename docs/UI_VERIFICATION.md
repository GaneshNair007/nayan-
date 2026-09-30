# UI integration verification — 2026-09-30

- Frontend: `npm run lint` and `npm run build` passed.
- Backend: 22 pytest cases passed, process exited normally. The installed Starlette version reports one upstream TestClient/httpx deprecation warning.
- Browser: real FastAPI and Vite services; landing, collision replay, camera evidence, modal acknowledge/propose/authorize/dispatch, generated corridor, adaptive signal recommendation, MOCK twin, and filtered audit trail passed.
- All six module screens passed document overflow checks at 1920, 1440, 1280, 1024, and 390 pixels (30 checks). Page runtime errors: zero. Reduced-motion CSS and Escape-to-close dialog were verified.
- Recorded-source posters are extracted from the repository's own source clips. They provide useful real previews while video loads or when the browser cannot decode its codec. The test headless shell cannot decode the MP4 codec; playback in a codec-capable desktop browser remains a manual check.
- The design adapts the observed Palomino layout and motion principles to NAYAN's operational screens. This is not a claim of a pixel-identical copy of the reference website.

Runtime boundaries are documented in LOCAL_SETUP.md: asynchronous overlays, deterministic scenario data, offline schematic coordinates, and MOCK digital twin results remain clearly labelled.
