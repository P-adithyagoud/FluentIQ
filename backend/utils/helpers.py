import re
from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    """Generates standard success response format"""
    response = {
        "success": True,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return jsonify(response), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    """Generates standard error response format"""
    response = {
        "success": False,
        "message": message
    }
    if errors is not None:
        response["errors"] = errors
    return jsonify(response), status_code

def validate_email(email):
    """Robust regex check for valid emails"""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_password_strength(password):
    """Verifies password has at least 6 characters (customizable)"""
    return len(password) >= 6
