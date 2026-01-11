# HR Payroll System API Reference

## Overview

The HR Payroll System provides comprehensive payroll management functionality including salary structure definition, payslip generation, approval workflows, payment processing, and bank export capabilities.

## Base URL

```
http://localhost:3000/api/payroll
```

## Authentication

All payroll endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control (RBAC)

Different endpoints require different roles:

- **HR**: Can run payroll, list payslips, approve payslips, generate PDFs, and email payslips
- **Finance**: Can run payroll, list payslips, approve payslips, mark payslips as paid, export bank files, generate PDFs, and email payslips
- **Accountant**: Same capabilities as Finance (run payroll, approve, mark as paid, export bank files, PDFs, email payslips)
- **SuperAdmin**: Full access to all payroll operations
- **Employee / OR / Developer**: Can view their own payslips only

---

## API Endpoints

### 1. Run Payroll

**Endpoint:** `POST /api/payroll/run`

**Description:** Generates payslips for employees for a specific month and year. Processes all active employees or a specified list of employees.

**Required Roles:** `HR` | `Finance` | `Accountant` | `SuperAdmin`

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

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `companyId` | String (ObjectId) | Yes | - | Company ID |
| `month` | Number | Yes | - | Month (1-12) |
| `year` | Number | Yes | - | Year (2000-2100) |
| `workingDays` | Number | No | 26 | Total working days in the month (1-31) |
| `employees` | Array[ObjectId] | No | - | Specific employee IDs to process. If not provided, processes all employees |
| `force` | Boolean | No | false | If true, overwrites existing payslips for the period |

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:3000/api/payroll/run" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "507f1f77bcf86cd799439011",
    "month": 12,
    "year": 2024,
    "workingDays": 26,
    "force": false
  }'
```

**Success Response (201):**
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

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Company ID is required",
    "Month must be between 1 and 12",
    "Year must be a valid year"
  ]
}
```

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. HR, Finance, or SuperAdmin role required."
}
```

**404 - Company Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

### 2. List Payslips

**Endpoint:** `GET /api/payroll`

**Description:** Retrieves a paginated list of payslips filtered by company, month, year, and status.

**Required Roles:** `HR` | `Finance` | `SuperAdmin`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `companyId` | String (ObjectId) | Yes | - | Company ID |
| `month` | Number | No | - | Month (1-12) |
| `year` | Number | No | - | Year (2000-2100) |
| `status` | String | No | - | Status: `draft`, `approved`, `paid`, or `cancelled` |
| `page` | Number | No | 1 | Page number (min: 1) |
| `limit` | Number | No | 20 | Items per page (min: 1, max: 100) |

**Example Request (cURL):**
```bash
curl -X GET "http://localhost:3000/api/payroll?companyId=507f1f77bcf86cd799439011&month=12&year=2024&status=approved&page=1&limit=20" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payslips retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "company": "507f1f77bcf86cd799439011",
      "employee": {
        "_id": "507f1f77bcf86cd799439012",
        "fullname": "John Doe",
        "empCode": "EMP001",
        "email": "john.doe@example.com"
      },
      "period": {
        "month": 12,
        "year": 2024
      },
      "earnings": [
        {
          "name": "Basic",
          "amount": 25000
        },
        {
          "name": "HRA",
          "amount": 10000
        }
      ],
      "deductions": [
        {
          "name": "Provident Fund (PF)",
          "amount": 3000
        },
        {
          "name": "Professional Tax",
          "amount": 200
        }
      ],
      "gross": 35000,
      "totalDeductions": 3200,
      "netPay": 31800,
      "status": "approved",
      "generatedAt": "2024-12-01T10:00:00.000Z",
      "approvedBy": {
        "_id": "507f1f77bcf86cd799439016",
        "fullname": "HR Manager",
        "email": "hr@example.com"
      },
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Company ID is required"
  ]
}
```

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. HR, Finance, or SuperAdmin role required."
}
```

---

### 3. Get Employee Payslip

**Endpoint:** `GET /api/payroll/payslip/:employeeId`

**Description:** Retrieves a specific payslip for an employee for a given month and year. Employees can only view their own payslips.

