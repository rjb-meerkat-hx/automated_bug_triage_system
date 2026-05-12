#!/usr/bin/env python3
"""
Simple server startup script for Render deployment.
Direct uvicorn startup without complex imports.
"""

import os
import sys
import subprocess
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Start the FastAPI server directly."""
    
    logger.info("🚀 Starting Bug Triage System...")
    
    # Create necessary directories
    os.makedirs("model", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    
    # Install dependencies
    logger.info("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                   capture_output=True, text=True, check=True)
        logger.info("✅ Dependencies installed")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to install dependencies: {e}")
        return False
    
    # Setup database
    logger.info("📊 Setting up database...")
    try:
        subprocess.run([sys.executable, "main.py", "db"], 
                   capture_output=True, text=True, check=True)
        logger.info("✅ Database ready")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Database setup failed: {e}")
        return False
    
    # Start server
    logger.info("🌐 Starting server...")
    try:
        # Use uvicorn directly
        port = int(os.getenv("PORT", "8000"))
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", str(port)
        ], check=True)
        logger.info(f"✅ Server running on port {port}")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Server startup failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
