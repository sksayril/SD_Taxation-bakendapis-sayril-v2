# Company Management API Reference

## Base URL
```
http://localhost:3000/api/companies
```

## Authentication
All company endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Quick Start

### 1. Get Authentication Token
First, login to get your JWT token:
```bash
curl -X POST http://localhost:3000/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### 2. Create Your First Company
```bash
curl -X POST http://localhost:3000/api/companies/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "My Company",
    "company_email": "contact@mycompany.com",
    "company_phone": "+1-555-123-4567",
  }'
```

### 3. Get All Companies
```bash
curl -X GET http://localhost:3000/api/companies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Endpoints

### 1. Create Company

**Endpoint:** `POST /create`

**Description:** Creates a new company in the system.

**Authentication:** Required (JWT token)

**Request Body:**
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `company_name`: String (required)
  - `company_email`: String (required, valid email)
  - `company_phone`: String (required)
  - `company_address`: Object (required)
  - `company_logo`: File (optional, image file)
  - `company_website`: String (optional, valid URL)
  - `gstNumber`: String (optional, valid GST number format)
  - `fiscalYear`: String (optional, format YYYY-YYYY)

**Example Form Data:**
```
company_name: "Acme Corporation"
company_email: "contact@acmecorp.com"
company_phone: "+1-555-123-4567"
company_address: {"street":"123 Tech Street","city":"San Francisco","state":"CA","country":"USA","zipCode":"896589"}
company_logo: [FILE] (image file)
company_website: "https://www.acmecorp.com"
gstNumber: "22ABCDE1234F1Z5"
fiscalYear: "2024-2025"
```

**Validation Rules:**
- `company_name`: Required, 2-100 characters
- `company_email`: Required, valid email format, unique
- `company_phone`: Required, 10-20 characters
- `company_address`: Required object with:
  - `street`: Required, 5-200 characters
  - `city`: Required, 2-100 characters
  - `state`: Required, 2-100 characters
  - `country`: Required, 2-100 characters
  - `zipCode`: Required, 3-20 characters
- `company_logo`: Optional, image file (max 5MB, formats: jpg, jpeg, png, gif, webp)
- `company_website`: Optional, valid URL
- `gstNumber`: Optional, valid GST number format (e.g., 22ABCDE1234F1Z5)
- `fiscalYear`: Optional, format YYYY-YYYY (e.g., 2024-2025)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "company_name": "Acme Corporation",
    "company_email": "contact@acmecorp.com",
    "company_phone": "+1-555-123-4567",
    "company_address": {
      "street": "123 Tech Street",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "zipCode": "896589"
    },
    "company_logo": "https://your-s3-bucket.s3.amazonaws.com/company-logos/logo_1234567890_abc123.png",
    "company_website": "https://www.acmecorp.com",
    "gstNumber": "22ABCDE1234F1Z5",
    "fiscalYear": "2024-2025",
    "status": "active",
    "created_at": "2024-12-17T10:30:00.000Z"
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
    "Company name must be at least 2 characters",
    "Please enter a valid email address"
  ]
}
```

**400 - Email Already Exists:**
```json
{
  "success": false,
  "message": "Company with this email already exists"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

**Example Usage:**

**cURL (with file upload):**
```bash
curl -X POST http://localhost:3000/api/companies/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "company_name=Acme Corporation" \
  -F "company_email=contact@acmecorp.com" \
  -F "company_phone=+1-555-123-4567" \
  -F 'company_address={"street":"123 Tech Street","city":"San Francisco","state":"CA","country":"USA","zipCode":"896589"}' \
  -F "company_logo=@/path/to/logo.png" \
  -F "company_website=https://www.acmecorp.com"
```

**cURL (Update Company):**
```bash
curl -X POST http://localhost:3000/api/companies/:id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "company_name=Updated Company Name" \
  -F "company_email=updated@company.com" \
  -F "company_phone=+1-555-999-9999" \
  -F 'company_address={"street":"456 Updated Street","city":"New York","state":"NY","country":"USA","zipCode":"10001"}' \
  -F "company_logo=@/path/to/new-logo.png" \
  -F "company_website=https://www.updatedcompany.com"
```

**PowerShell (with file upload):**
```powershell
$form = @{
    company_name = "Acme Corporation"
    company_email = "contact@acmecorp.com"
    company_phone = "+1-555-123-4567"
    company_address = '{"street":"123 Tech Street","city":"San Francisco","state":"CA","country":"USA","zipCode":"896589"}'
    company_logo = Get-Item "C:\path\to\logo.png"
    company_website = "https://www.acmecorp.com"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/companies/create" -Method POST `
  -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} `
  -Form $form
```

