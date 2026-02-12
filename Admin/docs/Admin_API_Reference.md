# Admin API Reference

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
All Admin endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

**Note:** Most endpoints require Admin role with appropriate module permissions. SuperAdmin has full access to all endpoints.

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

### 1. Admin Login

**Endpoint:** `POST /login`

**Description:** Authenticates an Admin user and returns a JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "admin_id",
    "fullname": "Admin Name",
    "username": "adminuser",
    "email": "admin@company.com",
    "role": "Admin",
    "phone": "1234567890",
    "department": "IT",
    "adminArea": "Operations",
    "company": {
      "_id": "company_id",
      "company_name": "Company Name",
      "company_email": "company@example.com"
    },
    "status": "active",
    "lastLogin": "2025-01-15T10:30:00.000Z"
  },
  "token": "jwt_token_here"
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

### 3. Admin Management (SuperAdmin Only)

**Base URL:** `http://localhost:3000/api/admin`

- **Create Admin**
  - **Endpoint:** `POST /create-admin`
  - **Authentication:** Required (SuperAdmin token)
  - **Description:** Creates a new Admin user for a company.
  - **Request Body:**
    ```json
    {
      "fullname": "Admin Name",
      "username": "adminuser",
      "email": "admin@company.com",
      "password": "password123",
      "originalPassword": "password123",
      "phone": "1234567890",
      "adminArea": "Operations",
      "company": "company_id",
      "permissions": {
        "hrm": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true
        },
        "crm": {
          "create": false,
          "read": true,
          "update": true,
          "delete": false
        },
        "erp": {
          "create": false,
          "read": false,
          "update": false,
          "delete": false
        },
        "payroll": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true
        }
      }
    }
    ```
  - **Permissions Format:**
    - Each module (hrm, crm, erp, payroll) accepts: `create`, `read`, `update`, `delete` (all boolean, optional)
    - The `access` field is automatically set to `true` if any permission (create, read, update, delete) is `true`
    - If a module is not provided, all permissions default to `false`

- **Get All Admins**
  - **Endpoint:** `GET /admins`
  - **Authentication:** Required (SuperAdmin token)
  - **Description:** Retrieves all Admin users with their permissions.

- **Get Admin by ID**
  - **Endpoint:** `GET /admins/:id`
  - **Authentication:** Required (SuperAdmin token)
  - **Description:** Retrieves a specific Admin user by ID.

- **Update Admin**
  - **Endpoint:** `POST /update-admin/:id`
  - **Authentication:** Required (SuperAdmin token)
  - **Description:** Updates Admin user information.

- **Delete Admin**
  - **Endpoint:** `POST /delete-admin/:id`
  - **Authentication:** Required (SuperAdmin token)
  - **Description:** Deletes an Admin user.

- **Update Admin Permissions**
  - **Endpoint:** `POST /permissions/:id`
  - **Authentication:** Required (SuperAdmin token)
  - **Description:** Updates Admin module permissions.
  - **Request Body:**
    ```json
    {
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
          "canCreate": false,
          "canRead": true,
          "canUpdate": true,
          "canDelete": false
        },
        "erp": {
          "access": false,
          "canCreate": false,
          "canRead": false,
          "canUpdate": false,
          "canDelete": false
        },
        "payroll": {
          "access": true,
          "canCreate": true,
          "canRead": true,
          "canUpdate": true,
          "canDelete": true
        }
      }
    }
    ```

- **Get Admin Permissions**
  - **Endpoint:** `GET /permissions/:id`
  - **Authentication:** Required (SuperAdmin token)
  - **Description:** Retrieves Admin permissions for all modules.

---

### 4. HRM Module Management (Admin with HRM Permissions)

**Base URL:** `http://localhost:3000/api/admin`

- **Update HR User**
  - **Endpoint:** `POST /hrm/update-user/:id`
  - **Authentication:** Required (Admin token with HRM update permission)
  - **Description:** Updates an HR/Finance user.
  - **Required Permission:** `hrm.canUpdate = true`

