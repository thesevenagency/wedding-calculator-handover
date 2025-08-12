# Database ERD (Generated)

```mermaid
erDiagram
  service_categories {
    string id
    string Name
  }
  seasons {
    string id
    string seasonName
    string seasonType
    string seasonStartDate
    string seasonEndDate
    string venue_id
    string min_nights
    string active
  }
  services {
    string id
    string serviceName
  }
  subvenues {
    string id
    string Name
    string mainVenue_id
    string capacity
    string active
  }
  calculator {
    string _CALCULATION_PARAMETERS_
    string Unnamed__1
    string Unnamed__2
    string CALCULATION_RESULTS
    string Unnamed__4
    string Unnamed__5
    string Unnamed__6
    string Unnamed__7
    string Unnamed__8
    string Unnamed__9
    string Helper__Sub_venue_List
    string Unnamed__11
    string Unnamed__12
  }
  vendors {
    string id
    string vendorName
  }
  pricelist {
    string id
    string itemName
    string venue_id
    string sub_venue_id
    string serviceCategory_id
    string feeRules
    string guestMin
    string guestMax
    string includedInVenue
    string visibleInCalculator
    string vendor_id
    string active
    string service_id
    string description
  }
  venues {
    string id
    string Name
    string seasonRules
    string active
    string calculationModel
    string allowsOutsideCatering
    string requiresSubVenue
  }
  seasons }o--|| venues : "venue_id → id"
  pricelist }o--|| services : "service_id → id"
  pricelist }o--|| vendors : "vendor_id → id"
  pricelist }o--|| venues : "venue_id → id"
```

## Detected Primary Keys (heuristic)
- **service_categories**: id
- **seasons**: id
- **services**: id
- **subvenues**: id
- **calculator**:  CALCULATION PARAMETERS 
- **vendors**: id
- **pricelist**: id
- **venues**: id

## Detected Foreign Keys (heuristic)
- **service_categories**: —
- **seasons**: venue_id → venues.id
- **services**: —
- **subvenues**: —
- **calculator**: —
- **vendors**: —
- **pricelist**: service_id → services.id, vendor_id → vendors.id, venue_id → venues.id
- **venues**: —
