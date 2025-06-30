#!/usr/bin/env python3

"""
WSGI config for PythonAnywhere deployment
"""

import sys
import os
from pathlib import Path

# Add your project directory to Python path
project_home = '/home/yourusername/geo-rural'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ['PYTHONPATH'] = project_home
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

# Import your FastAPI app
from backend.main import app

# For PythonAnywhere's WSGI server
application = app