"""
Configuration file for AI script
Please set your API keys as environment variables or update this file
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")

# Validate required API keys
def validate_api_keys():
    """Validate that required API keys are set"""
    missing_keys = []
    
    if not GROQ_API_KEY:
        missing_keys.append("GROQ_API_KEY")
    if not GOOGLE_API_KEY:
        missing_keys.append("GOOGLE_API_KEY")
    
    if missing_keys:
        print("Missing required API keys:")
        for key in missing_keys:
            print(f"  - {key}")
        print("\nPlease set these environment variables or create a .env file with:")
        print("GROQ_API_KEY=your_groq_api_key_here")
        print("GOOGLE_API_KEY=your_google_api_key_here")
        return False
    
    return True

if __name__ == "__main__":
    validate_api_keys() 