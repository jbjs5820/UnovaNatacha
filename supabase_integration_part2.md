# Supabase Integration Implementation Plan - Part 2

## Part 2: Resource Management & File Storage

### 1. Resources Database Operations

Add resource management functions to the Supabase client:

```javascript
// Resource Operations
async getResources(filters = {}) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    let query = this._client
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    const { data, error } = await query;
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { error };
  }
},

async getResourceById(id) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { data, error } = await this._client
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching resource:', error);
    return { error };
  }
},

async createResource(resource) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    // Remove client-side ID if present, let Supabase generate UUID
    const { id, ...resourceData } = resource;
    
    // Format resource for database
    const formattedResource = {
      title: resourceData.title || '',
      description: resourceData.description || '',
      type: resourceData.type || 'article',
      url: resourceData.url || '',
      authors: resourceData.authors || '',
      publication_date: resourceData.publicationDate || null,
      project_id: resourceData.projectId || null,
      metadata: {
        tags: resourceData.tags || [],
        notes: resourceData.notes || '',
        ai_generated: resourceData.aiGenerated || false,
        ai_content: resourceData.aiContent || '',
        citation: resourceData.citation || '',
        file_path: resourceData.filePath || ''
      }
    };
    
    const { data, error } = await this._client
      .from('resources')
      .insert([formattedResource])
      .select();
    
    return { data: data?.[0], error };
  } catch (error) {
    console.error('Error creating resource:', error);
    return { error };
  }
},

async updateResource(id, updates) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    // Get current resource to merge metadata
    const { data: currentResource } = await this.getResourceById(id);
    const currentMetadata = currentResource?.metadata || {};
    
    // Format updates for database
    const formattedUpdates = {};
    
    // Handle basic fields
    if (updates.title !== undefined) formattedUpdates.title = updates.title;
    if (updates.description !== undefined) formattedUpdates.description = updates.description;
    if (updates.type !== undefined) formattedUpdates.type = updates.type;
    if (updates.url !== undefined) formattedUpdates.url = updates.url;
    if (updates.authors !== undefined) formattedUpdates.authors = updates.authors;
    if (updates.publicationDate !== undefined) formattedUpdates.publication_date = updates.publicationDate;
    if (updates.projectId !== undefined) formattedUpdates.project_id = updates.projectId;
    
    // Handle metadata fields
    const updatedMetadata = { ...currentMetadata };
    
    if (updates.tags !== undefined) updatedMetadata.tags = updates.tags;
    if (updates.notes !== undefined) updatedMetadata.notes = updates.notes;
    if (updates.aiGenerated !== undefined) updatedMetadata.ai_generated = updates.aiGenerated;
    if (updates.aiContent !== undefined) updatedMetadata.ai_content = updates.aiContent;
    if (updates.citation !== undefined) updatedMetadata.citation = updates.citation;
    if (updates.filePath !== undefined) updatedMetadata.file_path = updates.filePath;
    
    formattedUpdates.metadata = updatedMetadata;
    
    const { data, error } = await this._client
      .from('resources')
      .update(formattedUpdates)
      .eq('id', id)
      .select();
    
    return { data: data?.[0], error };
  } catch (error) {
    console.error('Error updating resource:', error);
    return { error };
  }
},

async deleteResource(id) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    // First check if there's a file to delete
    const { data: resource } = await this.getResourceById(id);
    const filePath = resource?.metadata?.file_path;
    
    if (filePath) {
      // Delete the file from storage
      const { error: storageError } = await this._client
        .storage
        .from('resources')
        .remove([filePath]);
      
      if (storageError) {
        console.error('Error deleting resource file:', storageError);
      }
    }
    
    // Then delete the resource record
    const { data, error } = await this._client
      .from('resources')
      .delete()
      .eq('id', id);
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting resource:', error);
    return { error };
  }
}
```

### 2. File Storage Implementation

Add file storage operations to the Supabase client:

```javascript
// File Storage Operations
async uploadFile(file, path) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const filePath = path || `${Date.now()}_${file.name}`;
    
    const { data, error } = await this._client
      .storage
      .from('resources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL for the file
    const { data: { publicUrl } } = this._client
      .storage
      .from('resources')
      .getPublicUrl(filePath);
    
    return { data: { path: filePath, url: publicUrl }, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error };
  }
},

async downloadFile(path) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { data, error } = await this._client
      .storage
      .from('resources')
      .download(path);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error downloading file:', error);
    return { error };
  }
},

async getFileUrl(path) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { data: { publicUrl } } = this._client
      .storage
      .from('resources')
      .getPublicUrl(path);
    
    return { data: { url: publicUrl }, error: null };
  } catch (error) {
    console.error('Error getting file URL:', error);
    return { error };
  }
}
```

### 3. Data Migration Utility

Create a utility to migrate existing localStorage data to Supabase:

