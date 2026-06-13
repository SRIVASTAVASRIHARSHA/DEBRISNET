from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from orbit_service import get_orbit_prediction
from conjunction_service import analyze_conjunction

# 1. Create a FastAPI application instance
app = FastAPI(
    title="DebrisNet API",
    description="Starter backend for the DebrisNet space debris tracking application.",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://debrisnet.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Define the GET root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to DebrisNet"
    }

# 3. Define the GET health endpoint
@app.get("/health")
def read_health():
    return {
        "status": "running"
    }

# Helper function to convert Gpredict's .dat format to TLE format
def format_dat_to_tle(dat_text):
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
            
        if current_name and current_tle1 and current_tle2:
            tle_lines.append(f"{current_name}")
            tle_lines.append(current_tle1)
            tle_lines.append(current_tle2)
            current_name = None
            current_tle1 = None
            current_tle2 = None
            
    return "\n".join(tle_lines)

# Helper function to parse raw TLE text into a list of dictionaries with satellite names
def parse_tle_to_satellites(tle_text):
    satellites = []
    # Split by line and strip spaces, filtering out completely empty lines
    lines = [line.strip() for line in tle_text.splitlines() if line.strip()]
    
    # A standard TLE set comes in blocks of 3 lines:
    # Line 0: Satellite Name
    # Line 1: TLE Line 1 (starts with '1 ')
    # Line 2: TLE Line 2 (starts with '2 ')
    for i in range(0, len(lines) - 2, 3):
        name = lines[i]
        line1 = lines[i+1]
        line2 = lines[i+2]
        
        # Verify this is a valid TLE block before adding
        if line1.startswith("1 ") and line2.startswith("2 "):
            try:
                raw_id = line1.split()[1]
                norad_id = int(''.join(filter(str.isdigit, raw_id)))
            except Exception:
                continue
            
            satellites.append({
                "name": name,
                "norad_id": norad_id,
                "tle_line1": line1,
                "tle_line2": line2
            })
            
    return satellites

# 4. Define the GET satellites endpoint
@app.get("/api/satellites")
def get_satellites():
    primary_url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
    fallback_url = "https://raw.githubusercontent.com/csete/gpredict/master/data/satdata/satellites.dat"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        # Try fetching from CelesTrak
        response = requests.get(primary_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse the raw TLE text into a structured JSON list of satellite dictionaries
        satellites_list = parse_tle_to_satellites(response.text)
        return satellites_list
        
    except Exception:
        # If CelesTrak fails, fallback to the GitHub mirror
        try:
            response = requests.get(fallback_url, timeout=10)
            response.raise_for_status()
            
            # Format the .dat file content into standard TLE lines
            formatted_data = format_dat_to_tle(response.text)
            
            # Parse the formatted TLE data into a structured JSON list
            satellites_list = parse_tle_to_satellites(formatted_data)
            return satellites_list
            
        except Exception as fallback_error:
            # If both fail, return a descriptive error JSON
            return {
                "status": "error",
                "message": "Failed to fetch satellite data from both CelesTrak and the backup mirror.",
                "details": str(fallback_error)
            }

@app.get("/api/orbit/{norad_id}")
def get_orbit(norad_id: int):
    """
    Return predicted orbit positions for a satellite identified by NORAD ID.
    """
    return get_orbit_prediction(norad_id)

from pydantic import BaseModel

class ConjunctionRequest(BaseModel):
    primary_id: int
    secondary_id: int
    prediction_hours: int = 24
    timezone: str = "UTC"

@app.post("/api/conjunction")
async def post_conjunction(req: ConjunctionRequest):
    """
    Analyze the future conjunction between two satellites.
    """
    # Log incoming request for debugging
    print("Conjunction request received:", req.dict())
    try:
        from conjunction_service import analyze_future_conjunction
        # Pass timezone if needed; currently not used in backend logic
        return analyze_future_conjunction(req.primary_id, req.secondary_id, req.prediction_hours)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/conjunction/{satellite_a}/{satellite_b}")
def get_conjunction(satellite_a: int, satellite_b: int):
    """
    Analyze the conjunction (closest approach) between two satellites.
    """
    try:
        return analyze_conjunction(satellite_a, satellite_b)
    except HTTPException:
        # Re-raise HTTP exceptions from orbit_service
        raise
    except ValueError as e:
        # e.g., mismatched list lengths, empty lists
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status")
def get_status():
    return {
        "modules": [
            {"name": "SYSTEM", "status": "ONLINE"},
            {"name": "DATA SOURCE", "status": "LIVE TLE"},
            {"name": "ENGINE", "status": "SGP4 ACTIVE"}
        ]
    }
