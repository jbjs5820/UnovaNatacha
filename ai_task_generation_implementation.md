# AI Task Generation Implementation Plan

This document outlines the implementation plan for adding AI-driven task generation to the Academic Project Management Application.

## Overview

The AI Task Generation feature will automatically create relevant tasks based on project information. When a user creates a new project, the system will use AI to suggest tasks aligned with the project's objectives, target users, and deadlines.

## Implementation Steps

### 1. Create AI Task Generation Service

Create a new service file: `/js/utils/aiTaskGenerationService.js`

```javascript
// AI Task Generation Service
const AITaskGenerationService = {
  // Generate tasks based on project data
  async generateTasksForProject(project, apiKey = null) {
    try {
      // Get API key from environment if not provided
      const key = apiKey || localStorage.getItem('geminiApiKey') || EnvConfig.GEMINI_API_KEY;
      const model = ModelUtils.getModelFromStorage();
      
      if (!key) {
        console.error('No API key available for AI Task Generation');
        return { error: 'No API key available' };
      }
      
      // Create prompt for the AI
      const prompt = this._createTaskGenerationPrompt(project);
      
      // Call Gemini API
      const response = await GeminiAPI.generateAcademicContent(
        key,
        prompt,
        'task_generation',
        'pt',
        {
          model,
          interactionType: 'task_generation',
          metadata: {
            projectId: project.id,
            projectName: project.name
          }
        }
      );
      
      // Parse the AI response into task objects
      const tasks = this._parseTasksFromAIResponse(response, project.id);
      
      return { tasks };
    } catch (error) {
      console.error('Error generating tasks:', error);
      return { error: error.message || 'Error generating tasks' };
    }
  },
  
  // Create a detailed prompt for the AI
  _createTaskGenerationPrompt(project) {
    return `Crie uma lista detalhada de tarefas para um projeto acadêmico com as seguintes características:
    
Título do Projeto: ${project.name}
Descrição: ${project.description}
Prazo: ${project.deadline}
Membros da equipe: ${project.members.join(', ')}

Para cada tarefa, inclua:
1. Título da tarefa
2. Descrição detalhada
3. Responsável sugerido (escolha entre os membros da equipe)
4. Prazo estimado (em dias a partir do início)
5. Categoria (Pesquisa, Análise, Escrita, Revisão, etc.)
6. Prioridade (Alta, Média, Baixa)

Formate as tarefas em formato JSON, com cada tarefa contendo os campos: title, description, assignedTo, dueDate (em dias), category, priority.
Organize as tarefas em uma sequência lógica, considerando dependências entre elas.`;
  },
  
  // Parse the AI response into task objects
  _parseTasksFromAIResponse(response, projectId) {
    try {
      // Try to parse the response as JSON directly
      let tasks = [];
      
      // First, try to extract JSON if it's wrapped in text
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/```\n([\s\S]*?)\n```/) ||
                        response.match(/\[\n\s*\{\s*"title"/);
      
      if (jsonMatch) {
        // Extract the JSON part
        const jsonStr = jsonMatch[1] || response;
        tasks = JSON.parse(jsonStr);
      } else {
        // If not in JSON format, try to parse it as plain text
        console.warn('AI response not in expected JSON format, attempting to parse text');
        tasks = this._parseTasksFromText(response);
      }
      
      // Convert the parsed tasks into our task model format
      return tasks.map(task => {
        const model = createTaskModel({
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          priority: task.priority || 'Média',
          category: task.category || 'Pesquisa',
          status: 'Não Iniciada',
          progress: 0,
          aiGenerated: true,
          projectId: projectId
        });
        
        return model;
      });
    } catch (error) {
      console.error('Error parsing AI response into tasks:', error);
      console.log('Raw response:', response);
      return [];
    }
  },
  
  // Fallback parser for non-JSON responses
  _parseTasksFromText(text) {
    const tasks = [];
    const taskBlocks = text.split(/Tarefa \d+:|Tarefa:/).filter(block => block.trim().length > 0);
    
    taskBlocks.forEach(block => {
      try {
        const title = block.match(/Título:?\s*([^\n]+)/i)?.[1]?.trim() || 'Tarefa não especificada';
        const description = block.match(/Descrição:?\s*([^\n]+(?:\n(?!Responsável|Prazo|Categoria|Prioridade)[^\n]+)*)/i)?.[1]?.trim() || '';
        const assignedTo = block.match(/Responsável:?\s*([^\n]+)/i)?.[1]?.trim() || '';
        const dueDate = block.match(/Prazo:?\s*([^\n]+)/i)?.[1]?.trim() || '';
        const category = block.match(/Categoria:?\s*([^\n]+)/i)?.[1]?.trim() || 'Pesquisa';
        const priority = block.match(/Prioridade:?\s*([^\n]+)/i)?.[1]?.trim() || 'Média';
        
        tasks.push({
          title,
          description,
          assignedTo,
          dueDate,
          category,
          priority
        });
      } catch (error) {
        console.error('Error parsing task block:', error);
      }
    });
    
    return tasks;
  }
};

window.AITaskGenerationService = AITaskGenerationService;
```

### 2. Modify Project Creation Flow

Update `/js/components/ProjectsView.js` to integrate AI task generation when a project is created or edited:

