'''conjunction_service

Utility module for calculating distances between satellite positions.

Provides:
- calculate_distance(position_a, position_b): Compute 3D Euclidean distance (km).
- find_closest_approach(orbit_a, orbit_b): Find the minimum distance between two orbits.

The module is intentionally lightweight and independent, ready to be imported by
orbit_service, FastAPI routes, or the risk engine.
'''

import math
from math import sqrt
from typing import Mapping, Any


def _validate_position(pos: Mapping[str, Any], name: str) -> tuple[float, float, float]:
    """Validate that a position mapping contains numeric x, y, z keys.

    Args:
        pos: Mapping with keys 'x', 'y', 'z'.
        name: Identifier used in error messages.

    Returns:
        Tuple of (x, y, z) as floats.

    Raises:
        ValueError: If the required keys are missing or values are not numbers.
    """
    required_keys = ('x', 'y', 'z')
    for k in required_keys:
        if k not in pos:
            raise ValueError(f"{name} is missing required key '{k}'.")
        try:
            # Cast to float to ensure numeric type
            value = float(pos[k])
        except (TypeError, ValueError):
            raise ValueError(f"{name} key '{k}' must be a numeric value.")
        # Replace the value in the dict for consistency (optional)
        pos[k] = value
    return pos['x'], pos['y'], pos['z']


def calculate_distance(position_a: Mapping[str, Any], position_b: Mapping[str, Any]) -> float:
    """Calculate the 3‑D Euclidean distance between two positions.

    Both inputs must be mappings (e.g., dict) containing numeric ``x``, ``y`` and ``z``
    coordinates expressed in kilometers. The function returns the straight‑line distance
    in kilometers.

    Example::

        distance = calculate_distance({"x": 7000, "y": 0, "z": 0},
                                      {"x": 0, "y": 0, "z": 0})

    Args:
        position_a: Mapping with keys ``x``, ``y``, ``z`` for the first object.
        position_b: Mapping with keys ``x``, ``y``, ``z`` for the second object.

    Returns:
        The Euclidean distance (km) as a float.

    Raises:
        ValueError: If either input is missing required keys or contains non‑numeric values.
    """
    # Validate and extract coordinates
    x1, y1, z1 = _validate_position(position_a, "position_a")
    x2, y2, z2 = _validate_position(position_b, "position_b")

    # Compute distance
    distance = sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)
    return distance


def find_closest_approach(orbit_a: list[Mapping[str, Any]], orbit_b: list[Mapping[str, Any]]) -> dict[str, Any]:
    """Finds the closest approach between two orbit paths by comparing them timestep by timestep.

    Args:
        orbit_a: A list of mappings, where each mapping contains 'timestamp', 'x', 'y', 'z'.
        orbit_b: A list of mappings, where each mapping contains 'timestamp', 'x', 'y', 'z'.

    Returns:
        A dictionary containing the closest time, minimum distance, and positions.
        
    Raises:
        ValueError: If orbits are empty, have mismatched lengths, or missing coordinates.
    """
    if not orbit_a or not orbit_b:
        raise ValueError("Orbit paths cannot be empty.")
    
    if len(orbit_a) != len(orbit_b):
        raise ValueError("Orbit paths must have the same length.")

    min_dist = float('inf')
    closest_time = None
    pos_a_closest = None
    pos_b_closest = None

    for pos_a, pos_b in zip(orbit_a, orbit_b):
        if 'timestamp' not in pos_a:
            raise ValueError("Position in orbit_a is missing required key 'timestamp'.")
        if 'timestamp' not in pos_b:
            raise ValueError("Position in orbit_b is missing required key 'timestamp'.")
            
        dist = calculate_distance(pos_a, pos_b)
        
        if dist < min_dist:
            min_dist = dist
            closest_time = pos_a['timestamp']
            pos_a_closest = pos_a
            pos_b_closest = pos_b

    return {
        "closest_time": closest_time,
        "minimum_distance_km": min_dist,
        "position_a": pos_a_closest,
        "position_b": pos_b_closest
    }


def geodetic_to_ecef(lat_deg: float, lon_deg: float, alt_km: float) -> tuple[float, float, float]:
    """Convert geodetic coordinates to ECEF (x, y, z) in kilometers."""
    a = 6378.137  # Earth semi-major axis in km
    f = 1.0 / 298.257223563  # Flattening factor
    b = a * (1.0 - f)
    e2 = 1.0 - (b**2 / a**2)
    
    lat = math.radians(lat_deg)
    lon = math.radians(lon_deg)
    
    N = a / math.sqrt(1 - e2 * (math.sin(lat)**2))
    
    x = (N + alt_km) * math.cos(lat) * math.cos(lon)
    y = (N + alt_km) * math.cos(lat) * math.sin(lon)
    z = (N * (1 - e2) + alt_km) * math.sin(lat)
    
    return x, y, z


