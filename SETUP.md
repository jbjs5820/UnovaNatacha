# Gestor de Trabalhos Académicos PhD - Setup Guide

## API Key Setup

This application uses the Google Gemini API for AI features. To use these features, you'll need to set up an API key:

1. Visit [Google AI Studio](https://ai.google.dev/) and create an account if you don't have one
2. Generate a new API key from the Google AI Studio dashboard
3. In the application, go to Settings and paste your API key in the "Gemini API Key" field
4. Click "Save Settings" to store your API key

Your API key will be stored locally in your browser's localStorage and is not transmitted to any server except Google's API services when making requests.

## Running the Application

1. Clone this repository
2. Navigate to the project directory
3. Start a local server:
   ```
   python -m http.server 8083
   ```
4. Open your browser and go to: http://localhost:8083/index.html

## Default Settings

If you need to reset to default settings, use the "Reset Settings" button in the Settings panel. You'll need to re-enter your API key after resetting.

## Security Note

- Never commit your API key to version control
- The application stores your API key in localStorage for convenience
- If you're using a shared computer, remember to clear your browser data when finished
