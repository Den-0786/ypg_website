#!/usr/bin/env python3
"""
Django Setup Script for YPG Website
This script sets up the Django backend with proper authentication
"""
import os
import sys
import subprocess
import sqlite3

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(f"Error: {result.stderr}")
            return False
        print(result.stdout)
        return True
    except Exception as e:
        print(f"Error running command {command}: {str(e)}")
        return False

def main():
    print("🚀 Setting up Django Backend for YPG Website...")
    
    backend_dir = "ypg_website/backend"
    
    # Check if we're in the right directory
    if not os.path.exists(backend_dir):
        print("❌ Backend directory not found. Make sure you're in the project root.")
        return
    
    print("\n1️⃣ Installing Django dependencies...")
    if not run_command("pip install django djangorestframework django-cors-headers python-decouple dj-database-url psycopg2-binary pillow whitenoise gunicorn", backend_dir):
        print("❌ Failed to install dependencies")
        return
    
    print("\n2️⃣ Creating database migrations...")
    if not run_command("python manage.py makemigrations", backend_dir):
        print("❌ Failed to create migrations")
        return
    
    print("\n3️⃣ Applying database migrations...")
    if not run_command("python manage.py migrate", backend_dir):
        print("❌ Failed to apply migrations")
        return
    
    print("\n4️⃣ Creating supervisor user...")
    if not run_command("python manage.py setup_supervisor --username supervisor --password admin123", backend_dir):
        print("❌ Failed to create supervisor user")
        return
    
    print("\n✅ Django Backend Setup Complete!")
    print("\n🔐 Login Credentials:")
    print("   Username: supervisor")
    print("   Password: admin123")
    print("\n🚀 To start Django server:")
    print("   cd ypg_website/backend")
    print("   python manage.py runserver 8000")
    print("\n🌐 Django will be available at: http://localhost:8000")
    print("📱 Next.js frontend at: http://localhost:3002")

if __name__ == "__main__":
    main()
















