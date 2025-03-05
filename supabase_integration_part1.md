# Supabase Integration Implementation Plan - Part 1

## Overview

This document outlines the implementation plan for integrating Supabase as the backend database for the Academic Project Management Application. This integration will replace the current localStorage implementation with a robust, cloud-based database solution.

## Current State

Currently, the application:
- Uses localStorage for storing projects, tasks, and resources
- Has partial Supabase schema setup but isn't fully utilizing it
- Lacks proper data synchronization between client and server

## Implementation Goals

1. Migrate all data storage from localStorage to Supabase
2. Implement proper CRUD operations for all data types
3. Set up Supabase Bucket storage for resources and files
4. Ensure data synchronization between client and server
5. Add authentication for multi-user support

## Part 1: Core Database Integration

### 1. Update Supabase Client Utility

Enhance the existing `/js/utils/supabaseClient.js` to include comprehensive CRUD operations for all entity types:

```javascript
// Enhanced Supabase client utility for database operations
const SupabaseClient = {
  // Existing initialization code...
  
  // Project Operations
  async getProjects() {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      const { data, error } = await this._client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { error };
    }
  },
  
  async getProjectById(id) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      const { data, error } = await this._client
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching project:', error);
      return { error };
    }
  },
  
  async createProject(project) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      // Remove client-side ID if present, let Supabase generate UUID
      const { id, ...projectData } = project;
      
      const { data, error } = await this._client
        .from('projects')
        .insert([projectData])
        .select();
      
      return { data: data?.[0], error };
    } catch (error) {
      console.error('Error creating project:', error);
      return { error };
    }
  },
  
  async updateProject(id, updates) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      const { data, error } = await this._client
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select();
      
      return { data: data?.[0], error };
    } catch (error) {
      console.error('Error updating project:', error);
      return { error };
    }
  },
  
  async deleteProject(id) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      // First delete related tasks to maintain referential integrity
      await this._client
        .from('tasks')
        .delete()
        .eq('project_id', id);
      
      // Then delete the project
      const { data, error } = await this._client
        .from('projects')
        .delete()
        .eq('id', id);
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { error };
    }
  },
  
  // Task Operations
  async getTasks(filters = {}) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      let query = this._client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters if provided
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { error };
    }
  },
  
  async getTaskById(id) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      const { data, error } = await this._client
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching task:', error);
      return { error };
    }
  },
  
  async createTask(task) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      // Remove client-side ID if present, let Supabase generate UUID
      const { id, ...taskData } = task;
      
      // Convert projectId to project_id for database
      const formattedTask = {
        ...taskData,
        project_id: taskData.projectId || null,
        metadata: {
          comments: taskData.comments || [],
          files: taskData.files || [],
          ai_content: taskData.aiContent || '',
          ai_reviewed: taskData.aiReviewed || false,
          ai_generated: taskData.aiGenerated || false
        }
      };
      
      // Remove fields that are now in metadata
      delete formattedTask.comments;
      delete formattedTask.files;
      delete formattedTask.aiContent;
      delete formattedTask.aiReviewed;
      delete formattedTask.aiGenerated;
      delete formattedTask.projectId;
      
      const { data, error } = await this._client
        .from('tasks')
        .insert([formattedTask])
        .select();
      
      return { data: data?.[0], error };
    } catch (error) {
      console.error('Error creating task:', error);
      return { error };
    }
  },
  
  async updateTask(id, updates) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      // Format updates for database
      const formattedUpdates = { ...updates };
      
      // Handle metadata fields
      if (updates.comments || updates.files || updates.aiContent !== undefined || 
          updates.aiReviewed !== undefined || updates.aiGenerated !== undefined) {
        
        // First get the current task to merge metadata
        const { data: currentTask } = await this.getTaskById(id);
        const currentMetadata = currentTask?.metadata || {};
        
        formattedUpdates.metadata = {
          ...currentMetadata,
          comments: updates.comments || currentMetadata.comments || [],
          files: updates.files || currentMetadata.files || [],
          ai_content: updates.aiContent !== undefined ? updates.aiContent : currentMetadata.ai_content || '',
          ai_reviewed: updates.aiReviewed !== undefined ? updates.aiReviewed : currentMetadata.ai_reviewed || false,
          ai_generated: updates.aiGenerated !== undefined ? updates.aiGenerated : currentMetadata.ai_generated || false
        };
        
        // Remove fields that are now in metadata
        delete formattedUpdates.comments;
        delete formattedUpdates.files;
        delete formattedUpdates.aiContent;
        delete formattedUpdates.aiReviewed;
        delete formattedUpdates.aiGenerated;
      }
      
      // Convert projectId to project_id for database
      if (formattedUpdates.projectId !== undefined) {
        formattedUpdates.project_id = formattedUpdates.projectId;
        delete formattedUpdates.projectId;
      }
      
      const { data, error } = await this._client
        .from('tasks')
        .update(formattedUpdates)
        .eq('id', id)
        .select();
      
      return { data: data?.[0], error };
    } catch (error) {
      console.error('Error updating task:', error);
      return { error };
    }
  },
  
  async deleteTask(id) {
    if (!this.isInitialized()) {
      console.error('Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      const { data, error } = await this._client
        .from('tasks')
        .delete()
        .eq('id', id);
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { error };
    }
  }
};

window.SupabaseClient = SupabaseClient;
```

