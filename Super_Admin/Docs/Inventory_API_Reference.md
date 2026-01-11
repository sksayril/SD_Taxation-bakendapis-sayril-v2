# Inventory API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
All inventory endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Quick Start

### 1. Get Authentication Token
First, login to get your JWT token:
```bash
curl -X POST http://localhost:3000/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### 2. Create Your First Stock Group
```bash
curl -X POST http://localhost:3000/api/stock-groups/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "COMP001",
    "groupName": "Electronics",
    "parentGroup": "Assets",
    "description": "All electronic assets like laptops, phones, etc."
  }'
```

### 3. Create Your First Stock Item
```bash
curl -X POST http://localhost:3000/api/stock-items/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "COMP001",
    "stockGroup": "Electronics",
    "itemCode": "AST001",
    "itemName": "Dell Latitude 7420 Laptop",
    "unit": "Nos",
    "quantity": 10,
    "rate": 60000,
    "location": "Warehouse-1"
  }'
```

---

## API Endpoints Summary

### Stock Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stock-groups/create` | Create new stock group |
| GET | `/api/stock-groups` | Get all stock groups |
| GET | `/api/stock-groups/:id` | Get specific stock group |
| POST | `/api/stock-groups/:id` | Update stock group |
| POST | `/api/stock-groups/:id/delete` | Delete stock group |
| GET | `/api/stock-groups/parent/:parentGroup` | Get stock groups by parent |
| GET | `/api/stock-groups/search` | Search stock groups |

### Stock Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stock-items/create` | Create new stock item |
| GET | `/api/stock-items` | Get all stock items |
| GET | `/api/stock-items/:id` | Get specific stock item |
| POST | `/api/stock-items/:id` | Update stock item |
| POST | `/api/stock-items/:id/delete` | Delete stock item |
| GET | `/api/stock-items/group/:stockGroup` | Get stock items by group |
| GET | `/api/stock-items/status/:status` | Get stock items by status |
| GET | `/api/stock-items/low-stock` | Get low stock items |
| GET | `/api/stock-items/search` | Search stock items |
| POST | `/api/stock-items/:id/quantity` | Update stock quantity |

### Stock Vouchers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stock-vouchers/create` | Create new stock voucher |
| GET | `/api/stock-vouchers` | Get all stock vouchers |
| GET | `/api/stock-vouchers/:id` | Get specific stock voucher |
| POST | `/api/stock-vouchers/:id` | Update stock voucher |
| POST | `/api/stock-vouchers/:id/delete` | Delete stock voucher |
| GET | `/api/stock-vouchers/type/:voucherType` | Get stock vouchers by type |
| GET | `/api/stock-vouchers/status/:status` | Get stock vouchers by status |
| GET | `/api/stock-vouchers/search` | Search stock vouchers |
| POST | `/api/stock-vouchers/:id/status` | Update stock voucher status |
| POST | `/api/stock-vouchers/:originalVoucherId/return` | Create return voucher |

---

## Stock Groups API

### 1. Create Stock Group

**Endpoint:** `POST /api/stock-groups/create`

