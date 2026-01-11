# HR/Finance API Reference

## Base URL
```
http://localhost:3000/api/hr
```

## Authentication
All HR endpoints require JWT authentication with Admin or SuperAdmin role. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Endpoints

### 1. HR Login

**Endpoint:** `POST /login`

**Description:** Authenticates an HR or Finance user and returns a JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Example Request:**
```json
{
  "email": "rekha@company.com",
  "password": "HrPass@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "64f...abcd",
    "fullname": "Rekha Sharma",
    "username": "rekha_hr",
    "email": "rekha@company.com",
    "role": "HR",
    "phone": "+919876543210",
    "designation": "HR Manager",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400001"
    },
    "company": {
      "_id": "6710f9f0a8b2e0f49d9d3d12",
      "company_name": "ABC Corp",
      "company_email": "contact@abccorp.com"
    },
    "lastLogin": "2025-01-17T18:30:15.123Z"
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

---

### 2. HR/Finance Logout

**Endpoint:** `POST /logout`

**Description:** Logs out the current HR or Finance user.

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 3. Create HR/Finance User

**Endpoint:** `POST /hr`

**Description:** Creates a new HR or Finance user account. Only Admin or SuperAdmin can access this endpoint.

**Authentication:** Required (Admin or SuperAdmin)

**Request Body:**
```json
{
  "fullname": "string (required, 2-100 characters)",
  "username": "string (required, 3-50 characters, alphanumeric)",
  "email": "string (required, valid email)",
  "password": "string (required, minimum 6 characters)",
  "phone": "string (required, 10-20 characters)",
  "designation": "string (optional, 2-100 characters)",
  "address": {
    "street": "string (optional, max 200 characters)",
    "city": "string (optional, max 100 characters)",
    "state": "string (optional, max 100 characters)",
    "country": "string (optional, max 100 characters)",
    "zipCode": "string (optional, max 20 characters)"
  },
  "role": "string (required, must be 'HR', 'Finance', or 'Accountant')",
  "company": "string (optional, valid MongoDB ObjectId - uses req.user.company if not provided)"
}
```

**Example Request:**
```json
{
  "fullname": "Rekha Sharma",
  "username": "rekha_hr",
  "email": "rekha@company.com",
  "password": "HrPass@123",
  "phone": "+919876543210",
  "designation": "HR Manager",
  "role": "HR",
  "company": "6710f9f0a8b2e0f49d9d3d12"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "HR created successfully",
  "data": {
    "_id": "64f...abcd",
    "fullname": "Rekha Sharma",
    "username": "rekha_hr",
    "email": "rekha@company.com",
    "role": "HR",
    "phone": "+919876543210",
    "designation": "HR Manager",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400001"
    },
    "company": "6710f9f0a8b2e0f49d9d3d12",
    "createdBy": "68f1df75eb4191c9a3610f08",
    "createdAt": "2025-01-17T18:00:00.000Z"
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
    "Full name must be at least 2 characters",
    "Role must be either HR, Finance, or Accountant"
  ]
}
```

**409 - Duplicate Data:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. Admin or SuperAdmin role required."
}
```

---

### 4. Get All HR/Finance Users

**Endpoint:** `GET /hr`

**Description:** Retrieves all HR and OR users with pagination, search, and filtering.

