# Wedding Calculator — Handover Package

This repository contains the **data**, **calculation logic outline**, and **developer specs** to complete the Wedding Calculator project.

## Goals
- Standardized, data-driven wedding budget calculator for venues, packages, outside vendors and services.
- Easy onboarding: Sales Managers can add new locations via **Venue Adder**, without code changes.
- Transparent calculation breakdown and reproducible results.

## Repository Structure
```
.
├─ data/                     # CSV datasets (source of truth)
├─ docs/
│  ├─ ERD.md                 # Entity-Relationship Diagram (Mermaid)
│  ├─ calculator_flow.md     # Step-by-step calculation logic
│  ├─ venue_adder_spec.md    # Form spec and field mapping
│  └─ TODO.md                # Open issues
├─ scripts/
│  ├─ validate_data.py       # Schema & referential integrity checks
│  └─ README.md              # How to run scripts
├─ .vscode/                  # VS Code recommendations
└─ README.md
```

## Quickstart (VS Code + GitHub)
1. **Clone or unzip** this repo locally.
2. Open in **VS Code**.
3. (Optional) Install recommended extensions when prompted.
4. Create a local git repo and first commit:
   ```bash
   git init
   git add .
   git commit -m "chore: bootstrap Wedding Calculator handover"
   ```
5. Create a new **GitHub** (or GitLab) repo (empty), then set remote & push:
   ```bash
   git branch -M main
   git remote add origin https://<YOUR_HOST>/<YOUR_USER>/wedding-calculator.git
   git push -u origin main
   ```

## Data Tables (CSV)
Auto-detected columns from uploaded files. Review `docs/ERD.md` for PK/FK mapping.

- **service_categories.csv**: (empty or unreadable — please verify delimiter)
- **seasons.csv**: (empty or unreadable — please verify delimiter)
- **services.csv**: (empty or unreadable — please verify delimiter)
- **subvenues.csv**: (empty or unreadable — please verify delimiter)
- **calculator.csv**: (empty or unreadable — please verify delimiter)
- **vendors.csv**: (empty or unreadable — please verify delimiter)
- **pricelist.csv**: (empty or unreadable — please verify delimiter)
- **venues.csv**: (empty or unreadable — please verify delimiter)

## Calculation Flow (high-level)
See `docs/calculator_flow.md` for the contract the code must satisfy. In short:
1. **Inputs**: venue/subvenue, date/event window, guest count, selected services, package toggles.
2. **Season resolution**: map event date → season for chosen venue.
3. **Base venue price**: by season and subvenue; include minimum nights if applicable.
4. **Fees & policies**: event fee, banjar fee, outside vendor policy, corkage, etc.
5. **Services (pricelist)**: apply `feeRules` per item (fixed/per-person/tiers; min/max guests; inclusions).
6. **Included vs optional**: exclude included items from subtotal; list options.
7. **Totals**: per-category subtotals, taxes/SC as needed, and grand total.
8. **Output**: itemized breakdown suitable for PDF/Client view.

---

**Next steps**
- Run `python scripts/validate_data.py` to sanity-check CSVs.
- Adjust `docs/ERD.md` if relations differ from your practices.
- Drop your existing scripts (Apps Script, Python, etc.) into `scripts/` and update `scripts/README.md`.