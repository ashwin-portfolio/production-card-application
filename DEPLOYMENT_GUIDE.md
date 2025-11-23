# Deployment Guide - Production Card Application

Complete guide for deploying all components of the Production Card Application.

## Prerequisites

- Docker and Docker Compose installed
- MySQL 8.0+ (or use Docker)
- Python 3.11+ (for backend)
- Node.js 18+ (for admin portal)
- Android Studio (for Android builds)

## Component Overview

1. **MySQL Database** - Data persistence
2. **FastAPI Backend** - REST API server
3. **React Admin Portal** - Web interface
4. **Android App** - Mobile application

## Deployment Options

### Option 1: Docker Compose (Recommended for Development)

Deploy all services using Docker Compose:

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services:**
- MySQL: `localhost:3306`
- Backend: `localhost:8000`

### Option 2: Manual Deployment

#### 1. MySQL Database

**Using Docker:**
```bash
docker run -d \
  --name production_card_db \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=production_card_db \
  -e MYSQL_USER=prodcard \
  -e MYSQL_PASSWORD=prodcard123 \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

**Using Local MySQL:**
```bash
mysql -u root -p
CREATE DATABASE production_card_db;
CREATE USER 'prodcard'@'localhost' IDENTIFIED BY 'prodcard123';
GRANT ALL PRIVILEGES ON production_card_db.* TO 'prodcard'@'localhost';
FLUSH PRIVILEGES;
```

**Initialize Database:**
```bash
mysql -u prodcard -p production_card_db < backend/app/db/migrations/init_db.sql
```

#### 2. FastAPI Backend

**Development:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production with Docker:**
```bash
cd backend
docker build -t production-card-api .
docker run -d \
  --name production_card_backend \
  -p 8000:8000 \
  -e DATABASE_URL=mysql+pymysql://prodcard:prodcard123@db:3306/production_card_db \
  -e SECRET_KEY=your-secret-key-here \
  production-card-api
```

**Production with Gunicorn:**
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Using Systemd (Linux):**
```ini
# /etc/systemd/system/production-card-api.service
[Unit]
Description=Production Card API
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/production-card/backend
Environment="PATH=/opt/production-card/backend/venv/bin"
ExecStart=/opt/production-card/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```

#### 3. React Admin Portal

**Development:**
```bash
cd admin
npm install
npm run dev
```

**Production Build:**
```bash
cd admin
npm install
npm run build

# Deploy dist/ folder to static hosting:
# - Netlify
# - Vercel
# - AWS S3 + CloudFront
# - Nginx
# - Apache
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name admin.productioncard.com;
    
    root /var/www/production-card-admin/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Vercel Deployment:**
```bash
cd admin
npm install -g vercel
vercel --prod
```

#### 4. Android App

**Build Release APK:**
```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

**Build AAB (Google Play):**
```bash
cd android
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Sign APK:**
```bash
# Generate keystore (first time)
keytool -genkey -v -keystore production-card.keystore \
  -alias production-card -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore production-card.keystore app-release-unsigned.apk production-card

# Align APK
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=mysql+pymysql://prodcard:prodcard123@localhost:3306/production_card_db
SECRET_KEY=your-secret-key-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SMS_API_KEY=your-sms-api-key
MAX_DISTANCE_METERS=500
```

### Admin Portal

Update `admin/src/api/index.js`:
```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000';
```

### Android

Update `android/app/src/main/java/com/productioncard/utils/ApiClient.kt`:
```kotlin
private const val BASE_URL = "https://api.productioncard.com/"
```

## SSL/HTTPS Setup

### Using Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.productioncard.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.productioncard.com;
    
    ssl_certificate /etc/letsencrypt/live/api.productioncard.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.productioncard.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Using Let's Encrypt

```bash
sudo certbot --nginx -d api.productioncard.com
```

## Production Checklist

### Security

- [ ] Change default passwords
- [ ] Use strong SECRET_KEY (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database encryption
- [ ] Use environment variables (never commit secrets)
- [ ] Set up rate limiting
- [ ] Enable logging and monitoring

### Database

- [ ] Create production database
- [ ] Run migrations
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Set up database monitoring

### Backend

- [ ] Configure production environment variables
- [ ] Set up process manager (PM2, systemd)
- [ ] Enable logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure CORS for production domains
- [ ] Set up API rate limiting

### Admin Portal

- [ ] Build production bundle
- [ ] Update API URL
- [ ] Deploy to static hosting
- [ ] Configure CDN
- [ ] Set up custom domain

### Android

- [ ] Update API URL in ApiClient
- [ ] Build release APK/AAB
- [ ] Sign APK with release keystore
- [ ] Test on multiple devices
- [ ] Upload to Google Play Console

### Monitoring

- [ ] Set up application monitoring
- [ ] Configure error alerts
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Set up performance monitoring

## Backup Strategy

### Database Backup

```bash
# Daily backup script
mysqldump -u prodcard -p production_card_db > backup_$(date +%Y%m%d).sql

# Restore
mysql -u prodcard -p production_card_db < backup_20241219.sql
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Scaling

### Backend Scaling

- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use Redis for session management
- Set up database replication

### Database Scaling

- Use read replicas
- Implement connection pooling
- Optimize queries
- Add database indexes

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify credentials
   - Check firewall rules
   - Verify port mapping

2. **CORS Errors**
   - Update CORS origins in backend
   - Check API URL in frontend
   - Verify headers

3. **OTP Not Received**
   - Check SMS service configuration
   - Verify phone number format
   - Check backend logs

4. **Android App Can't Connect**
   - Update BASE_URL in ApiClient
   - Check network permissions
   - Verify backend is accessible

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review documentation: `README.md`
- Check test results: `TESTING_GUIDE.md`

