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
