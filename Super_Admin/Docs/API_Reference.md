# Super Admin API Reference

## Base URL
```
http://localhost:3000/api/superadmin
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Endpoints

### 1. Register Super Admin

**Endpoint:** `POST /signup`

**Description:** Creates a new super admin account in the system.

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "string (required, 2-50 characters)",
  "email": "string (required, valid email)",
  "password": "string (required, minimum 6 characters)"
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name must be at least 2 characters",
    "Please enter a valid email address"
  ]
}
```

**400 - Email Already Exists:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

---

### 2. Login Super Admin

**Endpoint:** `POST /login`

**Description:** Authenticates a super admin and returns a JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login Successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password is required"
  ]
}
```

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

---

### 3. Logout Super Admin

**Endpoint:** `POST /logout`

**Description:** Logs out the authenticated super admin.

**Authentication:** Required (JWT token)

**Request Body:** None required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout Successfully"
}
```

**Error Responses:**

**401 - No Token Provided:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**401 - Invalid or Expired Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

---

### 4. Forget Password

**Endpoint:** `POST /forget-password`

**Description:** Initiates password reset process for super admin.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required, valid email)"
}
```

**Validation Rules:**
- `email`: Required, valid email format

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset token generated successfully",
  "resetToken": "0e26fdc2496f5176bfff2cef48d95742d963003db2a5341f26160790bc377923",
  "expiresIn": "1 hour"
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Please enter a valid email address"
  ]
}
```

**404 - Admin Not Found:**
```json
{
  "success": false,
  "message": "Admin not found with this email"
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Please enter a valid email address"
  ]
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

---

### 6. Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Resets password using the token from forget password email.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "string (required, reset token from email)",
  "newPassword": "string (required, minimum 6 characters)"
}
```

**Validation Rules:**
- `token`: Required, valid reset token
- `newPassword`: Required, minimum 6 characters

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "email": "admin@example.com",
    "name": "Admin Name"
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
    "Reset token is required",
    "New password must be at least 6 characters"
  ]
}
```

**400 - Invalid or Expired Token:**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

---

### 5. Change Password

**Endpoint:** `POST /change-password`

**Description:** Changes the password for authenticated super admin.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, minimum 6 characters)"
}
```

