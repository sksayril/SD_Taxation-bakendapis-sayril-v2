# Authentication & Authorization Guide

## Overview

The Super Admin API uses **JWT (JSON Web Tokens)** for authentication. This guide explains how to implement authentication in your application.

## 🔐 Authentication Flow

### 1. Registration Flow
```
Client → POST /api/superadmin/signup → Server
Server → Validates data → Creates user → Returns JWT token
```

### 2. Login Flow
```
Client → POST /api/superadmin/login → Server
Server → Validates credentials → Returns JWT token
```

### 3. Protected Route Access
```
Client → Request with JWT → Server validates token → Access granted/denied
```

---

## 🔑 JWT Token Details

### Token Structure
JWT tokens contain the following payload:
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "role": "superadmin",
  "email": "admin@example.com",
  "iat": 1703123456,
  "exp": 1703728256
}
```

### Token Configuration
- **Algorithm:** HS256
- **Expiration:** 7 days (configurable via `JWT_EXPIRES_IN`)
- **Secret:** Configurable via `JWT_SECRET` environment variable

---

## 🛡️ Security Implementation

### Password Security
- **Hashing Algorithm:** bcryptjs
- **Salt Rounds:** 10
- **Password Requirements:** Minimum 6 characters

### Token Security
- Tokens are signed with a secret key
- Tokens expire automatically
- No refresh token mechanism (implement if needed)

---

## 📝 Implementation Examples

### 1. JavaScript/Node.js Client

```javascript
// Login and store token
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/superadmin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token in localStorage or secure storage
    localStorage.setItem('token', data.token);
    return data;
  }
  
  throw new Error(data.message);
};

// Make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

### 2. cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Use token in subsequent requests
curl -X GET http://localhost:3000/api/superadmin/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 3. Postman Setup

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/superadmin/login`
   - Body: JSON
   ```json
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```

2. **Store Token:**
   - In Tests tab, add:
   ```javascript
   if (pm.response.code === 200) {
     const response = pm.response.json();
     pm.environment.set("jwt_token", response.token);
   }
   ```

3. **Use Token:**
   - In Authorization tab:
   - Type: Bearer Token
   - Token: `{{jwt_token}}`

---

## 🔒 Middleware Implementation

### Server-Side Auth Middleware
The authentication middleware is located at `Super_Admin/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.header('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const secret = process.env.JWT_SECRET || 'change-me';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};
```

### Using Auth Middleware
```javascript
const auth = require('./middleware/auth');

// Protect a route
router.get('/protected-route', auth, (req, res) => {
  // req.user contains the decoded JWT payload
  res.json({ user: req.user });
});
```

---

## ⚠️ Security Best Practices

### 1. Token Storage
- **✅ DO:** Store tokens in secure HTTP-only cookies
- **✅ DO:** Use localStorage for development only
- **❌ DON'T:** Store tokens in plain text
- **❌ DON'T:** Include tokens in URLs

### 2. Token Transmission
- **✅ DO:** Use HTTPS in production
- **✅ DO:** Include tokens in Authorization header
- **❌ DON'T:** Send tokens in query parameters
- **❌ DON'T:** Log tokens in server logs

### 3. Token Validation
- **✅ DO:** Validate tokens on every request
- **✅ DO:** Check token expiration
- **✅ DO:** Implement token blacklisting for logout

### 4. Password Security
- **✅ DO:** Use strong passwords (8+ characters, mixed case, numbers, symbols)
- **✅ DO:** Implement password reset functionality
- **❌ DON'T:** Store passwords in plain text
- **❌ DON'T:** Use weak default passwords

---

## 🚨 Error Handling

### Common Authentication Errors

| Error Code | Message | Cause | Solution |
|------------|---------|-------|----------|
| 401 | No token provided | Missing Authorization header | Include `Authorization: Bearer <token>` |
| 401 | Invalid or expired token | Invalid/expired JWT | Re-authenticate user |
| 400 | Request body is required | Missing request body | Include JSON body in request |
| 401 | Invalid credentials | Wrong email/password | Check credentials |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

---

## 🔧 Environment Configuration

### Required Environment Variables
```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# Database
MONGO_URI=mongodb://localhost:27017/SD_Taxation

# Server
PORT=3000
```

### Production Security Checklist
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Use environment-specific configurations
- [ ] Implement token blacklisting
- [ ] Add CORS configuration
- [ ] Implement input sanitization

---

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT token debugger
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