### 2. Create Data Service Layer

Create a new data service layer to abstract Supabase operations and provide fallback to localStorage:

```javascript
// Data service for handling both Supabase and localStorage
const DataService = {
  // Check if Supabase is available
  isSupabaseAvailable() {
    return SupabaseClient.isInitialized();
  },
  
  // Projects
  async getProjects() {
    if (this.isSupabaseAvailable()) {
      const { data, error } = await SupabaseClient.getProjects();
      if (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        return this._getProjectsFromLocalStorage();
      }
      return data;
    } else {
      return this._getProjectsFromLocalStorage();
    }
  },
  
  _getProjectsFromLocalStorage() {
    const savedProjects = localStorage.getItem('phd-projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  },
  
  async saveProject(project) {
    // Save to localStorage as backup
    const currentProjects = this._getProjectsFromLocalStorage();
    const existingIndex = currentProjects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      // Update existing project
      currentProjects[existingIndex] = project;
    } else {
      // Add new project
      currentProjects.push(project);
    }
    
    localStorage.setItem('phd-projects', JSON.stringify(currentProjects));
    
    // Save to Supabase if available
    if (this.isSupabaseAvailable()) {
      if (project.id && !project.id.toString().includes('-')) {
        // This is a client-generated ID, we need to create a new project
        const { data, error } = await SupabaseClient.createProject(project);
        if (error) {
          console.error('Error saving project to Supabase:', error);
          return { id: project.id, error };
        }
        return data;
      } else {
        // This might be a Supabase UUID, try to update
        const { data, error } = await SupabaseClient.updateProject(project.id, project);
        if (error) {
          // If update fails, try to create
          const { data: newData, error: createError } = await SupabaseClient.createProject(project);
          if (createError) {
            console.error('Error saving project to Supabase:', createError);
            return { id: project.id, error: createError };
          }
          return newData;
        }
        return data;
      }
    }
    
    return project;
  },
  
  async deleteProject(id) {
    // Delete from localStorage
    const currentProjects = this._getProjectsFromLocalStorage();
    const updatedProjects = currentProjects.filter(p => p.id !== id);
    localStorage.setItem('phd-projects', JSON.stringify(updatedProjects));
    
    // Delete from Supabase if available
    if (this.isSupabaseAvailable()) {
      const { error } = await SupabaseClient.deleteProject(id);
      if (error) {
        console.error('Error deleting project from Supabase:', error);
        return { error };
      }
    }
    
    return { success: true };
  },
  
  // Tasks
  async getTasks(filters = {}) {
    if (this.isSupabaseAvailable()) {
      const { data, error } = await SupabaseClient.getTasks(filters);
      if (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        return this._getTasksFromLocalStorage(filters);
      }
      
      // Convert from Supabase format to app format
      const formattedTasks = data.map(task => this._formatTaskFromSupabase(task));
      return formattedTasks;
    } else {
      return this._getTasksFromLocalStorage(filters);
    }
  },
  
  _getTasksFromLocalStorage(filters = {}) {
    const savedTasks = localStorage.getItem('phd-tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Apply filters
    return tasks.filter(task => {
      if (filters.projectId && task.projectId !== filters.projectId) {
        return false;
      }
      
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  },
  
  _formatTaskFromSupabase(task) {
    // Extract metadata fields
    const metadata = task.metadata || {};
    
    return {
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assigned_to || '',
      dueDate: task.due_date || '',
      priority: task.priority || 'Média',
      status: task.status || 'Não Iniciada',
      category: task.category || 'Investigação',
      progress: task.progress || 0,
      projectId: task.project_id || null,
      comments: metadata.comments || [],
      files: metadata.files || [],
      aiContent: metadata.ai_content || '',
      aiReviewed: metadata.ai_reviewed || false,
      aiGenerated: metadata.ai_generated || false
    };
  },
  
  _formatTaskForSupabase(task) {
    // Format task for Supabase
    const { id, comments, files, aiContent, aiReviewed, aiGenerated, projectId, ...basicData } = task;
    
    return {
      ...basicData,
      project_id: projectId,
      assigned_to: task.assignedTo,
      due_date: task.dueDate,
      metadata: {
        comments: comments || [],
        files: files || [],
        ai_content: aiContent || '',
        ai_reviewed: aiReviewed || false,
        ai_generated: aiGenerated || false
      }
    };
  },
  
  async saveTask(task) {
    // Save to localStorage as backup
    const currentTasks = this._getTasksFromLocalStorage();
    const existingIndex = currentTasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      // Update existing task
      currentTasks[existingIndex] = task;
    } else {
      // Add new task
      currentTasks.push(task);
    }
    
    localStorage.setItem('phd-tasks', JSON.stringify(currentTasks));
    
    // Save to Supabase if available
    if (this.isSupabaseAvailable()) {
      const formattedTask = this._formatTaskForSupabase(task);
      
      if (task.id && !task.id.toString().includes('-')) {
        // This is a client-generated ID, we need to create a new task
        const { data, error } = await SupabaseClient.createTask(formattedTask);
        if (error) {
          console.error('Error saving task to Supabase:', error);
          return { id: task.id, error };
        }
        return this._formatTaskFromSupabase(data);
      } else {
        // This might be a Supabase UUID, try to update
        const { data, error } = await SupabaseClient.updateTask(task.id, formattedTask);
        if (error) {
          // If update fails, try to create
          const { data: newData, error: createError } = await SupabaseClient.createTask(formattedTask);
          if (createError) {
            console.error('Error saving task to Supabase:', createError);
            return { id: task.id, error: createError };
          }
          return this._formatTaskFromSupabase(newData);
        }
        return this._formatTaskFromSupabase(data);
      }
    }
    
    return task;
  },
  
  async deleteTask(id) {
    // Delete from localStorage
    const currentTasks = this._getTasksFromLocalStorage();
    const updatedTasks = currentTasks.filter(t => t.id !== id);
    localStorage.setItem('phd-tasks', JSON.stringify(updatedTasks));
    
    // Delete from Supabase if available
    if (this.isSupabaseAvailable()) {
      const { error } = await SupabaseClient.deleteTask(id);
      if (error) {
        console.error('Error deleting task from Supabase:', error);
        return { error };
      }
    }
    
    return { success: true };
  }
};

window.DataService = DataService;
```
