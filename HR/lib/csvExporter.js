/**
 * CSV Exporter for bank payment files
 * Generates properly escaped CSV files for bank transfers
 */

/**
 * Escape CSV field value
 * @param {String} value - Field value
 * @returns {String} Escaped value
 */
const escapeCsvField = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Generate CSV content for bank payment file
 * @param {Array} rows - Array of payment rows
 * @param {String} rows[].name - Beneficiary name
 * @param {String} rows[].account - Bank account number
 * @param {String} rows[].ifsc - IFSC code
 * @param {Number} rows[].amount - Amount in rupees
 * @returns {String} CSV content
 */
const generateBankCsv = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Rows must be a non-empty array');
  }

  // CSV header
  const headers = ['Name', 'Account Number', 'IFSC Code', 'Amount'];
  const headerRow = headers.map(escapeCsvField).join(',');

  // CSV rows
  const dataRows = rows.map(row => {
    const { name, account, ifsc, amount } = row;
    
    // Validate required fields
    if (!name || !account || !ifsc || amount === undefined || amount === null) {
      throw new Error(`Invalid row: missing required fields. Row: ${JSON.stringify(row)}`);
    }

    // Format amount to 2 decimal places
    const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : String(amount);

    return [
      escapeCsvField(name),
      escapeCsvField(account),
      escapeCsvField(ifsc),
      escapeCsvField(formattedAmount)
    ].join(',');
  });

  // Combine header and rows
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Generate CSV with custom headers
 * @param {Array} headers - Column headers
 * @param {Array} rows - Array of row objects
 * @returns {String} CSV content
 */
const generateCustomCsv = (headers, rows) => {
  if (!Array.isArray(headers) || headers.length === 0) {
    throw new Error('Headers must be a non-empty array');
  }
  if (!Array.isArray(rows)) {
    throw new Error('Rows must be an array');
  }

  const headerRow = headers.map(escapeCsvField).join(',');

  const dataRows = rows.map(row => {
    return headers.map(header => {
      const value = row[header] !== undefined ? row[header] : '';
      return escapeCsvField(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

module.exports = {
  generateBankCsv,
  generateCustomCsv,
  escapeCsvField
};