**Request Body:**
```json
{
  "companyId": "COMP001",
  "groupName": "Electronics",
  "parentGroup": "Assets",
  "description": "All electronic assets like laptops, phones, etc."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Stock group created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "groupName": "Electronics",
    "parentGroup": "Assets",
    "description": "All electronic assets like laptops, phones, etc.",
    "createdAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 2. Get All Stock Groups

**Endpoint:** `GET /api/stock-groups`

**Query Parameters:**
- `companyId` (optional): Filter by company ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by group name or description
- `parentGroup` (optional): Filter by parent group

**Example:**
```
GET /api/stock-groups?companyId=COMP001&page=1&limit=10&parentGroup=Assets
```

---

## Stock Items API

### 1. Create Stock Item

**Endpoint:** `POST /api/stock-items/create`

**Request Body:**
```json
{
  "companyId": "COMP001",
  "stockGroup": "Electronics",
  "itemCode": "AST001",
  "itemName": "Dell Latitude 7420 Laptop",
  "unit": "Nos",
  "quantity": 10,
  "rate": 60000,
  "batchNo": "DL7420-001",
  "location": "Warehouse-1",
  "status": "Available"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Stock item created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "stockGroup": "Electronics",
    "itemCode": "AST001",
    "itemName": "Dell Latitude 7420 Laptop",
    "unit": "Nos",
    "quantity": 10,
    "rate": 60000,
    "totalValue": 600000,
    "batchNo": "DL7420-001",
    "location": "Warehouse-1",
    "status": "Available",
    "createdAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 2. Update Stock Quantity

**Endpoint:** `POST /api/stock-items/:id/quantity`

**Request Body:**
```json
{
  "quantity": 15,
  "operation": "add"
}
```

**Operations:**
- `set`: Set quantity to specific value
- `add`: Add to existing quantity
- `subtract`: Subtract from existing quantity

---

## Stock Vouchers API

### 1. Create Stock Voucher

**Endpoint:** `POST /api/stock-vouchers/create`

**Request Body:**
```json
{
  "voucherType": "Stock Journal",
  "voucherNumber": "SJ-2025-001",
  "companyId": "COMP001",
  "date": "2025-01-25",
  "narration": "Issued Dell Laptop to EMP1001",
  "sourceLocation": "Warehouse-1",
  "destinationLocation": "Employee:EMP1001",
  "items": [
    {
      "itemCode": "AST001",
      "quantity": 1,
      "rate": 60000
    }
  ],
  "createdBy": "Admin"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Stock voucher created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "voucherType": "Stock Journal",
    "voucherNumber": "SJ-2025-001",
    "companyId": "COMP001",
    "date": "2025-01-25T00:00:00.000Z",
    "narration": "Issued Dell Laptop to EMP1001",
    "sourceLocation": "Warehouse-1",
    "destinationLocation": "Employee:EMP1001",
    "items": [
      {
        "itemCode": "AST001",
        "quantity": 1,
        "rate": 60000
      }
    ],
    "status": "Issued",
    "createdBy": "Admin",
    "totalItems": 1,
    "totalValue": 60000,
    "createdAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 2. Create Return Voucher

**Endpoint:** `POST /api/stock-vouchers/:originalVoucherId/return`

**Request Body:**
```json
{
  "createdBy": "Admin"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Return voucher created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "voucherType": "Stock Return",
    "voucherNumber": "SJ-20250125123456",
    "companyId": "COMP001",
    "date": "2025-01-25T10:00:00.000Z",
    "narration": "Return of Issued Dell Laptop to EMP1001",
    "sourceLocation": "Employee:EMP1001",
    "destinationLocation": "Warehouse-1",
    "items": [
      {
        "itemCode": "AST001",
        "quantity": 1,
        "rate": 60000
      }
    ],
    "status": "Returned",
    "createdBy": "Admin",
    "totalItems": 1,
    "totalValue": 60000
  }
}
```

---

## Voucher Types

| Type | Description | Use Case |
|------|-------------|----------|
| Stock Journal | General stock movements | Issue items to employees |
| Stock Transfer | Transfer between locations | Move items between warehouses |
| Stock Issue | Issue items for use | Department supplies |
| Stock Return | Return issued items | Employee returns |
| Stock Adjustment | Adjust stock quantities | Physical count adjustments |

---

## Stock Item Status

| Status | Description |
|--------|-------------|
| Available | Item is available for issue |
| Issued | Item has been issued |
| Returned | Item has been returned |
| Damaged | Item is damaged |
| Lost | Item is lost |

---

## Units

| Unit | Description |
|------|-------------|
| Nos | Numbers/Pieces |
| Kg | Kilograms |
| Ltr | Liters |
| Mtr | Meters |
| Box | Boxes |
| Set | Sets |
| Pair | Pairs |
| Dozen | Dozens |
| Gram | Grams |
| Ton | Tons |

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Item name must be at least 2 characters",
    "Quantity cannot be negative"
  ]
}
```

### Duplicate Item Code (409)
```json
{
  "success": false,
  "message": "Item code 'AST001' already exists"
}
```

### Insufficient Stock (400)
```json
{
  "success": false,
  "message": "Insufficient stock for item 'AST001'. Available: 5, Required: 10"
}
```

### Stock Group Not Found (400)
```json
{
  "success": false,
  "message": "Stock group 'Electronics' does not exist for company COMP001"
}
```

---

## Business Rules

1. **Stock Group Validation**: Parent group must exist in Groups collection
2. **Stock Item Validation**: Stock group must exist before creating items
3. **Stock Voucher Validation**: All item codes must exist in StockItems collection
4. **Quantity Management**: Stock quantities are automatically updated when vouchers are created
5. **Return Vouchers**: Can only return issued vouchers
6. **Unique Constraints**: Item codes and voucher numbers must be unique

---

## Sample Data Structure

### Stock Group
```json
{
  "_id": "ObjectId",
  "companyId": "COMP001",
  "groupName": "Electronics",
  "parentGroup": "Assets",
  "description": "All electronic assets like laptops, phones, etc.",
  "createdAt": "Date"
}
```

### Stock Item
```json
{
  "_id": "ObjectId",
  "companyId": "COMP001",
  "stockGroup": "Electronics",
  "itemCode": "AST001",
  "itemName": "Dell Latitude 7420 Laptop",
  "unit": "Nos",
  "quantity": 10,
  "rate": 60000,
  "totalValue": 600000,
  "batchNo": "DL7420-001",
  "location": "Warehouse-1",
  "status": "Available",
  "createdAt": "Date"
}
```

### Stock Voucher
```json
{
  "_id": "ObjectId",
  "voucherType": "Stock Journal",
  "voucherNumber": "SJ-2025-001",
  "companyId": "COMP001",
  "date": "2025-01-25",
  "narration": "Issued Dell Laptop to EMP1001",
  "sourceLocation": "Warehouse-1",
  "destinationLocation": "Employee:EMP1001",
  "items": [
    {
      "itemCode": "AST001",
      "quantity": 1,
      "rate": 60000
    }
  ],
  "status": "Issued",
  "createdBy": "Admin",
  "totalItems": 1,
  "totalValue": 60000,
  "createdAt": "Date"
}
```

---

**Last Updated:** 2025-01-25  
**Version:** 1.0.0  
**Maintainer:** SD_Taxation Development Team
