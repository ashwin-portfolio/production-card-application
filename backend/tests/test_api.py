"""
Comprehensive API Testing Script
Run with: python -m pytest tests/test_api.py -v
Or: python tests/test_api.py
"""
import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8000"
TEST_PHONE = "+919876543210"  # Admin user
TEST_PASSWORD = "admin123"
TEST_EMPLOYEE_PHONE = "+919876543211"  # Employee
TEST_EMPLOYEE_PASSWORD = "employee123"

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.user_data: Optional[dict] = None
        
    def test_root_endpoint(self):
        """Test root endpoint"""
        print("\n[TEST] Root Endpoint")
        response = requests.get(f"{self.base_url}/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Root endpoint working")
        return True
        
    def test_health_check(self):
        """Test health check endpoint"""
        print("\n[TEST] Health Check")
        response = requests.get(f"{self.base_url}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check working")
        return True
        
    def test_login(self, phone: str = TEST_PHONE, password: str = TEST_PASSWORD):
        """Test login endpoint"""
        print("\n[TEST] Login Endpoint")
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"phone": phone, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("requires_otp"):
                print("✓ Login successful - OTP required")
                self.user_data = data.get("user")
                return "otp_required"
            else:
                self.token = data.get("access_token")
                self.user_data = data.get("user")
                print(f"✓ Login successful - Token: {self.token[:20]}...")
                return "success"
        else:
            print(f"✗ Login failed: {response.status_code} - {response.text}")
            return False
            
    def test_verify_otp(self, phone: str, otp: str = "123456"):
        """Test OTP verification (mock OTP for testing)"""
        print("\n[TEST] OTP Verification")
        # Note: In production, you'd get OTP from SMS
        # For testing, check the backend logs or use a test OTP
        response = requests.post(
            f"{self.base_url}/api/auth/verify-otp",
            json={"phone": phone, "otp": otp}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            print(f"✓ OTP verified - Token: {self.token[:20]}...")
            return True
        else:
            print(f"✗ OTP verification failed: {response.status_code} - {response.text}")
            return False
            
    def test_get_my_cards(self):
        """Test getting user's cards"""
        print("\n[TEST] Get My Cards")
        if not self.token:
            print("✗ No token available")
            return False
            
        response = requests.get(
            f"{self.base_url}/api/cards/my",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        if response.status_code == 200:
            cards = response.json()
            print(f"✓ Retrieved {len(cards)} cards")
            return True
        else:
            print(f"✗ Failed to get cards: {response.status_code} - {response.text}")
            return False
            
    def test_get_card_details(self, card_id: int = 1):
        """Test getting card details"""
        print("\n[TEST] Get Card Details")
        if not self.token:
            print("✗ No token available")
            return False
            
        response = requests.get(
            f"{self.base_url}/api/cards/{card_id}",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        if response.status_code == 200:
            card = response.json()
            print(f"✓ Card details retrieved: {card.get('card_number')}")
            return True
        else:
            print(f"✗ Failed to get card details: {response.status_code} - {response.text}")
            return False
            
    def test_admin_dashboard(self):
        """Test admin dashboard endpoint"""
        print("\n[TEST] Admin Dashboard")
        if not self.token:
            print("✗ No token available")
            return False
            
        response = requests.get(
            f"{self.base_url}/api/admin/dashboard",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        if response.status_code == 200:
            dashboard = response.json()
            print(f"✓ Dashboard data retrieved: {dashboard}")
            return True
        else:
            print(f"✗ Failed to get dashboard: {response.status_code} - {response.text}")
            return False
            
    def test_register_device(self, device_hash: str = "test_device_hash_123"):
        """Test device registration"""
        print("\n[TEST] Device Registration")
        if not self.token:
            print("✗ No token available")
            return False
            
        response = requests.post(
            f"{self.base_url}/api/devices/register",
            data={"device_hash": device_hash},
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Device registered: {data.get('message')}")
            return True
        else:
            print(f"✗ Device registration failed: {response.status_code} - {response.text}")
            return False
            
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("PRODUCTION CARD API TEST SUITE")
        print("=" * 60)
        
        results = []
        
        # Basic endpoint tests
        results.append(("Root Endpoint", self.test_root_endpoint()))
        results.append(("Health Check", self.test_health_check()))
        
        # Authentication tests
        login_result = self.test_login()
        if login_result == "otp_required":
            print("\n⚠ OTP required - skipping token-based tests")
            print("  Note: For full testing, verify OTP first")
        elif login_result == "success":
            # Card tests
            results.append(("Get My Cards", self.test_get_my_cards()))
            results.append(("Get Card Details", self.test_get_card_details()))
            
            # Admin tests (if admin user)
            if self.user_data and self.user_data.get("role") == "admin":
                results.append(("Admin Dashboard", self.test_admin_dashboard()))
            
            # Device tests
            results.append(("Device Registration", self.test_register_device()))
        
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        passed = sum(1 for _, result in results if result is True)
        total = len(results)
        for test_name, result in results:
            status = "✓ PASS" if result is True else "✗ FAIL" if result is False else "⚠ SKIP"
            print(f"{status}: {test_name}")
        
        print(f"\nTotal: {passed}/{total} tests passed")
        return passed == total

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests()

