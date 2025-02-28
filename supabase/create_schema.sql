-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_projects_name ON public.projects(name);

-- Grant access to authenticated and anon users
GRANT ALL ON public.projects TO authenticated, anon;

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  due_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Grant access to authenticated and anon users
GRANT ALL ON public.tasks TO authenticated, anon;

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id UUID,
  title TEXT NOT NULL,
  content TEXT,
  document_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);

-- Grant access to authenticated and anon users
GRANT ALL ON public.documents TO authenticated, anon;

-- Add foreign keys to tasks table
ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_project_id 
FOREIGN KEY (project_id) 
REFERENCES public.projects(id);

-- Add foreign keys to documents table
ALTER TABLE public.documents 
ADD CONSTRAINT fk_documents_project_id 
FOREIGN KEY (project_id) 
REFERENCES public.projects(id);

-- Add foreign keys to ai_interactions table
ALTER TABLE public.ai_interactions 
ADD COLUMN IF NOT EXISTS project_id UUID,
ADD COLUMN IF NOT EXISTS task_id UUID,
ADD COLUMN IF NOT EXISTS document_id UUID;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_interactions_project_id'
  ) THEN
    ALTER TABLE public.ai_interactions 
    ADD CONSTRAINT fk_ai_interactions_project_id 
    FOREIGN KEY (project_id) 
    REFERENCES public.projects(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_interactions_task_id'
  ) THEN
    ALTER TABLE public.ai_interactions 
    ADD CONSTRAINT fk_ai_interactions_task_id 
    FOREIGN KEY (task_id) 
    REFERENCES public.tasks(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_interactions_document_id'
  ) THEN
    ALTER TABLE public.ai_interactions 
    ADD CONSTRAINT fk_ai_interactions_document_id 
    FOREIGN KEY (document_id) 
    REFERENCES public.documents(id);
  END IF;
END
$$;
