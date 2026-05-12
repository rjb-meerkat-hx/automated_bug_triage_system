#!/usr/bin/env python3
"""
Robust Render deployment script for Automated Bug Triage System.
Handles scikit-learn installation issues and provides fallbacks.
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def install_scikit_learn():
    """Try multiple approaches to install scikit-learn"""
    
    # Try installing specific version first
    versions_to_try = [
        "scikit-learn==1.3.2",
        "scikit-learn==1.3.0", 
        "scikit-learn==1.2.2",
        "scikit-learn>=1.3.0"
    ]
    
    for version in versions_to_try:
        try:
            logger.info(f"Attempting to install scikit-learn {version}")
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", version],
                capture_output=True, text=True, check=True
            )
            logger.info(f"Successfully installed scikit-learn {version}")
            return True
        except subprocess.CalledProcessError as e:
            logger.warning(f"Failed to install scikit-learn {version}: {e}")
            continue
    
    # Try without version constraint as last resort
    try:
        logger.info("Attempting to install scikit-learn without version constraint")
        subprocess.run([sys.executable, "-m", "pip", "install", "scikit-learn"], 
                   capture_output=True, text=True, check=True)
        logger.info("Successfully installed scikit-learn (latest)")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install scikit-learn: {e}")
        return False

def setup_render():
    """Setup application for Render deployment with error handling."""
    
    logger.info("🚀 Setting up Bug Triage System for Render...")
    
    # Create necessary directories
    os.makedirs("model", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    
    # Install scikit-learn with fallback
    if not install_scikit_learn():
        logger.error("❌ Failed to install scikit-learn. Deployment cannot continue.")
        return False
    
    # Install other dependencies
    logger.info("📦 Installing other dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                   capture_output=True, text=True, check=True)
        logger.info("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Dependency installation failed: {e}")
        return False
    
    # Initialize database
    logger.info("📊 Creating database tables...")
    try:
        result = subprocess.run([sys.executable, "main.py", "db"], 
                           capture_output=True, text=True, check=True)
        logger.info("✅ Database created successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Database creation failed: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False
    
    # Train model if not exists
    model_path = Path("model/bug_triage_model.pkl")
    if not model_path.exists():
        logger.info("🤖 Training ML model...")
        try:
            result = subprocess.run([sys.executable, "train_with_large_dataset.py"], 
                               capture_output=True, text=True, check=True)
            logger.info("✅ Model trained successfully")
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Model training failed: {e}")
            logger.error(f"Output: {e.stdout}")
            logger.error(f"Error: {e.stderr}")
            return False
    else:
        logger.info("✅ Model already exists")
    
    # Start server
    logger.info("🌐 Starting FastAPI server...")
    try:
        subprocess.run([sys.executable, "main.py", "run"], check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Server startup failed: {e}")
        return False
    except KeyboardInterrupt:
        logger.info("👋 Server stopped by user")
        return True
    
    return True

if __name__ == "__main__":
    success = setup_render()
    sys.exit(0 if success else 1)
