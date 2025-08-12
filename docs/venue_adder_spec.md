# Venue Adder — Form Spec

Goal: allow non-technical managers to add a venue end-to-end **without code edits**.

## Sections & Fields

### 1) Venue Info
- Venue Name (required)
- Slug/Code (auto)
- Address / Region
- Allow Outside Catering (bool)
- Taxes/Service Included in Base (bool)
- Notes/Policies (multiline)

### 2) Subvenues
- Repeatable block:
  - Subvenue Name
  - Capacity (min/max)
  - Default Event Fee / Curfew Rules

### 3) Seasons
- Repeatable block:
  - Season Name
  - Start Date, End Date
  - Price / Night (or Package Price)
  - Min Nights
  - Notes

### 4) Pricelist Items
- Repeatable block:
  - Item Name
  - Vendor (select from Vendors; allow quick-add)
  - Service Type / Category
  - Unit (fixed/person/set)
  - guestMin, guestMax (when applicable)
  - `feeRules` (JSON builder wizard)
  - includedInVenue (bool)
  - visibleInCalculator (bool)

## Writing to Tables (CSV)
- `venues.csv`: venue-level fields
- `subvenues.csv`: subvenue rows with `venue` linkage
- `seasons.csv`: season rows with `venue` linkage
- `pricelist.csv`: items referencing `venue`, `vendor`, `serviceType`

## Validation
- Mandatory fields before save.
- Autogenerate IDs/Slugs.
- Prevent duplicates (same venue + season range overlap).