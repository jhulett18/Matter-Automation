"""
Shared logging utility for Playwright automation scripts
"""
import json
from datetime import datetime


def log(message, level="info"):
    """Output structured logs in JSON format for streaming to frontend

    Args:
        message: The log message to output
        level: Log level (info, success, warning, error)
    """
    timestamp = datetime.now().isoformat()
    print(json.dumps({
        "timestamp": timestamp,
        "level": level,
        "message": message
    }), flush=True)
