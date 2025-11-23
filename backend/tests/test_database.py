"""
Database Testing Script
Tests database connectivity, migrations, and sample data
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, init_db
from app.db import models
from app.core.security import verify_password

def test_database_connection():
    """Test database connection"""
    print("\n[TEST] Database Connection")
    try:
        db = SessionLocal()
        # Try a simple query
        result = db.query(models.User).first()
        db.close()
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def test_database_tables():
    """Test that all tables exist"""
    print("\n[TEST] Database Tables")
    try:
        db = SessionLocal()
        # Check if tables exist by querying them
        user_count = db.query(models.User).count()
        site_count = db.query(models.Site).count()
        card_count = db.query(models.ProductionCard).count()
        db.close()
        
        print(f"✓ Tables exist - Users: {user_count}, Sites: {site_count}, Cards: {card_count}")
        return True
    except Exception as e:
        print(f"✗ Table check failed: {e}")
        return False

def test_sample_users():
    """Test sample user data"""
    print("\n[TEST] Sample Users")
    try:
        db = SessionLocal()
        
        # Check admin user
        admin = db.query(models.User).filter(models.User.phone == "+919876543210").first()
        if admin:
            # Verify password
            password_valid = verify_password("admin123", admin.password_hash)
            print(f"✓ Admin user found - Password valid: {password_valid}")
        else:
            print("✗ Admin user not found")
            db.close()
            return False
        
        # Check employee users (enum is EMPLOYEE in uppercase)
        employees = db.query(models.User).filter(models.User.role == models.UserRole.EMPLOYEE).all()
        print(f"✓ Found {len(employees)} employee users")
        if employees:
            for emp in employees[:3]:
                print(f"  - {emp.name} ({emp.phone})")
        
        db.close()
        return True
    except Exception as e:
        print(f"✗ Sample user test failed: {e}")
        return False

def test_sample_cards():
    """Test sample production cards"""
    print("\n[TEST] Sample Production Cards")
    try:
        db = SessionLocal()
        cards = db.query(models.ProductionCard).all()
        print(f"✓ Found {len(cards)} production cards")
        
        if cards:
            for card in cards[:3]:  # Show first 3
                print(f"  - {card.card_number} (Status: {card.status})")
        
        db.close()
        return True
    except Exception as e:
        print(f"✗ Sample cards test failed: {e}")
        return False

def run_all_tests():
    """Run all database tests"""
    print("=" * 60)
    print("DATABASE TEST SUITE")
    print("=" * 60)
    
    # Initialize database
    print("\n[INIT] Initializing database...")
    try:
        init_db()
        print("✓ Database initialization successful")
    except Exception as e:
        print(f"⚠ Database initialization warning: {e}")
    
    results = []
    results.append(("Database Connection", test_database_connection()))
    results.append(("Database Tables", test_database_tables()))
    results.append(("Sample Users", test_sample_users()))
    results.append(("Sample Cards", test_sample_cards()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    return passed == total

if __name__ == "__main__":
    run_all_tests()

