import datetime
from datetime import timezone
import requests
from sgp4.api import Satrec, jday
from skyfield.api import load, EarthSatellite, wgs84
from fastapi import HTTPException

# URLs for TLE data (same as in satellites.py)
PRIMARY_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
FALLBACK_URL = "https://raw.githubusercontent.com/csete/gpredict/master/data/satdata/satellites.dat"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def _fetch_raw_tle() -> str:
    """Fetch raw TLE catalog (fallback to mirror if needed)."""
    try:
        resp = requests.get(PRIMARY_URL, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        return resp.text
    except Exception:
        # fallback
        resp = requests.get(FALLBACK_URL, timeout=10)
        resp.raise_for_status()
        # Convert .dat to standard TLE format
        from satellites import format_dat_to_tle
        return format_dat_to_tle(resp.text)

def _find_tle_for_norad(tle_text: str, norad_id: int):
    """Return (name, line1, line2) for the requested NORAD ID or raise ValueError.

    Parses the first TLE line to extract the catalog number, handling
    classification letters and extra spaces.
    """
    lines = [ln.strip() for ln in tle_text.splitlines() if ln.strip()]
    for i in range(0, len(lines) - 2, 3):
        name = lines[i]
        line1 = lines[i + 1]
        line2 = lines[i + 2]
        parts = line1.split()
        if len(parts) > 1:
            # Extract digits from the second token (catalog number) which may contain letters
            try:
                current_id = int(''.join(filter(str.isdigit, parts[1])))
            except ValueError:
                continue
            if current_id == norad_id:
                return name, line1, line2
    raise ValueError(f"TLE for NORAD ID {norad_id} not found")

def _propagate_positions(l1: str, l2: str, start: datetime.datetime, minutes: int = 90):
    """Propagate orbit for *minutes* minutes at 1‑minute intervals.
    Returns list of (timestamp, lat, lon, alt)."""
    sat = Satrec.twoline2rv(l1, l2)
    ts = load.timescale()
    results = []
    for i in range(minutes + 1):
        future = start + datetime.timedelta(minutes=i)
        jd, fr = jday(
            future.year, future.month, future.day,
            future.hour, future.minute, future.second + future.microsecond / 1e6
        )
        err, pos, _ = sat.sgp4(jd, fr)
        if err != 0:
            raise RuntimeError(f"SGP4 propagation error {err} at +{i} minutes")
        # Convert TEME (ECI) to geodetic using skyfield
        eci_sat = EarthSatellite(l1, l2, "temp", ts)
        t = ts.utc(future)
        subpoint = eci_sat.at(t).subpoint()
        results.append((future.isoformat(), subpoint.latitude.degrees, subpoint.longitude.degrees, subpoint.elevation.km))
    return results

def get_orbit_prediction(norad_id: int):
    """Public API: return orbit prediction dict for a NORAD ID.
    Raises HTTPException on error so FastAPI can translate it.
    """
    try:
        raw_tle = _fetch_raw_tle()
        name, line1, line2 = _find_tle_for_norad(raw_tle, norad_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    start = datetime.datetime.now(timezone.utc)
    try:
        positions = _propagate_positions(line1, line2, start, minutes=90)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {
        "name": name,
        "norad_id": str(norad_id),
        "positions": [
            {"time": t, "latitude": lat, "longitude": lon, "altitude": alt}
            for t, lat, lon, alt in positions
        ]
    }