**Required Roles:** `Employee` (self only) | `HR` | `Finance`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | String (ObjectId) | Yes | Employee ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | Number | Yes | Month (1-12) |
| `year` | Number | Yes | Year (2000-2100) |

**Example Request (cURL):**
```bash
curl -X GET "http://localhost:3000/api/payroll/payslip/507f1f77bcf86cd799439012?month=12&year=2024" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payslip retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "company": {
      "_id": "507f1f77bcf86cd799439011",
      "company_name": "ABC Corp",
      "company_address": {
        "street": "123 Main St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "zipCode": "400001"
      }
    },
    "employee": {
      "_id": "507f1f77bcf86cd799439012",
      "fullname": "John Doe",
      "empCode": "EMP001",
      "email": "john.doe@example.com",
      "designation": "Software Engineer",
      "department": "IT"
    },
    "period": {
      "month": 12,
      "year": 2024
    },
    "earnings": [
      {
        "name": "Basic",
        "amount": 25000
      },
      {
        "name": "HRA",
        "amount": 10000
      },
      {
        "name": "Conveyance Allowance",
        "amount": 1600
      },
      {
        "name": "Medical Allowance",
        "amount": 1250
      }
    ],
    "deductions": [
      {
        "name": "Provident Fund (PF)",
        "amount": 3000
      },
      {
        "name": "Professional Tax",
        "amount": 200
      }
    ],
    "gross": 37850,
    "totalDeductions": 3200,
    "netPay": 34650,
    "status": "approved",
    "generatedAt": "2024-12-01T10:00:00.000Z",
    "approvedBy": {
      "_id": "507f1f77bcf86cd799439016",
      "fullname": "HR Manager",
      "email": "hr@example.com"
    },
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Month is required",
    "Year is required"
  ]
}
```

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. You can only view your own payslips."
}
```

**404 - Payslip Not Found:**
```json
{
  "success": false,
  "message": "Payslip not found for the specified period"
}
```

---

### 4. Approve Payslip

**Endpoint:** `POST /api/payroll/:payslipId/approve`

**Description:** Approves a draft payslip, allowing it to proceed to payment. Only draft payslips can be approved.

**Required Roles:** `HR` | `Finance`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payslipId` | String (ObjectId) | Yes | Payslip ID |

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:3000/api/payroll/507f1f77bcf86cd799439014/approve" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payslip approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "approved",
    "approvedBy": "507f1f77bcf86cd799439016",
    "updatedAt": "2024-12-01T11:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Invalid Status:**
```json
{
  "success": false,
  "message": "Only draft payslips can be approved"
}
```

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. HR or Finance role required."
}
```

**404 - Payslip Not Found:**
```json
{
  "success": false,
  "message": "Payslip not found"
}
```

---

### 5. Mark Payslip as Paid

**Endpoint:** `POST /api/payroll/:payslipId/pay`

**Description:** Marks an approved payslip as paid. This operation is transactional and idempotent. Creates an audit log entry and optionally integrates with the accounting module to create payment vouchers.

**Required Roles:** `Finance`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payslipId` | String (ObjectId) | Yes | Payslip ID |

**Request Body:**
```json
{
  "paymentRef": "TXN123456789",
  "bankLedgerId": "507f1f77bcf86cd799439016"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paymentRef` | String | No | Payment reference/transaction ID (max 200 chars) |
| `bankLedgerId` | String (ObjectId) | No | Bank ledger ID for accounting integration |

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:3000/api/payroll/507f1f77bcf86cd799439014/pay" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentRef": "TXN123456789",
    "bankLedgerId": "507f1f77bcf86cd799439016"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payslip marked as paid successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "paid",
    "paidAt": "2024-12-01T12:00:00.000Z",
    "paymentRef": "TXN123456789",
    "updatedAt": "2024-12-01T12:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Invalid Status:**