```javascript
// Data migration utility
const DataMigration = {
  async migrateToSupabase() {
    if (!SupabaseClient.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      // Migrate projects
      const projects = JSON.parse(localStorage.getItem('phd-projects') || '[]');
      console.log(`Migrating ${projects.length} projects to Supabase...`);
      
      for (const project of projects) {
        const { error } = await SupabaseClient.createProject(project);
        if (error) console.error(`Error migrating project ${project.id}:`, error);
      }
      
      // Migrate tasks
      const tasks = JSON.parse(localStorage.getItem('phd-tasks') || '[]');
      console.log(`Migrating ${tasks.length} tasks to Supabase...`);
      
      for (const task of tasks) {
        const formattedTask = DataService._formatTaskForSupabase(task);
        const { error } = await SupabaseClient.createTask(formattedTask);
        if (error) console.error(`Error migrating task ${task.id}:`, error);
      }
      
      // Migrate resources
      const resources = JSON.parse(localStorage.getItem('phd-resources') || '[]');
      console.log(`Migrating ${resources.length} resources to Supabase...`);
      
      for (const resource of resources) {
        // Format resource for Supabase
        const formattedResource = {
          title: resource.title || '',
          description: resource.description || '',
          type: resource.type || 'article',
          url: resource.url || '',
          authors: resource.authors || '',
          publication_date: resource.publicationDate || null,
          project_id: resource.projectId || null,
          metadata: {
            tags: resource.tags || [],
            notes: resource.notes || '',
            ai_generated: resource.aiGenerated || false,
            ai_content: resource.aiContent || '',
            citation: resource.citation || '',
            file_path: resource.filePath || ''
          }
        };
        
        const { error } = await SupabaseClient.createResource(formattedResource);
        if (error) console.error(`Error migrating resource ${resource.id}:`, error);
      }
      
      console.log('Migration completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error during migration:', error);
      return { error };
    }
  }
};

window.DataMigration = DataMigration;
```

## Part 3: Authentication and User Management

### 1. Authentication Implementation

Add authentication operations to the Supabase client:

```javascript
// Authentication Operations
async signUp(email, password) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { data, error } = await this._client.auth.signUp({
      email,
      password
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error signing up:', error);
    return { error };
  }
},

async signIn(email, password) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { data, error } = await this._client.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error signing in:', error);
    return { error };
  }
},

async signOut() {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { error } = await this._client.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
},

async getCurrentUser() {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { data: { user }, error } = await this._client.auth.getUser();
    return { user, error };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { error };
  }
},

async resetPassword(email) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { error } = await this._client.auth.resetPasswordForEmail(email);
    return { error };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { error };
  }
},

async updatePassword(password) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    const { error } = await this._client.auth.updateUser({
      password
    });
    
    return { error };
  } catch (error) {
    console.error('Error updating password:', error);
    return { error };
  }
}
```

### 2. User Profile Management

Add user profile operations to the Supabase client:

```javascript
// User Profile Operations
async getUserProfile() {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    // First get the current user
    const { user, error: userError } = await this.getCurrentUser();
    if (userError) throw userError;
    
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }
    
    // Then get the user profile
    const { data, error } = await this._client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { error };
  }
},

async updateUserProfile(updates) {
  if (!this.isInitialized()) {
    console.error('Supabase client not initialized');
    return { error: { message: 'Supabase client not initialized' } };
  }
  
  try {
    // First get the current user
    const { user, error: userError } = await this.getCurrentUser();
    if (userError) throw userError;
    
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }
    
    // Then update the user profile
    const { data, error } = await this._client
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select();
    
    return { data: data?.[0], error };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { error };
  }
}
```

## Implementation Steps

1. **Database Schema Setup**:
   - Create necessary tables in Supabase (projects, tasks, resources, profiles)
   - Set up appropriate relationships and constraints
   - Configure RLS (Row Level Security) policies for multi-user access

2. **Client Integration**:
   - Implement the Supabase client utility with all CRUD operations
   - Create the data service layer for abstracting storage operations
   - Implement file storage operations for resource attachments

3. **Authentication Integration**:
   - Implement sign-up, sign-in, and sign-out functionality
   - Create user profile management
   - Set up password reset flow

4. **UI Updates**:
   - Add login/signup screens
   - Update project, task, and resource components to use the data service
   - Add file upload/download UI for resources
   - Create user profile settings page

5. **Data Migration**:
   - Implement the data migration utility
   - Add migration option in settings
   - Provide fallback to localStorage when offline

## Testing Plan

1. **Unit Testing**:
   - Test all CRUD operations for projects, tasks, and resources
   - Test file upload/download functionality
   - Test authentication flows

2. **Integration Testing**:
   - Test data synchronization between client and server
   - Test offline fallback functionality
   - Test multi-user access and permissions

3. **User Acceptance Testing**:
   - Test the complete application flow with real users
   - Gather feedback on performance and usability
   - Identify any issues with data migration

## Deployment Considerations

1. **Environment Variables**:
   - Securely manage Supabase URL and API key
   - Set up different environments for development and production

2. **Security**:
   - Implement proper RLS policies in Supabase
   - Ensure secure handling of user authentication
   - Protect sensitive data

3. **Performance**:
   - Optimize database queries for performance
   - Implement caching for frequently accessed data
   - Monitor and optimize file storage usage

## Timeline

1. **Phase 1 (Week 1)**:
   - Set up Supabase project and database schema
   - Implement basic CRUD operations for projects and tasks

2. **Phase 2 (Week 2)**:
   - Implement file storage and resource management
   - Create data migration utility

3. **Phase 3 (Week 3)**:
   - Implement authentication and user management
   - Update UI components for multi-user support

4. **Phase 4 (Week 4)**:
   - Testing and bug fixing
   - Documentation and deployment

## Conclusion

This implementation plan provides a comprehensive roadmap for integrating Supabase as the backend database for the Academic Project Management Application. By following this plan, the application will transition from using localStorage to a robust, cloud-based database solution with proper authentication, file storage, and multi-user support.

The implementation is designed to be gradual, with fallback to localStorage when needed, ensuring a smooth transition for existing users. The end result will be a more powerful, reliable, and scalable application that can better serve the needs of academic project management.
