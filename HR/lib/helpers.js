/**
 * Currency conversion helpers
 * All amounts are stored in rupees in the database for readability,
 * but calculations are done in paise to avoid floating-point errors.
 */

/**
 * Convert rupees to paise (multiply by 100)
 * @param {Number} rupees - Amount in rupees
 * @returns {Number} Amount in paise
 */
const toPaise = (rupees) => {
  if (typeof rupees !== 'number' || isNaN(rupees)) {
    throw new Error('Invalid rupees value: must be a number');
  }
  return Math.round(rupees * 100);
};

/**
 * Convert paise to rupees (divide by 100)
 * @param {Number} paise - Amount in paise
 * @returns {Number} Amount in rupees (rounded to 2 decimal places)
 */
const toRupees = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) {
    throw new Error('Invalid paise value: must be a number');
  }
  return Math.round(paise) / 100;
};

/**
 * Round to nearest paise (ensures no fractional paise)
 * @param {Number} paise - Amount in paise
 * @returns {Number} Rounded amount in paise
 */
const roundToPaise = (paise) => {
  return Math.round(paise);
};

/**
 * Round rupees to 2 decimal places
 * @param {Number} rupees - Amount in rupees
 * @returns {Number} Rounded amount in rupees
 */
const roundRupees = (rupees) => {
  return Math.round(rupees * 100) / 100;
};

/**
 * Format amount for display (with 2 decimal places)
 * @param {Number} rupees - Amount in rupees
 * @returns {String} Formatted string
 */
const formatCurrency = (rupees) => {
  return rupees.toFixed(2);
};

module.exports = {
  toPaise,
  toRupees,
  roundToPaise,
  roundRupees,
  formatCurrency
};