```json
{
  "success": false,
  "message": "Only approved payslips can be marked as paid"
}
```

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. Finance role required."
}
```

**404 - Payslip Not Found:**
```json
{
  "success": false,
  "message": "Payslip not found"
}
```

**409 - Already Paid:**
```json
{
  "success": true,
  "message": "Payslip already marked as paid with the same payment reference",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "paid",
    "paidAt": "2024-12-01T12:00:00.000Z",
    "paymentRef": "TXN123456789"
  }
}
```

---

### 6. Bank Export

**Endpoint:** `GET /api/payroll/bank-export`

**Description:** Exports approved or paid payslips as a CSV file for bank payment processing. Includes employee bank details and payment amounts. Invalid rows (missing IFSC or account numbers) are reported in response headers.

**Required Roles:** `Finance`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `companyId` | String (ObjectId) | Yes | - | Company ID |
| `month` | Number | Yes | - | Month (1-12) |
| `year` | Number | Yes | - | Year (2000-2100) |
| `format` | String | No | csv | Export format (currently only 'csv' supported) |

**Example Request (cURL):**
```bash
curl -X GET "http://localhost:3000/api/payroll/bank-export?companyId=507f1f77bcf86cd799439011&month=12&year=2024&format=csv" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -o bank_payments.csv
```

**Success Response (200):**

**Content-Type:** `text/csv`

**Content-Disposition:** `attachment; filename="bank_payment_<companyId>_<year>_<month>.csv"`

**Response Headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="bank_payment_507f1f77bcf86cd799439011_2024_12.csv"
X-Invalid-Rows: [{"employeeId":"507f1f77bcf86cd799439015","employeeName":"Jane Smith","reason":"Missing IFSC code"}]
```

**CSV Content:**
```csv
Employee Name,Account Number,IFSC Code,Amount (INR)
"John Doe",1234567890,SBIN0001234,34650.00
"Jane Smith",9876543210,HDFC0005678,32000.00
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Company ID is required",
    "Month is required",
    "Year is required"
  ]
}
```

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. Finance role required."
}
```

**404 - No Payslips Found:**
```json
{
  "success": false,
  "message": "No approved or paid payslips found for the specified period"
}
```

---

### 7. Generate PDF

**Endpoint:** `POST /api/payroll/payslip/:payslipId/generate-pdf`

**Description:** Generates a PDF payslip for the specified payslip. In production, this should be handled by a background worker/queue to avoid blocking the main event loop.

**Required Roles:** `HR` | `Finance`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payslipId` | String (ObjectId) | Yes | Payslip ID |

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:3000/api/payroll/payslip/507f1f77bcf86cd799439014/generate-pdf" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "PDF generated successfully",
  "data": {
    "payslipId": "507f1f77bcf86cd799439014",
    "pdfPath": "/tmp/payslip_507f1f77bcf86cd799439014.pdf",
    "note": "In production, this should be handled by a background worker and uploaded to S3"
  }
}
```

**Error Responses:**

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. HR or Finance role required."
}
```

**404 - Payslip Not Found:**
```json
{
  "success": false,
  "message": "Payslip not found"
}
```

**500 - PDF Generation Error:**
```json
{
  "success": false,
  "message": "Failed to generate PDF",
  "error": "Detailed error message"
}
```

---

### 8. Email Payslip

**Endpoint:** `POST /api/payroll/payslip/:payslipId/email`

**Description:** Sends the payslip PDF to the employee's email address. In production, this should be handled by a background worker/queue.

**Required Roles:** `HR` | `Finance`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payslipId` | String (ObjectId) | Yes | Payslip ID |

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:3000/api/payroll/payslip/507f1f77bcf86cd799439014/email" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payslip email sent successfully",
  "data": {
    "payslipId": "507f1f77bcf86cd799439014",
    "email": "john.doe@example.com",
    "note": "In production, this should be handled by a background worker"
  }
}
```