**Validation Rules:**
- `currentPassword`: Required
- `newPassword`: Required, minimum 6 characters

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Current password is required",
    "New password must be at least 6 characters"
  ]
}
```

**400 - Incorrect Current Password:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**401 - No Token Provided:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**401 - Invalid or Expired Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**404 - Admin Not Found:**
```json
{
  "success": false,
  "message": "Admin not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error"
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

### 7. Filter Companies (SuperAdmin Only)

**Endpoint:** `POST /companies/filter`

**Description:** Filters companies by company ID and/or status. Allows SuperAdmin to search for specific companies or filter by active/inactive/suspended status. **If both `company_id` and `status` are provided, the company's status will be updated in the database.**

**Authentication:** Required (SuperAdmin JWT token)

**Request Body:**
```json
{
  "company_id": "string (optional, MongoDB ObjectId)",
  "status": "string (optional, one of: active, inactive, suspended)"
}
```

**Request Body Fields:**
- `company_id` (optional): Filter by specific company ID. Must be a valid MongoDB ObjectId (24 hex characters)
  - If provided alone, returns only the company with matching ID
  - If provided with `status`, **updates the company's status** and returns the updated company
  - If not provided, returns all companies (or filtered by status if status is provided)
- `status` (optional): Filter companies by status. Valid values: `active`, `inactive`, `suspended`
  - If provided alone, returns only companies with matching status
  - If provided with `company_id`, **updates the company's status** to this value and returns the updated company
  - If not provided, returns all companies (or filtered by company_id if company_id is provided)

**Important:** When both `company_id` and `status` are provided, the endpoint will:
1. Find the company by ID
2. Update its status to the provided status value
3. Return the updated company data

**Success Response (200) - When both company_id and status are provided (Status Updated):**
```json
{
  "success": true,
  "message": "Company status updated to inactive and filtered successfully",
  "data": [
    {
      "_id": "698c78c63416024b097cb6fb",
      "company_id": "CI/SD/0000001",
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
      "gstNumber": null,
      "fiscalYear": null,
      "industries": null,
      "constitution_of_business": null,
      "tdsApplicable": false,
      "tdsNumber": null,
      "professional": false,
      "professionalNumber": null,
      "epf": false,
      "epfNumber": null,
      "pf": false,
      "pfNumber": null,
      "esic": false,
      "esicNumber": null,
      "status": "inactive",
      "created_by": {
        "_id": "68f1df75eb4191c9a3610f08",
        "name": "superadmin",
        "email": "superadmin@gmail.com"
      },
      "createdAt": "2025-10-17T09:48:10.094Z",
      "updatedAt": "2025-10-17T10:30:00.000Z",
      "__v": 0
    }
  ],
  "count": 1,
  "filter": {
    "company_id": "698c78c63416024b097cb6fb",
    "status": "inactive"
  },
  "updated": true
}
```

**Success Response (200) - When filtering only (No Update):**
```json
{
  "success": true,
  "message": "Companies filtered by: status: active",
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
      "gstNumber": null,
      "fiscalYear": null,
      "industries": null,
      "constitution_of_business": null,
      "tdsApplicable": false,
      "tdsNumber": null,
      "professional": false,
      "professionalNumber": null,
      "epf": false,
      "epfNumber": null,
      "pf": false,
      "pfNumber": null,
      "esic": false,
      "esicNumber": null,
      "status": "active",
      "created_by": {
        "_id": "68f1df75eb4191c9a3610f08",
        "name": "superadmin",
        "email": "superadmin@gmail.com"
      },
      "createdAt": "2025-10-17T09:48:10.094Z",
      "updatedAt": "2025-10-17T09:48:10.094Z",
      "__v": 0
    }
  ],
  "count": 1,
  "filter": {
    "company_id": null,
    "status": "active"
  },
  "updated": false
}
```

**Example Requests:**

**Filter by Status Only (Active Companies):**
```json
{
  "status": "active"
}
```

**Filter by Status Only (Inactive Companies):**
```json
{
  "status": "inactive"
}
```

**Filter by Company ID Only:**
```json
{
  "company_id": "68f210dae0021a8a2431defc"
}
```

**Filter by Both Company ID and Status (Updates Company Status):**
```json
{
  "company_id": "698c78c63416024b097cb6fb",
  "status": "inactive"
}
```
**Note:** This will update the company's status to "inactive" in the database and return the updated company.

**Get All Companies (No Filters):**
```json
{}
```

**Error Responses:**

**400 - Invalid Status:**
```json
{
  "success": false,
  "message": "Invalid status value. Must be one of: active, inactive, suspended"
}
```

**400 - Invalid Company ID Format:**
```json
{
  "success": false,
  "message": "Invalid company_id format. Must be a valid MongoDB ObjectId"
}
```

**400 - Request Body Required:**
```json
{
  "success": false,
  "message": "Request body is required"
}
```

**404 - Company Not Found (when updating status):**
```json
{
  "success": false,
  "message": "Company not found"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:3000/api/superadmin/companies/filter" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "company_id": "68f210dae0021a8a2431defc"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/superadmin/companies/filter', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'active',
    company_id: '68f210dae0021a8a2431defc'
  })
});

const data = await response.json();
console.log(data);
```

---

### 8. Create Admin (SuperAdmin Only)

**Endpoint:** `POST /create-admin`

**Description:** Creates a new Admin user for a company with optional module permissions. SuperAdmin can assign specific permissions for HRM, CRM, ERP, and Payroll modules.

**Authentication:** Required (SuperAdmin JWT token)

**Request Body:**
```json
{
  "fullname": "Test User",
  "username": "testuser",
  "email": "testuser1@gmail.com",
  "role": "Admin",
  "password": "password123",
  "originalPassword": "password123",
  "phone": "1234567895",
  "adminArea": "kolkata",
  "company": "698c78c63416024b097cb6fb",
  "department": "698c78c63416024b097cb6fc",
  "permissions": {
    "hrm": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
    },
    "payroll": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
    },
    "crm": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
    },
    "erp": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
    }
  }
}
```

**Request Body Fields:**
- `fullname` (required): Admin's full name (2-100 characters)
- `username` (required): Unique username (3-50 characters, alphanumeric)
- `email` (required): Valid email address (unique)
- `role` (required): Must be "Admin"
- `password` (required): Password (minimum 6 characters, stored in plain text)
- `originalPassword` (required): Same as password (minimum 6 characters)
- `phone` (required): Phone number (10-20 characters)
- `adminArea` (required): Admin area/location (2-100 characters)
- `company` (required): Company ID (valid MongoDB ObjectId)
- `department` (optional): Department ID (valid MongoDB ObjectId). Must reference an existing department
- `permissions` (optional): Object containing module permissions
  - Each module (hrm, crm, erp, payroll) can have:
    - `create` (boolean, optional): Permission to create records
    - `read` (boolean, optional): Permission to read/view records
    - `update` (boolean, optional): Permission to update records
    - `delete` (boolean, optional): Permission to delete records
  - If `access` is not provided, it's automatically set to `true` if any permission (create, read, update, delete) is `true`
  - If a module is not provided, all permissions default to `false`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "_id": "698c78c63416024b097cb6fb",
    "fullname": "Test User",
    "username": "testuser",
    "email": "testuser1@gmail.com",
    "role": "Admin",
    "phone": "1234567895",
    "adminArea": "kolkata",
    "company": "698c78c63416024b097cb6fb",
    "department": "698c78c63416024b097cb6fc",
    "status": "active",
    "password": "password123",
    "originalPassword": "password123",
    "permissions": {
      "hrm": {
        "access": true,
        "canCreate": true,
        "canRead": true,
        "canUpdate": true,
        "canDelete": true
      },
      "crm": {
        "access": true,
        "canCreate": true,
        "canRead": true,
        "canUpdate": true,
        "canDelete": true
      },
      "erp": {
        "access": true,
        "canCreate": true,
        "canRead": true,
        "canUpdate": true,
        "canDelete": true
      },
      "payroll": {
        "access": true,
        "canCreate": true,
        "canRead": true,
        "canUpdate": true,
        "canDelete": true
      }
    },
    "createdAt": "2025-01-15T10:30:00.000Z"
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
    "Email is required",
    "Please enter a valid email address"
  ]
}
```

**400 - Email Already Registered:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**400 - Username Already Taken:**
```json
{
  "success": false,
  "message": "Username already taken"
}
```

**400 - Company Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

**400 - Department Not Found:**
```json
{
  "success": false,
  "message": "Department not found"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:3000/api/superadmin/create-admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "username": "testuser",
    "email": "testuser1@gmail.com",
    "role": "Admin",
    "password": "password123",
    "originalPassword": "password123",
    "phone": "1234567895",
    "adminArea": "kolkata",
    "company": "698c78c63416024b097cb6fb",
    "department": "698c78c63416024b097cb6fc",
    "permissions": {
      "hrm": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true
      },
      "payroll": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true
      },
      "crm": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true
      },
      "erp": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true
      }
    }
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/superadmin/create-admin', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullname: 'Test User',
    username: 'testuser',
    email: 'testuser1@gmail.com',
    role: 'Admin',
    password: 'password123',
    originalPassword: 'password123',
    phone: '1234567895',
    adminArea: 'kolkata',
    company: '698c78c63416024b097cb6fb',
    department: '698c78c63416024b097cb6fc',
    permissions: {
      hrm: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      payroll: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      crm: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      erp: {
        create: true,
        read: true,
        update: true,
        delete: true
      }
    }
  })
});

