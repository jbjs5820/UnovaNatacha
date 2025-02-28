// AI Interactions Service - Handles storing and retrieving AI interactions from Supabase
const AIInteractionsService = {
  // Store a new AI interaction
  async storeInteraction(prompt, response, model, type, metadata = {}, projectId = null, taskId = null, documentId = null) {
    // Check if Supabase is available
    if (!window.SupabaseClient || !SupabaseClient.isInitialized()) {
      console.warn('Supabase client not initialized. Storing interaction in localStorage only.');
      return this.storeInteractionLocally(prompt, response, model, type, metadata, projectId, taskId, documentId);
    }
    
    try {
      // Add timestamp to metadata
      const interactionMetadata = {
        ...metadata,
        timestamp: new Date().toISOString(),
        stored_locally: false
      };
      
      // Store in Supabase
      const { data, error } = await this.saveToSupabase({
        prompt,
        response,
        model,
        type,
        metadata: interactionMetadata,
        projectId,
        taskId,
        documentId
      });
      
      if (error) {
        console.error('Error storing AI interaction in Supabase:', error);
        // Fallback to localStorage
        return this.storeInteractionLocally(prompt, response, model, type, metadata, projectId, taskId, documentId);
      }
      
      console.log('AI interaction stored in Supabase:', data);
      return { success: true, data, source: 'supabase' };
    } catch (error) {
      console.error('Exception storing AI interaction in Supabase:', error);
      // Fallback to localStorage
      return this.storeInteractionLocally(prompt, response, model, type, metadata, projectId, taskId, documentId);
    }
  },
  
  /**
   * Saves an AI interaction to Supabase
   * @param {Object} interaction - The interaction to save
   * @returns {Promise<Object>} - The saved interaction or error
   */
  async saveToSupabase(interaction) {
    if (!SupabaseClient.isInitialized()) {
      console.warn('Supabase client not initialized. Cannot save interaction to Supabase.');
      return { error: 'Supabase client not initialized' };
    }
    
    try {
      // First try using the stored procedure (if it exists)
      try {
        const { data, error } = await SupabaseClient.getClient().rpc(
          'create_ai_interaction',
          {
            p_prompt: interaction.prompt,
            p_response: interaction.response,
            p_model: interaction.model,
            p_interaction_type: interaction.type,
            p_metadata: interaction.metadata || {},
            p_project_id: interaction.projectId || null,
            p_task_id: interaction.taskId || null,
            p_document_id: interaction.documentId || null
          }
        );
        
        if (!error) {
          return { data: { id: data } };
        }
        
        console.warn('Failed to save using stored procedure:', error);
        // If the stored procedure doesn't exist, fall back to direct table insert
      } catch (rpcError) {
        console.warn('RPC error when saving interaction:', rpcError);
        // Continue to fallback
      }
      
      // Fallback: Direct table insert
      const { data, error } = await SupabaseClient.getClient()
        .from('ai_interactions')
        .insert({
          prompt: interaction.prompt,
          response: interaction.response,
          model: interaction.model,
          interaction_type: interaction.type,
          metadata: interaction.metadata || {},
          project_id: interaction.projectId || null,
          task_id: interaction.taskId || null,
          document_id: interaction.documentId || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving interaction to Supabase:', error);
        
        // If the error is that the table doesn't exist, try to create it
        if (error.code === '42P01') { // Table doesn't exist
          console.log('Table ai_interactions does not exist. Please run the SQL in the Supabase SQL Editor.');
          console.log('See the supabase/create_schema.sql file for the required SQL.');
          return { error: 'Database tables not created. Please run the setup SQL in Supabase.' };
        }
        
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Exception saving interaction to Supabase:', error);
      return { error };
    }
  },
  
  /**
   * Gets AI interactions from Supabase with filtering
   * @param {Object} filters - Filters to apply
   * @param {Number} limit - Maximum number of interactions to return
   * @param {Number} offset - Offset for pagination
   * @returns {Promise<Object>} - The interactions or error
   */
  async getInteractionsFromSupabase(filters = {}, limit = 50, offset = 0) {
    if (!SupabaseClient.isInitialized()) {
      console.warn('Supabase client not initialized. Cannot get interactions from Supabase.');
      return { error: 'Supabase client not initialized' };
    }
    
    try {
      // First try using the stored procedure (if it exists)
      try {
        const { data, error } = await SupabaseClient.getClient().rpc(
          'get_ai_interactions',
          {
            p_interaction_type: filters.type || null,
            p_project_id: filters.projectId || null,
            p_task_id: filters.taskId || null,
            p_document_id: filters.documentId || null,
            p_limit: limit,
            p_offset: offset
          }
        );
        
        if (!error) {
          return { data };
        }
        
        console.warn('Failed to get interactions using stored procedure:', error);
        // If the stored procedure doesn't exist, fall back to direct query
      } catch (rpcError) {
        console.warn('RPC error when getting interactions:', rpcError);
        // Continue to fallback
      }
      
      // Fallback: Direct query
      let query = SupabaseClient.getClient()
        .from('ai_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);
      
      // Apply filters
      if (filters.type) {
        query = query.eq('interaction_type', filters.type);
      }
      
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      
      if (filters.taskId) {
        query = query.eq('task_id', filters.taskId);
      }
      
      if (filters.documentId) {
        query = query.eq('document_id', filters.documentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error getting interactions from Supabase:', error);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Exception getting interactions from Supabase:', error);
      return { error };
    }
  },
  
  // Store interaction in localStorage (fallback)
  storeInteractionLocally(prompt, response, model, type, metadata = {}, projectId = null, taskId = null, documentId = null) {
    try {
      // Get stored interactions or initialize empty array
      const storedInteractions = localStorage.getItem('ai_interactions');
      let interactions = storedInteractions ? JSON.parse(storedInteractions) : [];
      
      // Create new interaction with UUID
      const newInteraction = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        prompt,
        response,
        model,
        interaction_type: type,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          stored_locally: true
        },
        project_id: projectId,
        task_id: taskId,
        document_id: documentId
      };
      
      // Add to array
      interactions.push(newInteraction);
      
      // Store back in localStorage
      localStorage.setItem('ai_interactions', JSON.stringify(interactions));
      
      console.log('AI interaction stored locally:', newInteraction);
      return { success: true, data: newInteraction, source: 'localStorage' };
    } catch (error) {
      console.error('Error storing AI interaction locally:', error);
      return { success: false, error };
    }
  },
  
  // Get all AI interactions
  async getInteractions(options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      type = null, 
      projectId = null,
      taskId = null,
      documentId = null,
      sortBy = 'created_at', 
      sortDirection = 'desc' 
    } = options;
    
    // Check if Supabase is available
    if (!window.SupabaseClient || !SupabaseClient.isInitialized()) {
      console.warn('Supabase client not initialized. Getting interactions from localStorage only.');
      return this.getInteractionsLocally(options);
    }
    
    try {
      // Build query
      let query = SupabaseClient.getClient()
        .from('ai_interactions')
        .select('*');
      
      // Add filters
      if (type) {
        query = query.eq('interaction_type', type);
      }
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      if (taskId) {
        query = query.eq('task_id', taskId);
      }
      
      if (documentId) {
        query = query.eq('document_id', documentId);
      }
      
      // Add sorting
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
      
      // Add pagination
      query = query.range(offset, offset + limit - 1);
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error getting AI interactions from Supabase:', error);
        // Fallback to localStorage
        return this.getInteractionsLocally(options);
      }
      
      // Get local interactions and merge if needed
      const localResult = await this.getInteractionsLocally(options);
      
      if (localResult.success && localResult.data.length > 0) {
        // Merge and sort
        const allInteractions = [...data, ...localResult.data];
        const sortedInteractions = this.sortInteractions(allInteractions, sortBy, sortDirection);
        
        // Apply limit
        const limitedInteractions = sortedInteractions.slice(0, limit);
        
        return { 
          success: true, 
          data: limitedInteractions, 
          source: 'merged',
          count: allInteractions.length
        };
      }
      
      return { success: true, data, source: 'supabase', count };
    } catch (error) {
      console.error('Exception getting AI interactions from Supabase:', error);
      // Fallback to localStorage
      return this.getInteractionsLocally(options);
    }
  },
  
  // Get interactions from localStorage
  getInteractionsLocally(options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      type = null, 
      projectId = null,
      taskId = null,
      documentId = null,
      sortBy = 'created_at', 
      sortDirection = 'desc' 
    } = options;
    
    try {
      // Get stored interactions
      const storedInteractions = localStorage.getItem('ai_interactions');
      let interactions = storedInteractions ? JSON.parse(storedInteractions) : [];
      
      // Filter by type if needed
      if (type) {
        interactions = interactions.filter(item => item.interaction_type === type);
      }
      
      if (projectId) {
        interactions = interactions.filter(item => item.project_id === projectId);
      }
      
      if (taskId) {
        interactions = interactions.filter(item => item.task_id === taskId);
      }
      
      if (documentId) {
        interactions = interactions.filter(item => item.document_id === documentId);
      }
      
      // Sort interactions
      interactions = this.sortInteractions(interactions, sortBy, sortDirection);
      
      // Apply pagination
      const paginatedInteractions = interactions.slice(offset, offset + limit);
      
      return { 
        success: true, 
        data: paginatedInteractions, 
        source: 'local',
        count: interactions.length
      };
    } catch (error) {
      console.error('Error getting AI interactions from localStorage:', error);
      return { success: false, error, source: 'local' };
    }
  },
  
  // Helper to sort interactions
  sortInteractions(interactions, sortBy = 'created_at', sortDirection = 'desc') {
    return [...interactions].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  },
  
  // Sync local interactions to Supabase
  async syncLocalInteractions() {
    // Check if Supabase is available
    if (!window.SupabaseClient || !SupabaseClient.isInitialized()) {
      console.warn('Supabase client not initialized. Cannot sync local interactions.');
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    try {
      // Get local interactions
      const storedInteractions = localStorage.getItem('ai_interactions');
      const interactions = storedInteractions ? JSON.parse(storedInteractions) : [];
      
      // Filter for locally stored interactions only
      const localInteractions = interactions.filter(
        item => item.metadata && item.metadata.stored_locally
      );
      
      if (localInteractions.length === 0) {
        console.log('No local interactions to sync');
        return { success: true, synced: 0 };
      }
      
      // Prepare interactions for Supabase
      const interactionsToSync = localInteractions.map(item => ({
        prompt: item.prompt,
        response: item.response,
        model: item.model,
        interaction_type: item.interaction_type,
        metadata: {
          ...item.metadata,
          original_local_id: item.id,
          synced_at: new Date().toISOString(),
          stored_locally: false
        },
        project_id: item.project_id,
        task_id: item.task_id,
        document_id: item.document_id
      }));
      
      // Insert in batches to avoid request size limits
      const batchSize = 10;
      let syncedCount = 0;
      let errors = [];
      
      for (let i = 0; i < interactionsToSync.length; i += batchSize) {
        const batch = interactionsToSync.slice(i, i + batchSize);
        
        const { data, error } = await SupabaseClient.getClient()
          .from('ai_interactions')
          .insert(batch)
          .select();
        
        if (error) {
          console.error(`Error syncing batch ${i / batchSize + 1}:`, error);
          errors.push(error);
        } else {
          syncedCount += data.length;
          
          // Update local storage to mark these as synced
          for (const syncedItem of data) {
            const originalLocalId = syncedItem.metadata.original_local_id;
            const localIndex = interactions.findIndex(item => item.id === originalLocalId);
            
            if (localIndex !== -1) {
              // Remove the local item since it's now in Supabase
              interactions.splice(localIndex, 1);
            }
          }
        }
      }
      
      // Save updated local interactions
      localStorage.setItem('ai_interactions', JSON.stringify(interactions));
      
      return { 
        success: errors.length === 0, 
        synced: syncedCount,
        errors: errors.length > 0 ? errors : null,
        remaining: interactions.length
      };
    } catch (error) {
      console.error('Exception syncing local interactions:', error);
      return { success: false, error };
    }
  },
  
  // Delete an interaction
  async deleteInteraction(id) {
    // Check if it's a local ID
    if (id.startsWith('local-')) {
      return this.deleteLocalInteraction(id);
    }
    
    // Check if Supabase is available
    if (!window.SupabaseClient || !SupabaseClient.isInitialized()) {
      console.warn('Supabase client not initialized. Cannot delete from Supabase.');
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    try {
      const { error } = await SupabaseClient.getClient()
        .from('ai_interactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting AI interaction from Supabase:', error);
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Exception deleting AI interaction from Supabase:', error);
      return { success: false, error };
    }
  },
  
  // Delete a local interaction
  deleteLocalInteraction(id) {
    try {
      // Get stored interactions
      const storedInteractions = localStorage.getItem('ai_interactions');
      const interactions = storedInteractions ? JSON.parse(storedInteractions) : [];
      
      // Find and remove the interaction
      const index = interactions.findIndex(item => item.id === id);
      
      if (index === -1) {
        return { success: false, error: 'Interaction not found' };
      }
      
      interactions.splice(index, 1);
      
      // Save updated interactions
      localStorage.setItem('ai_interactions', JSON.stringify(interactions));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting local AI interaction:', error);
      return { success: false, error };
    }
  },
  
  // Clear all interactions (use with caution)
  async clearAllInteractions(options = { local: true, remote: false }) {
    const { local, remote } = options;
    const results = { local: null, remote: null };
    
    // Clear local interactions
    if (local) {
      try {
        localStorage.removeItem('ai_interactions');
        results.local = { success: true };
      } catch (error) {
        console.error('Error clearing local AI interactions:', error);
        results.local = { success: false, error };
      }
    }
    
    // Clear remote interactions
    if (remote) {
      // Check if Supabase is available
      if (!window.SupabaseClient || !SupabaseClient.isInitialized()) {
        console.warn('Supabase client not initialized. Cannot clear remote interactions.');
        results.remote = { success: false, error: 'Supabase client not initialized' };
      } else {
        try {
          // This is dangerous, so we add an extra check
          if (!confirm('Are you sure you want to delete ALL interactions from Supabase? This cannot be undone.')) {
            results.remote = { success: false, error: 'Operation cancelled by user' };
          } else {
            const { error } = await SupabaseClient.getClient()
              .from('ai_interactions')
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
            
            if (error) {
              console.error('Error clearing remote AI interactions:', error);
              results.remote = { success: false, error };
            } else {
              results.remote = { success: true };
            }
          }
        } catch (error) {
          console.error('Exception clearing remote AI interactions:', error);
          results.remote = { success: false, error };
        }
      }
    }
    
    return results;
  }
};

// Export the service
window.AIInteractionsService = AIInteractionsService;
