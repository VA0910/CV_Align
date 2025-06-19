#!/usr/bin/env python3
"""
Setup script for AI CV analysis system
"""

import os
import sys

def create_env_file():
    """Create a .env file with placeholder values"""
    env_content = """# AI Script Environment Variables
# Please replace these with your actual API keys

# Groq API Key for LLM (get from https://console.groq.com/)
GROQ_API_KEY=your_groq_api_key_here

# Google API Key for embeddings (get from https://console.cloud.google.com/)
GOOGLE_API_KEY=your_google_api_key_here

# Optional: LangChain API Key for tracing
# LANGCHAIN_API_KEY=your_langchain_api_key_here
"""
    
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_path):
        print(f".env file already exists at {env_path}")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            return
    
    try:
        with open(env_path, 'w') as f:
            f.write(env_content)
        print(f"Created .env file at {env_path}")
        print("Please edit this file and add your actual API keys.")
    except Exception as e:
        print(f"Error creating .env file: {e}")

def test_dependencies():
    """Test if all required dependencies are installed"""
    required_packages = [
        'langchain_groq',
        'langchain_google_genai',
        'pypdf',
        'faiss-cpu',
        'python-dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("Missing required packages:")
        for package in missing_packages:
            print(f"  - {package}")
        print("\nPlease install them using:")
        print("pip install -r requirements.txt")
        return False
    else:
        print("All required packages are installed.")
        return True

def test_api_keys():
    """Test if API keys are configured"""
    try:
        from config import validate_api_keys
        if validate_api_keys():
            print("API keys are properly configured.")
            return True
        else:
            print("API keys are missing. Please configure them in the .env file.")
            return False
    except Exception as e:
        print(f"Error testing API keys: {e}")
        return False

def main():
    print("AI CV Analysis System Setup")
    print("=" * 40)
    
    # Test dependencies
    print("\n1. Testing dependencies...")
    if not test_dependencies():
        return
    
    # Create .env file
    print("\n2. Setting up environment variables...")
    create_env_file()
    
    # Test API keys
    print("\n3. Testing API keys...")
    if test_api_keys():
        print("\nSetup complete! The AI system should be ready to use.")
    else:
        print("\nSetup incomplete. Please:")
        print("1. Edit the .env file and add your API keys")
        print("2. Run this script again to verify the configuration")

if __name__ == "__main__":
    main() 