# Employee API Reference

## Base URL
```
http://localhost:3000/api/employees
```

## Authentication
Employee management endpoints require JWT authentication with **Admin**, **Company HR**, or **SuperAdmin** role. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

Employee login/logout endpoints do not require authentication.

---

## Endpoints

### 1. Employee Login

**Endpoint:** `POST /login`

**Description:** Authenticates an Employee user and returns a JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "6710f9f0a8b2e0f49d9d3d12",
    "fullname": "Priya Sharma",
    "email": "priya.sharma@company.com",
    "role": "Employee",
    "phone": "+919876543210",
    "department": "Operations",
    "designation": "Field Executive",
    "address": {
      "street": "No. 12, MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "zipCode": "560001"
    },
    "company": {
      "_id": "66f3a9abbb1234567890abcd",
      "company_name": "ABC Corp",
      "company_email": "contact@abccorp.com"
    },
    "lastLogin": "2025-01-17T16:30:15.123Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Employee Logout

**Endpoint:** `POST /logout`

**Description:** Logs out the current Employee user.

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 3. Create Employee

**Endpoint:** `POST /employees`

**Description:** Creates a new Employee, OR, or Developer account for a company.

**Authentication:** Required (**Admin**, **HR**, or **SuperAdmin**)

**Request Body:**
```json
{
  "fullname": "string (required, 2-100 characters)",
  "email": "string (required, valid email)",
  "password": "string (optional, minimum 6 characters)",
  "phone": "string (required, 10-20 characters)",
  "department": "string (required, 2-100 characters)",
  "designation": "string (optional, 2-100 characters)",
  "empCode": "string (required, 3-20 characters, uppercase letters and numbers only)",
  "salary": "number (required, 0-99999999)",
  "bankDetails": {
    "bankName": "string (optional, max 100 characters)",
    "accountNumber": "string (optional, max 20 characters, digits only)",
    "ifsc": "string (optional, 11 characters, format: SBIN0001234)",
    "branch": "string (optional, max 100 characters)"
  },
  "aadharId": "string (optional, exactly 12 digits)",
  "panNo": "string (optional, exactly 10 characters, format: ABCDE1234F)",
  "joinDate": "date (required, ISO 8601 format: YYYY-MM-DD)",
  "address": {
    "street": "string (optional, max 200 characters)",
    "city": "string (optional, max 100 characters)",
    "state": "string (optional, max 100 characters)",
    "country": "string (optional, max 100 characters)",
    "zipCode": "string (optional, max 20 characters)"
  },
  "role": "string (optional, one of: 'Employee', 'HR', 'OR', 'Developer' – defaults to 'Employee' if omitted)",
  "company": "string (required, valid MongoDB ObjectId)"
}
```

**Example Request:**
```json
{
  "fullname": "Priya Sharma",
  "email": "priya.sharma@company.com",
  "password": "Emp@12345",
  "phone": "+919876543210",
  "department": "Operations",
  "designation": "Field Executive",
  "empCode": "EMP001",
  "salary": 45000,
  "bankDetails": {
    "bankName": "State Bank of India",
    "accountNumber": "1234567890123456",
    "ifsc": "SBIN0001234",
    "branch": "MG Road Branch"
  },
  "aadharId": "123456789012",
  "panNo": "ABCDE1234F",
  "joinDate": "2024-01-15",
  "address": {
    "street": "No. 12, MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "zipCode": "560001"
  },
  "company": "6710f9f0a8b2e0f49d9d3d12"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "_id": "6710f9f0a8b2e0f49d9d3d12",
    "fullname": "Priya Sharma",
    "email": "priya.sharma@company.com",
    "role": "Employee",
    "phone": "+919876543210",
    "department": "Operations",
    "designation": "Field Executive",
    "empCode": "EMP001",
    "ledgerName": "Priya Sharma - Field Executive",
    "assetsAssigned": ["AST001", "AST002"],
    "salary": 45000,
    "bankDetails": {
      "bankName": "State Bank of India",
      "accountNumber": "1234567890123456",
      "ifsc": "SBIN0001234",
      "branch": "MG Road Branch"
    },
    "aadharId": "123456789012",
    "panNo": "ABCDE1234F",
    "joinDate": "2024-01-15T00:00:00.000Z",
    "address": {
      "street": "No. 12, MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "zipCode": "560001"
    },
    "company": "6710f9f0a8b2e0f49d9d3d12",
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2025-01-17T15:50:21.342Z"
  }
}
```

---

### 4. Get All Employees

**Endpoint:** `GET /employees`

**Description:** Retrieves all Employee accounts with pagination, search, and filtering.

**Authentication:** Required (**Admin**, **HR**, or **SuperAdmin**)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in fullname, email
- `department` (optional): Filter by department

