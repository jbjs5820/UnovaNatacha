// Script to query tables in Supabase database directly
import { createClient } from '@supabase/supabase-js';

// Supabase project details
const supabaseUrl = 'https://gqevdzxemwsdmalsupgd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZXZkenhlbXdzZG1hbHN1cGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDc2NjYsImV4cCI6MjA1NjI4MzY2Nn0.1ILPwgViZkCLHlGaSvBcaM9vnPbiPdDVLLg9yKIYw40';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function queryTables() {
  try {
    // Query to get all tables in the database
    const { data, error } = await supabase.rpc('get_tables_info');
    
    if (error) {
      // If the RPC function doesn't exist, try a direct SQL query
      console.log('RPC function not found, trying direct SQL query...');
      const { data: sqlData, error: sqlError } = await supabase
        .from('_metadata')
        .select('tables');
      
      if (sqlError) {
        // If that fails too, try a raw SQL query
        console.log('Direct table query failed, trying raw SQL...');
        const { data: rawData, error: rawError } = await supabase
          .rpc('pg_catalog_query', { 
            query_text: `
              SELECT 
                table_schema, 
                table_name, 
                table_type 
              FROM 
                information_schema.tables 
              WHERE 
                (table_schema = 'public' OR table_schema = 'pdh')
                AND table_type = 'BASE TABLE'
              ORDER BY 
                table_schema, 
                table_name
            `
          });
        
        if (rawError) {
          throw new Error(rawError.message);
        }
        
        console.log('Database Tables:');
        console.log(JSON.stringify(rawData, null, 2));
        return;
      }
      
      console.log('Database Tables:');
      console.log(JSON.stringify(sqlData, null, 2));
      return;
    }
    
    console.log('Database Tables:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error querying tables:', error.message);
    
    // Fallback to listing available schemas
    try {
      console.log('Attempting to list available schemas...');
      const { data: schemas, error: schemaError } = await supabase
        .rpc('pg_catalog_query', { 
          query_text: `
            SELECT 
              schema_name 
            FROM 
              information_schema.schemata 
            ORDER BY 
              schema_name
          `
        });
      
      if (schemaError) {
        throw new Error(schemaError.message);
      }
      
      console.log('Available Schemas:');
      console.log(JSON.stringify(schemas, null, 2));
    } catch (fallbackError) {
      console.error('Error listing schemas:', fallbackError.message);
    }
  }
}

queryTables();
