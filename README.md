# Wedding Calculator — Handover

## 📦 Project Structure

```
wedding-calculator-handover/
├── data/                          # CSV source of truth
│   ├── venues.csv
│   ├── subvenues.csv
│   ├── seasons.csv
│   ├── pricelist.csv
│   ├── services.csv
│   ├── service_categories.csv
│   └── vendors.csv
│
├── scripts/
│   ├── validate_data.py           # CSV integrity checks
│   ├── build_docs.py              # Generates docs/ERD.md + updates README data section
│   │
│   └── google-apps/
│       ├── calculator-next/
│       │   └── calculate_wedding_budget_next.js   # next‑gen calculator (GAS)
│       └── venue-adder/
│           └── Code.gs                            # sidebar form (GAS)
│
├── docs/
│   └── ERD.md                     # auto‑generated Mermaid ER diagram
│
└── README.md
```

## 🔗 Data Contract (short)

- PK/FK consistent (validated by `scripts/validate_data.py`).
- **GLOBAL services:** `pricelist.venue_id = 0` → item available for any venue; season lookup uses the **selected venue**.
- `feeRules` is JSON: supports `fixed`, `per_guest`, tiered `eventFee` (weekday/weekend), `accommodationRate`, `banjarFee`, optional `taxInfo`.

## 🚀 Quickstart for Dev

```bash
python3 scripts/validate_data.py
python3 scripts/build_docs.py
```

- Check `docs/ERD.md` after build.

## 🧮 Google Apps Script

- **Legacy demo** lives in the client Google Sheet (unchanged).
- **Next‑gen calculator:** `scripts/google-apps/calculator-next/calculate_wedding_budget_next.js`
  - Weekend/weekday taken from **event date**.
  - GLOBAL=0 respected (season from the selected venue).
- **Venue Adder:** `scripts/google-apps/venue-adder/Code.gs`
  - One-file GAS (menu + sidebar). Creates rows in `venues`, `subvenues`, `seasons`, `pricelist` in one submit.
  - Maps `serviceCategoryName`→`service_categories.id`, `vendorName`→`vendors.id` (creates vendor if missing).

### How to use GAS files

1. Make a copy of the working Google Sheet.
2. **Extensions → Apps Script** → paste the file content.
3. Reload the sheet or run `onOpen()` → menu appears.

## ✅ Handover Checklist (Dev)

-

## 🔄 Common commands

```bash
git add -A
git commit -m "chore: data/docs update"
git push origin main
```

## 📞 Point of Contact

For questions about business logic and data: **Ruslan Khachikian**.

