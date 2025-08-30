# Gemini AI Setup for Exercise Routines

This guide explains how to set up the Gemini AI API for generating personalized exercise routines.

## Prerequisites

1. A Google Cloud account
2. Access to the Gemini API

## Setup Steps

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure the API Key

You have two options to configure the API key:

#### Option A: Environment Variable (Recommended)

Set the environment variable before running the Django server:

**Windows:**
```cmd
set GEMINI_API_KEY=your_actual_api_key_here
python manage.py runserver
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY=your_actual_api_key_here
python manage.py runserver
```

#### Option B: Direct Configuration

Edit `fitnexus/settings.py` and replace the placeholder:

```python
GEMINI_API_KEY = 'your_actual_api_key_here'
```

### 3. Test the Setup

1. Start the Django server
2. Navigate to the Exercise Routines page in the frontend
3. Try generating a new exercise routine
4. Check the Django console for any error messages

## Features

- **Personalized Routines**: AI generates routines based on age, weight, height, and experience level
- **Fallback System**: If Gemini API is unavailable, the system provides pre-defined routines
- **Structured Output**: Routines include warm-up, main workout, cool-down, safety tips, and modifications
- **Error Handling**: Robust error handling with detailed logging

## Troubleshooting

### API Key Issues
- Ensure the API key is valid and has proper permissions
- Check that the environment variable is set correctly
- Verify the API key format (should be a long string without spaces)

### Network Issues
- Check your internet connection
- Ensure the Gemini API is accessible from your network
- Check firewall settings if applicable

### Response Issues
- If routines are not generating properly, check the Django console for error messages
- The system will automatically fall back to pre-defined routines if the API fails

## Security Notes

- Never commit your API key to version control
- Use environment variables for production deployments
- Regularly rotate your API keys
- Monitor API usage to avoid unexpected charges

## API Limits

- Check Google's current rate limits for the Gemini API
- The system includes timeout handling (30 seconds)
- Consider implementing rate limiting for production use

