#!/usr/bin/env python3
import os, re, textwrap
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DOCS = ROOT / "docs"
README = ROOT / "README.md"

# Порядок таблиц в выводе
TABLES = [
    "service_categories","seasons","services","subvenues",
    "calculator","vendors","pricelist","venues"
]

def read_cols(p: Path):
    """Пытаемся прочитать CSV с разными кодировками/разделителями и возвращаем список колонок."""
    encodings = ["utf-8","utf-8-sig","latin-1"]
    seps = [",",";","|","\t"]
    for enc in encodings:
        for sep in seps:
            try:
                df = pd.read_csv(p, sep=sep, encoding=enc)
                if len(df.columns) > 0:
                    return list(df.columns)
            except Exception:
                pass
    return []

def esc(s: str) -> str:
    """Экранируем имена для Mermaid."""
    return re.sub(r'[^A-Za-z0-9_]', '_', str(s))

# Схемы таблиц
schemas = {}
for t in TABLES:
    path = DATA / f"{t}.csv"
    schemas[t] = read_cols(path) if path.exists() else []

def guess_pk(table: str, cols: list):
    low = [c.lower() for c in cols]
    for cand in ("id", f"{table}_id", f"{table[:-1]}_id"):
        if cand in low: return cols[low.index(cand)]
    for cand in ("slug","code","name",f"{table}_name",f"{table[:-1]}_name"):
        if cand in low: return cols[low.index(cand)]
    return cols[0] if cols else None

pks = {t: guess_pk(t, schemas[t]) for t in TABLES}

def guess_fks(table: str, cols: list):
    """Находим возможные FK по названию колонок (эвристика)."""
    fks = []
    low = {c.lower(): c for c in cols}
    for other in TABLES:
        if other == table:
            continue
        for pat in (f"{other}_id", f"{other[:-1]}_id", other, other[:-1]):
            if pat in low:
                fks.append((low[pat], other))
    seen, out = set(), []
    for col, ref in fks:
        key = (col.lower(), ref)
        if key not in seen:
            seen.add(key)
            out.append((col, ref))
    return out

fks = {t: guess_fks(t, schemas[t]) for t in TABLES}

# Mermaid ERD
lines = ["erDiagram"]
for t in TABLES:
    lines.append(f"  {esc(t)} {{")
    cols = schemas[t] or ["_empty"]
    for c in cols:
        lines.append(f"    string {esc(c)}")
    lines.append("  }")

for t in TABLES:
    for col, ref in fks[t]:
        lines.append(
            f'  {esc(t)} }}o--|| {esc(ref)} : "{esc(col)} → {esc(pks.get(ref) or "id")}"'
        )

erd = "\n".join(lines)

# Пишем docs/ERD.md
DOCS.mkdir(exist_ok=True, parents=True)
(DOCS / "ERD.md").write_text(textwrap.dedent(f"""
# Database ERD (Generated)

```mermaid
{erd}
```

## Detected Primary Keys (heuristic)
{os.linesep.join([f"- **{t}**: {pks[t] or '—'}" for t in TABLES])}

## Detected Foreign Keys (heuristic)
{os.linesep.join([
    f"- **{t}**: " + (
        ", ".join([f"{c} → {r}.{pks.get(r) or 'id'}" for c, r in fks[t]]) if fks[t] else "—"
    )
    for t in TABLES
])}
""" ).strip() + "\n")

# Обновляем раздел "## Data Tables (CSV)" в README.md или добавляем, если его нет
tables_block = "\n".join([
    f"- **{t}.csv**: {', '.join(schemas[t]) if schemas[t] else '(empty or cannot parse)'}"
    for t in TABLES
])

if README.exists():
    readme = README.read_text()
    if "## Data Tables (CSV)" in readme:
        readme = re.sub(
            r"(## Data Tables \(CSV\)\n)(.*?)(\n\n##|$)",
            lambda m: f"{m.group(1)}{tables_block}{m.group(3)}",
            readme,
            flags=re.S
        )
    else:
        # Вставим блок в конец README
        readme = readme.rstrip() + "\n\n## Data Tables (CSV)\n" + tables_block + "\n"
    README.write_text(readme)

print("Docs rebuilt: docs/ERD.md and README.md updated.")
