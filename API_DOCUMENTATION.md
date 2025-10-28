# JARVIS OMEGA PROTOCOL - API Documentation

## 📚 Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Authentication](#authentication-endpoints)
  - [Documents](#document-endpoints)
  - [AI Processing](#ai-endpoints)

---

## Overview

The JARVIS OMEGA PROTOCOL API is a RESTful API that provides document analysis, user authentication, and AI-powered insights. All responses are in JSON format.

### API Version
Current Version: **1.0.0**

### Content Type
All requests and responses use `application/json` content type.

---

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Getting a Token
Tokens are obtained through the `/auth/login` or `/auth/register` endpoints.

### Token Expiration
Tokens expire after 7 days by default.

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info included in response headers
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

---

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok",
  "message": "J.A.R.V.I.S AI Backend is running",
  "timestamp": "2025-10-28T12:00:00.000Z"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "string (required, 3-30 characters)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 characters)"
}
```

**Success Response** (201):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-10-28T12:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Validation error or user already exists
- 500: Server error

---

### POST /auth/login
Login to an existing account.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "lastLogin": "2025-10-28T12:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Missing credentials
- 401: Invalid credentials
- 500: Server error

---

### GET /auth/me
Get current user information.

**Authentication**: Required

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "createdAt": "2025-10-28T12:00:00.000Z"
  }
}
```

**Error Responses**:
- 401: Invalid or missing token
- 404: User not found
- 500: Server error

---

### PUT /auth/preferences
Update user preferences.

**Authentication**: Required

**Request Body**:
```json
{
  "theme": "string (optional, 'dark' or 'light')",
  "notifications": "boolean (optional)",
  "language": "string (optional)"
}
```

**Success Response** (200):
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  }
}
```

---

### POST /auth/logout
Logout current user.

**Authentication**: Required

**Success Response** (200):
```json
{
  "message": "Logout successful"
}
```

---

## Document Endpoints

### POST /documents/upload
Upload a new document.

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Form Data**:
- `document`: File (required, PDF/TXT/DOC/DOCX, max 10MB)
- `module`: String (optional, default: "Finance")
  - Options: Finance, HR, Analytics, Compliance, Reports
- `tags`: String (optional, comma-separated)

**Success Response** (201):
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": "507f1f77bcf86cd799439011",
    "filename": "report.pdf",
    "module": "Finance",
    "size": 1024000,
    "uploadedAt": "2025-10-28T12:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: No file uploaded or invalid file type
- 413: File too large
- 500: Server error

---

### GET /documents
Get all documents for the current user.

**Authentication**: Required

**Query Parameters**:
- `module`: String (optional) - Filter by module
- `status`: String (optional) - Filter by status
- `page`: Number (optional, default: 1)
- `limit`: Number (optional, default: 10)

**Success Response** (200):
```json
{
  "documents": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "filename": "report.pdf",
      "originalName": "Financial Report Q4.pdf",
      "module": "Finance",
      "fileSize": 1024000,
      "status": "analyzed",
      "tags": ["quarterly", "finance"],
      "createdAt": "2025-10-28T12:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

---

### GET /documents/:id
Get a specific document.

**Authentication**: Required

**URL Parameters**:
- `id`: Document ID (required)

**Success Response** (200):
```json
{
  "document": {
    "_id": "507f1f77bcf86cd799439011",
    "filename": "report.pdf",
    "originalName": "Financial Report Q4.pdf",
    "filePath": "/uploads/document-123.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "module": "Finance",
    "status": "analyzed",
    "tags": ["quarterly", "finance"],
    "extractedData": {
      "names": ["John Smith", "Jane Doe"],
      "dates": ["2025-01-15", "2025-03-30"],
      "amounts": ["$50,000", "$75,000"],
      "departments": ["Finance", "HR"]
    },
    "analysis": {
      "summary": "Financial report summary...",
      "keyPoints": ["Point 1", "Point 2"],
      "riskLevel": "LOW",
      "compliance": "PASSED",
      "confidence": 94
    },
    "createdAt": "2025-10-28T12:00:00.000Z"
  }
}
```

**Error Responses**:
- 404: Document not found
- 500: Server error

---

### PUT /documents/:id
Update document metadata.

**Authentication**: Required

**URL Parameters**:
- `id`: Document ID (required)

**Request Body**:
```json
{
  "module": "string (optional)",
  "tags": "string (optional, comma-separated)",
  "isPublic": "boolean (optional)"
}
```

**Success Response** (200):
```json
{
  "message": "Document updated successfully",
  "document": {
    "_id": "507f1f77bcf86cd799439011",
    "module": "HR",
    "tags": ["contract", "employee"],
    "isPublic": false
  }
}
```

---

### DELETE /documents/:id
Delete a document.

**Authentication**: Required

**URL Parameters**:
- `id`: Document ID (required)

**Success Response** (200):
```json
{
  "message": "Document deleted successfully"
}
```

**Error Responses**:
- 404: Document not found
- 500: Server error

---

### GET /documents/:id/content
Get document content and analysis.

**Authentication**: Required

**URL Parameters**:
- `id`: Document ID (required)

**Success Response** (200):
```json
{
  "content": "Full document text content...",
  "extractedData": {
    "names": ["John Smith"],
    "dates": ["2025-01-15"],
    "amounts": ["$50,000"],
    "departments": ["Finance"],
    "keywords": ["budget", "forecast", "revenue"]
  },
  "analysis": {
    "summary": "Document summary...",
    "keyPoints": ["Key point 1", "Key point 2"],
    "riskLevel": "LOW",
    "compliance": "PASSED",
    "confidence": 94
  }
}
```

---

## AI Endpoints

### POST /ai/analyze/:documentId
Analyze a document using AI/NLP.

**Authentication**: Required

**URL Parameters**:
- `documentId`: Document ID (required)

**Success Response** (200):
```json
{
  "message": "Document analysis completed",
  "analysis": {
    "summary": "This document contains financial data...",
    "keyPoints": [
      "Revenue increased by 15%",
      "New budget allocation approved",
      "Q4 targets met"
    ],
    "riskLevel": "LOW",
    "compliance": "PASSED",
    "confidence": 94
  },
  "extractedData": {
    "names": ["John Smith", "Jane Doe"],
    "dates": ["2025-01-15", "2025-03-30"],
    "amounts": ["$50,000", "$75,000"],
    "departments": ["Finance", "HR"],
    "keywords": ["budget", "revenue", "forecast"]
  }
}
```

**Error Responses**:
- 400: Document content not available
- 404: Document not found
- 500: Analysis error

---

### POST /ai/chat
Chat with the AI assistant.

**Authentication**: Required

**Request Body**:
```json
{
  "message": "string (required)",
  "documentId": "string (optional)"
}
```

**Success Response** (200):
```json
{
  "message": "I'm J.A.R.V.I.S, your AI assistant. How can I help you today?",
  "timestamp": "2025-10-28T12:00:00.000Z"
}
```

**Example Requests**:
```json
// General chat
{
  "message": "Hello"
}

// Document-specific chat
{
  "message": "Summarize this document",
  "documentId": "507f1f77bcf86cd799439011"
}
```

---

### POST /ai/insights
Generate insights from documents.

**Authentication**: Required

**Request Body**:
```json
{
  "module": "string (optional)"
}
```

**Success Response** (200):
```json
{
  "insights": [
    "⚠️ 2 document(s) flagged as HIGH risk requiring immediate attention.",
    "🚨 1 document(s) failed compliance checks.",
    "💰 Found 45 financial amounts across documents.",
    "📊 Average analysis confidence: 92%"
  ],
  "documentCount": 25,
  "module": "Finance"
}
```

---

## Code Examples

### JavaScript/Fetch

#### Register User
```javascript
const register = async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'securepassword123'
    })
  });
  
  const data = await response.json();
  console.log(data.token); // Save this token
};
```

#### Upload Document
```javascript
const uploadDocument = async (file, token) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('module', 'Finance');
  formData.append('tags', 'quarterly,report');
  
  const response = await fetch('http://localhost:5000/api/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  return data.document;
};
```

#### Analyze Document
```javascript
const analyzeDocument = async (documentId, token) => {
  const response = await fetch(`http://localhost:5000/api/ai/analyze/${documentId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.analysis;
};
```

### cURL

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securepassword123"}'
```

#### Get Documents
```bash
curl -X GET "http://localhost:5000/api/documents?module=Finance&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Chat with AI
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message":"Summarize my documents"}'
```

---

## Webhooks (Future Feature)

Webhooks will be available in a future release to notify your application of events:
- Document analysis completed
- New document uploaded
- Risk detected
- Compliance failure

---

## API Versioning

The API uses URL-based versioning. Future versions will be available at:
- v1: `/api/v1/...`
- v2: `/api/v2/...` (future)

---

## Support

For API support:
- **Documentation**: This file
- **Issues**: [GitHub Issues](https://github.com/lalith-sky/automationhackathon/issues)
- **Email**: support@example.com

---

**Last Updated**: 2025-10-28  
**API Version**: 1.0.0

**JARVIS OMEGA PROTOCOL** - Enterprise AI Command Center 🤖✨