**Authentication:** Required (Admin or SuperAdmin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in fullname, username, email
- `department` (optional): Filter by department
- `role` (optional): Filter by role (HR or Finance)

**Example Request:**
```
GET /hr?page=1&limit=10&search=rekha&department=Human Resources&role=HR
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "HR/Finance users retrieved successfully",
  "data": [
    {
      "_id": "64f...abcd",
      "fullname": "Rekha Sharma",
      "username": "rekha_hr",
      "email": "rekha@company.com",
      "role": "HR",
      "phone": "+919876543210",
      "designation": "HR Manager",
      "address": {
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "zipCode": "400001"
      },
      "company": {
        "_id": "6710f9f0a8b2e0f49d9d3d12",
        "company_name": "ABC Corp",
        "company_email": "contact@abccorp.com"
      },
      "createdBy": {
        "_id": "68f1df75eb4191c9a3610f08",
        "fullname": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2025-01-17T18:00:00.000Z",
      "updatedAt": "2025-01-17T18:00:00.000Z"
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

### 5. Get HR/Finance User by ID

**Endpoint:** `GET /hr/:id`

**Description:** Retrieves a specific HR or Finance user by ID.

**Authentication:** Required (Admin or SuperAdmin)

**Parameters:**
- `id`: HR/Finance User ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "HR/Finance user retrieved successfully",
  "data": {
    "_id": "64f...abcd",
    "fullname": "Rekha Sharma",
    "username": "rekha_hr",
    "email": "rekha@company.com",
    "role": "HR",
    "phone": "+919876543210",
    "designation": "HR Manager",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400001"
    },
    "company": {
      "_id": "6710f9f0a8b2e0f49d9d3d12",
      "company_name": "ABC Corp",
      "company_email": "contact@abccorp.com",
      "company_phone": "+911234567890"
    },
    "createdBy": {
      "_id": "68f1df75eb4191c9a3610f08",
      "fullname": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2025-01-17T18:00:00.000Z",
    "updatedAt": "2025-01-17T18:00:00.000Z"
  }
}
```

---

### 6. Update HR/Finance User

**Endpoint:** `POST /update-hr/:id`

**Description:** Updates an existing HR or Finance user account.

**Authentication:** Required (Admin or SuperAdmin)

**Parameters:**
- `id`: HR/Finance User ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "fullname": "string (optional, 2-100 characters)",
  "username": "string (optional, 3-50 characters, alphanumeric)",
  "email": "string (optional, valid email)",
  "password": "string (optional, minimum 6 characters)",
  "phone": "string (optional, 10-20 characters)",
  "department": "string (optional, 2-100 characters)",
  "designation": "string (optional, 2-100 characters)",
  "address": {
    "street": "string (optional, max 200 characters)",
    "city": "string (optional, max 100 characters)",
    "state": "string (optional, max 100 characters)",
    "country": "string (optional, max 100 characters)",
    "zipCode": "string (optional, max 20 characters)"
  },
  "role": "string (optional, must be 'HR' or 'Finance')"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "HR/Finance user updated successfully",
  "data": {
    "_id": "64f...abcd",
    "fullname": "Rekha Sharma Updated",
    "username": "rekha_hr",
    "email": "rekha.updated@company.com",
    "role": "HR",
    "phone": "+919876543210",
    "designation": "Senior HR Manager",
    "address": {
      "street": "456 Updated Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400001"
    },
    "company": "6710f9f0a8b2e0f49d9d3d12",
    "createdAt": "2025-01-17T18:00:00.000Z",
    "updatedAt": "2025-01-17T19:30:15.123Z"
  }
}
```

---

### 7. Delete HR/Finance User

**Endpoint:** `POST /delete-hr/:id`

**Description:** Deletes an HR or Finance user account permanently.

**Authentication:** Required (Admin or SuperAdmin)

**Parameters:**
- `id`: HR/Finance User ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "HR/Finance user deleted successfully"
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
    "Role must be either HR or Finance"
  ]
}
```

### 400 - Invalid Company
```json
{
  "success": false,
  "message": "Company not found"
}
```

### 401 - No Token
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 - Access Denied
```json
{
  "success": false,
  "message": "Access denied. Admin or SuperAdmin role required."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "HR/Finance user not found"
}
```

### 409 - Duplicate Data
```json
{
  "success": false,
  "message": "Email already exists"
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

### HR Model (Dedicated Schema)
```javascript
{
  "_id": "ObjectId",
  "fullname": "String (required, 2-100 characters)",
  "username": "String (required, unique, 3-50 characters, alphanumeric)",
  "email": "String (required, unique, valid email)",
  "password": "String (optional, hashed with bcrypt)",
  "role": "String (enum: HR|Finance, required)",
  "phone": "String (required, 10-20 characters)",
  "department": "String (required, 2-100 characters)",
  "designation": "String (optional, 2-100 characters)",
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

---

## Security Notes
- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens expire in 7 days by default (configurable via JWT_EXPIRES_IN)
- Email addresses and usernames are stored in lowercase
- All input is validated using Joi schemas
- Request bodies are sanitized (unknown fields are stripped)
- Only Admin or SuperAdmin roles can manage HR/Finance users
- Company references are validated before creating HR/Finance users
- Duplicate email and username prevention
- Password is never returned in API responses

---

**Last Updated:** January 2025  
**API Version:** 1.0.0