```javascript
// Add new state for task generation
const [isGeneratingTasks, setIsGeneratingTasks] = React.useState(false);
const [showGenerateTasksButton, setShowGenerateTasksButton] = React.useState(false);

// Modify addProject function to show generate tasks button after creating project
const addProject = (e) => {
  e.preventDefault();
  const newProject = {
    ...projectFormData,
    id: Date.now(),
    members: typeof projectFormData.members === 'string' 
            ? projectFormData.members.split(',').map(member => member.trim()) 
            : projectFormData.members
  };
  setProjects([...projects, newProject]);
  setProjectFormData(createProjectModel());
  document.getElementById('addProjectModal').classList.add('hidden');
  
  // Show success notification with option to generate tasks
  setShowGenerateTasksButton(true);
  setTimeout(() => setShowGenerateTasksButton(false), 10000); // Hide after 10 seconds
  
  // Store the newly created project ID to use for task generation
  window.lastCreatedProjectId = newProject.id;
};

// Add function to generate tasks for a project
const generateTasksForProject = async (projectId) => {
  setIsGeneratingTasks(true);
  
  try {
    // Find the project
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      console.error('Project not found', projectId);
      return;
    }
    
    // Call AI service to generate tasks
    const { tasks, error } = await AITaskGenerationService.generateTasksForProject(project);
    
    if (error) {
      console.error('Error generating tasks:', error);
      alert(`Erro ao gerar tarefas: ${error}`);
      return;
    }
    
    if (tasks && tasks.length > 0) {
      // Store the generated tasks
      const currentTasks = JSON.parse(localStorage.getItem('phd-tasks') || '[]');
      const updatedTasks = [...currentTasks, ...tasks];
      localStorage.setItem('phd-tasks', JSON.stringify(updatedTasks));
      
      // Update tasks in the current state (if tasks state is accessible)
      if (window.currentTasksComponent && window.currentTasksComponent.tasks) {
        const currentTasksList = window.currentTasksComponent.tasks;
        const updatedTasksList = [...currentTasksList, ...tasks];
        window.setTasks(updatedTasksList);
      }
      
      alert(`${tasks.length} tarefas foram geradas com sucesso para o projeto "${project.name}".`);
    } else {
      alert('Não foi possível gerar tarefas. Verifique os detalhes do projeto e tente novamente.');
    }
  } catch (error) {
    console.error('Error in generateTasksForProject', error);
    alert(`Erro ao gerar tarefas: ${error.message}`);
  } finally {
    setIsGeneratingTasks(false);
  }
};
```

### 3. Add UI Elements for Task Generation

Add these UI elements to the ProjectsView component:

```jsx
{/* Task Generation Notification */}
{showGenerateTasksButton && (
  <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50">
    <div className="flex justify-between items-center">
      <p>Projeto criado com sucesso! Deseja gerar tarefas automaticamente?</p>
      <div className="ml-4">
        <button
          onClick={() => generateTasksForProject(window.lastCreatedProjectId)}
          disabled={isGeneratingTasks}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50"
        >
          {isGeneratingTasks ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gerando...
            </span>
          ) : 'Gerar Tarefas'}
        </button>
        <button
          onClick={() => setShowGenerateTasksButton(false)}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
)}

{/* Add a "Generate Tasks" button to each project card */}
<button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    generateTasksForProject(project.id);
  }}
  className="mt-2 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium py-1 px-2 rounded transition duration-200"
  title="Gerar tarefas automaticamente para este projeto"
>
  <span className="flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
    </svg>
    Gerar Tarefas
  </span>
</button>
```

### 4. Enhance TasksView Component

Update the TasksView component to display AI-generated tasks appropriately:

```javascript
// Add logic to filter tasks by project
const filteredTasks = tasks.filter(task => {
  if (selectedProjectId) {
    return task.projectId === selectedProjectId;
  }
  return true;
});

// Add visual indicator for AI-generated tasks
<div className="task-card">
  {task.aiGenerated && (
    <div className="absolute top-2 right-2 flex items-center text-xs text-indigo-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2-3.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zm0-2a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5zm0-2a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5zm0-2a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5z" clipRule="evenodd" />
      </svg>
      IA
    </div>
  )}
  
  {/* Rest of the task card content */}
</div>
```

### 5. Update Task Model

Modify the task model in `/js/utils/models.js` to include AI-related fields:

```javascript
// Modelo de Tarefa
const createTaskModel = (data = {}) => ({
  id: data.id || Date.now(),
  title: data.title || '',
  description: data.description || '',
  assignedTo: data.assignedTo || '',
  dueDate: data.dueDate || '',
  priority: data.priority || 'Média',
  status: data.status || 'Não Iniciada',
  category: data.category || 'Investigação',
  comments: data.comments || [],
  files: data.files || [],
  progress: data.progress || 0,
  projectId: data.projectId || null, // Add projectId field
  aiContent: data.aiContent || '', // Conteúdo gerado pela IA
  aiReviewed: data.aiReviewed || false, // Indica se o conteúdo foi revisto pelo utilizador
  aiGenerated: data.aiGenerated || false, // Indica se a tarefa foi gerada pela IA
});
```

## Testing Plan

1. Create a new project with detailed information
2. Test the "Generate Tasks" button functionality
3. Verify that tasks are generated with appropriate titles, descriptions, and assignments
4. Test task filtering by project
5. Verify that AI-generated tasks are visually distinct
6. Test the integration with Supabase for storing tasks

## Future Enhancements

1. Allow customization of task generation parameters
2. Add ability to regenerate specific tasks
3. Implement AI-driven task recommendation based on project progress
4. Create a dashboard showing task distribution and progress
5. Add automatic notifications for approaching deadlines

## Integration with Export Feature

Ensure that AI-generated tasks are properly included in project exports, highlighting their AI-generated nature and providing a coherent narrative across all tasks.