def analyze_conjunction(satellite_a_id: int, satellite_b_id: int) -> dict[str, Any]:
    """
    Fetch future positions for two satellites and calculate their closest approach.
    """
    # Import here to avoid circular dependencies
    from orbit_service import get_orbit_prediction
    
    orbit_a_data = get_orbit_prediction(satellite_a_id)
    orbit_b_data = get_orbit_prediction(satellite_b_id)
    
    orbit_a_formatted = []
    for pos in orbit_a_data["positions"]:
        x, y, z = geodetic_to_ecef(pos["latitude"], pos["longitude"], pos["altitude"])
        orbit_a_formatted.append({"timestamp": pos["time"], "x": x, "y": y, "z": z})
        
    orbit_b_formatted = []
    for pos in orbit_b_data["positions"]:
        x, y, z = geodetic_to_ecef(pos["latitude"], pos["longitude"], pos["altitude"])
        orbit_b_formatted.append({"timestamp": pos["time"], "x": x, "y": y, "z": z})
        
    result = find_closest_approach(orbit_a_formatted, orbit_b_formatted)
    
    from risk_service import calculate_risk
    
    min_dist = result["minimum_distance_km"]
    
    try:
        risk_assessment = calculate_risk(min_dist)
    except Exception as e:
        risk_assessment = {"error": str(e)}
    
    conjunction_result = {
        "satellite_a": satellite_a_id,
        "satellite_b": satellite_b_id,
        "closest_approach": {
            "time": result["closest_time"],
            "distance_km": min_dist
        },
        "risk_assessment": risk_assessment
    }
    
    from mission_report_service import generate_mission_report
    try:
        mission_report = generate_mission_report(conjunction_result)
    except Exception as e:
        mission_report = {"error": f"Failed to generate report: {str(e)}"}
        
    conjunction_result["mission_report"] = mission_report
    
    from ai_analyst_service import generate_ai_analysis
    try:
        ai_analysis = generate_ai_analysis(conjunction_result)
    except Exception as e:
        ai_analysis = {"error": f"Failed to generate AI analysis: {str(e)}"}
        
    conjunction_result["ai_analysis"] = ai_analysis
    
    from avoidance_service import generate_avoidance_plan
    try:
        avoidance_plan = generate_avoidance_plan(conjunction_result)
    except Exception as e:
        avoidance_plan = {"error": f"Failed to generate avoidance plan: {str(e)}"}
        
    conjunction_result["avoidance_plan"] = avoidance_plan
    
    return conjunction_result


if __name__ == "__main__":
    # Example usage for quick sanity testing
    print("--- Testing calculate_distance ---")
    sat_a = {"x": 7000.0, "y": 0.0, "z": 0.0}
    sat_b = {"x": 0.0, "y": 0.0, "z": 0.0}
    try:
        dist = calculate_distance(sat_a, sat_b)
        print(f"Distance between objects: {dist:.3f} km")
    except ValueError as e:
        print(f"Error calculating distance: {e}")

    print("\n--- Testing find_closest_approach ---")
    orbit_1 = [
        {"timestamp": "2023-10-27T10:00:00Z", "x": 7000.0, "y": 0.0, "z": 0.0},
        {"timestamp": "2023-10-27T10:01:00Z", "x": 7010.0, "y": 10.0, "z": 5.0},
        {"timestamp": "2023-10-27T10:02:00Z", "x": 7020.0, "y": 20.0, "z": 10.0}
    ]
    orbit_2 = [
        {"timestamp": "2023-10-27T10:00:00Z", "x": 0.0, "y": 0.0, "z": 0.0},
        {"timestamp": "2023-10-27T10:01:00Z", "x": 7005.0, "y": 10.0, "z": 5.0},
        {"timestamp": "2023-10-27T10:02:00Z", "x": 1000.0, "y": 20.0, "z": 10.0}
    ]
    
    try:
        closest = find_closest_approach(orbit_1, orbit_2)
        print("Closest approach detected:")
        print(f"Time: {closest['closest_time']}")
        print(f"Distance: {closest['minimum_distance_km']:.3f} km")
        print(f"Position A: {closest['position_a']}")
        print(f"Position B: {closest['position_b']}")
    except ValueError as e:
        print(f"Error finding closest approach: {e}")
