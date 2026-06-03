def calculate_risk(distance_km: float) -> dict:
    """
    Convert a closest approach distance into a collision risk assessment.
    """
    if not isinstance(distance_km, (int, float)):
        raise ValueError("Distance must be a numeric value")
    if distance_km < 0:
        raise ValueError("Distance cannot be negative")

    if distance_km > 50:
        return {
            "risk_level": "SAFE",
            "severity": "LOW",
            "recommendation": "Objects are safely separated. No action required."
        }
    elif distance_km > 10:
        return {
            "risk_level": "WATCH",
            "severity": "MODERATE",
            "recommendation": "Close approach detected. Continue monitoring."
        }
    elif distance_km > 1:
        return {
            "risk_level": "WARNING",
            "severity": "HIGH",
            "recommendation": "Potential conjunction detected. Further analysis recommended."
        }
    else:
        return {
            "risk_level": "CRITICAL",
            "severity": "SEVERE",
            "recommendation": "High collision possibility. Immediate attention required."
        }

if __name__ == "__main__":
    tests = [100.0, 20.0, 5.0, 0.5]
    for dist in tests:
        risk = calculate_risk(dist)
        print(f"Distance: {dist:5.1f} km")
        print(f"  Risk Level     : {risk['risk_level']}")
        print(f"  Severity       : {risk['severity']}")
        print(f"  Recommendation : {risk['recommendation']}")
        print("-" * 50)
