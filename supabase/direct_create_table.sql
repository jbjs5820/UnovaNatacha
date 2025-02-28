-- Direct SQL to create the ai_interactions table
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT,
  interaction_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID -- Optional, for future authentication
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON public.ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON public.ai_interactions(created_at);

-- Grant access to authenticated and anon users
GRANT ALL ON public.ai_interactions TO authenticated, anon;

-- Comment on table
COMMENT ON TABLE public.ai_interactions IS 'Stores AI interactions from the application';
