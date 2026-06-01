import urllib.request
import datetime
import math
from sgp4.api import Satrec, jday

def get_iss_tle():
    """
    Downloads the current Two-Line Element (TLE) set for the International Space Station (ISS)
    from CelesTrak.
    
    Returns:
        tuple: (satellite_name, line1, line2)
    """
    url = "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
    
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as response:
        data = response.read().decode('utf-8')
        lines = [line.strip() for line in data.strip().split('\n') if line.strip()]
        
        if len(lines) < 3:
            raise ValueError(f"Unexpected TLE data format returned from CelesTrak. Expected at least 3 lines, got:\n{data}")
            
        return lines[0], lines[1], lines[2]

def gmst(jd, fr):
    """
    Calculates the Greenwich Mean Sidereal Time (GMST) in radians.
    This represents the rotation angle of the Earth's Prime Meridian relative to 
    the vernal equinox (fixed star reference frame) at the specified Julian date.
    """
    # Calculate time in Julian centuries since the J2000.0 epoch
    t = ((jd + fr) - 2451545.0) / 36525.0
    
    # IAU 1982 formula for GMST in seconds of time
    gmst_seconds = (24110.54841 + 
                    8640184.812866 * t + 
                    0.093104 * (t ** 2) - 
                    6.2e-6 * (t ** 3))
    
    # Convert seconds of time to radians (2 * pi radians = 86400 seconds in a day)
    gmst_radians = (gmst_seconds * (2.0 * math.pi / 86400.0)) % (2.0 * math.pi)
    
    return gmst_radians

def teme_to_ecef(x, y, z, jd, fr):
    """
    Rotates a position vector from the TEME (ECI) coordinate frame to the 
    ECEF (Earth-Centered, Earth-Fixed) coordinate frame using the GMST angle.
    """
    theta = gmst(jd, fr)
    
    cos_theta = math.cos(theta)
    sin_theta = math.sin(theta)
    
    # Apply rotation about the Z-axis (rotation of the Earth)
    ecef_x = x * cos_theta + y * sin_theta
    ecef_y = -x * sin_theta + y * cos_theta
    ecef_z = z
    
    return ecef_x, ecef_y, ecef_z

def ecef_to_geodetic(x, y, z):
    """
    Converts ECEF coordinates (x, y, z) in kilometers into Geodetic coordinates
    (latitude in degrees, longitude in degrees, altitude in kilometers)
    using the standard WGS84 ellipsoid parameters and Bowring's closed-form algorithm.
    """
    # WGS84 Ellipsoid constants
    a = 6378.137          # Semi-major axis (radius at equator in km)
    f = 1.0 / 298.257223563 # Flattening factor
    b = a * (1.0 - f)     # Semi-minor axis (radius at poles in km)
    
    e2 = 1.0 - (b**2 / a**2)       # First eccentricity squared
    ep2 = (a**2 - b**2) / b**2     # Second eccentricity squared
    
    p = math.sqrt(x**2 + y**2)     # Ground distance from rotational axis
    
    # Handle the North and South poles to prevent division by zero
    if p < 1e-10:
        lat = 90.0 if z > 0 else -90.0
        lon = 0.0
        alt = abs(z) - b
        return lat, lon, alt
        
    # Bowring's algorithm calculation steps
    theta = math.atan2(z * a, p * b)
    
    lat = math.atan2(
        z + ep2 * b * (math.sin(theta)**3),
        p - e2 * a * (math.cos(theta)**3)
    )
    
    lon = math.atan2(y, x)
    
    # Radius of curvature in the prime vertical
    N = a / math.sqrt(1.0 - e2 * (math.sin(lat)**2))
    
    # Calculate altitude above WGS84 ellipsoid
    alt = p / math.cos(lat) - N
    
    # Convert radians to degrees
    lat_deg = math.degrees(lat)
    lon_deg = math.degrees(lon)
    
    # Wrap longitude to the standard range of [-180, 180]
    lon_deg = (lon_deg + 180) % 360 - 180
    
    return lat_deg, lon_deg, alt

