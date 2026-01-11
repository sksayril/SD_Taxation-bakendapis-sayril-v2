# Super Admin API Documentation

This directory contains comprehensive documentation for the Super Admin API endpoints in the SD_Taxation system.

## 📁 Documentation Structure

- **[API_Reference.md](./API_Reference.md)** - Complete API endpoint documentation
- **[Authentication_Guide.md](./Authentication_Guide.md)** - Authentication and authorization details
- **[Request_Response_Examples.md](./Request_Response_Examples.md)** - Detailed examples with sample requests/responses
- **[Error_Handling.md](./Error_Handling.md)** - Error codes and troubleshooting guide
- **[Testing_Guide.md](./Testing_Guide.md)** - How to test the API endpoints

## 🚀 Quick Start

### Base URL
```
http://localhost:3000/api/superadmin
```

### Authentication
All endpoints (except signup/login) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Content Type
All requests must include:
```
Content-Type: application/json
```

## 📋 Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new super admin | ❌ |
| POST | `/login` | Authenticate super admin | ❌ |

## 🔧 Environment Variables

Make sure these environment variables are set:

```env
MONGO_URI=mongodb://localhost:27017/SD_Taxation
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
```

## 📖 Getting Started

1. **Read the [API_Reference.md](./API_Reference.md)** for detailed endpoint information
2. **Check [Authentication_Guide.md](./Authentication_Guide.md)** for auth setup
3. **Use [Request_Response_Examples.md](./Request_Response_Examples.md)** for testing
4. **Refer to [Error_Handling.md](./Error_Handling.md)** for troubleshooting

## 🛠️ Development

### Starting the Server
```bash
npm start
# or for development
npm run dev
```

### Testing the API
Use the examples in [Testing_Guide.md](./Testing_Guide.md) to test the endpoints.

---

**Last Updated:** $(date)  
**Version:** 1.0.0  
**Maintainer:** SD_Taxation Development Team
