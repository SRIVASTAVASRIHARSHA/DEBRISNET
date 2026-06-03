def generate_mission_report(conjunction_data: dict) -> dict:
    """
    Convert raw conjunction analysis JSON into a human-readable mission report.
    """
    sat_a = conjunction_data.get("satellite_a", "Unknown")
    sat_b = conjunction_data.get("satellite_b", "Unknown")
    
    approach = conjunction_data.get("closest_approach", {})
    time = approach.get("time", "Unknown time")
    dist = approach.get("distance_km", "Unknown")
    
    risk_assessment = conjunction_data.get("risk_assessment", {})
    risk_level = risk_assessment.get("risk_level", "UNKNOWN")
    severity = risk_assessment.get("severity", "UNKNOWN")
    recommendation = risk_assessment.get("recommendation", "No recommendation available")
    
    # Format distance neatly if it's a number
    if isinstance(dist, (int, float)):
        dist_str = f"{dist:.3f} km"
    else:
        dist_str = str(dist)

    title = "DebrisNet Mission Analysis Report"
    
    # Generate tailored summary and details based on risk level
    if risk_level == "SAFE":
        summary = f"Routine orbit parameters confirmed. Satellites {sat_a} and {sat_b} will maintain a safe separation distance."
        details = f"Closest approach will occur at {time} with a minimum distance of {dist_str}. This classifies as a {severity} severity event."
    elif risk_level == "WATCH":
        summary = f"Notice: Close approach detected between {sat_a} and {sat_b}."
        details = f"Satellites are projected to pass within {dist_str} of each other at {time}. The severity is {severity}."
    elif risk_level == "WARNING":
        summary = f"WARNING: Potential conjunction alert for {sat_a} and {sat_b}."
        details = f"A high severity close approach is projected at {time}. Minimum distance: {dist_str}. Active tracking must be maintained."
    elif risk_level == "CRITICAL":
        summary = f"CRITICAL ALERT: Imminent collision risk detected between {sat_a} and {sat_b}."
        details = f"An extremely close approach of {dist_str} is predicted at {time}. This constitutes a {severity} severity event."
    else:
        summary = f"Analysis report for {sat_a} and {sat_b}."
        details = f"Time: {time} | Distance: {dist_str} | Severity: {severity}"
        
    return {
        "title": title,
        "summary": summary,
        "details": details,
        "recommendation": recommendation
    }

if __name__ == "__main__":
    import json
    
    print("=== Testing SAFE Scenario ===")
    safe_data = {
        "satellite_a": 25544,
        "satellite_b": 43013,
        "closest_approach": {
            "time": "2023-11-01T15:00:00Z",
            "distance_km": 150.25
        },
        "risk_assessment": {
            "risk_level": "SAFE",
            "severity": "LOW",
            "recommendation": "Objects are safely separated. No action required."
        }
    }
    safe_report = generate_mission_report(safe_data)
    print(json.dumps(safe_report, indent=4))
    print("\n")
    
    print("=== Testing CRITICAL Scenario ===")
    critical_data = {
        "satellite_a": 25544,
        "satellite_b": 99999,
        "closest_approach": {
            "time": "2023-11-01T16:30:00Z",
            "distance_km": 0.35
        },
        "risk_assessment": {
            "risk_level": "CRITICAL",
            "severity": "SEVERE",
            "recommendation": "High collision possibility. Immediate attention required."
        }
    }
    critical_report = generate_mission_report(critical_data)
    print(json.dumps(critical_report, indent=4))
