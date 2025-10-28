# MongoDB Installation Guide for Windows

## Quick Install Steps:

### 1. Download MongoDB
- Go to: https://www.mongodb.com/try/download/community
- Select: **Windows x64**
- Click: **Download**

### 2. Install MongoDB
- Run the downloaded `.msi` file
- Choose: **Complete** installation
- **Important**: Check "Install MongoDB as a Service"
- Keep default settings

### 3. Start MongoDB Service
Open PowerShell as Administrator and run:
```powershell
net start MongoDB
```

### 4. Verify MongoDB is Running
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Or test connection
mongosh --eval "db.version()"
```

## Alternative: Use MongoDB Atlas (Cloud - Free)

If you don't want to install locally, use MongoDB Atlas:

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0)
4. Get your connection string
5. Update `backend/server.js` line 41:
   ```javascript
   mongoose.connect('your-mongodb-atlas-connection-string', {
   ```

## Quick Test Without MongoDB

If you just want to test the frontend design without database:
- The login/register pages will load perfectly
- You can see all the animations and design
- API calls will fail (expected without MongoDB)
- Frontend functionality will work

## Troubleshooting

### MongoDB won't start?
```powershell
# Create data directory
mkdir C:\data\db

# Start MongoDB manually
mongod --dbpath="C:\data\db"
```

### Port 27017 already in use?
```powershell
# Find process using port 27017
netstat -ano | findstr :27017

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```
