-- Function to create the ai_interactions table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_ai_interactions_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'ai_interactions'
  ) THEN
    -- Create the ai_interactions table
    CREATE TABLE public.ai_interactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      model TEXT,
      interaction_type TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      user_id UUID -- Optional, for future authentication
    );

    -- Add RLS policies (when authentication is implemented)
    -- ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
    
    -- Create index for faster searches
    CREATE INDEX idx_ai_interactions_type ON public.ai_interactions(interaction_type);
    CREATE INDEX idx_ai_interactions_created_at ON public.ai_interactions(created_at);
    
    -- Grant access to authenticated and anon users
    GRANT ALL ON public.ai_interactions TO authenticated, anon;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.create_ai_interactions_table() TO anon, authenticated;

-- Comment on function
COMMENT ON FUNCTION public.create_ai_interactions_table() IS 'Creates the ai_interactions table if it does not exist';

-- Execute the function to create the table
-- Uncomment the line below to execute the function when running this script
SELECT create_ai_interactions_table();

-- Alternative direct table creation (if function execution fails)
-- This is a backup approach if the function approach doesn't work
-- Uncomment the section below to use direct table creation

/*
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT,
  interaction_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON public.ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON public.ai_interactions(created_at);

-- Grant access to authenticated and anon users
GRANT ALL ON public.ai_interactions TO authenticated, anon;
*/
