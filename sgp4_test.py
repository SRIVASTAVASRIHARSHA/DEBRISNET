import urllib.request
import datetime
from sgp4.api import Satrec, jday

def get_iss_tle():
    """
    Downloads the current Two-Line Element (TLE) set for the International Space Station (ISS)
    from CelesTrak.
    
    Returns:
        tuple: (satellite_name, line1, line2)
    """
    # CelesTrak URL to get the ISS TLE data in 3-line format.
    # CATNR=25544 is the NORAD Catalog Number for the ISS.
    # FORMAT=tle specifies the TLE format.
    url = "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
    
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as response:
        # Read the raw byte data and decode it to string format
        data = response.read().decode('utf-8')
        
        # Split the string by newlines and strip whitespace
        lines = [line.strip() for line in data.strip().split('\n') if line.strip()]
        
        if len(lines) < 3:
            raise ValueError(f"Unexpected TLE data format returned from CelesTrak. Expected at least 3 lines, got:\n{data}")
            
        # The 3-line TLE format contains:
        # Line 0: Satellite Name
        # Line 1: TLE Line 1
        # Line 2: TLE Line 2
        satellite_name = lines[0]
        line1 = lines[1]
        line2 = lines[2]
        
        return satellite_name, line1, line2

def main():
    print("==================================================")
    print("      DEBRISNET - Day 2: SGP4 Integration          ")
    print("==================================================")
    
    try:
        # Step 1: Download TLE data
        print("\n[1/4] Fetching current ISS TLE data from CelesTrak...")
        sat_name, l1, l2 = get_iss_tle()
        print(f"      Successfully retrieved TLE for: {sat_name}")
        print(f"      Line 1: {l1}")
        print(f"      Line 2: {l2}")
        
        # Step 2: Parse the TLE using the SGP4 library
        print("\n[2/4] Parsing TLE data...")
        satellite = Satrec.twoline2rv(l1, l2)
        
        # Step 3: Get current UTC time and convert to Julian date format
        print("\n[3/4] Calculating current satellite state...")
        # Get the current time in UTC
        now = datetime.datetime.now(datetime.timezone.utc)
        print(f"      Current UTC Time: {now.strftime('%Y-%m-%d %H:%M:%S.%f')}")
        
        # Convert UTC time into Julian Date (jd) and fractional day (fr) as required by SGP4
        jd, fr = jday(
            now.year, 
            now.month, 
            now.day, 
            now.hour, 
            now.minute, 
            now.second + now.microsecond / 1e6
        )
        
        # Step 4: Propagate the orbit to get current position and velocity vectors
        # sgp4 returns:
        #   error_code: 0 if propagation succeeded, or a non-zero error code if it failed
        #   position: a 3-element tuple (x, y, z) representing the position vector in km
        #   velocity: a 3-element tuple (vx, vy, vz) representing the velocity vector in km/s
        error_code, position, velocity = satellite.sgp4(jd, fr)
        
        if error_code != 0:
            raise RuntimeError(f"SGP4 propagation failed with error code: {error_code}")
            
        x, y, z = position
        
        # Step 5: Print the results
        print("\n[4/4] Output Results:")
        print("--------------------------------------------------")
        print(f"  Satellite Name : {sat_name}")
        print(f"  X Coordinate   : {x:+.4f} km")
        print(f"  Y Coordinate   : {y:+.4f} km")
        print(f"  Z Coordinate   : {z:+.4f} km")
        print("--------------------------------------------------")
        
        # Explanation of coordinates
        print("\n==================================================")
        print("   What do these X, Y, and Z coordinates mean?    ")
        print("==================================================")
        print("The coordinates are expressed in the TEME (True Equator,")
        print("Mean Equinox) reference frame, which is a geocentric")
        # geocentric means Earth-centered
        print("inertial coordinate system:")
        print("- Origin (0,0,0): Located at the Earth's center of mass.")
        print("- X-Axis: Points towards the First Point of Aries (vernal equinox).")
        print("- Y-Axis: Lies in the Earth's equatorial plane, 90 degrees east of the X-axis.")
        print("- Z-Axis: Points along the Earth's rotational axis towards the North Pole.")
        print("- Distance Unit: All coordinates are measured in kilometers (km).")
        print("==================================================")
        
    except urllib.error.URLError as e:
        print(f"\n[ERROR] Network error: Failed to connect to CelesTrak.")
        print(f"        Details: {e.reason}")
    except ValueError as e:
        print(f"\n[ERROR] Data format error.")
        print(f"        Details: {e}")
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred.")
        print(f"        Details: {e}")

if __name__ == "__main__":
    main()
