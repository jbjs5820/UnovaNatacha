// Utility for setting up Supabase tables and initial configuration
const SupabaseSetup = {
  // SQL for creating the ai_interactions table
  AI_INTERACTIONS_TABLE_SQL: `
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
    
    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS ai_interactions_created_at_idx ON public.ai_interactions (created_at);
    CREATE INDEX IF NOT EXISTS ai_interactions_type_idx ON public.ai_interactions (interaction_type);
  `,
  
  // Simplified SQL that's more likely to work with limited permissions
  SIMPLE_AI_INTERACTIONS_TABLE_SQL: `
    CREATE TABLE IF NOT EXISTS ai_interactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      model TEXT,
      interaction_type TEXT,
      metadata JSONB
    );
  `,
  
  // Create the ai_interactions table
  async createAIInteractionsTable(client) {
    if (!client) {
      console.error('Supabase client not provided');
      return { error: 'Supabase client not provided' };
    }
    
    try {
      // First try: Use the SQL query directly
      try {
        const { data, error } = await client.rpc('exec_sql', { 
          sql: this.AI_INTERACTIONS_TABLE_SQL 
        });
        
        if (!error) {
          console.log('Table created successfully using exec_sql RPC');
          return { success: true, message: 'Table created successfully' };
        }
        
        // If there's an error, continue to the next method
        console.warn('Failed to create table using exec_sql RPC:', error);
      } catch (error) {
        console.warn('Exception when using exec_sql RPC:', error);
      }
      
      // Second try: Use the REST API for SQL execution
      try {
        const { data, error } = await client.from('rest_sql_query').select('*').eq('query', this.AI_INTERACTIONS_TABLE_SQL).limit(1);
        
        if (!error) {
          console.log('Table created successfully using REST SQL query');
          return { success: true, message: 'Table created successfully' };
        }
        
        // If there's an error, continue to the next method
        console.warn('Failed to create table using REST SQL query:', error);
      } catch (error) {
        console.warn('Exception when using REST SQL query:', error);
      }
      
      // Third try: Try the simplified SQL
      try {
        // This might work with more limited permissions
        const { data, error } = await client.rpc('exec_sql', { 
          sql: this.SIMPLE_AI_INTERACTIONS_TABLE_SQL 
        });
        
        if (!error) {
          console.log('Table created successfully using simplified SQL');
          return { success: true, message: 'Table created with simplified schema' };
        }
        
        console.warn('Failed to create table using simplified SQL:', error);
      } catch (error) {
        console.warn('Exception when using simplified SQL:', error);
      }
      
      // Fourth try: Check if the table already exists
      try {
        const { data, error } = await client
          .from('ai_interactions')
          .select('id')
          .limit(1);
        
        if (!error) {
          console.log('Table already exists');
          return { success: true, message: 'Table already exists' };
        }
        
        console.warn('Failed to query existing table:', error);
      } catch (error) {
        console.warn('Exception when checking if table exists:', error);
      }
      
      // If we get here, all attempts failed
      return { 
        error: 'Failed to create table. You may need to run the SQL manually.',
        message: 'Please use the SQL in supabase/direct_create_table.sql to create the table manually.'
      };
    } catch (error) {
      console.error('Error creating table:', error);
      return { error };
    }
  },
  
  // Create RPC functions for table management
  async createHelperFunctions(client) {
    if (!client) {
      console.error('Supabase client not provided');
      return { error: 'Supabase client not provided' };
    }
    
    const checkTableExistsSQL = `
      CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        table_exists BOOLEAN;
      BEGIN
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = $1
        ) INTO table_exists;
        
        RETURN table_exists;
      END;
      $$;
    `;
    
    const executeSqlSQL = `
      CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    try {
      // Create the check_table_exists function
      const { error: checkError } = await client.rpc('execute_sql', { 
        sql: checkTableExistsSQL 
      });
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Failed to create check_table_exists function:', checkError);
      }
      
      // Create the execute_sql function
      const { error: execError } = await client.rpc('execute_sql', { 
        sql: executeSqlSQL 
      });
      
      if (execError && execError.code !== 'PGRST116') {
        console.error('Failed to create execute_sql function:', execError);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error creating helper functions:', error);
      return { error };
    }
  },
  
  // Initialize Supabase with necessary tables and configurations
  async initialize(client) {
    if (!client) {
      console.error('Supabase client not provided');
      return { error: 'Supabase client not provided' };
    }
    
    try {
      // Create the ai_interactions table
      const tableResult = await this.createAIInteractionsTable(client);
      
      if (tableResult.error) {
        return tableResult;
      }
      
      return { success: true, message: 'Supabase setup completed successfully' };
    } catch (error) {
      console.error('Error during Supabase setup:', error);
      return { error };
    }
  }
};

window.SupabaseSetup = SupabaseSetup;
