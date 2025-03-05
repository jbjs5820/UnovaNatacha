# Gestor de Trabalhos Académicos PhD - Setup Guide

## API Key Setup

This application uses the Google Gemini API for AI features. To use these features, you'll need to set up an API key:

1. Visit [Google AI Studio](https://ai.google.dev/) and create an account if you don't have one
2. Generate a new API key from the Google AI Studio dashboard
3. In the application, go to Settings and paste your API key in the "Gemini API Key" field
4. Click "Save Settings" to store your API key

Your API key will be stored locally in your browser's localStorage and is not transmitted to any server except Google's API services when making requests.

## Supabase Setup (Optional)

The application can use Supabase as a backend database for storing projects, tasks, and resources. To set up Supabase:

1. Visit [Supabase](https://supabase.com/) and create an account
2. Create a new project in Supabase
3. Once your project is created, go to Project Settings > API
4. Copy the URL and anon/public key
5. In the application, go to Settings and paste these values in the respective fields
6. Click "Save Settings" to store your Supabase credentials

### Database Schema Setup

After creating your Supabase project, you'll need to set up the database schema:

1. Go to the SQL Editor in your Supabase dashboard
2. Create the following tables:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  deadline DATE,
  status TEXT DEFAULT 'Em Progresso',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Não Iniciada',
  priority TEXT DEFAULT 'Média',
  category TEXT DEFAULT 'Investigação',
  progress INTEGER DEFAULT 0,
  due_date DATE,
  assigned_to TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'article',
  url TEXT,
  authors TEXT,
  publication_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create profiles table for user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  institution TEXT,
  department TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

3. Set up storage buckets for file uploads:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called "resources"
   - Set the bucket's privacy to "Public"

4. Set up Row Level Security (RLS) policies:
   - Go to Authentication > Policies in your Supabase dashboard
   - For each table (projects, tasks, resources, profiles), create policies that allow users to only access their own data

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

- Never commit your API keys to version control
- The application stores your API keys in localStorage for convenience
- If you're using a shared computer, remember to clear your browser data when finished
- Supabase credentials should be treated as sensitive information
