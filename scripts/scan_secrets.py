import os
import re

PATTERNS = [
    re.compile(r'(?i)(api[_-]?key|secret[_-]?key|auth[_-]?token|access[_-]?token)\s*[:=]\s*["\'][a-zA-Z0-9_\-]{8,}["\']'),
    re.compile(r'(?i)password\s*[:=]\s*["\'][^"\']+["\']'),
    re.compile(r'ghp_[a-zA-Z0-9]{20,}'),
    re.compile(r'github_pat_[a-zA-Z0-9]{20,}'),
    re.compile(r'AKIA[0-9A-Z]{16}'),
    re.compile(r'sk-[a-zA-Z0-9_\-]{20,}'),
    re.compile(r'sk-proj-[a-zA-Z0-9_\-]{20,}'),
]

IGNORE_DIRS = {'.git', '.venv', '__pycache__', 'node_modules', '.agents', '.gemini', 'datasets', 'labels', 'images', 'runs', 'dist', '.vite'}
IGNORE_EXTS = {'.pt', '.png', '.jpg', '.jpeg', '.mp4', '.avi', '.pyc', '.zip', '.tar', '.gz', '.svg'}

findings = []
for dirpath, dirnames, filenames in os.walk('.'):
    dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
    for f in filenames:
        ext = os.path.splitext(f)[1].lower()
        if ext in IGNORE_EXTS:
            continue
        filepath = os.path.join(dirpath, f)
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                for line_idx, line in enumerate(fp, 1):
                    for pat in PATTERNS:
                        if pat.search(line):
                            findings.append((filepath, line_idx, line.strip()))
        except Exception:
            pass

print(f"Total findings: {len(findings)}")
for file, line, content in findings:
    print(f"{file}:{line} -> {content[:80]}")

if findings:
    exit(1)
else:
    print("Secrets Scan: PASS (zero leaked credentials)")
    exit(0)
