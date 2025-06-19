# AI CV Analysis System

This directory contains the AI-powered CV analysis system that automatically parses and evaluates CVs against job descriptions.

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure API Keys

The AI system requires two API keys:

#### Groq API Key (for LLM)
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Create a new API key
4. Copy the key

#### Google API Key (for embeddings)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Generative AI API"
4. Create credentials (API key)
5. Copy the key

### 3. Set Up Environment Variables

Run the setup script:
```bash
python setup.py
```

This will create a `.env` file. Edit it and replace the placeholder values with your actual API keys:

```env
GROQ_API_KEY=your_actual_groq_api_key
GOOGLE_API_KEY=your_actual_google_api_key
```

### 4. Test the Setup

Run the test script to verify everything is working:
```bash
python test_rag.py
```

## Troubleshooting

### Common Issues

#### 1. "Missing required API keys" Error
- Make sure you have created a `.env` file in the AI directory
- Verify that your API keys are correct and active
- Check that the keys have the necessary permissions

#### 2. "AI script not found" Error
- Ensure you're running the backend from the correct directory
- Check that the AI script path is correct in `backend/app/routes/candidate.py`

#### 3. "AI parsing failed" Error
- Check the backend logs for detailed error messages
- Verify that your API keys have sufficient quota/credits
- Ensure the CV file is a valid PDF format

#### 4. "Pending AI Analysis" Status
- This means the AI analysis failed and the system fell back to default values
- Check the backend logs for the specific error
- Verify API key configuration and network connectivity

### Debugging Steps

1. **Check Backend Logs**: Look for detailed error messages in the backend console
2. **Test AI Script Directly**: Run `python ai_server/rag.py --cv test.pdf --job "test job description"`
3. **Verify API Keys**: Run `python config.py` to check if API keys are properly configured
4. **Check File Permissions**: Ensure the AI script has execute permissions

### Manual Testing

To test the AI script manually:

```bash
cd AI
python ai_server/rag.py --cv AAGAM_220123002.pdf --job "Software Developer with Python and JavaScript experience"
```

This should output a JSON result with the parsed CV data.

## File Structure

```
AI/
├── ai_server/
│   ├── rag.py          # Main AI analysis script
│   └── __init__.py
├── config.py           # Configuration and API key validation
├── setup.py            # Setup script for environment
├── test_rag.py         # Test script for verification
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── .env               # Environment variables (created by setup.py)
```

## API Integration

The AI system is integrated with the backend through the `parse_cv_with_ai` function in `backend/app/routes/candidate.py`. This function:

1. Downloads the CV from Cloudinary
2. Calls the AI script with the CV file and job description
3. Parses the AI output into structured data
4. Stores the results in the database

## Support

If you continue to experience issues:

1. Check the backend logs for detailed error messages
2. Verify all API keys are correctly configured
3. Ensure all dependencies are installed
4. Test the AI script manually to isolate the issue 