**PowerShell (Update Company):**
```powershell
$updateForm = @{
    company_name = "Updated Company Name"
    company_email = "updated@company.com"
    company_phone = "+1-555-999-9999"
    company_address = '{"street":"456 Updated Street","city":"New York","state":"NY","country":"USA","zipCode":"10001"}'
    company_logo = Get-Item "C:\path\to\new-logo.png"
    company_website = "https://www.updatedcompany.com"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/companies/:id" -Method POST `
  -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} `
  -Form $updateForm
```

**JavaScript (Fetch with FormData):**
```javascript
const formData = new FormData();
formData.append('company_name', 'Acme Corporation');
formData.append('company_email', 'contact@acmecorp.com');
formData.append('company_phone', '+1-555-123-4567');
formData.append('company_address', JSON.stringify({
  street: "123 Tech Street",
  city: "San Francisco",
  state: "CA",
  country: "USA",
  zipCode: "896589"
}));
formData.append('company_logo', fileInput.files[0]); // File from input element
formData.append('company_website', 'https://www.acmecorp.com');

const response = await fetch('http://localhost:3000/api/companies/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});

const data = await response.json();
console.log(data);
```

**JavaScript (Update Company):**
```javascript
const updateFormData = new FormData();
updateFormData.append('company_name', 'Updated Company Name');
updateFormData.append('company_email', 'updated@company.com');
updateFormData.append('company_phone', '+1-555-999-9999');
updateFormData.append('company_address', JSON.stringify({
  street: "456 Updated Street",
  city: "New York",
  state: "NY",
  country: "USA",
  zipCode: "10001"
}));
updateFormData.append('company_logo', newLogoFileInput.files[0]); // New logo file
updateFormData.append('company_website', 'https://www.updatedcompany.com');

const updateResponse = await fetch(`http://localhost:3000/api/companies/${companyId}`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: updateFormData
});

const updateData = await updateResponse.json();
console.log(updateData);
```

**Real-world Examples:**

**Example 1: Tech Startup**
```json
{
  "company_name": "TechFlow Solutions",
  "company_email": "hello@techflow.com",
  "company_phone": "+1-415-555-0123",
  "company_address": {
    "street": "456 Innovation Drive",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94105"
  },
  "company_logo": "https://techflow.com/images/logo.png",
  "company_website": "https://www.techflow.com"
}
```

**Example 2: Manufacturing Company**
```json
{
  "company_name": "Global Manufacturing Ltd",
  "company_email": "info@globalmfg.com",
  "company_phone": "+1-312-555-0456",
  "company_address": {
    "street": "789 Industrial Boulevard",
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "zipCode": "60601"
  },
  "company_logo": "https://globalmfg.com/assets/logo.svg",
  "company_website": "https://www.globalmfg.com"
}
```

**Example 3: Service Company (Minimal Data)**
```json
{
  "company_name": "Local Services Inc",
  "company_email": "contact@localservices.com",
  "company_phone": "+1-555-789-0123",
  "company_address": {
    "street": "321 Main Street",
    "city": "Anytown",
    "state": "ST",
    "country": "USA",
    "zipCode": "12345"
  }
}
```

---

### 2. Get All Companies

**Endpoint:** `GET /`

**Description:** Retrieves all companies in the system.

**Authentication:** Required (JWT token)

**Request Body:** None required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": [
    {
      "_id": "68f210dae0021a8a2431defc",
      "company_name": "Local Services Inc",
      "company_email": "contact@localservices.com",
      "company_phone": "1234567891",
      "company_address": {
        "street": "321 Main Street",
        "city": "Anytown",
        "state": "ST",
        "country": "USA",
        "zipCode": "12345"
      },
      "company_logo": null,
      "company_website": null,
      "status": "active",
      "created_by": {
        "_id": "68f1df75eb4191c9a3610f08",
        "name": "superadmin",
        "email": "superadmin@gmail.com"
      },
      "createdAt": "2025-10-17T09:48:10.094Z",
      "updatedAt": "2025-10-17T09:48:10.094Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get Company by ID

**Endpoint:** `GET /:id`

**Description:** Retrieves a specific company by its ID.

**Authentication:** Required (JWT token)

**Request Body:** None required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "company_name": "Tech Solutions Inc",
    "company_email": "info@techsolutions.com",
    "company_phone": "+1-555-0123",
    "company_address": "123 Tech Street, Silicon Valley, CA 94000",
    "company_logo": "https://example.com/logo.png",
    "company_website": "https://techsolutions.com",
    "status": "active",
    "created_by": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Super Admin",
      "email": "admin@example.com"
    },
    "createdAt": "2024-12-17T10:30:00.000Z",
    "updatedAt": "2024-12-17T10:30:00.000Z"
  }
}
```

**Error Responses:**

