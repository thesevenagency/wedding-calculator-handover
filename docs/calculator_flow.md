# Calculation Flow — Contract

This is the **canonical flow** the calculator implementation must satisfy.

## Inputs (from UI or manual form)
- `venue` (required)
- `subvenue` (optional per venue)
- `event_date` (or event window)
- `guest_count`
- Selected services / packages
- Flags: outside catering allowed, corkage, taxes included, etc.

## Steps
1. **Resolve Season**
   - Match `event_date` to `seasons` for the selected `venue`.
   - If multiple seasons overlap, pick the most specific rule (longest exact match or priority order).

2. **Venue Base**
   - Lookup base price (by `venue`/`subvenue` and resolved season).
   - Apply minimum nights / package constraints.
   - Include: if taxes/service charges are already included in base, do not re-add.

3. **Venue-related Fees**
   - Event Fee, Banjar Fee, Security, Curfew Surcharge, etc.
   - Policies: inside/outside vendors, corkage if BYO beverages.

4. **Services / Pricelist**
   - For each item in `pricelist`:
     - Parse `feeRules` (JSON) — fixed/per-person/tiers/min-max guests/options/inclusions.
     - Skip items that are `includedInVenue` or not `visibleInCalculator`.
     - Enforce minimum guest thresholds, fail gracefully otherwise.

5. **Totals & Breakdown**
   - Group by Service Category → Subtotal.
   - Taxes & SC (apply only if not included in upstream price).
   - Output detailed lines: qty, unit, unit price, total, notes/rules applied.

## Outputs
- Itemized table (category → items).
- Grand total.
- Diagnostics: unmet constraints/warnings (e.g., guest count below min).