**Error Responses:**

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. HR or Finance role required."
}
```

**404 - Payslip Not Found:**
```json
{
  "success": false,
  "message": "Payslip not found"
}
```

**400 - Missing Email:**
```json
{
  "success": false,
  "message": "Employee email not found"
}
```

**500 - Email Send Error:**
```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "Detailed error message"
}
```

---

## Salary Structure API Endpoints

### 9. Create Salary Structure

**Endpoint:** `POST /api/payroll/salary-structure`

**Description:** Creates a new salary structure for a company with earnings and deduction components.

**Required Roles:** `HR` | `Finance` | `SuperAdmin`

**Request Body:**
```json
{
  "companyId": "507f1f77bcf86cd799439011",
  "name": "Standard Monthly Salary Structure",
  "baseForPercent": "CTC",
  "components": [
    {
      "name": "Basic",
      "type": "earning",
      "kind": "percent",
      "value": 50
    },
    {
      "name": "HRA",
      "type": "earning",
      "kind": "percent",
      "value": 20
    },
    {
      "name": "Conveyance Allowance",
      "type": "earning",
      "kind": "fixed",
      "value": 1600
    },
    {
      "name": "Medical Allowance",
      "type": "earning",
      "kind": "fixed",
      "value": 1250
    },
    {
      "name": "Professional Tax",
      "type": "deduction",
      "kind": "fixed",
      "value": 200
    }
  ],
  "isDefault": false
}
```

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `companyId` | String (ObjectId) | Yes | - | Company ID |
| `name` | String | Yes | - | Salary structure name (max 200 chars, unique per company) |
| `baseForPercent` | String | No | `CTC` | Base for percentage calculations: `CTC` or `Basic` |
| `components` | Array | Yes | - | Array of salary components (min 1) |
| `components[].name` | String | Yes | - | Component name (max 100 chars) |
| `components[].type` | String | Yes | - | `earning` or `deduction` |
| `components[].kind` | String | Yes | - | `fixed` (rupees) or `percent` (percentage) |
| `components[].value` | Number | Yes | - | Component value (min 0) |
| `isDefault` | Boolean | No | `false` | Set as default structure for company |

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:3000/api/payroll/salary-structure" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "507f1f77bcf86cd799439011",
    "name": "Standard Monthly Salary Structure",
    "baseForPercent": "CTC",
    "components": [
      {
        "name": "Basic",
        "type": "earning",
        "kind": "percent",
        "value": 50
      },
      {
        "name": "HRA",
        "type": "earning",
        "kind": "percent",
        "value": 20
      }
    ],
    "isDefault": true
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Salary structure created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "company": "507f1f77bcf86cd799439011",
    "name": "Standard Monthly Salary Structure",
    "baseForPercent": "CTC",
    "components": [
      {
        "name": "Basic",
        "type": "earning",
        "kind": "percent",
        "value": 50
      },
      {
        "name": "HRA",
        "type": "earning",
        "kind": "percent",
        "value": 20
      }
    ],
    "isDefault": true,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Company ID is required",
    "Salary structure name is required",
    "At least one component is required"
  ]
}
```

**409 - Duplicate Name:**
```json
{
  "success": false,
  "message": "Salary structure with this name already exists for this company"
}
```

---

### 10. List Salary Structures

**Endpoint:** `GET /api/payroll/salary-structure`

**Description:** Retrieves a paginated list of salary structures for a company.

**Required Roles:** `HR` | `Finance` | `SuperAdmin`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `companyId` | String (ObjectId) | Yes | - | Company ID |
| `page` | Number | No | 1 | Page number (min: 1) |
| `limit` | Number | No | 20 | Items per page (min: 1, max: 100) |

