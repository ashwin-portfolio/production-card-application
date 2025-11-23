import math
from typing import Tuple

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth
    Returns distance in meters
    """
    # Radius of Earth in meters
    R = 6371000
    
    # Convert to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

def is_within_geofence(
    user_lat: float,
    user_lon: float,
    site_lat: float,
    site_lon: float,
    max_distance_meters: int = 500
) -> Tuple[bool, float]:
    """
    Check if user location is within geofence of site
    Returns (is_within, distance_in_meters)
    """
    distance = haversine_distance(user_lat, user_lon, site_lat, site_lon)
    is_within = distance <= max_distance_meters
    return is_within, distance

