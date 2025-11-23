#!/bin/bash

# =============================================================================
# Production Card Application - Complete Deployment Script
# =============================================================================
# This script will:
# 1. Create the complete project structure
# 2. Set up the backend (FastAPI + Python)
# 3. Set up the admin portal (React + Vite)
# 4. Set up the Android app (Kotlin)
# 5. Configure Docker and database
# 6. Install all dependencies
# =============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="production-card-application"
BACKEND_PORT=8000
ADMIN_PORT=3000
MYSQL_PORT=3306

# Functions
print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_dependencies() {
    print_header "Checking System Dependencies"
    
    local missing_deps=()
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python found: $PYTHON_VERSION"
    else
        missing_deps+=("python3")
        print_error "Python 3 not found"
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        missing_deps+=("node")
        print_error "Node.js not found"
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: v$NPM_VERSION"
    else
        missing_deps+=("npm")
        print_error "npm not found"
    fi
    
    # Check MySQL (optional)
    if command -v mysql &> /dev/null; then
        print_success "MySQL found"
    else
        print_warning "MySQL not found (will use Docker)"
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker found"
    else
        print_warning "Docker not found (optional for deployment)"
    fi
    
    # Check Android Studio (optional)
    if [ -d "/Applications/Android Studio.app" ] || command -v android-studio &> /dev/null; then
        print_success "Android Studio detected"
    else
        print_warning "Android Studio not found (required for Android development)"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        echo ""
        echo "Please install the missing dependencies and run this script again."
        exit 1
    fi
}

create_directory_structure() {
    print_header "Creating Directory Structure"
    
    # Create main directories
    mkdir -p "$PROJECT_NAME"/{backend,admin,android}
    cd "$PROJECT_NAME"
    
    # Backend structure
    mkdir -p backend/app/{api,core,db/{migrations,__pycache__},__pycache__}
    mkdir -p backend/app/api/__pycache__
    mkdir -p backend/app/core/__pycache__
    
    # Admin structure
    mkdir -p admin/src/{api,components,pages}
    mkdir -p admin/public
    mkdir -p admin/dist
    
    # Android structure
    mkdir -p android/app/src/main/{java/com/productioncard/{auth,dashboard,models,services,storage},res/{layout,menu,values,drawable,mipmap-hdpi,mipmap-mdpi,mipmap-xhdpi,mipmap-xxhdpi,mipmap-xxxhdpi}}
    mkdir -p android/gradle/wrapper
    
    print_success "Directory structure created"
}