**Example Request (cURL):**
```bash
curl -X GET "http://localhost:3000/api/payroll/salary-structure?companyId=507f1f77bcf86cd799439011&page=1&limit=20" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Salary structures retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "company": {
        "_id": "507f1f77bcf86cd799439011",
        "company_name": "ABC Corp"
      },
      "name": "Standard Monthly Salary Structure",
      "baseForPercent": "CTC",
      "components": [...],
      "isDefault": true,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### 11. Get Salary Structure

**Endpoint:** `GET /api/payroll/salary-structure/:id`

**Description:** Retrieves a specific salary structure by ID.

**Required Roles:** `HR` | `Finance` | `SuperAdmin`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String (ObjectId) | Yes | Salary structure ID |

**Example Request (cURL):**
```bash
curl -X GET "http://localhost:3000/api/payroll/salary-structure/507f1f77bcf86cd799439020" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Salary structure retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "company": {
      "_id": "507f1f77bcf86cd799439011",
      "company_name": "ABC Corp",
      "company_email": "contact@abccorp.com"
    },
    "name": "Standard Monthly Salary Structure",
    "baseForPercent": "CTC",
    "components": [
      {
        "name": "Basic",
        "type": "earning",
        "kind": "percent",
        "value": 50
      },
      {
        "name": "HRA",
        "type": "earning",
        "kind": "percent",
        "value": 20
      }
    ],
    "isDefault": true,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Salary structure not found"
}
```

---

### 12. Update Salary Structure

**Endpoint:** `POST /api/payroll/salary-structure/:id/update`

**Description:** Updates an existing salary structure. Only provided fields will be updated.

**Required Roles:** `HR` | `Finance` | `SuperAdmin`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String (ObjectId) | Yes | Salary structure ID |

**Request Body:**
```json
{
  "name": "Updated Salary Structure Name",
  "baseForPercent": "Basic",
  "components": [
    {
      "name": "Basic",
      "type": "earning",
      "kind": "fixed",
      "value": 25000
    }
  ],
  "isDefault": true
}
```

**Request Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | String | Salary structure name (max 200 chars) |
| `baseForPercent` | String | `CTC` or `Basic` |
| `components` | Array | Array of salary components (min 1) |
| `isDefault` | Boolean | Set as default structure |

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:3000/api/payroll/salary-structure/507f1f77bcf86cd799439020/update" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Salary Structure",
    "isDefault": true
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Salary structure updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Updated Salary Structure",
    "isDefault": true,
    ...
  }
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "At least one field must be provided for update"
  ]
}
```

**409 - Duplicate Name:**
```json
{
  "success": false,
  "message": "Salary structure with this name already exists for this company"
}
```

---

### 13. Delete Salary Structure

**Endpoint:** `POST /api/payroll/salary-structure/:id/delete`

**Description:** Deletes a salary structure. Use with caution as this may affect payroll calculations.

**Required Roles:** `HR` | `Finance` | `SuperAdmin`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String (ObjectId) | Yes | Salary structure ID |

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:3000/api/payroll/salary-structure/507f1f77bcf86cd799439020/delete" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Salary structure deleted successfully"
}
```

**Error Responses:**

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Salary structure not found"
}
```

---

### 14. Get Default Salary Structure

**Endpoint:** `GET /api/payroll/salary-structure/company/:companyId/default`

**Description:** Retrieves the default salary structure for a company.

**Required Roles:** `HR` | `Finance` | `SuperAdmin`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyId` | String (ObjectId) | Yes | Company ID |

**Example Request (cURL):**
```bash
curl -X GET "http://localhost:3000/api/payroll/salary-structure/company/507f1f77bcf86cd799439011/default" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Default salary structure retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "company": "507f1f77bcf86cd799439011",
    "name": "Standard Monthly Salary Structure",
    "baseForPercent": "CTC",
    "components": [...],
    "isDefault": true,
    ...
  }
}
```

**Error Responses:**

**404 - Not Found:**
```json
{
  "success": false,
  "message": "No default salary structure found for this company"
}
```

---

## Data Models

### Payslip Status Flow

```
draft → approved → paid
  ↓
