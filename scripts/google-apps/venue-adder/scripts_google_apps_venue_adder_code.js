/**
 * Venue Adder (handover version)
 * One-file Google Apps Script: opens a sidebar form and writes rows into
 *   - venues
 *   - subvenues
 *   - seasons
 *   - pricelist
 * Works with the CSV-compatible sheets used in the repo.
 * No runtime tests required by you; developer can adapt.
 */

// ===== Menu =====
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Venue Adder')
    .addItem('Open Form', 'showVenueAdder')
    .addToUi();
}

function showVenueAdder() {
  var html = HtmlService.createHtmlOutput(SIDEBAR_HTML)
    .setTitle('Venue Adder');
  SpreadsheetApp.getUi().showSidebar(html);
}

// ===== Config =====
var SHEETS = {
  venues: 'venues',
  subvenues: 'subvenues',
  seasons: 'seasons',
  pricelist: 'pricelist',
  vendors: 'vendors',
  serviceCategories: 'service_categories',
  services: 'services'
};

// ===== Utilities =====
function getSheet_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name);
  return sh;
}

function getRows_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values.length) return { headers: [], rows: [] };
  var headers = values.shift();
  var rows = values.map(function(r){
    var obj = {}; headers.forEach(function(h, i){ obj[h] = r[i]; }); return obj;
  });
  return { headers: headers, rows: rows };
}

function getNextId_(sheet, headers) {
  var idIdx = headers.indexOf('id');
  if (idIdx === -1) throw new Error('No "id" column in sheet: ' + sheet.getName());
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1; // only header exists
  var col = sheet.getRange(2, idIdx+1, lastRow-1, 1).getValues().flat();
  var max = 0;
  col.forEach(function(x){ if (typeof x === 'number') max = Math.max(max, x); });
  return max + 1;
}

function ensureVendorId_(vendorName) {
  if (!vendorName) return '';
  var sh = getSheet_(SHEETS.vendors);
  var d = getRows_(sh);
  var found = d.rows.find(function(r){ return String(r.vendorName).trim().toLowerCase() === String(vendorName).trim().toLowerCase(); });
  if (found) return found.id;
  var nextId = getNextId_(sh, d.headers);
  sh.appendRow([nextId, vendorName]);
  return nextId;
}

function idByName_(sheetName, nameField, idField, targetName) {
  var sh = getSheet_(sheetName), d = getRows_(sh);
  var row = d.rows.find(function(r){ return String(r[nameField]).trim().toLowerCase() === String(targetName).trim().toLowerCase(); });
  return row ? row[idField] : '';
}

function mapCategoryId_(name) { return idByName_(SHEETS.serviceCategories, 'Name', 'id', name); }
function mapServiceId_(name) { return idByName_(SHEETS.services, 'serviceName', 'id', name); }

// ===== Main entrypoint called from sidebar =====
function doSubmit(payload) {
  // payload structure (example):
  // {
  //   venue: {
  //     Name, calculationModel, allowsOutsideCatering, requiresSubVenue, active
  //   },
  //   subvenues: [{ Name, capacity, active }],
  //   seasons: [{ seasonName, seasonType, seasonStartDate, seasonEndDate, min_nights, active }],
  //   pricelist: [{ itemName, subVenueName, serviceCategoryName, serviceName, vendorName, feeRules, guestMin, guestMax, includedInVenue, visibleInCalculator, active, description }]
  // }

  var ss = SpreadsheetApp.getActive();
  var shVenues = getSheet_(SHEETS.venues);
  var shSub = getSheet_(SHEETS.subvenues);
  var shSeasons = getSheet_(SHEETS.seasons);
  var shPrice = getSheet_(SHEETS.pricelist);

  var V = getRows_(shVenues);
  var nextVenueId = getNextId_(shVenues, V.headers);

  var venue = payload.venue || {};
  var venueRow = [
    nextVenueId,
    venue.Name || '',
    venue.seasonRules || '',
    venue.active === false ? 0 : 1,
    venue.calculationModel || '',
    venue.allowsOutsideCatering ? 1 : 0,
    venue.requiresSubVenue ? 1 : 0
  ];
  shVenues.appendRow(venueRow);

  var createdSubvenues = {};
  if (Array.isArray(payload.subvenues)) {
    var S = getRows_(shSub);
    payload.subvenues.forEach(function(sv){
      if (!sv || !sv.Name) return;
      var nextSubId = getNextId_(shSub, S.headers);
      shSub.appendRow([
        nextSubId,
        sv.Name,
        nextVenueId,
        sv.capacity || '',
        sv.active === false ? 0 : 1
      ]);
      createdSubvenues[sv.Name.toLowerCase()] = nextSubId;
      S = getRows_(shSub); // refresh
    });
  }

  if (Array.isArray(payload.seasons)) {
    var SZ = getRows_(shSeasons);
    payload.seasons.forEach(function(s){
      if (!s) return;
      var nextSid = getNextId_(shSeasons, SZ.headers);
      shSeasons.appendRow([
        nextSid,
        s.seasonName || '',
        s.seasonType || 'low',
        s.seasonStartDate || '',
        s.seasonEndDate || '',
        nextVenueId,
        s.min_nights || '',
        s.active === false ? 0 : 1
      ]);
      SZ = getRows_(shSeasons);
    });
  }

  if (Array.isArray(payload.pricelist)) {
    var PR = getRows_(shPrice);
    payload.pricelist.forEach(function(p){
      if (!p || !p.itemName) return;
      var nextPid = getNextId_(shPrice, PR.headers);

      var subVenueId = '';
      if (p.subVenueName) {
        var key = String(p.subVenueName).trim().toLowerCase();
        subVenueId = createdSubvenues[key] || '';
      }

      var vendorId = p.vendorId || ensureVendorId_(p.vendorName);
      var catId = p.serviceCategory_id || mapCategoryId_(p.serviceCategoryName || '');
      var srvId = p.service_id || mapServiceId_(p.serviceName || '');

      shPrice.appendRow([
        nextPid,
        p.itemName,
        nextVenueId,
        subVenueId,
        catId,
        p.feeRules || '{}',
        p.guestMin || '',
        p.guestMax || '',
        p.includedInVenue ? 1 : 0,
        p.visibleInCalculator === false ? 0 : 1,
        vendorId || '',
        p.active === false ? 0 : 1,
        srvId || '',
        p.description || ''
      ]);
      PR = getRows_(shPrice);
    });
  }

  return { ok: true, venueId: nextVenueId };
}

