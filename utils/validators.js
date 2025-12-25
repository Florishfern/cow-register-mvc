const COLORS = ['White', 'Brown', 'Pink'];

function normalizeColor(input) {
  if (!input) return null;
  const v = String(input).trim().toLowerCase();
  if (v === 'white' || v === 'ขาว' || v === 'สีขาว') return 'White';
  if (v === 'brown' || v === 'น้ำตาล' || v === 'สีน้ำตาล') return 'Brown';
  if (v === 'pink' || v === 'ชมพู' || v === 'สีชมพู') return 'Pink';
  return null;
}

function isValidCowId(cowId) {
  return /^\d{8}$/.test(cowId) && cowId[0] !== '0';
}

function isValidFarmId(farmId) {
  return /^[1-9]$/.test(String(farmId));
}

function parseIntSafe(v) {
  if (v === undefined || v === null || v === '') return null;
  if (!/^-?\d+$/.test(String(v))) return null;
  return Number(v);
}

function isNonNegInt(n) {
  return Number.isInteger(n) && n >= 0;
}

function isValidOwnerName(name) {
  return /^[a-z]{1,8}$/.test(String(name || ''));
}

module.exports = {
  COLORS,
  normalizeColor,
  isValidCowId,
  isValidFarmId,
  parseIntSafe,
  isNonNegInt,
  isValidOwnerName,
};
