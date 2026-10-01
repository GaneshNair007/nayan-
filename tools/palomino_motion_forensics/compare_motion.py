import json
import os

def load_samples(path):
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if isinstance(data, list):
            return data
        return data.get('samples', [])

def get_elem(sample, key):
    if not sample:
        return {}
    if 'elements' in sample:
        return sample['elements'].get(key, {}) or {}
    return sample.get(key, {}) or {}

def find_nearest_sample(samples, target_progress):
    best = None
    min_diff = 999
    for s in samples:
        p = float(s.get('scrollProgress', 0))
        diff = abs(p - target_progress)
        if diff < min_diff:
            min_diff = diff
            best = s
    return best

def compute_diffs():
    pal_samples = load_samples('artifacts/palomino-motion/motion-samples.json')
    nayan_samples = load_samples('artifacts/nayan-motion/motion-samples.json')

    print(f"Loaded Palomino samples: {len(pal_samples)}")
    print(f"Loaded NAYAN samples:    {len(nayan_samples)}")

    checkpoints = [
        (0.00, "Initial Viewport (Hero)"),
        (0.10, "Hero Contraction & Client Marquee"),
        (0.25, "Selected Projects Grid"),
        (0.40, "Key Figures Benchmark Matrix"),
        (0.60, "Services Stacking Scenes"),
        (0.75, "Our Story Editorial Spread"),
        (0.85, "Forensic Evidence Cases"),
        (0.95, "Closing Statement CTA Curtain"),
        (1.00, "Footer White Sticky Underlay")
    ]

    print("\n" + "="*70)
    print("SECTION GEOMETRY & TRAJECTORY COMPARISON")
    print("="*70)

    for prog, title in checkpoints:
        s_pal = find_nearest_sample(pal_samples, prog)
        s_nay = find_nearest_sample(nayan_samples, prog)

        p_prog = float(s_pal.get('scrollProgress', 0)) if s_pal else 0
        n_prog = float(s_nay.get('scrollProgress', 0)) if s_nay else 0
        p_scroll = s_pal.get('scrollY', 0) if s_pal else 0
        n_scroll = s_nay.get('scrollY', 0) if s_nay else 0

        print(f"\n[{title}] Target Progress: {prog:.2f} (Pal: {p_prog:.3f} @ {p_scroll}px | NAYAN: {n_prog:.3f} @ {n_scroll}px)")

        # Hero comparison
        if prog <= 0.15:
            p_h = get_elem(s_pal, 'hero')
            n_h = get_elem(s_nay, 'hero')
            p_rect = p_h.get('section', {}).get('rect') if isinstance(p_h.get('section'), dict) else p_h.get('rect', {})
            n_rect = n_h.get('rect', {})
            print(f"  Hero Rect: Palomino={p_rect} | NAYAN={n_rect}")

        # Services comparison
        if 0.50 <= prog <= 0.70:
            p_s = get_elem(s_pal, 'services')
            n_s = get_elem(s_nay, 'services')
            p_rect = p_s.get('section', {}).get('rect') if isinstance(p_s.get('section'), dict) else p_s.get('rect', {})
            n_rect = n_s.get('rect', {})
            print(f"  Services Rect: Palomino={p_rect} | NAYAN={n_rect}")

        # Footer comparison
        if prog >= 0.95:
            p_f = get_elem(s_pal, 'footer')
            n_f = get_elem(s_nay, 'footer')
            p_rect = p_f.get('rect', {})
            n_rect = n_f.get('rect', {})
            print(f"  Footer Rect: Palomino={p_rect} | NAYAN={n_rect}")

if __name__ == '__main__':
    compute_diffs()
