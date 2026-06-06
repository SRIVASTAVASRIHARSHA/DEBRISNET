def generate_avoidance_plan(conjunction_data):
    """
    Generates an orbital maneuver recommendation based on risk assessment.
    """
    risk_level = conjunction_data.get("risk_assessment", {}).get("risk_level", "SAFE")
    
    if risk_level == "SAFE":
        return {
            "maneuver_required": False,
            "recommended_action": "No maneuver required",
            "maneuver_type": "Maintain current orbit",
            "estimated_delta_v": "0 m/s",
            "priority": "LOW",
            "explanation": "Separation distance is well within safety margins."
        }
    elif risk_level == "WATCH":
        return {
            "maneuver_required": False,
            "recommended_action": "Monitor trajectory",
            "maneuver_type": "Small station keeping adjustment",
            "estimated_delta_v": "<0.1 m/s",
            "priority": "MEDIUM",
            "explanation": "Approach is closer than optimal but does not strictly require an avoidance maneuver yet."
        }
    elif risk_level == "WARNING":
        return {
            "maneuver_required": True,
            "recommended_action": "Collision avoidance maneuver recommended",
            "maneuver_type": "Radial orbit adjustment",
            "estimated_delta_v": "0.1 - 1 m/s",
            "priority": "HIGH",
            "explanation": "Calculated miss distance violates safety thresholds. Proactive burn suggested."
        }
    elif risk_level == "CRITICAL":
        return {
            "maneuver_required": True,
            "recommended_action": "Immediate avoidance maneuver required",
            "maneuver_type": "Emergency orbital displacement burn",
            "estimated_delta_v": ">1 m/s",
            "priority": "CRITICAL",
            "explanation": "Very high probability of collision. Immediate evasion required to preserve asset."
        }
    
    return {
        "maneuver_required": False,
        "recommended_action": "Unknown risk level",
        "maneuver_type": "None",
        "estimated_delta_v": "0 m/s",
        "priority": "LOW",
        "explanation": "Could not determine avoidance plan from provided data."
    }
