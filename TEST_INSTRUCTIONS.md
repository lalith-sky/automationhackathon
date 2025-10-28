# JARVIS OMEGA PROTOCOL - Testing Instructions

## Prerequisites

### 1. Install MongoDB
- Download and install MongoDB Community Edition from: https://www.mongodb.com/try/download/community
- Start MongoDB service:
  ```bash
  # Windows
  net start MongoDB
  
  # Or run manually
  mongod --dbpath="C:\data\db"
  ```

### 2. Install Node.js Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies (if any)
```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Using the Start Script (Windows)
```bash
# From the root directory
start.bat
```

### Option 2: Manual Start

#### 1. Start Backend Server
```bash
cd backend
npm start
# Or for development with auto-reload
npm run dev
```

The backend will start on: http://localhost:5000

#### 2. Access Frontend
Open your browser and navigate to:
- **Main Dashboard**: http://localhost:5000/
- **Login Page**: http://localhost:5000/login
- **Register Page**: http://localhost:5000/signup

## Testing the Application

### 1. Test Registration
1. Navigate to http://localhost:5000/signup
2. Fill in the registration form:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
3. Click "CREATE ACCOUNT"
4. You should be redirected to the dashboard

### 2. Test Login
1. Navigate to http://localhost:5000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click "ACCESS SYSTEM"
4. You should be redirected to the dashboard

### 3. Test Backend API Endpoints

#### Health Check
```bash
curl http://localhost:5000/api/health
```

#### Register User (API)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"apiuser\",\"email\":\"api@example.com\",\"password\":\"password123\"}"
```

#### Login User (API)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"api@example.com\",\"password\":\"password123\"}"
```

#### Get Current User (requires token)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Test Document Upload
1. Login to the dashboard
2. Upload a PDF or TXT file
3. Select a module (Finance, HR, etc.)
4. Click upload
5. Verify the document appears in the list

### 5. Test AI Chat
1. In the dashboard, use the chatbot
2. Try these prompts:
   - "Hello"
   - "Summarize my documents"
   - "Check compliance"
   - "Analyze financial data"

## Common Issues and Solutions

### Issue: MongoDB Connection Error
**Solution**: 
- Ensure MongoDB is running
- Check connection string in backend/server.js
- Default: `mongodb://localhost:27017/jarvis-ai`

### Issue: Port Already in Use
**Solution**:
- Change PORT in backend/.env or backend/server.js
- Default port is 5000

### Issue: CORS Errors
**Solution**:
- Check CORS configuration in backend/server.js
- Ensure frontend URL matches the CORS origin

### Issue: File Upload Fails
**Solution**:
- Check if `backend/uploads` directory exists
- Verify file size limits (default 10MB)
- Ensure file type is allowed (PDF, TXT, DOC, DOCX)

## Environment Variables

Create a `.env` file in the `backend` directory (optional):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jarvis-ai
JWT_SECRET=your-secret-key-here
MAX_FILE_SIZE=10485760
NODE_ENV=development
```

## Browser Console Testing

Open browser console (F12) and test:

```javascript
// Test if token is stored
console.log(localStorage.getItem('jarvis_token'));

// Test if user is stored
console.log(JSON.parse(localStorage.getItem('jarvis_user')));

// Clear storage
localStorage.clear();
```

## Expected Results

### ✅ Successful Registration
- Status: 201 Created
- Response includes: token, user object
- Redirects to dashboard
- Token stored in localStorage

### ✅ Successful Login
- Status: 200 OK
- Response includes: token, user object
- Redirects to dashboard
- Token stored in localStorage

### ✅ Dashboard Access
- Shows JARVIS interface
- Displays user info
- Shows module navigation
- Chatbot is functional

## Design Features Implemented

### Login/Register Pages
- ✅ JARVIS OMEGA PROTOCOL branding
- ✅ Purple/cyan neon theme
- ✅ Animated logo with floating and spinning effects
- ✅ Gradient background with animated particles
- ✅ Vertical cyan line decoration
- ✅ Light input fields with focus effects
- ✅ Purple gradient button
- ✅ Feature badges (Secure, Fast, AI-Powered)
- ✅ Responsive design

### Backend Features
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ User registration and login
- ✅ Document upload and management
- ✅ AI document analysis
- ✅ Natural language processing
- ✅ RESTful API endpoints
- ✅ MongoDB integration

## Troubleshooting Commands

### Check if MongoDB is running
```bash
# Windows
tasklist | findstr mongod

# Check MongoDB status
mongo --eval "db.adminCommand('ping')"
```

### Check if port 5000 is available
```bash
# Windows
netstat -ano | findstr :5000
```

### View backend logs
Check the terminal where you started the backend server for error messages.

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check network connectivity
5. Review the error logs in the terminal

---

**JARVIS OMEGA PROTOCOL** - Enterprise AI Command Center 🤖✨