const data = await response.json();
console.log(data);
```

**Note:** The permissions format in the request uses `create`, `read`, `update`, `delete`, but the response shows the internal format with `access`, `canCreate`, `canRead`, `canUpdate`, `canDelete`. The system automatically maps the simplified format to the database format.

---

### 9. Create Department (SuperAdmin Only)

**Endpoint:** `POST /departments/create`

**Description:** Creates a new department in the system. SuperAdmin can create departments that can be used across the system.

**Authentication:** Required (SuperAdmin JWT token)

**Request Body:**
```json
{
  "department_name": "string (required, 2-100 characters)",
  "description": "string (optional, max 500 characters)",
  "status": "string (optional, one of: active, inactive)"
}
```

**Request Body Fields:**
- `department_name` (required): Name of the department (2-100 characters, unique)
- `description` (optional): Description of the department (max 500 characters)
- `status` (optional): Status of the department. Valid values: `active`, `inactive`. Defaults to `active`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "_id": "698c78c63416024b097cb6fb",
    "department_name": "Human Resources",
    "description": "HR department for managing employees",
    "status": "active",
    "created_by": "68f1df75eb4191c9a3610f08",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
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
    "Department name is required",
    "Department name must be at least 2 characters"
  ]
}
```

**400 - Department Already Exists:**
```json
{
  "success": false,
  "message": "Department with this name already exists"
}
```

