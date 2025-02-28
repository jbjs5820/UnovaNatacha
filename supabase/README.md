# Supabase Database Setup

This directory contains SQL scripts for setting up the Supabase database for the PhD Academic Work Management Application.

## Setup Instructions

1. Log in to your Supabase dashboard at [https://app.supabase.com](https://app.supabase.com)
2. Navigate to your project
3. Go to the SQL Editor
4. Copy and paste the contents of `create_ai_interactions_table.sql` into the SQL Editor
5. Run the script to create the stored procedure

## Table Structure

The application uses the following table:

### ai_interactions

Stores AI interactions with the Gemini API.

| Column      | Type        | Description                                |
|-------------|-------------|--------------------------------------------|
| id          | UUID        | Primary key                                |
| created_at  | TIMESTAMPTZ | Timestamp when the interaction was created |
| prompt      | TEXT        | The prompt sent to the AI                  |
| response    | TEXT        | The response from the AI                   |
| model       | TEXT        | The AI model used                          |
| type        | TEXT        | Type of interaction (e.g., paper_search, content_generation, text_analysis) |
| metadata    | JSONB       | Additional metadata about the interaction  |
| user_id     | UUID        | Optional user ID for future authentication |

## Environment Variables

Make sure your `.env.local` file contains the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Testing the Connection

You can test the Supabase connection in the application by:

1. Going to Settings
2. Scrolling to the Supabase Configuration section
3. Clicking "Test Connection"

If the connection is successful but the table doesn't exist, the application will attempt to create it automatically.
