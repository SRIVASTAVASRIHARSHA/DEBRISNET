import requests

def fetch_satellite_data():
    # Primary URL (Official CelesTrak API)
    primary_url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
    
    # Fallback Mirror URL (GitHub Gpredict satdata mirror - highly reliable and bypasses 403 blocks)
    fallback_url = "https://raw.githubusercontent.com/csete/gpredict/master/data/satdata/satellites.dat"
    
    print("Starting satellite download...")
    print(f"Primary Target: {primary_url}")
    
    # Define a modern User-Agent header to avoid basic scraping blocks
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        # Attempt to get data from CelesTrak
        response = requests.get(primary_url, headers=headers, timeout=10)
        print(f"Primary HTTP Status Code: {response.status_code}")
        
        # If CelesTrak blocks or fails, raise an exception to trigger the fallback
        response.raise_for_status()
        
        data = response.text
        print(f"Success! Number of characters received from CelesTrak: {len(data)}")
        print_tle_preview(data)
        
    except (requests.exceptions.HTTPError, requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
        print(f"\n[NOTICE] Primary request failed or was blocked by CelesTrak's strict rate limits (Error: {e}).")
        print("Initiating automatic fallback to the satellite database mirror...")
        print(f"Fallback Target: {fallback_url}")
        
        try:
            # Attempt to get data from the highly available GitHub mirror
            response = requests.get(fallback_url, timeout=10)
            print(f"Fallback HTTP Status Code: {response.status_code}")
            response.raise_for_status()
            
            # Format the .dat file content into standard TLE lines for preview
            data = format_dat_to_tle(response.text)
            print(f"Success! Number of characters received from mirror: {len(data)}")
            print_tle_preview(data)
            
        except Exception as fallback_err:
            print(f"\n[ERROR] Both CelesTrak and the backup mirror failed. Details: {fallback_err}")
            print("Please check your internet connection or try again later.")

def print_tle_preview(data):
    """Prints a neat visual preview of the first 1000 characters of TLE data."""
    print("\n--- FIRST 1000 CHARACTERS OF TLE DATA ---")
    print(data[:1000])
    print("-----------------------------------------\n")
    print("Download completed successfully!")

def format_dat_to_tle(dat_text):
    """
    Parses Gpredict's .dat file format and converts it to standard TLE lines
    so the format matches the exact CelesTrak TLE specification.
    """
    tle_lines = []
    current_name = None
    current_tle1 = None
    current_tle2 = None
    
    for line in dat_text.splitlines():
        line = line.strip()
        if line.startswith("NAME="):
            current_name = line.split("=", 1)[1]
        elif line.startswith("TLE1="):
            current_tle1 = line.split("=", 1)[1]
        elif line.startswith("TLE2="):
            current_tle2 = line.split("=", 1)[1]
            
        # Once we have all three components, build standard TLE format
        if current_name and current_tle1 and current_tle2:
            tle_lines.append(f"{current_name}")
            tle_lines.append(current_tle1)
            tle_lines.append(current_tle2)
            current_name = None
            current_tle1 = None
            current_tle2 = None
            
    return "\n".join(tle_lines)

if __name__ == "__main__":
    fetch_satellite_data()
