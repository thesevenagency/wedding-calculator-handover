// --- ФИНАЛЬНАЯ ВЕРСИЯ С ДОБАВЛЕННОЙ ФУНКЦИЕЙ "ОЧИСТИТЬ ВСЁ" ---

const CONFIG = {
  calculatorSheet: 'calculator',
  nightsInputCell: 'B7',
  output: { totalCost: 'E2', season: 'E3', breakdownStart: 'D6' },
  dataSheets: { venues: 'venues', seasons: 'seasons', pricelist: 'pricelist', categories: 'service_categories', services: 'services', vendors: 'vendors'},
  showcase: {
    startRow: 17,
    nameColumn: 1,   // A - Service Name
    idColumn: 2,     // B - Service ID (Hidden)
    addColumn: 3     // C - Add Checkbox
  },
  cart: {
    startRow: 17,
    startCol: 5,   // E
    nameColumn: 5,   // E
    costColumn: 6,   // F
    detailsColumn: 7,// G
    removeColumn: 8  // H
  }
};


// --- НОВЫЙ БЛОК: ФУНКЦИИ ДЛЯ ПОЛНОЙ ОЧИСТКИ ---

function clearCalculationResults() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.calculatorSheet);
  sheet.getRange(CONFIG.output.totalCost).clearContent();
  sheet.getRange(CONFIG.output.season).clearContent();
  const startCell = sheet.getRange(CONFIG.output.breakdownStart);
  const startRow = startCell.getRow();
  const startCol = startCell.getColumn();
  if (sheet.getLastRow() >= startRow) {
    sheet.getRange(startRow, startCol, sheet.getMaxRows() - startRow + 1, 3).clearContent();
  }
}

function clearCart() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.calculatorSheet);
  const cartRange = sheet.getRange(CONFIG.cart.startRow, CONFIG.cart.startCol, 100, 4);
  cartRange.clearContent().clearNote();
}

function clearAll() {
  clearCart();
  clearCalculationResults();
  SpreadsheetApp.getUi().alert('Все результаты и корзина очищены. Можно начинать новый расчет!');
}

// --- СУЩЕСТВУЮЩИЕ ФУНКЦИИ (ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ) ---
// Здесь остаётся твой весь код, который я тебе отправлял ранее без изменений