def get_iss_path(l1, l2, start_time, duration_minutes=60):
    """
    Propagates the orbit and converts coordinates from ECI to Geodetic (Lat, Lon, Alt).
    """
    satellite = Satrec.twoline2rv(l1, l2)
    geodetic_results = []
    
    for i in range(duration_minutes + 1):
        future_time = start_time + datetime.timedelta(minutes=i)
        
        # Get Julian date
        jd, fr = jday(
            future_time.year, 
            future_time.month, 
            future_time.day, 
            future_time.hour, 
            future_time.minute, 
            future_time.second + future_time.microsecond / 1e6
        )
        
        # Propagate to get TEME (ECI) coordinates in km
        error_code, position, velocity = satellite.sgp4(jd, fr)
        
        if error_code != 0:
            raise RuntimeError(f"SGP4 propagation failed at +{i} minutes with error code: {error_code}")
            
        # 1. TEME (ECI) -> ECEF
        ecef_x, ecef_y, ecef_z = teme_to_ecef(position[0], position[1], position[2], jd, fr)
        
        # 2. ECEF -> Geodetic (Lat, Lon, Alt)
        lat, lon, alt = ecef_to_geodetic(ecef_x, ecef_y, ecef_z)
        
        geodetic_results.append({
            "timestamp": future_time,
            "latitude": lat,
            "longitude": lon,
            "altitude": alt
        })
        
    return geodetic_results

def main():
    print("==========================================================")
    print("     DEBRISNET - Day 2: ECI to Geodetic Coordinate conversion ")
    print("==========================================================")
    
    try:
        # Step 1: Download TLE data
        print("\n[1/3] Fetching ISS TLE parameters...")
        sat_name, l1, l2 = get_iss_tle()
        print(f"      Successfully downloaded TLE for: {sat_name}")
        
        # Step 2: Set current time in UTC
        now = datetime.datetime.now(datetime.timezone.utc)
        print(f"      Start Epoch (UTC): {now.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Step 3: Run orbital propagation and geodetic conversion
        print("\n[2/3] Propagating & converting TEME (ECI) to Geodetic format...")
        converted_positions = get_iss_path(l1, l2, now, duration_minutes=60)
        
        # Step 4: Display Results
        print("\n[3/3] Success! Orbit conversion complete.")
        print(f"      Total positions converted: {len(converted_positions)}")
        
        print("\nFirst 5 Geodetic Positions (Lat, Lon, Alt):")
        print("--------------------------------------------------------------------------------------")
        print(f"{'Step':<5} | {'Timestamp (UTC)':<20} | {'Latitude (deg)':<16} | {'Longitude (deg)':<16} | {'Altitude (km)':<14}")
        print("--------------------------------------------------------------------------------------")
        for idx, pos in enumerate(converted_positions[:5]):
            ts_str = pos["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            print(f"+{idx:<4} | {ts_str:<20} | {pos['latitude']:>+14.6f}° | {pos['longitude']:>+14.6f}° | {pos['altitude']:>11.3f} km")
        print("--------------------------------------------------------------------------------------")
        
        # Explanation of Reference Frames
        print("\n==========================================================")
        print("   Understanding the Coordinate Reference Frames          ")
        print("==========================================================")
        print("1. Earth-Centered Inertial (ECI / TEME):")
        print("   - This frame does NOT rotate with the Earth. The X-axis points")
        print("     permanently toward a fixed point in the cosmos (Vernal Equinox).")
        print("   - Crucial for orbital physics because Newton's equations of motion")
        print("     only hold true in non-rotating (inertial) frames.")
        print("   - A satellite resting in ECI coordinates would appear stationary")
        print("     relative to the stars, but the Earth would spin beneath it.")
        print("\n2. Geodetic Coordinates (Latitude, Longitude, Altitude):")
        print("   - This frame is tied to an Earth-Centered, Earth-Fixed (ECEF) system")
        print("     that rotates with the Earth.")
        print("   - Latitude (North/South angle from equator) and Longitude (East/West")
        print("     angle from prime meridian) tell us exactly where the satellite is")
        print("     above the Earth's surface.")
        print("   - Altitude is the vertical distance in km above the reference WGS84")
        print("     ellipsoid (which models the Earth's squashed shape).")
        print("==========================================================")
        
    except urllib.error.URLError as e:
        print(f"\n[ERROR] Network error: Failed to connect to CelesTrak.")
        print(f"        Details: {e.reason}")
    except ValueError as e:
        print(f"\n[ERROR] Data format error.")
        print(f"        Details: {e}")
    except RuntimeError as e:
        print(f"\n[ERROR] Propagation model error.")
        print(f"        Details: {e}")
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred.")
        print(f"        Details: {e}")

if __name__ == "__main__":
    main()