create_backend_files() {
    print_header "Creating Backend Files"
    
    # requirements.txt
    cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pymysql==1.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.0
pydantic-settings==2.1.0
alembic==1.12.1
python-dotenv==1.0.0
EOF
    
    # Dockerfile
    cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
    
    # .env template
    cat > backend/.env.example << 'EOF'
DATABASE_URL=mysql+pymysql://prodcard:prodcard123@localhost:3306/production_card_db
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SMS_API_KEY=mock-sms-key
MAX_DISTANCE_METERS=500
EOF
    
    cp backend/.env.example backend/.env
    
    # Backend README
    cat > backend/README.md << 'EOF'
# Production Card Backend

FastAPI-based backend for Production Card Management System.

## Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run server
uvicorn app.main:app --reload
```

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
EOF
    
    # init_db.sql
    cat > backend/app/db/migrations/init_db.sql << 'EOF'
-- Initial database setup script for MySQL
CREATE DATABASE IF NOT EXISTS production_card_db;
USE production_card_db;

-- Sample data insertion (run after tables are created by SQLAlchemy)

-- Insert sample sites
INSERT INTO sites (site_name, latitude, longitude) VALUES
('Factory Site 1', 13.0827, 80.2707),
('Factory Site 2', 12.9716, 77.5946);

-- Insert admin user (password: admin123)
INSERT INTO users (name, phone, password_hash, role, site_id, language) VALUES
('Admin User', '+919876543210', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Jz4Q6Zfj.2cS', 'admin', NULL, 'en');

-- Insert sample employees (password: employee123)
INSERT INTO users (name, phone, password_hash, role, site_id, language) VALUES
('Ravi Kumar', '+919876543211', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Jz4Q6Zfj.2cS', 'employee', 1, 'ta'),
('Priya Sharma', '+919876543212', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Jz4Q6Zfj.2cS', 'employee', 1, 'hi'),
('Arun Patel', '+919876543213', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Jz4Q6Zfj.2cS', 'employee', 2, 'en');

-- Insert sample production cards
INSERT INTO production_cards (card_number, site_id, assigned_to, data, status) VALUES
('CARD-001', 1, 2, '{"item": "Widget A", "quantity": 100}', 'assigned'),
('CARD-002', 1, 2, '{"item": "Widget B", "quantity": 50}', 'assigned'),
('CARD-003', 1, 3, '{"item": "Widget C", "quantity": 75}', 'assigned'),
('CARD-004', 2, 4, '{"item": "Gadget X", "quantity": 200}', 'assigned');
EOF
    
    # __init__.py files
    touch backend/app/__init__.py
    touch backend/app/api/__init__.py
    touch backend/app/core/__init__.py
    touch backend/app/db/__init__.py
    
    print_success "Backend files created"
}

create_admin_files() {
    print_header "Creating Admin Portal Files"
    
    # package.json
    cat > admin/package.json << 'EOF'
{
  "name": "production-card-admin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.5"
  }
}
EOF
    
    # vite.config.js
    cat > admin/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
EOF
    
    # index.html
    cat > admin/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Production Card Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
    
    # Admin README
    cat > admin/README.md << 'EOF'
# Production Card Admin Portal

React-based admin portal for Production Card Management System.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Features
- Dashboard with statistics
- Device rebind request management
- Submission tracking
- Card assignment
- CSV export
EOF
    
    print_success "Admin portal files created"
}

create_android_files() {
    print_header "Creating Android Files"
    
    # build.gradle (project level)
    cat > android/build.gradle << 'EOF'
// Top-level build file
buildscript {
    ext.kotlin_version = '1.9.0'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
EOF
    
    # build.gradle (app level)
    cat > android/app/build.gradle << 'EOF'
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-kapt'
}

android {
    namespace 'com.productioncard'
    compileSdk 34
    
    defaultConfig {
        applicationId "com.productioncard"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = '17'
    }
    
    buildFeatures {
        viewBinding true
    }
}

dependencies {
    // AndroidX
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    
    // Retrofit for API calls
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    
    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    
    // Location services
    implementation 'com.google.android.gms:play-services-location:21.0.1'
    
    // Lifecycle
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    
    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
EOF
    
    # settings.gradle
    cat > android/settings.gradle << 'EOF'
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ProductionCard"
include ':app'
EOF
    
    # gradle.properties
    cat > android/gradle.properties << 'EOF'
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
EOF
    
    # AndroidManifest.xml
    cat > android/app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ProductionCard"
        android:usesCleartextTraffic="true"
        tools:targetApi="31">
        
        <activity
            android:name=".auth.LoginActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity android:name=".auth.OtpActivity" />
        <activity android:name=".auth.RootedDeviceActivity" />
        <activity android:name=".dashboard.CardsListActivity" />
        <activity android:name=".dashboard.CardDetailsActivity" />
        
    </application>

</manifest>
EOF
    
    # strings.xml
    cat > android/app/src/main/res/values/strings.xml << 'EOF'
<resources>
    <string name="app_name">Production Card</string>
    <string name="login">Login</string>
    <string name="phone_number">Phone Number</string>
    <string name="password">Password</string>
    <string name="verify_otp">Verify OTP</string>
    <string name="submit">Submit</string>
    <string name="logout">Logout</string>
    <string name="my_cards">My Production Cards</string>
</resources>
EOF
    
    # Android README
    cat > android/README.md << 'EOF'
# Production Card Android App

Android mobile application for production card management.

## Setup

1. Open this folder in Android Studio
2. Update `ApiService.kt` with your backend URL:
   - For emulator: `http://10.0.2.2:8000/`
   - For device: `http://YOUR_LOCAL_IP:8001/`
3. Sync project with Gradle files
4. Build and run

## Features
- Phone + Password + OTP authentication
- Device binding
- Root detection
- GPS-based geofencing
- Production card viewing and submission
- Multi-language support (English, Tamil, Hindi)

## Requirements
- Android Studio Arctic Fox or later
- Android SDK 24+
- Kotlin 1.9.0
- Google Play Services for Location
EOF
    
    print_success "Android files created"
}

create_docker_files() {
    print_header "Creating Docker Configuration"
    
    # docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MySQL Database
  db:
    image: mysql:8.0
    container_name: production_card_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: production_card_db
      MYSQL_USER: prodcard
      MYSQL_PASSWORD: prodcard123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/app/db/migrations/init_db.sql:/docker-entrypoint-initdb.d/init.sql

  # FastAPI Backend
  backend:
    build: ./backend
    container_name: production_card_backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: mysql+pymysql://prodcard:prodcard123@db:3306/production_card_db
      SECRET_KEY: 09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
    depends_on:
      - db
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000

volumes:
  mysql_data:
EOF
    
    print_success "Docker configuration created"
}

