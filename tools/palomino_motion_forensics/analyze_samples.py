import json

with open('artifacts/palomino-motion/motion-samples.json', 'r', encoding='utf-8') as f:
    samples = json.load(f)

print(f"Total samples: {len(samples)}")

print("\n=== HERO MOTION TRAJECTORY ===")
for s in samples[:25:3]:
    h = s.get('hero', {})
    img = h.get('img') or {}
    h1 = h.get('h1') or {}
    print(f"ScrollY: {s['scrollY']} | Progress: {s['scrollProgress']} | Img Transform: {img.get('style', {}).get('transform')} | Img Top: {img.get('rect', {}).get('top')} | H1 Opacity: {h1.get('style', {}).get('opacity')} | H1 Top: {h1.get('rect', {}).get('top')}")

print("\n=== SELECTED PROJECTS TRAJECTORY ===")
for s in samples[20:70:8]:
    p = s.get('projects', {})
    sec = p.get('section') or {}
    items = p.get('items', [])
    print(f"ScrollY: {s['scrollY']} | Progress: {s['scrollProgress']} | Sec Top: {sec.get('rect', {}).get('top')} | Items count: {len(items)}")
    for idx, itm in enumerate(items[:2]):
        print(f"   Project {idx}: rect={itm.get('rect')} | transform={itm.get('style', {}).get('transform')}")

print("\n=== SERVICES TRAJECTORY ===")
for s in samples[60:150:12]:
    srv = s.get('services', {})
    sec = srv.get('section') or {}
    items = srv.get('items', [])
    print(f"ScrollY: {s['scrollY']} | Progress: {s['scrollProgress']} | Sec Top: {sec.get('rect', {}).get('top')} | Items count: {len(items)}")
    for idx, itm in enumerate(items[:2]):
        print(f"   Service {idx}: rect={itm.get('rect')} | transform={itm.get('style', {}).get('transform')}")

print("\n=== CTA AND FOOTER REVEAL ===")
for s in samples[170::4]:
    cta = s.get('cta') or {}
    ftr = s.get('footer') or {}
    print(f"ScrollY: {s['scrollY']} | Progress: {s['scrollProgress']} | CTA Top: {cta.get('rect', {}).get('top')} | CTA Opacity: {cta.get('style', {}).get('opacity')} | Footer Top: {ftr.get('rect', {}).get('top')} | Footer Pos: {ftr.get('style', {}).get('position')}")
