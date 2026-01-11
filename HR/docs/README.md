# Payroll Module Documentation

## Overview

The Payroll module provides comprehensive payroll management functionality including salary structure definition, payslip generation, approval workflows, payment processing, and bank export capabilities.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Seeding Data](#seeding-data)
- [API Endpoints](#api-endpoints)
- [Assumptions](#assumptions)
- [Production Notes](#production-notes)
- [Testing](#testing)

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/SD_Taxation

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS S3 Configuration (for PDF storage in production)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION=us-east-1
```

## Installation

```bash
npm install
```

## Running the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Seeding Data

To seed the database with sample salary structures and payslips:

```bash
node scripts/seed_payroll.js
```

This script will:
- Create a default salary structure for each existing company
- Create sample payslip records for 2 employees (if available)
- Use the current month and year for payslip periods

**Note:** Make sure you have at least one company and employee in the database before running the seed script.

## API Endpoints

All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

### 1. Run Payroll

**POST** `/api/payroll/run`

**Roles:** HR | Finance | SuperAdmin

**Request Body:**
```json
{
  "companyId": "507f1f77bcf86cd799439011",
  "month": 12,
  "year": 2024,
  "workingDays": 26,
  "employees": ["507f1f77bcf86cd799439012"],
  "force": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll run completed",
  "data": {
    "payrollRunId": "507f1f77bcf86cd799439013",
    "createdCount": 10,
    "skippedCount": 2,
    "errorCount": 0,
    "created": [
      {
        "employeeId": "507f1f77bcf86cd799439012",
        "employeeName": "John Doe",
        "payslipId": "507f1f77bcf86cd799439014",
        "netPay": 35000
      }
    ],
    "skipped": [
      {
        "employeeId": "507f1f77bcf86cd799439015",
        "employeeName": "Jane Smith",
        "reason": "Payslip already exists for this period"
      }
    ],
    "errors": []
  }
}
```

### 2. List Payslips

**GET** `/api/payroll?companyId=<id>&month=<month>&year=<year>&status=<status>&page=<page>&limit=<limit>`

**Roles:** HR | Finance | SuperAdmin

**Query Parameters:**
- `companyId` (required): Company ID
- `month` (optional): Month (1-12)
- `year` (optional): Year
- `status` (optional): `draft`, `approved`, or `paid`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example:**
```bash
curl -X GET "http://localhost:3000/api/payroll?companyId=507f1f77bcf86cd799439011&month=12&year=2024&status=approved&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### 3. Get Employee Payslip

**GET** `/api/payslip/:employeeId?month=<month>&year=<year>`

**Roles:** Employee (self) | HR | Finance

**Example:**
```bash
curl -X GET "http://localhost:3000/api/payslip/507f1f77bcf86cd799439012?month=12&year=2024" \
  -H "Authorization: Bearer <token>"
```

### 4. Approve Payslip

**POST** `/api/payroll/:payslipId/approve`

**Roles:** HR | Finance

**Example:**
```bash
curl -X POST "http://localhost:3000/api/payroll/507f1f77bcf86cd799439014/approve" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### 5. Mark Payslip as Paid

**POST** `/api/payroll/:payslipId/pay`

**Roles:** Finance

**Request Body:**
```json
{
  "paymentRef": "TXN123456789",
  "bankLedgerId": "507f1f77bcf86cd799439016"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/payroll/507f1f77bcf86cd799439014/pay" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"paymentRef": "TXN123456789", "bankLedgerId": "507f1f77bcf86cd799439016"}'
```

### 6. Bank Export

**GET** `/api/payroll/bank-export?companyId=<id>&month=12&year=2024&format=csv`

**Roles:** Finance

**Query Parameters:**
- `companyId` (required): Company ID
- `month` (required): Month (1-12)
- `year` (required): Year (2000-2100)
- `format` (optional): Export format (default: "csv")

**Example:**
```bash
curl -X GET "http://localhost:3000/api/payroll/bank-export?companyId=507f1f77bcf86cd799439011&month=12&year=2024&format=csv" \
  -H "Authorization: Bearer <token>" \
  -o bank_payments.csv
```

**Response:** CSV file with bank payment details

### 7. Generate PDF

**POST** `/api/payslip/:payslipId/generate-pdf`

**Roles:** HR | Finance

**Note:** In production, this should be handled by a background worker/queue.

### 8. Email Payslip

**POST** `/api/payslip/:payslipId/email`

**Roles:** HR | Finance

**Note:** In production, this should be handled by a background worker/queue.

## Assumptions

1. **Salary Calculation:**
   - If employee has `ctcAnnual`, monthly base = `ctcAnnual / 12`
   - Otherwise, `employee.salary` is treated as monthly base
   - Default working days per month: **26 days**
   - Absent days are calculated from Attendance collection (currently defaults to 0)

2. **Statutory Deductions:**
   - **PF (Provident Fund):** Default 12% applied on Basic component (if present), else 50% of gross
   - **Professional Tax:** Fixed amount per company (default: 0)
   - **TDS:** Placeholder for future implementation

3. **Salary Structure:**
   - Components can be `earning` or `deduction`
   - Each component can be `fixed` (rupees) or `percent` (percentage of base)
   - Base for percentage calculations: `CTC` (default) or `Basic`

4. **Payslip Workflow:**
   - `draft` → `approved` → `paid`
   - Once paid, payslip cannot be modified
   - Idempotent payment: if payslip already paid with same paymentRef, returns success

5. **Bank Export:**
   - Exports payslips with status `approved` or `paid`
   - Validates IFSC code format: `^[A-Z]{4}0[A-Z0-9]{6}$`
   - Returns invalid rows in metadata if any

## Production Notes

### Security

1. **Encrypt Bank Details:**
   - Bank account numbers should be encrypted at rest
   - Use encryption libraries like `crypto` or `bcrypt` for sensitive data

2. **PDF Storage:**
   - Store generated PDFs in S3 or similar cloud storage
   - Update `HR/lib/pdfGenerator.js` to upload to S3
   - Set proper access controls and expiration policies

3. **Background Workers:**
   - Move PDF generation and email sending to background workers/queues
   - Use Bull, Agenda, or similar queue systems
   - Implement retry logic and error handling

### Accounting Integration

The payroll module includes integration points with the Accounts module:

- **Payment Voucher Creation:** When marking a payslip as paid, a Payment Voucher can be created automatically
- **Integration Point:** See `HR/controllers/payrollController.js` in the `payPayslip` function
- **Voucher Structure:**
  - Debit: SalaryExpense ledger
  - Credit: Bank ledger (from `bankLedgerId`)
  - Voucher type: `Payment`

To enable integration, uncomment and configure the voucher creation code in `payPayslip` function.

### Extensibility

The code is designed to be easily extensible:

1. **TDS Calculation:** Placeholder in `HR/lib/payrollCalculator.js`
2. **ESI (Employee State Insurance):** Can be added similar to PF
3. **Additional Deductions:** Can be added to salary structure components
4. **Attendance Integration:** Replace `absentDays = 0` with actual attendance calculation

## Testing

### Unit Tests

Run Jest tests for payroll calculator:

```bash
npm test -- HR/__tests__/payrollCalculator.test.js
```

**Test Cases:**
1. No absent days, basic percent present, PF policy
2. Absent days > 0, assert "Absent Adjustment" deduction
3. Employee with ctcAnnual instead of salary
4. PF fallback to 50% of gross when Basic not found
5. Edge case: all days absent

### Manual Testing Sequence

1. **Create Salary Structure:**
   ```bash
   # Use seed script or create via API
   node scripts/seed_payroll.js
   ```

2. **Run Payroll:**
   ```bash
   curl -X POST "http://localhost:3000/api/payroll/run" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "companyId": "<company-id>",
       "month": 12,
       "year": 2024,
       "workingDays": 26
     }'
   ```

3. **List Payslips:**
   ```bash
   curl -X GET "http://localhost:3000/api/payroll?companyId=<company-id>&month=12&year=2024" \
     -H "Authorization: Bearer <token>"
   ```

4. **Approve Payslip:**
   ```bash
   curl -X POST "http://localhost:3000/api/payroll/<payslip-id>/approve" \
     -H "Authorization: Bearer <token>"
   ```

5. **Mark as Paid:**
   ```bash
   curl -X POST "http://localhost:3000/api/payroll/<payslip-id>/pay" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"paymentRef": "TXN123456789"}'
   ```

6. **Export Bank File:**
   ```bash
   curl -X GET "http://localhost:3000/api/payroll/bank-export?companyId=<company-id>&month=12&year=2024&format=csv" \
     -H "Authorization: Bearer <token>" \
     -o bank_payments.csv
   ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message (in development)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

