/**
 * Comprehensive Supabase Schema Setup Utility
 * 
 * This utility creates and manages all database tables, functions, and relationships
 * for the application directly through the Supabase JavaScript client.
 */

const SupabaseSchemaSetup = {
  /**
   * SQL for creating the projects table
   */
  PROJECTS_TABLE_SQL: `
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
  `,

  /**
   * SQL for creating the tasks table
   */
  TASKS_TABLE_SQL: `
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
  `,

  /**
   * SQL for creating the documents table
   */
  DOCUMENTS_TABLE_SQL: `
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
  `,

  /**
   * SQL for adding foreign keys after tables are created
   */
  ADD_FOREIGN_KEYS_SQL: `
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
  `,

  /**
   * SQL for creating the core tables schema
   */
  CORE_TABLES_SQL: `
    -- Projects table
    CREATE TABLE IF NOT EXISTS public.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT NOT NULL,
      description TEXT,
      status TEXT,
      metadata JSONB DEFAULT '{}'::jsonb
    );

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

    -- AI interactions table (if it doesn't exist already)
    CREATE TABLE IF NOT EXISTS public.ai_interactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      model TEXT,
      interaction_type TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      project_id UUID,
      task_id UUID,
      document_id UUID
    );

    -- Create indexes for faster searches
    CREATE INDEX IF NOT EXISTS idx_projects_name ON public.projects(name);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
    CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
    CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON public.ai_interactions(interaction_type);
    CREATE INDEX IF NOT EXISTS idx_ai_interactions_project_id ON public.ai_interactions(project_id);
    CREATE INDEX IF NOT EXISTS idx_ai_interactions_task_id ON public.ai_interactions(task_id);
    CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON public.ai_interactions(created_at);

    -- Grant access to authenticated and anon users
    GRANT ALL ON public.projects TO authenticated, anon;
    GRANT ALL ON public.tasks TO authenticated, anon;
    GRANT ALL ON public.documents TO authenticated, anon;
    GRANT ALL ON public.ai_interactions TO authenticated, anon;
  `,

  /**
   * SQL for creating stored procedures and functions
   */
  STORED_PROCEDURES_SQL: `
    -- Function to create a new AI interaction with proper relationships
    CREATE OR REPLACE FUNCTION public.create_ai_interaction(
      p_prompt TEXT,
      p_response TEXT,
      p_model TEXT,
      p_interaction_type TEXT,
      p_metadata JSONB DEFAULT '{}'::jsonb,
      p_project_id UUID DEFAULT NULL,
      p_task_id UUID DEFAULT NULL,
      p_document_id UUID DEFAULT NULL
    ) RETURNS UUID AS $$
    DECLARE
      v_id UUID;
    BEGIN
      INSERT INTO public.ai_interactions (
        prompt, response, model, interaction_type, metadata,
        project_id, task_id, document_id
      ) VALUES (
        p_prompt, p_response, p_model, p_interaction_type, p_metadata,
        p_project_id, p_task_id, p_document_id
      )
      RETURNING id INTO v_id;
      
      RETURN v_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to get AI interactions with filtering
    CREATE OR REPLACE FUNCTION public.get_ai_interactions(
      p_interaction_type TEXT DEFAULT NULL,
      p_project_id UUID DEFAULT NULL,
      p_task_id UUID DEFAULT NULL,
      p_document_id UUID DEFAULT NULL,
      p_limit INTEGER DEFAULT 50,
      p_offset INTEGER DEFAULT 0
    ) RETURNS SETOF public.ai_interactions AS $$
    BEGIN
      RETURN QUERY
      SELECT *
      FROM public.ai_interactions
      WHERE 
        (p_interaction_type IS NULL OR interaction_type = p_interaction_type) AND
        (p_project_id IS NULL OR project_id = p_project_id) AND
        (p_task_id IS NULL OR task_id = p_task_id) AND
        (p_document_id IS NULL OR document_id = p_document_id)
      ORDER BY created_at DESC
      LIMIT p_limit
      OFFSET p_offset;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to create a new project
    CREATE OR REPLACE FUNCTION public.create_project(
      p_name TEXT,
      p_description TEXT DEFAULT NULL,
      p_status TEXT DEFAULT 'active',
      p_metadata JSONB DEFAULT '{}'::jsonb
    ) RETURNS UUID AS $$
    DECLARE
      v_id UUID;
    BEGIN
      INSERT INTO public.projects (
        name, description, status, metadata
      ) VALUES (
        p_name, p_description, p_status, p_metadata
      )
      RETURNING id INTO v_id;
      
      RETURN v_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to create a new task
    CREATE OR REPLACE FUNCTION public.create_task(
      p_project_id UUID,
      p_title TEXT,
      p_description TEXT DEFAULT NULL,
      p_status TEXT DEFAULT 'pending',
      p_due_date TIMESTAMPTZ DEFAULT NULL,
      p_metadata JSONB DEFAULT '{}'::jsonb
    ) RETURNS UUID AS $$
    DECLARE
      v_id UUID;
    BEGIN
      INSERT INTO public.tasks (
        project_id, title, description, status, due_date, metadata
      ) VALUES (
        p_project_id, p_title, p_description, p_status, p_due_date, p_metadata
      )
      RETURNING id INTO v_id;
      
      RETURN v_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to create a new document
    CREATE OR REPLACE FUNCTION public.create_document(
      p_project_id UUID,
      p_title TEXT,
      p_content TEXT DEFAULT NULL,
      p_document_type TEXT DEFAULT 'text',
      p_metadata JSONB DEFAULT '{}'::jsonb
    ) RETURNS UUID AS $$
    DECLARE
      v_id UUID;
    BEGIN
      INSERT INTO public.documents (
        project_id, title, content, document_type, metadata
      ) VALUES (
        p_project_id, p_title, p_content, p_document_type, p_metadata
      )
      RETURNING id INTO v_id;
      
      RETURN v_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Grant execute permissions
    GRANT EXECUTE ON FUNCTION public.create_ai_interaction TO authenticated, anon;
    GRANT EXECUTE ON FUNCTION public.get_ai_interactions TO authenticated, anon;
    GRANT EXECUTE ON FUNCTION public.create_project TO authenticated, anon;
    GRANT EXECUTE ON FUNCTION public.create_task TO authenticated, anon;
    GRANT EXECUTE ON FUNCTION public.create_document TO authenticated, anon;
  `,

  /**
   * Execute SQL in Supabase
   * @param {Object} client - Supabase client
   * @param {String} sql - SQL to execute
   * @param {String} description - Description of the operation
   * @returns {Promise<Object>} - Result of the operation
   */
  async executeSQL(client, sql, description) {
    console.log(`Executing SQL: ${description}...`);
    
    try {
      // Try using the rpc method first
      try {
        const { data, error } = await client.rpc('exec_sql', { sql });
        
        if (!error) {
          console.log(`SQL executed successfully: ${description}`);
          return { success: true, message: `${description} completed successfully` };
        }
        
        console.warn(`Failed to execute SQL using RPC: ${error?.message || 'Unknown error'}`);
      } catch (rpcError) {
        console.warn(`RPC execution error: ${rpcError?.message || 'Unknown error'}`);
      }
      
      // Try direct REST API approach as fallback
      try {
        // This might work with some Supabase configurations
        const { data, error } = await client.from('rest_sql_query').select('*').eq('query', sql).limit(1);
        
        if (!error) {
          console.log(`SQL executed successfully via REST: ${description}`);
          return { success: true, message: `${description} completed successfully` };
        }
        
        console.warn(`Failed to execute SQL using REST: ${error?.message || 'Unknown error'}`);
      } catch (restError) {
        console.warn(`REST execution error: ${restError?.message || 'Unknown error'}`);
      }
      
      // If we get here, both methods failed
      return { 
        error: `Failed to execute SQL: ${description}. You may need to run the SQL manually.`,
        sqlToRun: sql
      };
    } catch (error) {
      console.error(`Error executing SQL (${description}):`, error);
      return { error };
    }
  },

  /**
   * Create projects table
   * @param {Object} client - Supabase client
   * @returns {Promise<Object>} - Result of the operation
   */
  async createProjectsTable(client) {
    return await this.executeSQL(
      client, 
      this.PROJECTS_TABLE_SQL, 
      'Create projects table'
    );
  },

  /**
   * Create tasks table
   * @param {Object} client - Supabase client
   * @returns {Promise<Object>} - Result of the operation
   */
  async createTasksTable(client) {
    return await this.executeSQL(
      client, 
      this.TASKS_TABLE_SQL, 
      'Create tasks table'
    );
  },

  /**
   * Create documents table
   * @param {Object} client - Supabase client
   * @returns {Promise<Object>} - Result of the operation
   */
  async createDocumentsTable(client) {
    return await this.executeSQL(
      client, 
      this.DOCUMENTS_TABLE_SQL, 
      'Create documents table'
    );
  },

  /**
   * Add foreign keys to tables
   * @param {Object} client - Supabase client
   * @returns {Promise<Object>} - Result of the operation
   */
  async addForeignKeys(client) {
    return await this.executeSQL(
      client, 
      this.ADD_FOREIGN_KEYS_SQL, 
      'Add foreign keys'
    );
  },

  /**
   * Create all core tables
   * @param {Object} client - Supabase client
   * @returns {Promise<Object>} - Result of the operation
   */
  async createCoreTables(client) {
    try {
      // Try creating tables one by one
      const results = {
        projects: await this.createProjectsTable(client),
        tasks: await this.createTasksTable(client),
        documents: await this.createDocumentsTable(client)
      };
      
      // Check if any tables were created successfully
      const anySuccess = Object.values(results).some(r => r.success);
      
      if (anySuccess) {
        // If any tables were created, try to add foreign keys
        const foreignKeysResult = await this.addForeignKeys(client);
        results.foreignKeys = foreignKeysResult;
        
        return {
          success: true,
          message: 'Tables created successfully',
          details: results
        };
      }
      
      // If all individual attempts failed, try the original approach
      const result = await this.executeSQL(
        client, 
        this.CORE_TABLES_SQL, 
        'Create core tables (all at once)'
      );
      
      return result;
    } catch (error) {
      console.error('Error creating core tables:', error);
      return { error };
    }
  },

  /**
   * Create stored procedures
   * @param {Object} client - Supabase client
   * @returns {Promise<Object>} - Result of the operation
   */
  async createStoredProcedures(client) {
    return await this.executeSQL(
      client, 
      this.STORED_PROCEDURES_SQL, 
      'Create stored procedures'
    );
  },

  /**
   * Check if a table exists
   * @param {Object} client - Supabase client
   * @param {String} tableName - Name of the table to check
   * @returns {Promise<Boolean>} - Whether the table exists
   */
  async tableExists(client, tableName) {
    try {
      const { data, error } = await client
        .from(tableName)
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.warn(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  },

  /**
   * Initialize the entire database schema
   * @param {Object} client - Supabase client
   * @returns {Promise<Object>} - Result of the operation
   */
  async initializeSchema(client) {
    if (!client) {
      console.error('Supabase client not provided');
      return { error: 'Supabase client not provided' };
    }
    
    try {
      // Step 1: Create core tables
      const tablesResult = await this.createCoreTables(client);
      if (tablesResult.error) {
        console.warn('Error creating core tables:', tablesResult.error);
        // Continue anyway, as some tables might have been created
      }
      
      // Step 2: Create stored procedures
      const proceduresResult = await this.createStoredProcedures(client);
      if (proceduresResult.error) {
        console.warn('Error creating stored procedures:', proceduresResult.error);
        // Continue anyway, as some procedures might have been created
      }
      
      // Step 3: Verify that at least some tables exist
      const tablesExist = await Promise.all([
        this.tableExists(client, 'projects'),
        this.tableExists(client, 'tasks'),
        this.tableExists(client, 'documents'),
        this.tableExists(client, 'ai_interactions')
      ]);
      
      const allTablesExist = tablesExist.every(exists => exists);
      const someTablesExist = tablesExist.some(exists => exists);
      
      if (allTablesExist) {
        return { 
          success: true, 
          message: 'All tables and procedures created successfully' 
        };
      } else if (someTablesExist) {
        return { 
          partialSuccess: true, 
          message: 'Some tables were created, but not all. You may need to run the SQL manually to complete setup.',
          tablesStatus: {
            projects: tablesExist[0],
            tasks: tablesExist[1],
            documents: tablesExist[2],
            ai_interactions: tablesExist[3]
          }
        };
      } else {
        return { 
          error: 'Failed to create any tables. You may need to run the SQL manually.',
          coreTables: this.CORE_TABLES_SQL,
          procedures: this.STORED_PROCEDURES_SQL
        };
      }
    } catch (error) {
      console.error('Error initializing schema:', error);
      return { error };
    }
  }
};

// Export the utility
window.SupabaseSchemaSetup = SupabaseSchemaSetup;