**400 - Request Body Required:**
```json
{
  "success": false,
  "message": "Request body is required"
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
  "message": "Internal server error",
  "error": "Error message details"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:3000/api/superadmin/departments/create" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "department_name": "Human Resources",
    "description": "HR department for managing employees",
    "status": "active"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/superadmin/departments/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    department_name: 'Human Resources',
    description: 'HR department for managing employees',
    status: 'active'
  })
});

const data = await response.json();
console.log(data);
```

---

### 10. Get All Departments (SuperAdmin Only)

**Endpoint:** `GET /departments`

**Description:** Retrieves all departments with optional filtering, search, and pagination. SuperAdmin can view all departments in the system.

**Authentication:** Required (SuperAdmin JWT token)

**Query Parameters:**
- `status` (optional): Filter by status. Valid values: `active`, `inactive`
- `search` (optional): Search by department name or description (case-insensitive)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 100)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "_id": "698c78c63416024b097cb6fb",
      "department_name": "Human Resources",
      "description": "HR department for managing employees",
      "status": "active",
      "created_by": {
        "_id": "68f1df75eb4191c9a3610f08",
        "name": "Super Admin",
        "email": "superadmin@example.com"
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "_id": "698c78c63416024b097cb6fc",
      "department_name": "Information Technology",
      "description": "IT department for technical support",
      "status": "active",
      "created_by": {
        "_id": "68f1df75eb4191c9a3610f08",
        "name": "Super Admin",
        "email": "superadmin@example.com"
      },
      "createdAt": "2025-01-15T11:00:00.000Z",
      "updatedAt": "2025-01-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 2,
    "pages": 1
  }
}
```

**Example Requests:**

**Get All Departments:**
```
GET /api/superadmin/departments
```

**Filter by Status:**
```
GET /api/superadmin/departments?status=active
```

**Search Departments:**
```
GET /api/superadmin/departments?search=Human
```

**Pagination:**
```
GET /api/superadmin/departments?page=1&limit=10
```

**Combined Filters:**
```
GET /api/superadmin/departments?status=active&search=IT&page=1&limit=10
```

**Error Responses:**

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**401 - Invalid or Expired Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/superadmin/departments?status=active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/superadmin/departments?status=active&page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log(data);
```

---

### 11. Update Department (SuperAdmin Only)

**Endpoint:** `PUT /departments/:id` or `POST /departments/:id/update`

**Description:** Updates an existing department's information. SuperAdmin can modify department name, description, and status.

**Authentication:** Required (SuperAdmin JWT token)

