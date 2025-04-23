// Script to query tables in Supabase database using MCP server
import fetch from 'node-fetch';

async function queryTables() {
  try {
    // MCP server endpoint for database operations
    const response = await fetch('http://localhost:3000/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'query',
        query: `
          SELECT 
            table_schema, 
            table_name, 
            table_type 
          FROM 
            information_schema.tables 
          WHERE 
            table_schema = 'public' OR 
            table_schema = 'pdh' 
          ORDER BY 
            table_schema, 
            table_name
        `
      }),
    });

    const data = await response.json();
    console.log('Database Tables:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error querying tables:', error);
  }
}

queryTables();
