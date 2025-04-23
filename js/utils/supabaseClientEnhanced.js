// Enhanced Supabase client utility
const SupabaseClientEnhanced = {
  // Supabase client instance
  _client: null,

  // Initialize the client
  init(supabaseUrl, supabaseKey) {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or key not provided');
      return false;
    }

    try {
      this._client = supabase.createClient(supabaseUrl, supabaseKey);
      console.log('Supabase client initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      return false;
    }
  },

  // Project operations
  async createProject(projectData) {
    if (!this._client) {
      console.error('Supabase client not initialized');
      return { error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this._client
        .from('projects')
        .insert([projectData])
        .select();
      return { data, error };
    } catch (error) {
      console.error('Error creating project:', error);
      return { error };
    }
  },

  async getProjectById(projectId) {
    if (!this._client) {
      console.error('Supabase client not initialized');
      return { error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this._client
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error getting project:', error);
      return { error };
    }
  },

  async updateProject(projectId, updates) {
    if (!this._client) {
      console.error('Supabase client not initialized');
      return { error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this._client
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select();
      return { data, error };
    } catch (error) {
      console.error('Error updating project:', error);
      return { error };
    }
  },

  async deleteProject(projectId) {
    if (!this._client) {
      console.error('Supabase client not initialized');
      return { error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this._client
        .from('projects')
        .delete()
        .eq('id', projectId);
      return { data, error };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { error };
    }
  },

  // Task operations
  async createTask(taskData) {
    if (!this._client) {
      console.error('Supabase client not initialized');
      return { error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this._client
        .from('tasks')
        .insert([taskData])
        .select();
      return { data, error };
    } catch (error) {
      console.error('Error creating task:', error);
      return { error };
    }
  },

  async getTasksByProject(projectId) {
    if (!this._client) {
      console.error('Supabase client not initialized');
      return { error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this._client
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);
      return { data, error };
    } catch (error) {
      console.error('Error getting tasks:', error);
      return { error };
    }
  },

  // Resource operations
  async createResource(resourceData) {
    if (!this._client) {
      console.error('Supabase client not initialized');
      return { error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this._client
        .from('resources')
        .insert([resourceData])
        .select();
      return { data, error };
    } catch (error) {
      console.error('Error creating resource:', error);
      return { error };
    }
  },

  async getResourcesByProject(projectId) {
    if (!this._client) {
      console.error('Supabase client not initialized');
      return { error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this._client
        .from('resources')
        .select('*')
        .eq('project_id', projectId);
      return { data, error };
    } catch (error) {
      console.error('Error getting resources:', error);
      return { error };
    }
  }
};

window.SupabaseClientEnhanced = SupabaseClientEnhanced;