**URL Parameters:**
- `id` (required): Department ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "department_name": "string (optional, 2-100 characters)",
  "description": "string (optional, max 500 characters)",
  "status": "string (optional, one of: active, inactive)"
}
```

**Request Body Fields:**
- `department_name` (optional): Name of the department (2-100 characters, must be unique if changed)
- `description` (optional): Description of the department (max 500 characters)
- `status` (optional): Status of the department. Valid values: `active`, `inactive`

**Note:** At least one field must be provided in the request body.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "_id": "698c78c63416024b097cb6fb",
    "department_name": "Human Resources",
    "description": "Updated HR department description",
    "status": "active",
    "created_by": {
      "_id": "68f1df75eb4191c9a3610f08",
      "name": "Super Admin",
      "email": "superadmin@example.com"
    },
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T12:30:00.000Z"
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
    "Department name must be at least 2 characters"
  ]
}
```

**400 - Department Name Already Exists:**
```json
{
  "success": false,
  "message": "Department with this name already exists"
}
```

**400 - Invalid Department ID Format:**
```json
{
  "success": false,
  "message": "Invalid department ID format"
}
```

**404 - Department Not Found:**
```json
{
  "success": false,
  "message": "Department not found"
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
  "message": "Internal server error",
  "error": "Error message details"
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:3000/api/superadmin/departments/698c78c63416024b097cb6fb" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "department_name": "Human Resources",
    "description": "Updated HR department description",
    "status": "active"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/superadmin/departments/698c78c63416024b097cb6fb', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    department_name: 'Human Resources',
    description: 'Updated HR department description',
    status: 'active'
  })
});

const data = await response.json();
console.log(data);
```

---

### 12. Delete Department (SuperAdmin Only)

**Endpoint:** `DELETE /departments/:id` or `POST /departments/:id/delete`

**Description:** Deletes an existing department from the system. The department cannot be deleted if it is assigned to any admins or employees.

**Authentication:** Required (SuperAdmin JWT token)

**URL Parameters:**
- `id` (required): Department ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department deleted successfully",
  "data": {
    "_id": "698c78c63416024b097cb6fb",
    "department_name": "Human Resources"
  }
}
```

**Error Responses:**

**400 - Invalid Department ID Format:**
```json
{
  "success": false,
  "message": "Invalid department ID format"
}
```

**400 - Department In Use:**
```json
{
  "success": false,
  "message": "Cannot delete department 'Human Resources' because it is assigned to one or more admins. Please reassign or remove those admins first."
}
```

```json
{
  "success": false,
  "message": "Cannot delete department 'Human Resources' because it is assigned to one or more employees. Please reassign or remove those employees first."
}
```

**404 - Department Not Found:**
```json
{
  "success": false,
  "message": "Department not found"
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
  "message": "Internal server error",
  "error": "Error message details"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3000/api/superadmin/departments/698c78c63416024b097cb6fb" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/superadmin/departments/698c78c63416024b097cb6fb', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log(data);
```

---

## Data Models

### SuperAdmin Model
```javascript
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique, lowercase)",
  "password": "String (required, hashed)",
  "role": "String (default: 'superadmin')",
  "resetPasswordToken": "String (optional, hashed reset token)",
  "resetPasswordExpires": "Date (optional, token expiration)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### JWT Token Payload
```javascript
{
  "id": "ObjectId (user ID)",
  "role": "String (user role)",
  "email": "String (user email)",
  "iat": "Number (issued at)",
  "exp": "Number (expiration)"
}
```

### Department Model
```javascript
{
  "_id": "ObjectId",
  "department_name": "String (required, unique, 2-100 characters)",
  "description": "String (optional, max 500 characters)",
  "status": "String (enum: 'active', 'inactive', default: 'active')",
  "created_by": "ObjectId (ref: 'SuperAdmin', required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Rate Limiting
Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Notes
- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens expire in 7 days by default (configurable via JWT_EXPIRES_IN)
- Email addresses are stored in lowercase
- All input is validated using Joi schemas
- Request bodies are sanitized (unknown fields are stripped)
- Password reset tokens are generated using crypto.randomBytes(32) and hashed with SHA256
- Reset tokens expire in 1 hour and are single-use only
- Email enumeration is prevented by always returning success for forget password requests

---

**Last Updated:** December 2024  
**API Version:** 1.0.0