// ===== Sidebar HTML (inline, so we keep a single .gs file) =====
var SIDEBAR_HTML = HtmlService.createHtmlOutputFromFile ? null : null; // keep linter calm
var SIDEBAR_HTML = [
  '<div style="font-family:Inter,Arial,sans-serif;padding:12px 12px 90px;max-width:480px">',
  '  <h2 style="margin:0 0 6px">Venue Adder</h2>',
  '  <p style="margin:0 0 12px;color:#555">Handover form. Minimal fields to create venue + subvenues + seasons + pricelist.</p>',

  '  <label><b>Venue name</b><br><input id="venueName" style="width:100%"></label><br><br>',
  '  <label>Calculation model<br>',
  '    <select id="calcModel" style="width:100%">',
  '      <option value="venueRental">venueRental</option>',
  '      <option value="hotelPackage">hotelPackage</option>',
  '    </select>',
  '  </label><br><br>',
  '  <label><input type="checkbox" id="allowsOC" checked> allowsOutsideCatering</label><br>',
  '  <label><input type="checkbox" id="requiresSV"> requiresSubVenue</label><br><br>',

  '  <fieldset style="border:1px solid #ddd;padding:10px"><legend><b>Subvenues</b></legend>',
  '    <div id="subvList"></div>',
  '    <button onclick="addSubv()">+ Add subvenue</button>',
  '  </fieldset><br>',

  '  <fieldset style="border:1px solid #ddd;padding:10px"><legend><b>Seasons</b></legend>',
  '    <div id="seasons"></div>',
  '    <button onclick="addSeason()">+ Add season</button>',
  '  </fieldset><br>',

  '  <fieldset style="border:1px solid #ddd;padding:10px"><legend><b>Pricelist items</b></legend>',
  '    <div id="prices"></div>',
  '    <button onclick="addPrice()">+ Add item</button>',
  '    <p style="color:#666;font-size:12px">feeRules JSON, e.g. {"type":"fixed","price":1000,"currency":"USD"}</p>',
  '  </fieldset><br>',

  '  <button style="background:#111;color:#fff;border:0;padding:10px 14px;border-radius:6px" onclick="submitAll()">Create</button>',
  '  <div id="msg" style="margin-top:10px;color:#0a0"></div>',

  '  <script>',
  '  function el(tag, attrs, parent){ var e=document.createElement(tag); if(attrs) Object.assign(e, attrs); if(parent) parent.appendChild(e); return e; }',
  '  function addSubv(){',
  '    var box = document.getElementById("subvList");',
  '    var row = el("div",{style:"display:grid;grid-template-columns:1fr 90px 80px;gap:6px;margin:6px 0"}, box);',
  '    el("input",{placeholder:"Name"},row);',
  '    el("input",{placeholder:"Capacity", type:"number"},row);',
  '    var w = el("label",{style:"align-self:center"},row);',
  '    var cb = el("input",{type:"checkbox",checked:true},w); w.appendChild(document.createTextNode(" active"));',
  '  }',
  '  function addSeason(){',
  '    var wrap = document.getElementById("seasons");',
  '    var row = el("div",{style:"display:grid;grid-template-columns:1fr 110px 140px 140px 90px 70px;gap:6px;margin:6px 0"}, wrap);',
  '    el("input",{placeholder:"seasonName"},row);',
  '    var sel = el("select",{},row); sel.innerHTML = "<option>low</option><option>high</option><option>blackout</option><option>auspicious</option>";',
  '    el("input",{placeholder:"start (YYYY-MM-DD)"},row);',
  '    el("input",{placeholder:"end (YYYY-MM-DD)"},row);',
  '    el("input",{placeholder:"min_nights", type:"number"},row);',
  '    var w = el("label",{style:"align-self:center"},row); var cb = el("input",{type:"checkbox",checked:true},w); w.appendChild(document.createTextNode(" active"));',
  '  }',
  '  function addPrice(){',
  '    var wrap = document.getElementById("prices");',
  '    var row = el("div",{style:"display:grid;grid-template-columns:1fr 1fr 1fr 1fr 110px 110px;gap:6px;margin:6px 0"}, wrap);',
  '    el("input",{placeholder:"itemName"},row);',
  '    el("input",{placeholder:"subVenueName (optional)"},row);',
  '    el("input",{placeholder:"serviceCategoryName"},row);',
  '    el("input",{placeholder:"vendorName (optional)"},row);',
  '    el("input",{placeholder:"guestMin", type:"number"},row);',
  '    el("input",{placeholder:"guestMax", type:"number"},row);',
  '    el("textarea",{placeholder:"feeRules JSON", style:"grid-column:1/-1;height:70px"},row);',
  '    var flags = el("div",{style:"grid-column:1/-1;display:flex;gap:12px;align-items:center"},row);',
  '    var i1 = el("label",{},flags); var c1 = el("input",{type:"checkbox"},i1); i1.appendChild(document.createTextNode(" includedInVenue"));',
  '    var i2 = el("label",{},flags); var c2 = el("input",{type:"checkbox", checked:true},i2); i2.appendChild(document.createTextNode(" visibleInCalculator"));',
  '    el("input",{placeholder:"serviceName (optional)"},row);',
  '    el("input",{placeholder:"description (optional)"},row);',
  '  }',
  '  function readSubv(){',
  '    var out=[], wrap=document.getElementById("subvList"); if(!wrap) return out;',
  '    [].slice.call(wrap.children).forEach(function(row){',
  '      var i=row.querySelectorAll("input"); out.push({Name:i[0].value, capacity: Number(i[1].value||0)||"", active:i[2].checked});',
  '    }); return out;',
  '  }',
  '  function readSeasons(){',
  '    var out=[], wrap=document.getElementById("seasons"); if(!wrap) return out;',
  '    [].slice.call(wrap.children).forEach(function(row){',
  '      var i=row.querySelectorAll("input,select"); out.push({',
  '        seasonName:i[0].value, seasonType:i[1].value, seasonStartDate:i[2].value, seasonEndDate:i[3].value, min_nights:Number(i[4].value||0)||"", active:i[5].checked',
  '      });',
  '    }); return out;',
  '  }',
  '  function readPrices(){',
  '    var out=[], wrap=document.getElementById("prices"); if(!wrap) return out;',
  '    [].slice.call(wrap.children).forEach(function(row){',
  '      var i=row.querySelectorAll("input,textarea"); out.push({',
  '        itemName:i[0].value, subVenueName:i[1].value, serviceCategoryName:i[2].value, vendorName:i[3].value, guestMin:Number(i[4].value||0)||"", guestMax:Number(i[5].value||0)||"", feeRules:i[6].value, includedInVenue:i[7].querySelector("input").checked, visibleInCalculator:i[8].querySelector("input").checked, serviceName:i[9].value, description:i[10].value',
  '      });',
  '    }); return out;',
  '  }',
  '  function submitAll(){',
  '    var payload={',
  '      venue:{ Name:document.getElementById("venueName").value, calculationModel:document.getElementById("calcModel").value, allowsOutsideCatering:document.getElementById("allowsOC").checked, requiresSubVenue:document.getElementById("requiresSV").checked, active:true },',
  '      subvenues:readSubv(), seasons:readSeasons(), pricelist:readPrices()',
  '    };',
  '    google.script.run.withSuccessHandler(function(res){',
  '      document.getElementById("msg").textContent = "Created. venue_id="+res.venueId;',
  '    }).withFailureHandler(function(err){',
  '      document.getElementById("msg").textContent = "Error: "+err.message;',
  '    }).doSubmit(payload);',
  '  }',
  '  // bootstrap default rows: one subvenue + one season + one price row
  '  addSubv(); addSeason(); addPrice();',
  '  </script>',
  '</div>'
].join('');
