"""
Geofencing Logic Testing
Tests the Haversine formula and geofence validation
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.geofence import is_within_geofence

def test_geofence_within_range():
    """Test geofence with valid coordinates"""
    print("\n[TEST] Geofence - Within Range")
    
    # Site location (Chennai)
    site_lat = 13.0827
    site_lon = 80.2707
    
    # User location (within 500m)
    user_lat = 13.0830
    user_lon = 80.2710
    
    is_valid, distance = is_within_geofence(
        user_lat, user_lon,
        site_lat, site_lon,
        max_distance_meters=500
    )
    
    if is_valid:
        print(f"✓ Location valid - Distance: {distance:.2f}m")
        return True
    else:
        print(f"✗ Location invalid - Distance: {distance:.2f}m")
        return False

def test_geofence_outside_range():
    """Test geofence with coordinates outside range"""
    print("\n[TEST] Geofence - Outside Range")
    
    # Site location (Chennai)
    site_lat = 13.0827
    site_lon = 80.2707
    
    # User location (far away - Bangalore)
    user_lat = 12.9716
    user_lon = 77.5946
    
    is_valid, distance = is_within_geofence(
        user_lat, user_lon,
        site_lat, site_lon,
        max_distance_meters=500
    )
    
    if not is_valid:
        print(f"✓ Correctly rejected - Distance: {distance/1000:.2f}km")
        return True
    else:
        print(f"✗ Should have been rejected - Distance: {distance/1000:.2f}km")
        return False

def test_geofence_exact_location():
    """Test geofence with exact same coordinates"""
    print("\n[TEST] Geofence - Exact Location")
    
    site_lat = 13.0827
    site_lon = 80.2707
    
    is_valid, distance = is_within_geofence(
        site_lat, site_lon,
        site_lat, site_lon,
        max_distance_meters=500
    )
    
    if is_valid and distance < 1:
        print(f"✓ Exact location valid - Distance: {distance:.2f}m")
        return True
    else:
        print(f"✗ Exact location test failed - Distance: {distance:.2f}m")
        return False

def run_all_tests():
    """Run all geofence tests"""
    print("=" * 60)
    print("GEOFENCING TEST SUITE")
    print("=" * 60)
    
    results = []
    results.append(("Within Range", test_geofence_within_range()))
    results.append(("Outside Range", test_geofence_outside_range()))
    results.append(("Exact Location", test_geofence_exact_location()))
    
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

