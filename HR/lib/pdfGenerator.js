/**
 * PDF Generator for Payslips
 * 
 * NOTE: This is a skeleton implementation. In production:
 * 1. Move PDF generation to a background worker/queue (e.g., Bull, Agenda)
 * 2. Store generated PDFs in S3 or similar cloud storage
 * 3. Use proper error handling and retry logic
 * 4. Consider using a template engine (Handlebars, EJS) for payslip design
 */

const path = require('path');
const fs = require('fs').promises;

/**
 * Generate PDF for a payslip
 * 
 * @param {Object} payslipData - Payslip document
 * @param {Object} employee - Employee document
 * @param {Object} company - Company document
 * @returns {Promise<String>} Path to generated PDF file
 * 
 * TODO: Implement actual PDF generation using Puppeteer or PDFKit
 * This is a placeholder that creates the directory structure
 */
const generatePayslipPdf = async (payslipData, employee, company) => {
  try {
    // Ensure /tmp directory exists
    const tmpDir = path.join(process.cwd(), 'tmp');
    try {
      await fs.access(tmpDir);
    } catch {
      await fs.mkdir(tmpDir, { recursive: true });
    }

    // Generate filename
    const filename = `payslip_${payslipData._id}_${payslipData.period.year}_${payslipData.period.month}.pdf`;
    const filePath = path.join(tmpDir, filename);

    // TODO: Implement actual PDF generation
    // Example with Puppeteer:
    // const puppeteer = require('puppeteer');
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // const html = generatePayslipHTML(payslipData, employee, company);
    // await page.setContent(html);
    // await page.pdf({ path: filePath, format: 'A4' });
    // await browser.close();

    // For now, create a placeholder file
    const placeholderContent = `
PAYSLIP PLACEHOLDER

Employee: ${employee.fullname}
Employee Code: ${employee.empCode}
Company: ${company.company_name}
Period: ${payslipData.period.month}/${payslipData.period.year}

Gross: ${payslipData.gross}
Deductions: ${payslipData.totalDeductions}
Net Pay: ${payslipData.netPay}

This is a placeholder. Implement actual PDF generation.
    `;
    
    await fs.writeFile(filePath, placeholderContent);

    console.log(`PDF placeholder created at: ${filePath}`);
    console.log('NOTE: Implement actual PDF generation in production');

    return filePath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Generate HTML template for payslip (for Puppeteer)
 * @param {Object} payslipData - Payslip document
 * @param {Object} employee - Employee document
 * @param {Object} company - Company document
 * @returns {String} HTML content
 */
const generatePayslipHTML = (payslipData, employee, company) => {
  // TODO: Implement proper HTML template
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payslip - ${employee.fullname}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .details { margin: 20px 0; }
        .earnings, .deductions { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${company.company_name}</h1>
        <h2>Payslip</h2>
      </div>
      <div class="details">
        <p><strong>Employee:</strong> ${employee.fullname}</p>
        <p><strong>Employee Code:</strong> ${employee.empCode}</p>
        <p><strong>Period:</strong> ${payslipData.period.month}/${payslipData.period.year}</p>
      </div>
      <div class="earnings">
        <h3>Earnings</h3>
        <table>
          ${payslipData.earnings.map(e => `
            <tr>
              <td>${e.name}</td>
              <td>₹${e.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total">
            <td>Gross Salary</td>
            <td>₹${payslipData.gross.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <div class="deductions">
        <h3>Deductions</h3>
        <table>
          ${payslipData.deductions.map(d => `
            <tr>
              <td>${d.name}</td>
              <td>₹${d.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total">
            <td>Total Deductions</td>
            <td>₹${payslipData.totalDeductions.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <div class="total">
        <h2>Net Pay: ₹${payslipData.netPay.toFixed(2)}</h2>
      </div>
    </body>
    </html>
  `;
};

/**
 * Upload PDF to S3 (placeholder)
 * @param {String} filePath - Local file path
 * @param {String} payslipId - Payslip ID
 * @returns {Promise<String>} S3 URL
 */
const uploadPdfToS3 = async (filePath, payslipId) => {
  // TODO: Implement S3 upload
  // const { uploadToS3 } = require('../../Super_Admin/config/s3Config');
  // const result = await uploadToS3(file, 'payslips');
  // return result.url;
  
  throw new Error('S3 upload not implemented. Implement in production.');
};

module.exports = {
  generatePayslipPdf,
  generatePayslipHTML,
  uploadPdfToS3
};