cancelled (can be cancelled at any time before paid)
```

### Payslip Structure

```json
{
  "_id": "ObjectId",
  "company": "ObjectId (ref: Company)",
  "employee": "ObjectId (ref: Employee)",
  "period": {
    "month": 1-12,
    "year": 2000-2100
  },
  "earnings": [
    {
      "name": "String",
      "amount": "Number (in rupees)"
    }
  ],
  "deductions": [
    {
      "name": "String",
      "amount": "Number (in rupees)"
    }
  ],
  "gross": "Number (in rupees)",
  "totalDeductions": "Number (in rupees)",
  "netPay": "Number (in rupees)",
  "status": "draft | approved | paid | cancelled",
  "generatedAt": "Date",
  "approvedBy": "ObjectId (ref: HR/Admin)",
  "paidAt": "Date",
  "paymentRef": "String",
  "pdfUrl": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Salary Structure

```json
{
  "_id": "ObjectId",
  "company": "ObjectId (ref: Company)",
  "name": "String",
  "baseForPercent": "CTC | Basic",
  "components": [
    {
      "name": "String",
      "type": "earning | deduction",
      "kind": "fixed | percent",
      "value": "Number"
    }
  ],
  "isDefault": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation errors) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (e.g., already paid) |
| `500` | Internal Server Error |

---

## Calculation Rules

### Salary Calculation

1. **Monthly Base Determination:**
   - If employee has `ctcAnnual`: `monthlyBase = ctcAnnual / 12`
   - Otherwise: `monthlyBase = employee.salary` (assumed monthly)

2. **Earnings Calculation:**
   - **Fixed:** `amount = component.value`
   - **Percent:** `amount = baseForPercent * (component.value / 100)`
   - Base for percentage: `CTC` (default) or `Basic` component

3. **Deductions Calculation:**
   - **Fixed:** `amount = component.value`
   - **Percent:** `amount = baseForPercent * (component.value / 100)`
   - **Absent Adjustment:** `perDay = gross / workingDays`, `deduction = perDay * absentDays`
   - **PF (Provident Fund):** `pfPercent%` of Basic (if present), else `50% of gross`
   - **Professional Tax:** Fixed amount (company setting)
   - **TDS:** Placeholder for future implementation

4. **Net Pay:**
   - `netPay = max(0, gross - totalDeductions)`

### Paise-Safe Arithmetic

All monetary calculations are performed in **paise** (integers) internally to avoid floating-point precision issues, then converted to **rupees** (with 2 decimal places) for storage and display.

---

## Best Practices

1. **Payroll Run:**
   - Run payroll at the beginning of each month for the previous month
   - Use `force: true` only when correcting errors
   - Review `skipped` and `errors` arrays after each run

2. **Approval Workflow:**
   - Review all payslips before approval
   - Approve in batches for efficiency
   - Keep audit trail for compliance

3. **Payment Processing:**
   - Always provide `paymentRef` for traceability
   - Use bank export for bulk payments
   - Verify payment status before marking as paid

4. **PDF and Email:**
   - In production, use background workers/queues
   - Store PDFs in S3 or similar cloud storage
   - Implement retry logic for email failures

---

## Integration Points

### Accounting Module

The payroll system includes integration points with the Accounts module:

- **Payment Voucher Creation:** When marking a payslip as paid, a Payment Voucher can be automatically created
- **Voucher Structure:**
  - Debit: SalaryExpense ledger
  - Credit: Bank ledger (from `bankLedgerId`)
  - Voucher type: `Payment`

To enable integration, uncomment and configure the voucher creation code in the `payPayslip` function.

### Attendance Module

Currently, absent days default to 0. To integrate with an Attendance module:

1. Replace `absentDays = 0` in `runPayroll` function
2. Query Attendance collection for the period
3. Calculate absent days based on attendance records

---

## Testing

### Unit Tests

Run Jest tests for payroll calculator:

```bash
npm test -- HR/__tests__/payrollCalculator.test.js
```

### Manual Testing Sequence

1. **Seed Data:**
   ```bash
   node scripts/seed_payroll.js
   ```

2. **Run Payroll:**
   ```bash
   POST /api/payroll/run
   ```

3. **List Payslips:**
   ```bash
   GET /api/payroll?companyId=<id>&month=12&year=2024
   ```

4. **Approve Payslip:**
   ```bash
   POST /api/payroll/<payslip-id>/approve
   ```

5. **Mark as Paid:**
   ```bash
   POST /api/payroll/<payslip-id>/pay
   ```

6. **Export Bank File:**
   ```bash
   GET /api/payroll/bank-export?companyId=<id>&month=12&year=2024&format=csv
   ```

---

## Support

For issues or questions, please refer to:
- Main project documentation: `HR/docs/README.md`
- Implementation summary: `HR/docs/PAYROLL_IMPLEMENTATION_SUMMARY.md`
- Postman collection: `HR/docs/postman_collection.json`

---

**Last Updated:** 2024-12-01
**Version:** 1.0.0

