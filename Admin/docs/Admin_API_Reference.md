# Admin API Reference

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
All Admin endpoints require JWT authentication with SuperAdmin role. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Endpoints

### 1. Admin Login

**Endpoint:** `POST /login`

**Description:** Authenticates an Admin user and returns a JWT token.

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
  "message": "Login successful",
  "data": {
    "_id": "6710f9f0a8b2e0f49d9d3d12",
    "fullname": "John Doe",
    "username": "john_admin",
    "email": "john@example.com",
    "role": "Admin",
    "phone": "+919876543210",
    "adminArea": "Mumbai",
    "company": {
      "_id": "66f3a9abbb1234567890abcd",
      "company_name": "ABC Corp",
      "company_email": "contact@abccorp.com"
    },
    "status": "active",
    "lastLogin": "2025-01-17T16:30:15.123Z"
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
    "Please enter a valid email address"
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

**401 - Account Inactive:**
```json
{
  "success": false,
  "message": "Account is inactive or suspended"
}
```

---

### 2. Admin Logout

**Endpoint:** `POST /logout`

**Description:** Logs out the current Admin user. Since JWT is stateless, the client should remove the token from storage.

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 3. HR / Finance User Management (Admin Side)

These APIs are implemented in the HR service but are used **by Admins (or SuperAdmin)** to create and manage HR/Finance users for a company.

**Base URL (HR Service):**
```
http://localhost:3000/api/hr
```

- **Create HR/Finance User**  
  - **Endpoint:** `POST /hr`  
  - **Authentication:** Required (`Admin` or `superadmin` token)  
  - **Description:** Creates a new HR or Finance user for the Admin’s company.  
  - **Key Fields:**  
    - `fullname`, `username`, `email`, `password`, `phone`  
    - `role`: `"HR"` or `"Finance"`  
    - `company`: Optional – if omitted, the API will use `req.user.company` from the Admin JWT.  
  - **Details:** Request/response and validation rules are fully documented in `HR/docs/HR_API_Reference.md` under **"Create HR/Finance User"**.

- **List HR/Finance Users**  
  - **Endpoint:** `GET /hr`  
  - **Authentication:** Required (`Admin` or `superadmin`)  
  - **Description:** Paginated list of HR/Finance users with search and filters.  
  - **See:** `HR/docs/HR_API_Reference.md` → **"Get All HR/Finance Users"**.

- **Get / Update / Delete HR/Finance User**  
  - **Endpoints:**  
    - `GET /hr/:id`  
    - `POST /update-hr/:id`  
    - `POST /delete-hr/:id`  
  - **Authentication:** Required (`Admin` or `superadmin`)  
  - **Description:** Standard read, update, and delete operations for HR/Finance users.  
  - **See:** `HR/docs/HR_API_Reference.md` for full request and response examples.

---

### 4. Employee Management (Admin Side)

These APIs are implemented in the Employee service but are used **by Admins, Company HR, or SuperAdmin** to create and manage employees for a company.

**Base URL (Employee Service):**
```
http://localhost:3000/api/employees
```

- **Create Employee / OR User**  
  - **Endpoint:** `POST /employees`  
  - **Authentication:** Required (`Admin`, `HR`, or `superadmin` token)  
  - **Description:** Creates a new Employee (or OR) for the company associated with the authenticated user (Admin or HR).  
  - **Key Fields:**  
    - `fullname`, `email`, `password`, `phone`, `department`, `empCode`, `salary`  
    - `role`: defaults to `"Employee"`; can be `"OR"` where allowed  
    - `company`: company ID the employee belongs to.  
  - **See:** `Employees/docs/Employee_API_Reference.md` → **"Create Employee"**.

- **List / Get / Update / Delete Employees**  
  - **Endpoints:**  
    - `GET /employees`  
    - `GET /employees/:id`  
    - `POST /update-employee/:id`  
    - `POST /delete-employee/:id`  
  - **Authentication:** Required (`Admin`, `HR`, or `superadmin`)  
  - **Description:** Standard CRUD operations for employees, including pagination and filtering. Both Admins and Company HR can perform these actions for their company.  
  - **See:** `Employees/docs/Employee_API_Reference.md` for complete request/response payloads.

---

### 5. Company Access (Admin Side)

Admins are always associated with **one company** (via the `company` field on the Admin model). Company creation and lifecycle management is handled by **SuperAdmin**, and is documented separately.

- **Company APIs (SuperAdmin Docs):**
  - **Base URL:** `http://localhost:3000/api/companies`  
  - **Key Endpoints:** `POST /create`, `GET /`, `GET /:id`, `POST /:id`, `PATCH /:id/status`, `POST /:id/delete`  
  - **Documentation:** `Super_Admin/Docs/Company_API_Reference.md`
- In most Admin flows, the Admin:
  - Reads **their own company details** via `whoami`/profile APIs (see unified/user docs), and  
  - Uses the company ID in HR/Finance and Employee creation calls (sections 3 and 4 above).

This Admin API reference intentionally **does not duplicate** the full SuperAdmin company endpoints or the low-level `/api/superadmin/...` Admin‑management APIs. For full SuperAdmin capabilities, see `Super_Admin/Docs/API_Reference.md` and `Super_Admin/Docs/Company_API_Reference.md`.

---

## Data Models

### Admin Model
```javascript
{
  "_id": "ObjectId",
  "fullname": "String (required, 2-100 characters)",
  "username": "String (required, unique, 3-50 characters, alphanumeric)",
  "email": "String (required, unique, valid email)",
  "password": "String (required, stored in plain text)",
  "originalPassword": "String (required, stored in plain text)",
  "role": "String (required, default: 'Admin')",
  "phone": "String (required, 10-20 characters)",
  "department": "String (required, 2-100 characters)",
  "adminArea": "String (required, 2-100 characters)",
  "company": "ObjectId (required, ref: 'Company')",
  "created_by": "ObjectId (required, ref: 'SuperAdmin')",
  "status": "String (enum: active|inactive|suspended, default: active)",
  "lastLogin": "Date (optional)",
  "resetPasswordToken": "String (optional)",
  "resetPasswordExpires": "Date (optional)",
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
- **PLAIN TEXT PASSWORDS**: Admin passwords are stored in plain text (not hashed)
- JWT tokens expire in 7 days by default (configurable via JWT_EXPIRES_IN)
- Email addresses and usernames are stored in lowercase
- All input is validated using Joi schemas
- Request bodies are sanitized (unknown fields are stripped)
- Only SuperAdmin role can access Admin management endpoints
- Company references are validated before creating Admin accounts
- Duplicate email and username prevention
- **SUPERADMIN ACCESS**: SuperAdmin can view admin passwords when retrieving admin details
- Reset password tokens are automatically excluded from responses

---

**Last Updated:** January 2025  
**API Version:** 1.0.0