- **Delete HR User**
  - **Endpoint:** `POST /hrm/delete-user/:id`
  - **Authentication:** Required (Admin token with HRM delete permission)
  - **Description:** Deletes an HR/Finance user.
  - **Required Permission:** `hrm.canDelete = true`

- **Update Employee**
  - **Endpoint:** `POST /hrm/update-employee/:id`
  - **Authentication:** Required (Admin token with HRM update permission)
  - **Description:** Updates an employee record.
  - **Required Permission:** `hrm.canUpdate = true`

- **Delete Employee**
  - **Endpoint:** `POST /hrm/delete-employee/:id`
  - **Authentication:** Required (Admin token with HRM delete permission)
  - **Description:** Deletes an employee record.
  - **Required Permission:** `hrm.canDelete = true`

---

### 5. CRM Module Management (Admin with CRM Permissions)

**Base URL:** `http://localhost:3000/api/crm`

- **Get All CRM Records**
  - **Endpoint:** `GET /`
  - **Authentication:** Required (Admin token with CRM read permission)
  - **Query Parameters:** `page`, `limit`, `search`
  - **Required Permission:** `crm.canRead = true`

- **Get CRM Record by ID**
  - **Endpoint:** `GET /:id`
  - **Authentication:** Required (Admin token with CRM read permission)
  - **Required Permission:** `crm.canRead = true`

- **Create CRM Record**
  - **Endpoint:** `POST /`
  - **Authentication:** Required (Admin token with CRM create permission)
  - **Request Body:**
    ```json
    {
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "1234567890",
      "notes": "Customer notes",
      "status": "active"
    }
    ```
  - **Required Permission:** `crm.canCreate = true`

- **Update CRM Record**
  - **Endpoint:** `POST /update/:id` (via CRM routes) or `POST /crm/update/:id` (via Admin routes)
  - **Authentication:** Required (Admin token with CRM update permission)
  - **Required Permission:** `crm.canUpdate = true`

- **Delete CRM Record**
  - **Endpoint:** `POST /delete/:id` (via CRM routes) or `POST /crm/delete/:id` (via Admin routes)
  - **Authentication:** Required (Admin token with CRM delete permission)
  - **Required Permission:** `crm.canDelete = true`

---

### 6. ERP Module Management (Admin with ERP Permissions)

**Base URL:** `http://localhost:3000/api/erp`

- **Get All ERP Records**
  - **Endpoint:** `GET /`
  - **Authentication:** Required (Admin token with ERP read permission)
  - **Query Parameters:** `page`, `limit`, `search`, `category`
  - **Required Permission:** `erp.canRead = true`

- **Get ERP Record by ID**
  - **Endpoint:** `GET /:id`
  - **Authentication:** Required (Admin token with ERP read permission)
  - **Required Permission:** `erp.canRead = true`

- **Create ERP Record**
  - **Endpoint:** `POST /`
  - **Authentication:** Required (Admin token with ERP create permission)
  - **Request Body:**
    ```json
    {
      "name": "ERP Item Name",
      "description": "Item description",
      "category": "Category Name",
      "status": "active",
      "metadata": {}
    }
    ```
  - **Required Permission:** `erp.canCreate = true`

- **Update ERP Record**
  - **Endpoint:** `POST /update/:id` (via ERP routes) or `POST /erp/update/:id` (via Admin routes)
  - **Authentication:** Required (Admin token with ERP update permission)
  - **Required Permission:** `erp.canUpdate = true`

- **Delete ERP Record**
  - **Endpoint:** `POST /delete/:id` (via ERP routes) or `POST /erp/delete/:id` (via Admin routes)
  - **Authentication:** Required (Admin token with ERP delete permission)
  - **Required Permission:** `erp.canDelete = true`

---

### 7. Payroll Module Management (Admin with Payroll Permissions)

**Base URL:** `http://localhost:3000/api/admin`

- **Update Payslip**
  - **Endpoint:** `POST /payroll/update-payslip/:id`
  - **Authentication:** Required (Admin token with Payroll update permission)
  - **Description:** Updates a payslip record.
  - **Required Permission:** `payroll.canUpdate = true`

