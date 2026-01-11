# Subscription Management API Reference

## Overview
This API allows SuperAdmin to manage subscription plans and assign them to companies. All users (Admin, HR, Finance, Employee) must have an active subscription for their company to access the system.

## Base URLs
```
Subscription Plans: http://localhost:3000/api/subscription-plans
Company Subscriptions: http://localhost:3000/api/company-subscriptions
```

## Authentication
All endpoints require JWT authentication with SuperAdmin role. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Subscription Plans API

### 1. Create Subscription Plan

**Endpoint:** `POST /api/subscription-plans/create`

**Description:** Creates a new subscription plan that can be assigned to companies.

**Request Body:**
```json
{
  "planName": "Premium Plan",
  "description": "Premium subscription with all features",
  "price": 9999,
  "currency": "INR",
  "duration": 12,
  "features": [
    "Unlimited employees",
    "Advanced payroll",
    "Priority support"
  ],
  "maxEmployees": null,
  "maxAdmins": 5,
  "isActive": true
}
```

**Validation Rules:**
- `planName`: Required, 2-100 characters, unique
- `description`: Optional, max 500 characters
- `price`: Required, number >= 0
- `currency`: Optional, 3 characters (default: "INR")
- `duration`: Required, integer >= 1 (in months)
- `features`: Optional, array of strings
- `maxEmployees`: Optional, integer >= 1 or null (unlimited)
- `maxAdmins`: Optional, integer >= 1 (default: 1)
- `isActive`: Optional, boolean (default: true)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "planName": "Premium Plan",
    "description": "Premium subscription with all features",
    "price": 9999,
    "currency": "INR",
    "duration": 12,
    "features": ["Unlimited employees", "Advanced payroll", "Priority support"],
    "maxEmployees": null,
    "maxAdmins": 5,
    "isActive": true,
    "created_by": "64f8a1b2c3d4e5f6a7b8c9d1",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

### 2. Get All Subscription Plans

**Endpoint:** `GET /api/subscription-plans`

**Description:** Retrieves all subscription plans, optionally filtered by active status.

**Query Parameters:**
- `isActive` (optional): Filter by active status (true/false)

**Example:** `GET /api/subscription-plans?isActive=true`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription plans retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "planName": "Premium Plan",
      "price": 9999,
      "duration": 12,
      "isActive": true,
      "created_by": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Super Admin",
        "email": "admin@example.com"
      }
    }
  ],
  "count": 1
}
```

---

### 3. Get Subscription Plan by ID

**Endpoint:** `GET /api/subscription-plans/:id`

**Description:** Retrieves a specific subscription plan by ID.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription plan retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "planName": "Premium Plan",
    "description": "Premium subscription with all features",
    "price": 9999,
    "currency": "INR",
    "duration": 12,
    "features": ["Unlimited employees", "Advanced payroll"],
    "maxEmployees": null,
    "maxAdmins": 5,
    "isActive": true,
    "created_by": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Super Admin",
      "email": "admin@example.com"
    }
  }
}
```

---

### 4. Update Subscription Plan

**Endpoint:** `PUT /api/subscription-plans/:id`

**Description:** Updates an existing subscription plan.

**Request Body:** (All fields optional)
```json
{
  "planName": "Updated Plan Name",
  "price": 12999,
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "planName": "Updated Plan Name",
    "price": 12999,
    "isActive": false
  }
}
```

---

### 5. Delete Subscription Plan

**Endpoint:** `DELETE /api/subscription-plans/:id`

**Description:** Deletes a subscription plan.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription plan deleted successfully"
}
```

---

## Company Subscriptions API

### 1. Assign Subscription to Company

**Endpoint:** `POST /api/company-subscriptions/assign`

**Description:** Assigns a subscription plan to a company. If company already has a subscription, it will be updated.

**Request Body:**
```json
{
  "company": "64f8a1b2c3d4e5f6a7b8c9d2",
  "plan": "64f8a1b2c3d4e5f6a7b8c9d0",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2026-01-15T00:00:00.000Z",
  "autoRenew": false,
  "notes": "Annual subscription"
}
```

**Validation Rules:**
- `company`: Required, valid company ID
- `plan`: Required, valid subscription plan ID
- `startDate`: Optional, date (default: current date)
- `endDate`: Required, date (must be after startDate)
- `autoRenew`: Optional, boolean (default: false)
- `notes`: Optional, max 500 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription assigned to company successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "company": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "company_name": "ABC Corporation",
      "company_email": "contact@abc.com"
    },
    "plan": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "planName": "Premium Plan",
      "price": 9999,
      "duration": 12
    },
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2026-01-15T00:00:00.000Z",
    "status": "active",
    "autoRenew": false,
    "assigned_by": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Super Admin",
      "email": "admin@example.com"
    }
  }
}
```

