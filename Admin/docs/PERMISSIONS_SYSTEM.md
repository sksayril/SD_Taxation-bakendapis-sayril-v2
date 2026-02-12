# Admin Permissions System Documentation

## Overview

The Admin Permissions System provides role-based access control (RBAC) for Admin users, allowing SuperAdmin to grant granular permissions for different modules (HRM, CRM, ERP, Payroll) to each Admin user.

## Features

1. **Module-Based Permissions**: Each Admin can have permissions for HRM, CRM, ERP, and Payroll modules
2. **Granular Access Control**: Each module has 5 permission levels:
   - `access`: Enable/disable access to the module
   - `canCreate`: Permission to create new records
   - `canRead`: Permission to view/read records
   - `canUpdate`: Permission to update existing records
   - `canDelete`: Permission to delete records
3. **SuperAdmin Override**: SuperAdmin users automatically have full access to all modules
4. **Middleware Protection**: All module endpoints are protected by permission middleware

## Permission Structure

```javascript
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

## Usage

### Creating Admin with Permissions (SuperAdmin Only)

```http
POST /api/admin/create-admin
Authorization: Bearer <superadmin-token>
Content-Type: application/json

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

### Updating Admin Permissions (SuperAdmin Only)

```http
POST /api/admin/permissions/:admin_id
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "permissions": {
    "hrm": {
      "access": true,
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": true
    }
  }
}
```

### Getting Admin Permissions (SuperAdmin Only)

```http
GET /api/admin/permissions/:admin_id
Authorization: Bearer <superadmin-token>
```

## Module Management Endpoints

### HRM Module

- **Update HR User**: `POST /api/admin/hrm/update-user/:id`
  - Requires: `hrm.canUpdate = true`
- **Delete HR User**: `POST /api/admin/hrm/delete-user/:id`
  - Requires: `hrm.canDelete = true`
- **Update Employee**: `POST /api/admin/hrm/update-employee/:id`
  - Requires: `hrm.canUpdate = true`
- **Delete Employee**: `POST /api/admin/hrm/delete-employee/:id`
  - Requires: `hrm.canDelete = true`

### CRM Module

- **Get All**: `GET /api/crm`
  - Requires: `crm.canRead = true`
- **Get by ID**: `GET /api/crm/:id`
  - Requires: `crm.canRead = true`
- **Create**: `POST /api/crm`
  - Requires: `crm.canCreate = true`
- **Update**: `POST /api/crm/update/:id` or `POST /api/admin/crm/update/:id`
  - Requires: `crm.canUpdate = true`
- **Delete**: `POST /api/crm/delete/:id` or `POST /api/admin/crm/delete/:id`
  - Requires: `crm.canDelete = true`

### ERP Module

- **Get All**: `GET /api/erp`
  - Requires: `erp.canRead = true`
- **Get by ID**: `GET /api/erp/:id`
  - Requires: `erp.canRead = true`
- **Create**: `POST /api/erp`
  - Requires: `erp.canCreate = true`
- **Update**: `POST /api/erp/update/:id` or `POST /api/admin/erp/update/:id`
  - Requires: `erp.canUpdate = true`
- **Delete**: `POST /api/erp/delete/:id` or `POST /api/admin/erp/delete/:id`
  - Requires: `erp.canDelete = true`

### Payroll Module

- **Update Payslip**: `POST /api/admin/payroll/update-payslip/:id`
  - Requires: `payroll.canUpdate = true`
- **Delete Payslip**: `POST /api/admin/payroll/delete-payslip/:id`
  - Requires: `payroll.canDelete = true`

## Error Responses

### 403 - Permission Denied

```json
{
  "success": false,
  "message": "Access denied. You don't have access to HRM module."
}
```

```json
{
  "success": false,
  "message": "Access denied. You don't have permission to update in CRM module."
}
```

### 401 - Authentication Required

```json
{
  "success": false,
  "message": "Authentication required"
}
```

## Implementation Details

### Middleware

The permission system uses middleware located at `Admin/middleware/permissions.js`:

- `checkModulePermission(module, action)`: Checks if admin has permission for a specific module and action
- `checkAnyModuleAccess(modules)`: Checks if admin has access to any of the specified modules

### Model Updates

The Admin model (`Admin/models/Admin.js`) has been updated to include a `permissions` field with the structure shown above.

### Default Permissions

When creating an Admin without specifying permissions, all permissions default to `false`. SuperAdmin must explicitly grant permissions.

## Best Practices

1. **Principle of Least Privilege**: Only grant the minimum permissions necessary for an Admin to perform their duties
2. **Regular Audits**: Periodically review Admin permissions to ensure they're still appropriate
3. **SuperAdmin Access**: SuperAdmin users automatically bypass all permission checks - use this role carefully
4. **Company Isolation**: All module operations are automatically scoped to the Admin's company

## Migration Notes

For existing Admin users:
- Existing Admins will have all permissions set to `false` by default
- SuperAdmin must update permissions for existing Admins using the `/api/admin/permissions/:id` endpoint
- The system is backward compatible - Admins without permissions will receive 403 errors when accessing protected endpoints

---

**Last Updated:** January 2025  
**Version:** 1.0.0