- **Delete Payslip**
  - **Endpoint:** `POST /payroll/delete-payslip/:id`
  - **Authentication:** Required (Admin token with Payroll delete permission)
  - **Description:** Deletes a payslip record.
  - **Required Permission:** `payroll.canDelete = true`

---

### 8. HR / Finance User Management (Admin Side)

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

### 9. Employee Management (Admin Side)

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

### 10. Company Access (Admin Side)

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
  "adminArea": "String (required, 2-100 characters)",
  "company": "ObjectId (required, ref: 'Company')",
  "created_by": "ObjectId (required, ref: 'SuperAdmin')",
  "status": "String (enum: active|inactive|suspended, default: active)",
  "permissions": {
    "hrm": {
      "access": "Boolean (default: false)",
      "canCreate": "Boolean (default: false)",
      "canRead": "Boolean (default: false)",
      "canUpdate": "Boolean (default: false)",
      "canDelete": "Boolean (default: false)"
    },
    "crm": {
      "access": "Boolean (default: false)",
      "canCreate": "Boolean (default: false)",
      "canRead": "Boolean (default: false)",
      "canUpdate": "Boolean (default: false)",
      "canDelete": "Boolean (default: false)"
    },
    "erp": {
      "access": "Boolean (default: false)",
      "canCreate": "Boolean (default: false)",
      "canRead": "Boolean (default: false)",
      "canUpdate": "Boolean (default: false)",
      "canDelete": "Boolean (default: false)"
    },
    "payroll": {
      "access": "Boolean (default: false)",
      "canCreate": "Boolean (default: false)",
      "canRead": "Boolean (default: false)",
      "canUpdate": "Boolean (default: false)",
      "canDelete": "Boolean (default: false)"
    }
  },
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

## Permission System

The Admin system uses a role-based access control (RBAC) system with module-level permissions. Each Admin can be granted access to specific modules (HRM, CRM, ERP, Payroll) with granular permissions:

- **access**: Boolean flag to enable/disable access to the module
- **canCreate**: Permission to create new records in the module
- **canRead**: Permission to view/read records in the module
- **canUpdate**: Permission to update existing records in the module
- **canDelete**: Permission to delete records in the module

**Permission Hierarchy:**
- SuperAdmin: Has full access to all modules and all operations (bypasses permission checks)
- Admin: Access is controlled by the `permissions` object in their profile

**403 - Permission Denied:**
```json
{
  "success": false,
  "message": "Access denied. You don't have permission to update in HRM module."
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
- **MODULE PERMISSIONS**: All module operations require appropriate permissions (SuperAdmin bypasses checks)

---

## Module Endpoints Summary

### HRM Module
- Update HR User: `POST /api/admin/hrm/update-user/:id`
- Delete HR User: `POST /api/admin/hrm/delete-user/:id`
- Update Employee: `POST /api/admin/hrm/update-employee/:id`
- Delete Employee: `POST /api/admin/hrm/delete-employee/:id`

### CRM Module
- Base URL: `http://localhost:3000/api/crm`
- Get All: `GET /`
- Get by ID: `GET /:id`
- Create: `POST /`
- Update: `POST /update/:id` or `POST /api/admin/crm/update/:id`
- Delete: `POST /delete/:id` or `POST /api/admin/crm/delete/:id`

### ERP Module
- Base URL: `http://localhost:3000/api/erp`
- Get All: `GET /`
- Get by ID: `GET /:id`
- Create: `POST /`
- Update: `POST /update/:id` or `POST /api/admin/erp/update/:id`
- Delete: `POST /delete/:id` or `POST /api/admin/erp/delete/:id`

### Payroll Module
- Update Payslip: `POST /api/admin/payroll/update-payslip/:id`
- Delete Payslip: `POST /api/admin/payroll/delete-payslip/:id`

---

**Last Updated:** January 2025  
**API Version:** 2.0.0
