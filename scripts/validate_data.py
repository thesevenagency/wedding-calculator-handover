import json
import sys
import pandas as pd
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"

TABLES = {
    "venues": "venues.csv",
    "subvenues": "subvenues.csv",
    "seasons": "seasons.csv",
    "vendors": "vendors.csv",
    "services": "services.csv",
    "service_categories": "service_categories.csv",
    "pricelist": "pricelist.csv",
    "calculator": "calculator.csv",
}

def load_csv(name):
    path = DATA / TABLES[name]
    try:
        return pd.read_csv(path)
    except Exception:
        try:
            return pd.read_csv(path, sep=';')
        except Exception as e:
            print(f"[ERROR] Cannot read {path}: {e}")
            return pd.DataFrame()

def main():
    dfs = {t: load_csv(t) for t in TABLES}
    # Basic report: shape and columns
    print("== Tables ==")
    for t, df in dfs.items():
        print(f"- {t}: {df.shape[0]} rows, {len(df.columns)} cols -> {list(df.columns)}")

    # Heuristic checks
    def has_col(df, *names):
        low = {c.lower(): c for c in df.columns}
        for n in names:
            if n.lower() in low:
                return low[n.lower()]
        return None

    # Venue linkage checks
    for t in ["subvenues", "seasons", "pricelist"]:
        df = dfs[t]
        if df.empty: 
            continue
        venue_col = has_col(df, "venue_id", "venue")
        venues = dfs["venues"]
        key = has_col(venues, "id", "venue_id", "slug", "name")
        if venue_col and key:
            missing = df[~df[venue_col].isin(venues[key])]
            if not missing.empty:
                print(f"[WARN] {t}: {len(missing)} rows reference unknown venue via {venue_col} -> {key}")

    # Vendor linkage
    dfp = dfs["pricelist"]
    if not dfp.empty:
        vendor_col = has_col(dfp, "vendor_id", "vendor")
        vendors = dfs["vendors"]
        key = has_col(vendors, "id", "vendor_id", "slug", "name")
        if vendor_col and key:
            missing = dfp[~dfp[vendor_col].isin(vendors[key])]
            if not missing.empty:
                print(f"[WARN] pricelist: {len(missing)} rows reference unknown vendor via {vendor_col} -> {key}")

        # feeRules JSON sanity
        fr_col = has_col(dfp, "feeRules", "feerules")
        if fr_col:
            bad = []
            for i, v in enumerate(dfp[fr_col].fillna("")[:]):
                if str(v).strip() == "":
                    continue
                try:
                    json.loads(v)
                except Exception:
                    bad.append(i)
            if bad:
                print(f"[WARN] pricelist: {len(bad)} rows have invalid JSON in {fr_col} (examples: {bad[:5]})")

    print("Done.")

if __name__ == "__main__":
    main()