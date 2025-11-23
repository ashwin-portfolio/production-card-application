# Testing Guide - Phase 6

This guide covers comprehensive testing for the Production Card Application.

## Prerequisites

1. **MySQL Database Running**
   ```bash
   docker-compose up -d db
   # Or use local MySQL
   ```

2. **Backend Server Running**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

3. **Admin Portal Running** (for frontend testing)
   ```bash
   cd admin
   npm run dev
   ```

## Backend Testing

### 1. Geofencing Tests ✅

Test the Haversine formula for GPS validation:

```bash
cd backend
source venv/bin/activate
python tests/test_geofence.py
```

**Expected Results:**
- ✓ Within Range: Validates locations within 500m
- ✓ Outside Range: Rejects locations outside 500m
- ✓ Exact Location: Handles exact coordinates

### 2. Database Tests

Test database connectivity and sample data:

```bash
cd backend
source venv/bin/activate
python tests/test_database.py
```

**Expected Results:**
- ✓ Database connection successful
- ✓ All tables exist
- ✓ Sample users loaded (admin + employees)
- ✓ Sample production cards loaded

### 3. API Endpoint Tests

Test all API endpoints:

```bash
cd backend
source venv/bin/activate
# Install requests if needed
pip install requests
python tests/test_api.py
```

**Endpoints Tested:**
- GET `/` - Root endpoint
- GET `/health` - Health check
- POST `/api/auth/login` - User login
- POST `/api/auth/verify-otp` - OTP verification
- GET `/api/cards/my` - Get user's cards
- GET `/api/cards/{id}` - Get card details
- GET `/api/admin/dashboard` - Admin dashboard
- POST `/api/devices/register` - Device registration

### 4. Manual API Testing with Swagger

1. Start backend server
2. Open browser: http://localhost:8000/docs
3. Test endpoints interactively:
   - **Login**: Use phone `+919876543210`, password `admin123`
   - **Get Cards**: Use the token from login
   - **Admin Dashboard**: Test admin endpoints

### 5. OTP Testing

OTP is generated but sent via mock SMS service. Check backend logs for OTP:

```bash
# In backend terminal, you'll see:
# "Mock SMS: Sending OTP 123456 to +919876543210"
```

Use the OTP from logs to test `/api/auth/verify-otp`.

## Admin Portal Testing

### 1. Login Flow

1. Open http://localhost:3000
2. Enter credentials:
   - Phone: `+919876543210`
   - Password: `admin123`
3. Verify redirect to dashboard

### 2. Dashboard

- Check if stats are displayed
- Verify card counts
- Check submission statistics

### 3. Rebind Requests

- Test device rebind request approval
- Verify request list updates

### 4. CSV Export

- Click export button
- Verify CSV file downloads
- Check data format

### 5. Card Assignment

- Assign card to employee
- Verify assignment in database
- Check employee can see card

## Android Testing

### Prerequisites

1. Android Studio installed
2. Emulator or physical device
3. Backend running and accessible

### 1. Login Flow

1. Launch app
2. Enter phone and password
3. Verify OTP screen appears
4. Enter OTP (check backend logs)
5. Verify dashboard loads

### 2. Root Detection

- Test on rooted device (should block access)
- Test on non-rooted device (should work)

### 3. Location Permissions

- Grant location permission
- Verify GPS coordinates captured
- Test card submission with location

### 4. Card Listing

- Verify assigned cards appear
- Check card details view
- Test card submission

### 5. Device Binding

- First login should register device
- Login on new device should create rebind request
- Verify admin can approve rebind

## Integration Testing

### Complete User Flow

1. **Employee Login**
   - Phone: `+919876543211`
   - Password: `employee123`
   - Complete OTP verification

2. **View Cards**
   - Verify assigned cards appear
   - Check card details

3. **Submit Card**
   - Get GPS location
   - Submit card with location
   - Verify submission success

4. **Admin Review**
   - Login as admin
   - View submissions
   - Export data

## Performance Testing

### Backend Load Test

```bash
# Install Apache Bench or use curl
ab -n 100 -c 10 http://localhost:8000/health
```

### Database Query Performance

- Test with large datasets
- Verify indexes are used
- Check query execution time

## Security Testing

### 1. Authentication

- Test invalid credentials
- Test expired tokens
- Test unauthorized access

### 2. Authorization

- Test employee accessing admin endpoints
- Test accessing other users' cards
- Test device binding security

### 3. Geofencing

- Test submission outside geofence
- Test GPS spoofing attempts
- Verify distance calculations

## Deployment Testing

### 1. Docker Compose

```bash
docker-compose up -d
# Verify all services start
docker-compose ps
```

### 2. Production Build

```bash
# Backend
cd backend
docker build -t production-card-api .

# Admin Portal
cd admin
npm run build
# Test dist/ folder

# Android
cd android
./gradlew assembleRelease
# Test APK installation
```

## Test Results Summary

| Test Category | Status | Notes |
|--------------|--------|-------|
| Geofencing | ✅ Pass | All 3 tests passed |
| Database | ⚠️ Partial | Model relationship fixed |
| API Endpoints | ⚠️ Pending | Requires backend running |
| Admin Portal | ⚠️ Pending | Requires frontend testing |
| Android | ⚠️ Pending | Requires device/emulator |
| Integration | ⚠️ Pending | Full flow testing |

## Troubleshooting

### Database Connection Issues

- Check MySQL is running: `docker ps | grep mysql`
- Verify credentials in `.env`
- Check port mapping (3306 or 3307)

### API Testing Issues

- Ensure backend is running on port 8000
- Check CORS settings
- Verify token is included in headers

### OTP Issues

- Check backend logs for OTP
- Verify SMS service is configured
- Use mock OTP from logs for testing

## Next Steps

1. ✅ Complete geofencing tests
2. ⚠️ Fix database model relationships
3. ⚠️ Run full API test suite
4. ⚠️ Test admin portal functionality
5. ⚠️ Test Android app
6. ⚠️ Set up CI/CD for automated testing

