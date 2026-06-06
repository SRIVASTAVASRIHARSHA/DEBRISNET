def generate_avoidance_plan(conjunction_data):
    """
    Generates an orbital maneuver recommendation based on risk assessment.
    """
    risk_level = conjunction_data.get("risk_assessment", {}).get("risk_level", "SAFE")

    if risk_level == "SAFE":
        return {
            "maneuver_required": False,
            "recommended_action": "Maintain current orbit",
            "maneuver_type": "None",
            "estimated_delta_v": "0 m/s",
            "priority": "LOW",
            "explanation": "Separation distance is well within safety margins."
        }
    elif risk_level == "WATCH":
        return {
            "maneuver_required": False,
            "recommended_action": "Increase tracking frequency and monitor conjunction evolution",
            "maneuver_type": "Monitoring",
            "estimated_delta_v": "0 m/s",
            "priority": "MEDIUM",
            "explanation": "Approach is closer than optimal but does not yet require a maneuver."
        }
    elif risk_level == "WARNING":
        return {
            "maneuver_required": True,
            "recommended_action": "Plan collision avoidance maneuver",
            "maneuver_type": "Orbit adjustment burn",
            "estimated_delta_v": "Low delta-v correction",
            "priority": "HIGH",
            "explanation": "Calculated miss distance violates safety thresholds. Proactive burn suggested."
        }
    elif risk_level == "CRITICAL":
        return {
            "maneuver_required": True,
            "recommended_action": "Execute immediate avoidance maneuver",
            "maneuver_type": "Emergency collision avoidance burn",
            "estimated_delta_v": "Mission calculated burn required",
            "priority": "CRITICAL",
            "explanation": "Very high probability of collision. Immediate evasion required to preserve asset."
        }
    else:
        return {
            "maneuver_required": False,
            "recommended_action": "Unknown risk level",
            "maneuver_type": "None",
            "estimated_delta_v": "0 m/s",
            "priority": "LOW",
            "explanation": "Could not determine avoidance plan from provided data."
        }
