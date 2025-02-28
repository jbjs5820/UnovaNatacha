/**
 * Supabase Schema Check Utility
 * 
 * This utility checks for the existence of database tables in Supabase.
 */

class SupabaseSchemaSetup {
  constructor(supabase) {
    this.supabase = supabase;
  }

  /**
   * Check if a specific table exists
   * @param {String} tableName - Name of the table to check
   * @returns {Promise<Boolean>} - Whether the table exists
   */
  async tableExists(tableName) {
    try {
      // Using information_schema is more reliable than trying to query the table directly
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .limit(1);
      
      if (error) {
        console.warn(`Error checking if table ${tableName} exists:`, error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.warn(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  /**
   * Check if all required tables exist
   * @returns {Promise<Object>} Object with table names as keys and boolean values indicating if they exist
   */
  async checkTablesExist() {
    try {
      const results = {
        projects: await this.tableExists('projects'),
        tasks: await this.tableExists('tasks'),
        documents: await this.tableExists('documents'),
        ai_interactions: await this.tableExists('ai_interactions')
      };
      
      return results;
    } catch (error) {
      console.error('Error checking tables:', error);
      throw error;
    }
  }
}

// Export the utility
window.SupabaseSchemaSetup = SupabaseSchemaSetup;
