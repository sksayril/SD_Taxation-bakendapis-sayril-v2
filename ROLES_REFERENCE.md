# Roles and Permissions Reference

## Overview
This document outlines all user roles in the SD Taxation system and what roles the SuperAdmin can assign to users.

---

## Complete List of All Roles in the System

The system has **8 distinct roles** across different user models:

### 1. **superadmin**
- **Model**: `SuperAdmin`
- **Default Role**: Yes (automatically assigned)
- **Who Can Create**: Self-registration only (via signup)
- **Description**: Highest level administrator with full system access
- **Can Assign**: All other roles

### 2. **Admin**
- **Model**: `Admin`
- **Default Role**: Yes (fixed, cannot be changed)
- **Who Can Create**: SuperAdmin only
- **Description**: Company-level administrator with management capabilities
- **Can Assign**: HR, Finance, Employee roles (for their company)

### 3. **HR**
- **Model**: `HR`
- **Default Role**: Yes (default for HR model)
- **Who Can Create**: Admin or SuperAdmin
- **Description**: Human Resources personnel with HR management access
- **Can Assign**: None (cannot create other users)

### 4. **Finance**
- **Model**: `HR` (same model as HR, different role)
- **Default Role**: No
- **Who Can Create**: Admin or SuperAdmin
- **Description**: Finance personnel with financial and payroll management access
- **Can Assign**: None (cannot create other users)

### 5. **Employee**
- **Model**: `Employee`
- **Default Role**: Yes (default for Employee model)
- **Who Can Create**: Admin or SuperAdmin
- **Description**: Regular employee with basic access
- **Can Assign**: None (cannot create other users)

### 6. **OR** (Office Representative)
- **Model**: `Employee` (same model as Employee, different role)
- **Default Role**: No
- **Who Can Create**: Admin or SuperAdmin
- **Description**: Office representative with elevated employee access
- **Can Assign**: None (cannot create other users)

### 7. **Accountant**
- **Model**: `HR` (same model as HR/Finance, different role)
- **Default Role**: No
- **Who Can Create**: Admin or SuperAdmin
- **Description**: Accountant with Finance-level financial and payroll management access
- **Can Assign**: None (cannot create other users)

### 8. **Developer**
- **Model**: `Employee` (same model as Employee/OR, different role)
- **Default Role**: No
- **Who Can Create**: Admin or SuperAdmin
- **Description**: Developer with employee-level access focused on technical workflows
- **Can Assign**: None (cannot create other users)

---

## Roles That SuperAdmin Can Assign

The SuperAdmin can assign the following roles when creating users:

### ✅ **Admin Role**
- **Endpoint**: `POST /api/admin/create-admin`
- **Model**: `Admin`
- **Role Value**: `'Admin'` (fixed, cannot be changed)
- **Required Fields**:
  - `fullname`, `username`, `email`, `password`, `originalPassword`, `phone`, `adminArea`, `company`
- **Access Level**: Company-level administrator

### ✅ **HR Role**
- **Endpoint**: `POST /api/hr/hr`
- **Model**: `HR`
- **Role Value**: `'HR'`
- **Required Fields**:
  - `fullname`, `username`, `email`, `password`, `phone`, `role: 'HR'`, `company`
- **Access Level**: HR management, payroll access

### ✅ **Finance Role**
- **Endpoint**: `POST /api/hr/hr`
- **Model**: `HR` (same model as HR)
- **Role Value**: `'Finance'`
- **Required Fields**:
  - `fullname`, `username`, `email`, `password`, `phone`, `role: 'Finance'`, `company`
- **Access Level**: Financial management, payroll processing, salary structure management

### ✅ **Employee Role**
- **Endpoint**: `POST /api/employees/employees`
- **Model**: `Employee`
- **Role Value**: `'Employee'` (default)
- **Required Fields**:
  - `fullname`, `email`, `password`, `phone`, `department`, `empCode`, `salary`, `company`
- **Access Level**: Basic employee access, view own payslips

### ✅ **OR (Office Representative) Role**
- **Endpoint**: `POST /api/employees/employees`
- **Model**: `Employee` (same model as Employee)
- **Role Value**: `'OR'`
- **Required Fields**:
  - `fullname`, `email`, `password`, `phone`, `department`, `empCode`, `salary`, `role: 'OR'`, `company`
- **Access Level**: Elevated employee access

---

## Role Assignment Matrix

| Created By | Can Create | Roles Available |
|------------|------------|-----------------|
| **SuperAdmin** | Admin | `Admin` (fixed) |
| **SuperAdmin** | HR/Finance | `HR`, `Finance` |
| **SuperAdmin** | Employee | `Employee`, `HR`, `OR` |
| **Admin** | HR/Finance | `HR`, `Finance` |
| **Admin** | Employee | `Employee`, `HR`, `OR` |
| **HR** | None | - |
| **Finance** | None | - |
| **Employee** | None | - |
| **OR** | None | - |

