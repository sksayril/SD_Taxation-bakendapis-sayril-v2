# SuperAdmin Dashboard API Reference

## Overview
The Dashboard API provides comprehensive analytics and statistics for SuperAdmin, including company account balances, subscription metrics, user counts, and revenue trends.

## Base URL
```
http://localhost:3000/api/superadmin/dashboard
```

## Authentication
This endpoint requires JWT authentication with SuperAdmin role. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Get Dashboard Data

**Endpoint:** `GET /api/superadmin/dashboard`

**Description:** Retrieves comprehensive dashboard data including:
- Total revenue and balances across all companies
- Company-wise account balances
- Subscription statistics
- User counts (Admin, HR, Employee)
- Revenue trends
- Service distribution
- Recent transactions

**Authentication:** Required (SuperAdmin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "summary": {
      "totalRevenue": 999900,
      "activeRevenue": 499950,
      "totalBalance": 4860000,
      "activeClients": 5,
      "totalCompanies": 10,
      "returnsFiled": 856,
      "taxSaved": 0
    },
    "kpis": [
      {
        "title": "Total Revenue",
        "value": "₹9,99,900",
        "change": "12.5",
        "trend": "up",
        "icon": "revenue"
      },
      {
        "title": "Active Clients",
        "value": "5",
        "change": "50.0",
        "trend": "up",
        "icon": "clients"
      },
      {
        "title": "Total Companies",
        "value": "10",
        "change": "100",
        "trend": "up",
        "icon": "companies"
      },
      {
        "title": "System Balance",
        "value": "₹48,60,000",
        "change": "0",
        "trend": "neutral",
        "icon": "balance"
      }
    ],
    "subscriptions": {
      "total": 8,
      "active": 5,
      "expired": 2,
      "cancelled": 1,
      "suspended": 0,
      "revenue": {
        "total": 999900,
        "active": 499950,
        "expired": 299970
      }
    },
    "companies": {
      "total": 10,
      "active": 8,
      "inactive": 1,
      "suspended": 1,
      "withSubscription": 8,
      "withoutSubscription": 2
    },
    "users": {
      "admins": {
        "total": 15,
        "active": 12
      },
      "hr": {
        "total": 25,
        "active": 25
      },
      "employees": {
        "total": 1248,
        "active": 1248
      },
      "total": 1288
    },
    "companyBalances": [
      {
        "companyId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "companyName": "ABC Corporation",
        "companyEmail": "contact@abc.com",
        "status": "active",
        "balance": 1250000,
        "ledgerCount": 45,
        "voucherCount": 320,
        "subscription": {
          "planName": "Premium Plan",
          "status": "active",
          "isActive": true,
          "endDate": "2026-01-15T00:00:00.000Z"
        }
      },
      {
        "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "companyName": "XYZ Ltd",
        "companyEmail": "info@xyz.com",
        "status": "active",
        "balance": 850000,
        "ledgerCount": 32,
        "voucherCount": 210,
        "subscription": {
          "planName": "Basic Plan",
          "status": "active",
          "isActive": true,
          "endDate": "2025-06-15T00:00:00.000Z"
        }
      }
    ],
    "revenueTrend": [
      {
        "month": "Aug 2024",
        "revenue": 50000,
        "subscriptions": 2
      },
      {
        "month": "Sep 2024",
        "revenue": 75000,
        "subscriptions": 3
      },
      {
        "month": "Oct 2024",
        "revenue": 60000,
        "subscriptions": 2
      },
      {
        "month": "Nov 2024",
        "revenue": 80000,
        "subscriptions": 3
      },
      {
        "month": "Dec 2024",
        "revenue": 55000,
        "subscriptions": 2
      },
      {
        "month": "Jan 2025",
        "revenue": 90000,
        "subscriptions": 4
      }
    ],
    "serviceDistribution": [
      {
        "name": "Premium Plan",
        "count": 5,
        "percentage": "62.5"
      },
      {
        "name": "Basic Plan",
        "count": 3,
        "percentage": "37.5"
      }
    ],
    "recentTransactions": [
      {
        "voucherNumber": "VCH-2025-001",
        "type": "Receipt",
        "date": "2025-01-15T10:00:00.000Z",
        "amount": 50000,
        "company": "ABC Corporation"
      },
      {
        "voucherNumber": "VCH-2025-002",
        "type": "Payment",
        "date": "2025-01-14T14:30:00.000Z",
        "amount": 25000,
        "company": "XYZ Ltd"
      }
    ],
    "plans": {
      "total": 3,
      "active": 3,
      "list": [
        {
          "id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Premium Plan",
          "price": 9999,
          "duration": 12,
          "isActive": true
        },
        {
          "id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "name": "Basic Plan",
          "price": 4999,
          "duration": 6,
          "isActive": true
        }
      ]
    }
  }
}
```

---

## Response Structure

### Summary
- `totalRevenue`: Total revenue from all subscriptions
- `activeRevenue`: Revenue from active subscriptions only
- `totalBalance`: Sum of all company account balances
- `activeClients`: Number of companies with active subscriptions
- `totalCompanies`: Total number of companies
- `returnsFiled`: Number of recent vouchers/transactions
- `taxSaved`: Placeholder for tax savings calculation

### KPIs
Array of key performance indicators with:
- `title`: KPI name
- `value`: Formatted value (with currency symbol if applicable)
- `change`: Percentage change (string)
- `trend`: "up", "down", or "neutral"
- `icon`: Icon identifier for UI

### Subscriptions
- `total`: Total number of subscriptions
- `active`: Active subscriptions count
- `expired`: Expired subscriptions count
- `cancelled`: Cancelled subscriptions count
- `suspended`: Suspended subscriptions count
- `revenue`: Revenue breakdown by status

### Companies
- `total`: Total companies
- `active`: Active companies
- `inactive`: Inactive companies
- `suspended`: Suspended companies
- `withSubscription`: Companies with subscriptions
- `withoutSubscription`: Companies without subscriptions

### Users
- `admins`: Admin user counts (total, active)
- `hr`: HR user counts (total, active)
- `employees`: Employee counts (total, active)
- `total`: Total users across all types

### Company Balances
Array of company balance information:
- `companyId`: Company ID
- `companyName`: Company name
- `companyEmail`: Company email
- `status`: Company status
- `balance`: Total account balance (calculated from ledgers and vouchers)
- `ledgerCount`: Number of ledgers for the company
- `voucherCount`: Number of vouchers for the company
- `subscription`: Subscription details (plan name, status, active status, end date)

### Revenue Trend
Array of monthly revenue data for last 6 months:
- `month`: Month name and year
- `revenue`: Revenue for that month
- `subscriptions`: Number of subscriptions started that month

### Service Distribution
Array of subscription plan distribution:
- `name`: Plan name
- `count`: Number of companies using this plan
- `percentage`: Percentage of total subscriptions

### Recent Transactions
Array of recent vouchers (last 30 days, top 10):
- `voucherNumber`: Voucher number
- `type`: Voucher type (Payment, Receipt, etc.)
- `date`: Transaction date
- `amount`: Transaction amount
- `company`: Company name

### Plans
- `total`: Total number of subscription plans
- `active`: Number of active plans
- `list`: Array of plan details

---

## Balance Calculation

Company balances are calculated by:
1. Starting with opening balances from all ledgers
2. Processing all approved vouchers to calculate running balances
3. Summing balances from Asset, Cash, and Bank ledger types
4. Excluding Liability, Income, Expense ledger types from total balance

---

## Error Responses

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied. SuperAdmin role required."
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error message details"
}
```

---

## Usage Example

```bash
curl -X GET http://localhost:3000/api/superadmin/dashboard \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

---

## Notes

- All monetary values are in INR (₹)
- Balances are calculated in real-time from ledgers and vouchers
- Only approved vouchers are included in balance calculations
- Revenue trend shows last 6 months of subscription revenue
- Recent transactions show last 30 days, limited to top 10
- Company balances are sorted by balance (highest first)

---

**Last Updated**: January 2025  
**API Version**: 1.0.0