**404 - Company Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

---

### 4. Update Company

**Endpoint:** `POST /:id`

**Description:** Updates an existing company.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "company_name": "string (optional, 2-100 characters)",
  "company_email": "string (optional, valid email)",
  "company_phone": "string (optional, 10-20 characters)",
  "company_address": "string (optional, 10-500 characters)",
  "company_logo": "string (optional, valid URL)",
  "company_website": "string (optional, valid URL)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "company_name": "Updated Tech Solutions Inc",
    "company_email": "updated@techsolutions.com",
    "company_phone": "+1-555-0124",
    "company_address": "456 New Tech Street, Silicon Valley, CA 94000",
    "company_logo": "https://example.com/new-logo.png",
    "company_website": "https://newtechsolutions.com",
    "status": "active",
    "created_by": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Super Admin",
      "email": "admin@example.com"
    },
    "createdAt": "2024-12-17T10:30:00.000Z",
    "updatedAt": "2024-12-17T11:30:00.000Z"
  }
}
```

---

### 5. Update Company Status

**Endpoint:** `PATCH /:id/status`

**Description:** Updates the status of a company.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "status": "string (required, one of: active, inactive, suspended)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company status updated successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "company_name": "Tech Solutions Inc",
    "status": "inactive"
  }
}
```

---

### 6. Delete Company

**Endpoint:** `POST /:id/delete`

**Description:** Deletes a company from the system.

**Authentication:** Required (JWT token)

**Request Body:** None required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Error Responses:**

**404 - Company Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

**Example Usage:**

**cURL:**
```bash
curl -X POST http://localhost:3000/api/companies/:id/delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/companies/:id/delete" -Method POST `
  -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}
```

**JavaScript:**
```javascript
const deleteResponse = await fetch(`http://localhost:3000/api/companies/${companyId}/delete`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const deleteData = await deleteResponse.json();
console.log(deleteData);
```

---

## Data Models

### Company Model
```javascript
{
  "_id": "ObjectId",
  "company_name": "String (required, 2-100 characters)",
  "company_email": "String (required, unique, valid email)",
  "company_phone": "String (required, 10-20 characters)",
  "company_logo": "String (optional, valid URL)",
  "company_website": "String (optional, valid URL)",
  "created_by": "ObjectId (reference to SuperAdmin)",
  "status": "String (enum: active, inactive, suspended, default: active)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Common Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Request body is required"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## AWS S3 Configuration

### Environment Variables Required
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

### File Upload Specifications
- **Supported Formats:** JPG, JPEG, PNG, GIF, WEBP
- **Maximum File Size:** 5MB
- **Storage Location:** S3 bucket under `company-logos/` folder
- **Access Level:** Public read
- **File Naming:** `logo_{timestamp}_{random}.{extension}`

### S3 Bucket Setup
1. Create an S3 bucket in your AWS account
2. Configure bucket permissions for public read access
3. Set up CORS policy if needed for web uploads
4. Add the environment variables to your `.env` file

## Security Notes
- All endpoints require JWT authentication
- Company email addresses must be unique
- Input validation using Joi schemas
- Request bodies are sanitized (unknown fields are stripped)
- Company creation is tracked with creator information
- File uploads are validated for type and size
- Uploaded files are stored securely on AWS S3

## Troubleshooting

### Common Issues

**1. "No token provided" Error**
- **Cause:** Missing or invalid Authorization header
- **Solution:** Ensure you include `Authorization: Bearer YOUR_JWT_TOKEN` in headers
- **Check:** Token is not expired (tokens expire in 7 days)

**2. "Company with this email already exists" Error**
- **Cause:** Trying to create company with existing email
- **Solution:** Use a different email address or update existing company instead

**3. "Validation failed" Error**
- **Cause:** Invalid input data (wrong format, missing required fields)
- **Solution:** Check all required fields are provided and properly formatted

**4. "Invalid or expired token" Error**
- **Cause:** JWT token is invalid or expired
- **Solution:** Login again to get a new token

### Field Requirements Summary

| Field | Required | Format | Length |
|-------|----------|--------|--------|
| company_name | ✅ | String | 2-100 chars |
| company_email | ✅ | Valid email | Unique |
| company_phone | ✅ | String | 10-20 chars |
| company_address | ✅ | String | 10-500 chars |
| company_logo | ❌ | Valid URL | - |
| company_website | ❌ | Valid URL | - |

### Status Codes Reference

| Code | Meaning | When to Expect |
|------|---------|----------------|
| 201 | Created | Successful company creation |
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 400 | Bad Request | Validation errors, duplicate email |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Company ID doesn't exist |
| 500 | Server Error | Internal server issues |

---

**Last Updated:** December 2024  
**API Version:** 1.0.0
