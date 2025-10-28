# J.A.R.V.I.S AI Dashboard - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd jarvis-ai-dashboard
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/jarvis-ai
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,txt,doc,docx
```

### 3. Start the Application

#### Option A: Using Startup Scripts
- **Windows**: Double-click `start.bat`
- **Linux/Mac**: Run `./start.sh`

#### Option B: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (if using separate server)
cd frontend
npx http-server . -p 3000 -o
```

### 4. Access the Dashboard
- **Main Dashboard**: http://localhost:5000
- **Login**: http://localhost:5000/login
- **Signup**: http://localhost:5000/signup
- **API Health**: http://localhost:5000/api/health

## 📁 Project Structure

```
jarvis-ai-dashboard/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Document.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── documents.js
│   │   └── ai.js
│   ├── uploads/
│   ├── package.json
│   ├── server.js
│   └── .env
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── style.css
│   ├── app.js
│   └── assets/
├── start.bat (Windows)
├── start.sh (Linux/Mac)
├── README.md
└── DEPLOYMENT.md
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/jarvis-ai` |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` (10MB) |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `pdf,txt,doc,docx` |

### MongoDB Setup
1. **Local MongoDB**:
   ```bash
   # Install MongoDB
   # Start MongoDB service
   mongod
   ```

2. **MongoDB Atlas** (Cloud):
   - Create account at https://cloud.mongodb.com
   - Create cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment
export NODE_ENV=production

# Update .env for production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jarvis-ai
JWT_SECRET=your-production-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### 2. Build and Deploy
```bash
# Install production dependencies
cd backend
npm install --production

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name jarvis-ai
pm2 save
pm2 startup
```

### 3. Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Considerations

### 1. JWT Secret
- Use a strong, random secret key
- Never commit secrets to version control
- Use environment variables

### 2. File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Store files outside web root

### 3. Database Security
- Use MongoDB authentication
- Enable SSL/TLS for database connections
- Regular backups

### 4. CORS Configuration
- Configure allowed origins
- Use HTTPS in production
- Validate all inputs

## 📊 Monitoring

### 1. Health Checks
```bash
# Check API health
curl http://localhost:5000/api/health

# Check application status
pm2 status
```

### 2. Logs
```bash
# View application logs
pm2 logs jarvis-ai

# View error logs
pm2 logs jarvis-ai --err
```

### 3. Performance Monitoring
- Monitor CPU and memory usage
- Track API response times
- Monitor database performance

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **File Upload Issues**:
   - Check file size limits
   - Verify file permissions
   - Check disk space

3. **Authentication Errors**:
   - Verify JWT secret
   - Check token expiration
   - Validate user credentials

4. **CORS Issues**:
   - Update FRONTEND_URL
   - Check CORS configuration
   - Verify request headers

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check specific modules
DEBUG=jarvis-ai:* npm run dev
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Deploy multiple instances
- Use session storage (Redis)

### Database Scaling
- MongoDB replica sets
- Database sharding
- Connection pooling

### File Storage
- Use cloud storage (AWS S3, Google Cloud)
- CDN for static files
- File compression

## 🔄 Updates

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart jarvis-ai
```

### Database Migrations
- Backup database before updates
- Test migrations in staging
- Use version control for schema changes

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs jarvis-ai`
2. Verify configuration
3. Test API endpoints
4. Check database connectivity
5. Review security settings

---

**J.A.R.V.I.S AI Dashboard** - Ready for deployment! 🤖✨