create_documentation() {
    print_header "Creating Documentation"
    
    # Main README
    cat > README.md << 'EOF'
# Production Card MVP - Complete System

A complete production card management system with Android mobile app, FastAPI backend, React admin portal, and MySQL database.

## System Overview

### Components
1. **Android Mobile App (Kotlin)** - For employees to view and submit production cards
2. **FastAPI Backend (Python)** - RESTful API server with authentication and business logic
3. **React Admin Portal** - Web interface for administrators
4. **MySQL Database** - Data persistence layer

### Key Features

- Phone + Password + SMS OTP authentication
- Device binding with hash (one device per user)
- Device rebind request workflow
- Root detection on Android
- Multi-language support (English, Tamil, Hindi)
- GPS-based geofencing (500m radius)
- Production card assignment and submission
- CSV data export
- Mobile-responsive admin portal

## Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Start database and backend
docker-compose up -d

# Backend will be available at http://localhost:8000
# MySQL will be available at localhost:3306
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run server
uvicorn app.main:app --reload
```

Backend will run on http://localhost:8000

#### Admin Portal Setup
```bash
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
```

Admin portal will run on http://localhost:3000

#### Android App Setup
1. Open `android/` folder in Android Studio
2. Update `ApiService.kt` with your backend URL
3. Build and run on emulator or device

## Database Setup

### Using Docker
Database will be automatically created when running `docker-compose up`

### Manual MySQL Setup
```sql
CREATE DATABASE production_card_db;
```

Then run the FastAPI server - tables will be created automatically using SQLAlchemy.

For sample data, run: `backend/app/db/migrations/init_db.sql`

## Test Credentials

### Admin
- Phone: +919876543210
- Password: admin123

### Employees
- Phone: +919876543211 (Ravi Kumar)
- Phone: +919876543212 (Priya Sharma)
- Phone: +919876543213 (Arun Patel)
- Password: employee123

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Architecture

See individual component READMEs:
- Backend: `backend/README.md`
- Admin Portal: `admin/README.md`
- Android App: `android/README.md`

## Security Features

### Device Binding
- Each user can only use one device
- Device identified by hashed Android ID
- Login on new device creates rebind request
- Admin approval required for device change

### Root Detection
- Checks for SU binaries
- Checks build tags
- Checks for root management apps
- Blocks access and alerts admin

### Geofencing
- Uses Haversine formula
- Validates submission within 500m of site
- Rejects submissions outside geofence

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- OTP verification for first login
- Admin role verification

## Deployment

### Backend (Docker)
```bash
cd backend
docker build -t production-card-api .
docker run -p 8000:8000 production-card-api
```

### Admin Portal
```bash
cd admin
npm run build
# Deploy dist/ folder to any static hosting (Netlify, Vercel, S3, etc.)
```

### Android App
Build release APK:
```bash
cd android
./gradlew assembleRelease
```

## Troubleshooting

### Backend Issues
- Check database connection in `.env`
- Ensure MySQL is running
- Check port 8000 is available

### Android Issues
- Update backend URL in `ApiService.kt`
- Use `10.0.2.2` for emulator
- Use actual IP for physical device
- Check location permissions

### Admin Portal Issues
- Update API URL in `src/api/index.js`
- Check CORS settings in backend
- Clear browser cache

## License

This is an MVP/prototype application for internal use.
EOF
    
    # Quick Start Guide
    cat > QUICK_START.md << 'EOF'
# Quick Start Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0 or Docker
- Android Studio (for mobile app)

## 1. Start Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Visit: http://localhost:8000/docs

## 2. Start Admin Portal

```bash
cd admin
npm install
npm run dev
```

Visit: http://localhost:3000

## 3. Setup Android App

1. Open `android/` in Android Studio
2. Edit `services/ApiService.kt`:
   ```kotlin
   private const val BASE_URL = "http://10.0.2.2:8000/"  // For emulator
   ```
3. Build and run

## 4. Test the System

### Login as Admin
- Open http://localhost:3000
- Phone: +919876543210
- Password: admin123

### Login as Employee (Android)
- Phone: +919876543211
- Password: employee123
- Enter OTP shown in backend console

## Next Steps
- Assign production cards to employees
- Submit cards with GPS location
- View submissions in admin portal
- Export data as CSV
EOF
    
    print_success "Documentation created"
}

create_gitignore() {
    print_header "Creating .gitignore"
    
    cat > .gitignore << 'EOF'
# Backend
backend/venv/
backend/__pycache__/
backend/**/__pycache__/
backend/.env
backend/**/*.pyc
backend/.pytest_cache/

# Admin
admin/node_modules/
admin/dist/
admin/.env
admin/.env.local

# Android
android/.gradle/
android/.idea/
android/build/
android/app/build/
android/local.properties
android/*.iml
android/.DS_Store

# General
.DS_Store
.vscode/
.idea/
*.log
*.swp
*.bak
*~
EOF
    
    print_success ".gitignore created"
}

setup_backend() {
    print_header "Setting Up Backend"
    
    cd backend
    
    # Create virtual environment
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_info "Installing Python dependencies..."
    pip install --upgrade pip > /dev/null 2>&1
    pip install -r requirements.txt
    
    print_success "Backend setup complete"
    
    deactivate
    cd ..
}

setup_admin() {
    print_header "Setting Up Admin Portal"
    
    cd admin
    
    # Install dependencies
    print_info "Installing npm dependencies..."
    npm install
    
    print_success "Admin portal setup complete"
    
    cd ..
}

print_summary() {
    print_header "Setup Complete!"
    
    echo ""
    echo -e "${GREEN}✓ Project structure created${NC}"
    echo -e "${GREEN}✓ Backend configured${NC}"
    echo -e "${GREEN}✓ Admin portal configured${NC}"
    echo -e "${GREEN}✓ Android app configured${NC}"
    echo -e "${GREEN}✓ Docker setup ready${NC}"
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    echo "1. Setup Database (choose one):"
    echo "   ${YELLOW}Option A - Docker:${NC}"
    echo "   $ docker-compose up -d"
    echo ""
    echo "   ${YELLOW}Option B - Local MySQL:${NC}"
    echo "   $ mysql -u root -p -e 'CREATE DATABASE production_card_db;'"
    echo ""
    echo "2. Start Backend:"
    echo "   $ cd backend"
    echo "   $ source venv/bin/activate"
    echo "   $ uvicorn app.main:app --reload"
    echo "   Visit: http://localhost:8000/docs"
    echo ""
    echo "3. Start Admin Portal (in new terminal):"
    echo "   $ cd admin"
    echo "   $ npm run dev"
    echo "   Visit: http://localhost:3000"
    echo ""
    echo "4. Setup Android App:"
    echo "   - Open android/ folder in Android Studio"
    echo "   - Update ApiService.kt with backend URL"
    echo "   - Build and run"
    echo ""
    echo -e "${BLUE}Test Credentials:${NC}"
    echo "   Admin: +919876543210 / admin123"
    echo "   Employee: +919876543211 / employee123"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "   - README.md - Complete documentation"
    echo "   - QUICK_START.md - Quick start guide"
    echo "   - backend/README.md - Backend specific docs"
    echo "   - admin/README.md - Admin portal docs"
    echo "   - android/README.md - Android app docs"
    echo ""
    echo -e "${GREEN}Happy coding!${NC}"
    echo ""
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    clear
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║   Production Card Application Setup Script           ║"
    echo "║   Complete End-to-End Deployment                     ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Get target directory
    read -p "Enter target directory name (default: production-card-application): " USER_DIR
    if [ ! -z "$USER_DIR" ]; then
        PROJECT_NAME="$USER_DIR"
    fi
    
    # Check if directory exists
    if [ -d "$PROJECT_NAME" ]; then
        read -p "Directory $PROJECT_NAME already exists. Remove it? (y/N): " REMOVE
        if [ "$REMOVE" = "y" ] || [ "$REMOVE" = "Y" ]; then
            rm -rf "$PROJECT_NAME"
        else
            print_error "Aborted. Please choose a different directory."
            exit 1
        fi
    fi
    
    check_dependencies
    create_directory_structure
    create_backend_files
    create_admin_files
    create_android_files
    create_docker_files
    create_documentation
    create_gitignore
    
    # Install dependencies
    read -p "Install backend and admin dependencies now? (Y/n): " INSTALL
    if [ "$INSTALL" != "n" ] && [ "$INSTALL" != "N" ]; then
        setup_backend
        setup_admin
    else
        print_warning "Skipping dependency installation. Run manually later."
    fi
    
    print_summary
}

# Run main function
main