---

### 2. Get All Company Subscriptions

**Endpoint:** `GET /api/company-subscriptions`

**Description:** Retrieves all company subscriptions, optionally filtered.

**Query Parameters:**
- `status` (optional): Filter by status (active, expired, cancelled, suspended)
- `company` (optional): Filter by company ID

**Example:** `GET /api/company-subscriptions?status=active`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company subscriptions retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "company": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "company_name": "ABC Corporation",
        "company_email": "contact@abc.com"
      },
      "plan": {
        "planName": "Premium Plan",
        "price": 9999
      },
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2026-01-15T00:00:00.000Z",
      "status": "active",
      "isActive": true
    }
  ],
  "count": 1
}
```

---

### 3. Get Company Subscription by ID

**Endpoint:** `GET /api/company-subscriptions/:id`

**Description:** Retrieves a specific company subscription by ID.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company subscription retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "company": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "company_name": "ABC Corporation",
      "company_email": "contact@abc.com"
    },
    "plan": {
      "planName": "Premium Plan",
      "price": 9999,
      "duration": 12
    },
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2026-01-15T00:00:00.000Z",
    "status": "active",
    "isActive": true
  }
}
```

---

### 4. Get Subscription by Company ID

**Endpoint:** `GET /api/company-subscriptions/company/:companyId`

**Description:** Retrieves the subscription for a specific company.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company subscription retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "company": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "company_name": "ABC Corporation"
    },
    "plan": {
      "planName": "Premium Plan"
    },
    "status": "active",
    "isActive": true
  }
}
```

---

### 5. Update Company Subscription

**Endpoint:** `PUT /api/company-subscriptions/:id`

**Description:** Updates an existing company subscription.

**Request Body:** (All fields optional)
```json
{
  "endDate": "2027-01-15T00:00:00.000Z",
  "status": "active",
  "autoRenew": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company subscription updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "endDate": "2027-01-15T00:00:00.000Z",
    "status": "active",
    "autoRenew": true,
    "isActive": true
  }
}
```

---

### 6. Delete Company Subscription

**Endpoint:** `DELETE /api/company-subscriptions/:id`

**Description:** Deletes a company subscription.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company subscription deleted successfully"
}
```

---

## Subscription Status and Login Blocking

### How It Works

1. **Subscription Check on Login**: When Admin, HR, Finance, or Employee attempts to login, the system checks if their company has an active subscription.

2. **Active Subscription Criteria**:
   - Subscription status must be `"active"`
   - Current date must be between `startDate` and `endDate`
   - Subscription must not be `"cancelled"` or `"suspended"`

3. **Login Blocking**: If subscription is not active, login is blocked with a 403 error.

### Login Error Response (403)

```json
{
  "success": false,
  "message": "Your company subscription has expired. Please renew your subscription.",
  "code": "SUBSCRIPTION_INACTIVE",
  "subscription": {
    "status": "expired",
    "endDate": "2024-12-31T00:00:00.000Z",
    "plan": "Premium Plan"
  }
}
```

### Subscription Status Codes

- `NO_SUBSCRIPTION`: Company has no subscription assigned
- `SUBSCRIPTION_INACTIVE`: Subscription exists but is not active (expired, cancelled, or suspended)

---

## Subscription Status Values

- **active**: Subscription is active and valid
- **expired**: Subscription end date has passed
- **cancelled**: Subscription has been cancelled
- **suspended**: Subscription has been suspended

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Plan name is required", "Price must be a number"]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden (Subscription Inactive)
```json
{
  "success": false,
  "message": "Your company subscription has expired. Please renew your subscription.",
  "code": "SUBSCRIPTION_INACTIVE"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Subscription plan not found"
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

## Example Workflow

1. **Create Subscription Plan**:
   ```bash
   POST /api/subscription-plans/create
   ```

2. **Assign Plan to Company**:
   ```bash
   POST /api/company-subscriptions/assign
   ```

3. **User Login** (automatically checks subscription):
   ```bash
   POST /api/admin/login
   POST /api/hr/login
   POST /api/employees/login
   ```

4. **Check Company Subscription**:
   ```bash
   GET /api/company-subscriptions/company/:companyId
   ```

5. **Update Subscription** (extend validity):
   ```bash
   PUT /api/company-subscriptions/:id
   ```

---

## Notes

- Only SuperAdmin can create plans and assign subscriptions
- Each company can have only one active subscription at a time
- Subscription status is automatically updated based on dates
- All users (Admin, HR, Finance, Employee) are blocked from login if their company subscription is inactive
- Subscription validity is checked on every login attempt

---

**Last Updated**: January 2025  
**API Version**: 1.0.0