---

## Role-Based Access Control (RBAC)

### SuperAdmin Access
- ✅ Create/Read/Update/Delete Companies
- ✅ Create/Read/Update/Delete Admins
- ✅ Create/Read/Update/Delete HR/Finance users
- ✅ Create/Read/Update/Delete Employees
- ✅ Access all payroll and financial features
- ✅ Manage all system configurations

### Admin Access
- ✅ Create/Read/Update/Delete HR/Finance users (for their company)
- ✅ Create/Read/Update/Delete Employees (for their company)
- ✅ Access company-specific payroll features
- ❌ Cannot create other Admins
- ❌ Cannot create SuperAdmins

### HR Access
- ✅ Manage employee records
- ✅ Create/Read/Update salary structures
- ✅ Process payroll runs
- ✅ View and manage payslips
- ❌ Cannot create other users
- ❌ Limited to their company

### Finance Access
- ✅ All HR capabilities
- ✅ Approve payroll runs
- ✅ Manage financial vouchers
- ✅ Export financial reports
- ❌ Cannot create other users
- ❌ Limited to their company

### Employee Access
- ✅ View own profile
- ✅ View own payslips
- ✅ Update own profile (limited fields)
- ❌ Cannot create other users
- ❌ Cannot access payroll management
- ❌ Limited to own data

### OR (Office Representative) Access
- ✅ All Employee capabilities
- ✅ Additional office representative features (if implemented)
- ❌ Cannot create other users
- ❌ Limited to own data

---

## Important Notes

1. **Role Naming Convention**:
   - SuperAdmin role is lowercase: `'superadmin'`
   - All other roles use PascalCase: `'Admin'`, `'HR'`, `'Finance'`, `'Employee'`, `'OR'`, `'Accountant'`, `'Developer'`

2. **Model vs Role**:
   - `HR` model can have roles: `'HR'`, `'Finance'`, or `'Accountant'`
   - `Employee` model can have roles: `'Employee'`, `'HR'`, `'OR'`, or `'Developer'`
   - These are different entities even if they share role names

3. **Company Association**:
   - All users (except SuperAdmin) must be associated with a Company
   - Users can only access data for their assigned company

4. **Role Validation**:
   - Roles are validated using enum constraints in the models
   - Invalid roles will be rejected by the validation middleware

5. **Password Storage**:
   - Currently, passwords are stored in plain text (security improvement needed)
   - SuperAdmin passwords are hashed using bcrypt

---

## API Endpoints for Role Assignment

### Create Admin (SuperAdmin only)
```http
POST /api/admin/create-admin
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "fullname": "Admin Name",
  "username": "adminuser",
  "email": "admin@company.com",
  "password": "password123",
  "originalPassword": "password123",
  "phone": "1234567890",
  "adminArea": "Operations",
  "company": "<company_id>"
}
```

### Create HR/Finance/Accountant (Admin or SuperAdmin)
```http
POST /api/hr/hr
Authorization: Bearer <admin_or_superadmin_token>
Content-Type: application/json

{
  "fullname": "HR Name",
  "username": "hruser",
  "email": "hr@company.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "HR",  // or "Finance" or "Accountant"
  "company": "<company_id>"
}
```

### Create Employee (Admin or SuperAdmin)
```http
POST /api/employees/employees
Authorization: Bearer <admin_or_superadmin_token>
Content-Type: application/json

{
  "fullname": "Employee Name",
  "email": "employee@company.com",
  "password": "password123",
  "phone": "1234567890",
  "department": "IT",
  "empCode": "EMP001",
  "salary": 50000,
  "role": "Employee",  // or "HR" or "OR" or "Developer"
  "company": "<company_id>"
}
```

---

## Summary

**SuperAdmin can assign 7 different roles:**
1. `Admin` - Company administrator
2. `HR` - Human Resources personnel
3. `Finance` - Finance personnel
4. `Employee` - Regular employee
5. `OR` - Office Representative
6. `Accountant` - Accountant (HR model)
7. `Developer` - Developer (Employee model)

**Total roles in system: 8**
1. `superadmin` - System administrator (self-created)
2. `Admin` - Company administrator
3. `HR` - Human Resources
4. `Finance` - Finance
5. `Employee` - Regular employee
6. `OR` - Office Representative
7. `Accountant` - Accountant (HR model)
8. `Developer` - Developer (Employee model)

---

**Last Updated**: January 2025  
**API Version**: 1.0.0

