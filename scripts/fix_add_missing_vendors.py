#!/usr/bin/env python3
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data"
vendors = pd.read_csv(ROOT / "vendors.csv")
pricelist = pd.read_csv(ROOT / "pricelist.csv")

# Унификация типов (чтобы int/str не мешали сравнению)
# Если у тебя ID строковые — закомментируй block A и раскомментируй block B.

# --- block A: числовые ID ---
try:
    vendors_ids = pd.to_numeric(vendors["id"], errors="coerce")
    pricelist_vendor_ids = pd.to_numeric(pricelist["vendor_id"], errors="coerce")
except Exception:
    vendors_ids = vendors["id"]
    pricelist_vendor_ids = pricelist["vendor_id"]

# --- block B: строковые ID ---
# vendors_ids = vendors["id"].astype(str)
# pricelist_vendor_ids = pricelist["vendor_id"].astype(str)

# Разница множеств + фильтр против NaN
missing_ids = sorted(x for x in set(pricelist_vendor_ids) - set(vendors_ids) if pd.notna(x))
print("Will add vendor rows for IDs:", missing_ids)

if missing_ids:
    to_add = pd.DataFrame({
        "id": missing_ids,
        "vendorName": [f"TBD_{i}" for i in missing_ids]
    })
    vendors2 = pd.concat([vendors, to_add], ignore_index=True).drop_duplicates(subset=["id"])
    vendors2.to_csv(ROOT / "vendors.csv", index=False)
    print(f"Added {len(missing_ids)} vendor(s).")
else:
    print("No missing vendors.")
