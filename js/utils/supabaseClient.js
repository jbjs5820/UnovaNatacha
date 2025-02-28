// Supabase client utility for database operations
const SupabaseClient = {
  // Supabase client instance
  _client: null,
  
  // Supabase URLs and keys (to be set in the UI)
  _supabaseUrl: '',
  _supabaseKey: '',
  
  // Initialize the client
  init(supabaseUrl, supabaseKey) {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or key not provided');
      return false;
    }
    
    this._supabaseUrl = supabaseUrl;
    this._supabaseKey = supabaseKey;
    
    // Save to localStorage for persistent storage across sessions
    localStorage.setItem('supabaseUrl', supabaseUrl);
    localStorage.setItem('supabaseKey', supabaseKey);
    
    try {
      // Check if supabase is defined
      if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Make sure to include the Supabase script in your HTML.');
        return false;
      }
      
      this._client = supabase.createClient(supabaseUrl, supabaseKey);
      console.log('Supabase client initialized successfully');
      
      // Initialize AIInteractionsService if available
      if (window.AIInteractionsService) {
        console.log('Initializing AIInteractionsService with Supabase client');
        // AIInteractionsService will use this client via getClient()
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      return false;
    }
  },
  
  // Get the client instance, initializing it if necessary
  getClient() {
    if (!this._client) {
      const url = localStorage.getItem('supabaseUrl');
      const key = localStorage.getItem('supabaseKey');
      
      if (url && key) {
        this.init(url, key);
      }
    }
    
    return this._client;
  },
  
  // Check if the client is initialized
  isInitialized() {
    return !!this._client;
  },
  
  // Reset the client (for logout, etc.)
  reset() {
    this._client = null;
    this._supabaseUrl = '';
    this._supabaseKey = '';
    localStorage.removeItem('supabaseUrl');
    localStorage.removeItem('supabaseKey');
    return true;
  },
  
  // AI Interactions functions
  // These are now deprecated in favor of AIInteractionsService
  // but kept for backward compatibility
  
  // Store a new AI interaction
  async storeAIInteraction(interaction) {
    console.warn('SupabaseClient.storeAIInteraction is deprecated. Use AIInteractionsService.storeInteraction instead.');
    
    if (!window.AIInteractionsService) {
      return this._legacyStoreAIInteraction(interaction);
    }
    
    const { prompt, response, model, type, metadata } = interaction;
    return AIInteractionsService.storeInteraction(prompt, response, model, type, metadata);
  },
  
  // Legacy implementation
  async _legacyStoreAIInteraction(interaction) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      const { data, error } = await this._client
        .from('ai_interactions')
        .insert([interaction])
        .select();
      
      return { data, error };
    } catch (error) {
      console.error('Error storing AI interaction:', error);
      return { error };
    }
  },
  
  // Get all AI interactions
  async getAIInteractions(options = {}) {
    console.warn('SupabaseClient.getAIInteractions is deprecated. Use AIInteractionsService.getInteractions instead.');
    
    if (!window.AIInteractionsService) {
      return this._legacyGetAIInteractions(options);
    }
    
    const result = await AIInteractionsService.getInteractions(options);
    
    // Convert to legacy format for backward compatibility
    if (result.success) {
      return { data: result.data, error: null };
    } else {
      return { data: null, error: result.error };
    }
  },
  
  // Legacy implementation
  async _legacyGetAIInteractions(options = {}) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    const { limit = 50, offset = 0, type = null } = options;
    
    try {
      let query = this._client
        .from('ai_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (type) {
        query = query.eq('interaction_type', type);
      }
      
      const { data, error } = await query;
      
      return { data, error };
    } catch (error) {
      console.error('Error getting AI interactions:', error);
      return { error };
    }
  },
  
  // Get a specific AI interaction by ID
  async getAIInteractionById(id) {
    console.warn('SupabaseClient.getAIInteractionById is deprecated. Use AIInteractionsService.getInteractionById instead.');
    
    if (!window.AIInteractionsService) {
      return this._legacyGetAIInteractionById(id);
    }
    
    return AIInteractionsService.getInteractionById(id);
  },
  
  // Legacy implementation
  async _legacyGetAIInteractionById(id) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      const { data, error } = await this._client
        .from('ai_interactions')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error getting AI interaction:', error);
      return { error };
    }
  },
  
  // Delete an AI interaction
  async deleteAIInteraction(id) {
    console.warn('SupabaseClient.deleteAIInteraction is deprecated. Use AIInteractionsService.deleteInteraction instead.');
    
    if (!window.AIInteractionsService) {
      return this._legacyDeleteAIInteraction(id);
    }
    
    return AIInteractionsService.deleteInteraction(id);
  },
  
  // Legacy implementation
  async _legacyDeleteAIInteraction(id) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      const { data, error } = await this._client
        .from('ai_interactions')
        .delete()
        .eq('id', id);
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting AI interaction:', error);
      return { error };
    }
  },
  
  // Export AI interactions (for backup or analysis)
  async exportAIInteractions(format = 'json') {
    console.warn('SupabaseClient.exportAIInteractions is deprecated. Use AIInteractionsService.exportInteractions instead.');
    
    if (!window.AIInteractionsService) {
      return this._legacyExportAIInteractions(format);
    }
    
    return AIInteractionsService.exportInteractions(format);
  },
  
  // Legacy implementation
  async _legacyExportAIInteractions(format = 'json') {
    const { data, error } = await this.getAIInteractions();
    if (error) return { error };
    
    let exportData, filename, mimeType;
    
    if (format === 'json') {
      // JSON format
      exportData = JSON.stringify(data, null, 2);
      filename = `ai-interactions-${new Date().toISOString().slice(0, 10)}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      // CSV format
      const headers = ['id', 'created_at', 'prompt', 'response', 'model', 'interaction_type'];
      const rows = [headers.join(',')];
      
      for (const item of data) {
        const values = headers.map(header => {
          const value = item[header];
          // Escape strings with quotes and commas
          return typeof value === 'string' 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        });
        rows.push(values.join(','));
      }
      
      exportData = rows.join('\n');
      filename = `ai-interactions-${new Date().toISOString().slice(0, 10)}.csv`;
      mimeType = 'text/csv';
    } else {
      return { error: `Unsupported format: ${format}` };
    }
    
    return { data: exportData, filename, mimeType };
  }
};

window.SupabaseClient = SupabaseClient;