**Example Request:**
```
GET /employees?page=1&limit=10&search=priya&department=Operations
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": [
    {
      "_id": "6710f9f0a8b2e0f49d9d3d12",
      "fullname": "Priya Sharma",
      "email": "priya.sharma@company.com",
      "role": "Employee",
      "phone": "+919876543210",
      "department": "Operations",
      "designation": "Field Executive",
      "empCode": "EMP001",
      "ledgerName": "Priya Sharma - Field Executive",
      "assetsAssigned": ["AST001", "AST002"],
      "address": {
        "street": "No. 12, MG Road",
        "city": "Bangalore",
        "state": "Karnataka",
        "country": "India",
        "zipCode": "560001"
      },
      "company": {
        "_id": "66f3a9abbb1234567890abcd",
        "company_name": "ABC Corp",
        "company_email": "contact@abccorp.com"
      },
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "fullname": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2025-01-17T15:50:21.342Z",
      "updatedAt": "2025-01-17T15:50:21.342Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 5. Get Employee by ID

**Endpoint:** `GET /employees/:id`

**Description:** Retrieves a specific Employee account by ID.

**Authentication:** Required (**Admin**, **HR**, or **SuperAdmin**)

**Parameters:**
- `id`: Employee ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "_id": "6710f9f0a8b2e0f49d9d3d12",
    "fullname": "Priya Sharma",
    "email": "priya.sharma@company.com",
    "role": "Employee",
    "phone": "+919876543210",
    "department": "Operations",
    "designation": "Field Executive",
    "empCode": "EMP001",
    "ledgerName": "Priya Sharma - Field Executive",
    "assetsAssigned": ["AST001", "AST002"],
    "address": {
      "street": "No. 12, MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "zipCode": "560001"
    },
    "company": {
      "_id": "66f3a9abbb1234567890abcd",
      "company_name": "ABC Corp",
      "company_email": "contact@abccorp.com",
      "company_phone": "+911234567890"
    },
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fullname": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2025-01-17T15:50:21.342Z",
    "updatedAt": "2025-01-17T15:50:21.342Z"
  }
}
```

---

### 6. Update Employee

**Endpoint:** `POST /update-employee/:id`

**Description:** Updates an existing Employee account.

**Authentication:** Required (**Admin**, **HR**, or **SuperAdmin**)

**Parameters:**
- `id`: Employee ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "fullname": "string (optional, 2-100 characters)",
  "email": "string (optional, valid email)",
  "password": "string (optional, minimum 6 characters)",
  "phone": "string (optional, 10-20 characters)",
  "department": "string (optional, 2-100 characters)",
  "designation": "string (optional, 2-100 characters)",
  "ledgerName": "string (optional, 2-100 characters)",
  "assetsAssigned": "array (optional, array of asset IDs)",
  "address": {
    "street": "string (optional, max 200 characters)",
    "city": "string (optional, max 100 characters)",
    "state": "string (optional, max 100 characters)",
    "country": "string (optional, max 100 characters)",
    "zipCode": "string (optional, max 20 characters)"
  },
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "_id": "6710f9f0a8b2e0f49d9d3d12",
    "fullname": "Priya Sharma Updated",
    "email": "priya.updated@company.com",
    "role": "Employee",
    "phone": "+919876543210",
    "department": "Operations",
    "designation": "Senior Field Executive",
    "empCode": "EMP001",
    "ledgerName": "Priya Sharma - Senior Field Executive",
    "assetsAssigned": ["AST001", "AST002"],
    "address": {
      "street": "No. 15, MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "zipCode": "560001"
    },
    "company": "66f3a9abbb1234567890abcd",
    "createdAt": "2025-01-17T15:50:21.342Z",
    "updatedAt": "2025-01-17T16:30:15.123Z"
  }
}
```

---

### 7. Delete Employee

**Endpoint:** `POST /delete-employee/:id`

**Description:** Deletes an Employee account permanently.

**Authentication:** Required (**Admin**, **HR**, or **SuperAdmin**)

**Parameters:**
- `id`: Employee ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Full name must be at least 2 characters",
    "Please enter a valid email address"
  ]
}
```

### 400 - Duplicate Data
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 401 - Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 - Access Denied
```json
{
  "success": false,
  "message": "Access denied. Admin, Company HR, or SuperAdmin role required."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Employee not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Data Models

### Employee Model
```javascript
{
  "_id": "ObjectId",
  "fullname": "String (required, 2-100 characters)",
  "email": "String (required, unique, valid email)",
  "password": "String (optional, hashed with bcrypt)",
  "role": "String (default: 'Employee')",
  "phone": "String (required, 10-20 characters)",
  "department": "String (required, 2-100 characters)",
  "designation": "String (optional, 2-100 characters)",
  "empCode": "String (required, 3-20 characters, uppercase letters and numbers only)",
  "salary": "Number (required, 0-99999999)",
  "bankDetails": {
    "bankName": "String (optional, max 100 characters)",
    "accountNumber": "String (optional, max 20 characters, digits only)",
    "ifsc": "String (optional, 11 characters, format: SBIN0001234)",
    "branch": "String (optional, max 100 characters)"
  },
  "aadharId": "String (optional, exactly 12 digits)",
  "panNo": "String (optional, exactly 10 characters, format: ABCDE1234F)",
  "joinDate": "Date (required, ISO 8601 format: YYYY-MM-DD)",
  "address": {
    "street": "String (optional, max 200 characters)",
    "city": "String (optional, max 100 characters)",
    "state": "String (optional, max 100 characters)",
    "country": "String (optional, max 100 characters)",
    "zipCode": "String (optional, max 20 characters)"
  },
  "company": "ObjectId (required, ref: 'Company')",
  "createdBy": "ObjectId (required, ref: 'Admin')",
  "lastLogin": "Date (optional)",
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
  "company": "ObjectId (company ID)",
  "iat": "Number (issued at)",
  "exp": "Number (expiration)"
}
```

---

## Security Notes
- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens expire in 7 days by default (configurable via JWT_EXPIRES_IN)
- Email addresses are stored in lowercase
- All input is validated using Joi schemas
- Request bodies are sanitized (unknown fields are stripped)
- Only Admin or SuperAdmin roles can manage employees
- Company references are validated before creating employees
- Duplicate email and employeeId prevention
- Password is never returned in API responses

---

**Last Updated:** January 2025  
**API Version:** 1.0.0
