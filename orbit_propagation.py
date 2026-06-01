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
    # CelesTrak URL to retrieve the ISS TLE data in a 3-line format.
    # CATNR=25544 is the NORAD Catalog Number for the ISS.
    # FORMAT=tle specifies the TLE format.
    url = "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
    
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as response:
        # Read the raw byte data and decode it to a string
        data = response.read().decode('utf-8')
        
        # Split the string by newlines and strip whitespace
        lines = [line.strip() for line in data.strip().split('\n') if line.strip()]
        
        if len(lines) < 3:
            raise ValueError(f"Unexpected TLE data format returned from CelesTrak. Expected at least 3 lines, got:\n{data}")
            
        satellite_name = lines[0]
        line1 = lines[1]
        line2 = lines[2]
        
        return satellite_name, line1, line2

def propagate_orbit(l1, l2, start_time, duration_minutes=60):
    """
    Propagates the satellite orbit from a start time for a specified number of minutes.
    
    Parameters:
        l1 (str): TLE Line 1
        l2 (str): TLE Line 2
        start_time (datetime): The starting datetime in UTC
        duration_minutes (int): Total minutes to propagate forward
        
    Returns:
        list: A list of dictionaries containing timestamp, x, y, z coordinates
    """
    # Parse the TLE data using SGP4 Satrec
    satellite = Satrec.twoline2rv(l1, l2)
    
    propagation_results = []
    
    # We want current time (minute 0) through duration_minutes (minute 60) inclusive (61 points)
    for i in range(duration_minutes + 1):
        # Calculate the future timestamp by adding i minutes to the start time
        future_time = start_time + datetime.timedelta(minutes=i)
        
        # Convert UTC time into Julian Date (jd) and fractional day (fr) as required by SGP4
        jd, fr = jday(
            future_time.year, 
            future_time.month, 
            future_time.day, 
            future_time.hour, 
            future_time.minute, 
            future_time.second + future_time.microsecond / 1e6
        )
        
        # Propagate orbit to this step
        error_code, position, velocity = satellite.sgp4(jd, fr)
        
        if error_code != 0:
            raise RuntimeError(f"SGP4 propagation failed at +{i} minutes with error code: {error_code}")
            
        x, y, z = position
        
        # Append the calculated coordinates and timestamp to our list
        propagation_results.append({
            "timestamp": future_time,
            "x": x,
            "y": y,
            "z": z
        })
        
    return propagation_results

def main():
    print("==================================================")
    print("      DEBRISNET - Day 2: Orbit Propagation        ")
    print("==================================================")
    
    try:
        # Step 1: Download TLE data
        print("\n[1/3] Fetching current ISS TLE data from CelesTrak...")
        sat_name, l1, l2 = get_iss_tle()
        print(f"      Successfully retrieved TLE for: {sat_name}")
        
        # Step 2: Set start time to current UTC time
        now = datetime.datetime.now(datetime.timezone.utc)
        print(f"      Start Time (UTC): {now.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Step 3: Run orbit propagation
        print("\n[2/3] Propagating orbit for the next 60 minutes...")
        results = propagate_orbit(l1, l2, now, duration_minutes=60)
        
        # Step 4: Output Results
        print("\n[3/3] Success! Orbit propagated successfully.")
        print(f"      Total positions generated: {len(results)}")
        
        print("\nFirst 5 Propagated Positions:")
        print("--------------------------------------------------------------------------------------")
        print(f"{'Step':<5} | {'Timestamp (UTC)':<26} | {'X (km)':<12} | {'Y (km)':<12} | {'Z (km)':<12}")
        print("--------------------------------------------------------------------------------------")
        for idx, pos in enumerate(results[:5]):
            ts_str = pos["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            print(f"+{idx:<4} | {ts_str:<26} | {pos['x']:>+10.4f} | {pos['y']:>+10.4f} | {pos['z']:>+10.4f}")
        print("--------------------------------------------------------------------------------------")
        
        # Explanation of Orbit Propagation
        print("\n==================================================")
        print("        What is Orbit Propagation?                ")
        print("==================================================")
        print("Orbit propagation is the process of predicting the future")
        print("position and velocity of a satellite or space debris over time,")
        print("using a known starting state (the orbital elements or TLE).")
        print("\nIn this script, the SGP4 (Simplified General Perturbations 4)")
        print("mathematical model uses Kepler's laws of planetary motion while")
        print("accounting for complex real-world perturbations. These include:")
        print("- The non-spherical shape of Earth (Earth's equatorial bulge).")
        print("- Gravitational pull of the Sun and Moon.")
        print("- Atmospheric drag (slows satellites down, lowering their orbit).")
        print("- Solar radiation pressure.")
        print("\nBy computing these equations at successive time steps (every minute),")
        print("we map out the complete path the ISS will travel over the next hour.")
        print("==================================================")
        
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
