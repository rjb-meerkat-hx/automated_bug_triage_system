#!/usr/bin/env python3
"""
Render deployment script for Automated Bug Triage System.
Ensures database and model are ready before starting the server.
"""

import os
import sys
import subprocess
from pathlib import Path

def setup_render():
    """Setup application for Render deployment."""
    
    print("🚀 Setting up Bug Triage System for Render...")
    
    # Create necessary directories
    os.makedirs("model", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    
    # Initialize database
    print("📊 Creating database tables...")
    try:
        result = subprocess.run([sys.executable, "main.py", "db"], 
                           capture_output=True, text=True, check=True)
        print("✅ Database created successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Database creation failed: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error: {e.stderr}")
        return False
    
    # Train model if not exists
    model_path = Path("model/bug_triage_model.pkl")
    if not model_path.exists():
        print("🤖 Training ML model...")
        try:
            result = subprocess.run([sys.executable, "train_with_large_dataset.py"], 
                               capture_output=True, text=True, check=True)
            print("✅ Model trained successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Model training failed: {e}")
            print(f"Output: {e.stdout}")
            print(f"Error: {e.stderr}")
            return False
    else:
        print("✅ Model already exists")
    
    # Start server
    print("🌐 Starting FastAPI server...")
    try:
        subprocess.run([sys.executable, "main.py", "run"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Server startup failed: {e}")
        return False
    except KeyboardInterrupt:
        print("👋 Server stopped by user")
        return True
    
    return True

if __name__ == "__main__":
    success = setup_render()
    sys.exit(0 if success else 1)
