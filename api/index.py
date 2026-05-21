import os
import sys

# Ensure root folder is in Python search path for modular backend imports
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from backend.app import create_app

app = create_app()
