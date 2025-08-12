#!/usr/bin/env python3
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data"

def read(name): return pd.read_csv(ROOT / name)

v = read("venues.csv")
vd = read("vendors.csv")
p = read("pricelist.csv")

missing_venue = sorted(set(p["venue_id"]) - set(v["id"]))
missing_vendor = sorted(set(p["vendor_id"]) - set(vd["id"]))

print("Missing venue_id → venues.id:", missing_venue)
print("Missing vendor_id → vendors.id:", missing_vendor)

# Примеры строк для проверки руками
mv_rows = p[p["venue_id"].isin(missing_venue)][["id","itemName","venue_id","description"]].head(20)
mvd_rows = p[p["vendor_id"].isin(missing_vendor)][["id","itemName","vendor_id","description"]].head(20)

mv_rows.to_csv(ROOT / "report_missing_venues_rows.csv", index=False)
mvd_rows.to_csv(ROOT / "report_missing_vendors_rows.csv", index=False)

pd.DataFrame({"missing_venue_id":missing_venue}).to_csv(ROOT/"report_missing_venue_ids.csv", index=False)
pd.DataFrame({"missing_vendor_id":missing_vendor}).to_csv(ROOT/"report_missing_vendor_ids.csv", index=False)

print("Saved:")
print(" - data/report_missing_venue_ids.csv")
print(" - data/report_missing_vendor_ids.csv")
print(" - data/report_missing_venues_rows.csv")
print(" - data/report_missing_vendors_rows.csv")
