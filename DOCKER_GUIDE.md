# JARVIS OMEGA PROTOCOL - Docker Deployment Guide

## 🐳 Docker Quick Start

### Prerequisites
- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)

### Quick Start Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 📋 Detailed Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here

# Application Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15

# Mongo Express (Optional - for debugging)
MONGOEXPRESS_LOGIN=admin
MONGOEXPRESS_PASSWORD=admin123
```

### 2. Build and Run

#### Option A: Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f jarvis-backend
docker-compose logs -f mongodb
```

#### Option B: Using Docker Only

```bash
# Build the image
docker build -t jarvis-omega-protocol:latest .

# Run MongoDB
docker run -d \
  --name jarvis-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -v mongodb_data:/data/db \
  mongo:6.0

# Run JARVIS Backend
docker run -d \
  --name jarvis-backend \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://admin:password123@jarvis-mongodb:27017/jarvis-ai?authSource=admin \
  -e JWT_SECRET=your-secret-key \
  --link jarvis-mongodb \
  jarvis-omega-protocol:latest
```

---

## 🔧 Service Configuration

### Services Included

1. **jarvis-backend** - Main application (Port 5000)
2. **mongodb** - Database (Port 27017)
3. **mongo-express** - Database UI (Port 8081) - Optional

### Accessing Services

- **Application**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health
- **Mongo Express**: http://localhost:8081 (if enabled)

### Enable Mongo Express

```bash
# Start with debug profile
docker-compose --profile debug up -d

# Access at http://localhost:8081
# Login: admin / admin123 (from .env)
```

---

## 📊 Container Management

### View Container Status

```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# Inspect container
docker inspect jarvis-backend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f jarvis-backend

# Last 100 lines
docker-compose logs --tail=100 jarvis-backend

# Since timestamp
docker-compose logs --since 2025-10-28T12:00:00 jarvis-backend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart jarvis-backend

# Restart with rebuild
docker-compose up --build -d jarvis-backend
```

---

## 💾 Data Persistence

### Volumes

Docker Compose creates three volumes:
- `mongodb_data` - MongoDB database files
- `mongodb_config` - MongoDB configuration
- `uploads_data` - Uploaded documents

### Backup Data

```bash
# Backup MongoDB
docker exec jarvis-mongodb mongodump --out /backup
docker cp jarvis-mongodb:/backup ./mongodb-backup

# Backup uploads
docker cp jarvis-backend:/app/backend/uploads ./uploads-backup
```

### Restore Data

```bash
# Restore MongoDB
docker cp ./mongodb-backup jarvis-mongodb:/backup
docker exec jarvis-mongodb mongorestore /backup

# Restore uploads
docker cp ./uploads-backup jarvis-backend:/app/backend/uploads
```

---

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs jarvis-backend

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Test MongoDB connection
docker exec jarvis-mongodb mongosh --eval "db.adminCommand('ping')"

# Check network
docker network inspect jarvis_jarvis-network
```

### Port Already in Use

```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac

# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Use 5001 instead
```

### Out of Disk Space

```bash
# Clean up unused images
docker image prune -a

# Clean up volumes
docker volume prune

# Clean up everything
docker system prune -a --volumes
```

---

## 🚀 Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable HTTPS (use reverse proxy)
- [ ] Restrict MongoDB access
- [ ] Set up firewall rules
- [ ] Enable container resource limits
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Regular backups
- [ ] Update dependencies

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  jarvis-backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### HTTPS with Nginx Reverse Proxy

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - jarvis-backend
```

---

## 📈 Monitoring

### Health Checks

```bash
# Check application health
curl http://localhost:5000/api/health

# Check container health
docker inspect --format='{{.State.Health.Status}}' jarvis-backend
```

### Container Stats

```bash
# Real-time stats
docker stats jarvis-backend

# Export stats
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Clean up old images
docker image prune
```

### Update Dependencies

```bash
# Rebuild with no cache
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Database Maintenance

```bash
# Compact database
docker exec jarvis-mongodb mongosh --eval "db.runCommand({compact: 'users'})"

# Repair database
docker exec jarvis-mongodb mongosh --eval "db.repairDatabase()"

# Check database size
docker exec jarvis-mongodb mongosh --eval "db.stats()"
```

---

## 🌐 Multi-Container Networking

### Network Commands

```bash
# List networks
docker network ls

# Inspect network
docker network inspect jarvis_jarvis-network

# Connect container to network
docker network connect jarvis_jarvis-network my-container
```

---

## 📝 Docker Commands Reference

### Essential Commands

```bash
# Build
docker-compose build
docker-compose build --no-cache

# Start
docker-compose up
docker-compose up -d
docker-compose up --build

# Stop
docker-compose stop
docker-compose down
docker-compose down -v

# Logs
docker-compose logs
docker-compose logs -f
docker-compose logs --tail=100

# Execute commands
docker-compose exec jarvis-backend sh
docker-compose exec mongodb mongosh

# Scale services
docker-compose up -d --scale jarvis-backend=3
```

---

## 🎯 Best Practices

1. **Always use .env files** for sensitive data
2. **Never commit .env** to version control
3. **Use named volumes** for data persistence
4. **Implement health checks** for all services
5. **Set resource limits** in production
6. **Regular backups** of data volumes
7. **Monitor logs** and metrics
8. **Keep images updated** for security
9. **Use specific image tags** (not :latest)
10. **Document your setup** and changes

---

## 🆘 Getting Help

### Useful Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)

### Common Issues
- Check logs first: `docker-compose logs`
- Verify environment variables
- Ensure ports are not in use
- Check disk space
- Verify network connectivity

---

**JARVIS OMEGA PROTOCOL** - Containerized and Ready to Deploy! 🐳🤖✨
