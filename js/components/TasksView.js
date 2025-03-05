// Componente de Visualização de Tarefas
const TasksView = ({ tasks, setTasks }) => {
  const [taskFormData, setTaskFormData] = React.useState(createTaskModel());
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTaskId, setEditTaskId] = React.useState(null);
  
  // Add event listeners when component mounts
  React.useEffect(() => {
    console.log('TasksView component mounted');
    
    // Add direct click handlers to edit buttons
    const addEditButtonHandlers = () => {
      const editButtons = document.querySelectorAll('.task-edit-button');
      console.log('Found edit buttons:', editButtons.length);
      
      editButtons.forEach(button => {
        const taskId = button.getAttribute('data-task-id');
        if (taskId) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit button clicked for task ID:', taskId);
            const task = tasks.find(t => t.id == taskId);
            if (task) {
              startEditTask(task);
            }
          });
        }
      });
    };
    
    // Run after a short delay to ensure DOM is ready
    setTimeout(addEditButtonHandlers, 500);
    
    // Clean up
    return () => {
      console.log('TasksView component unmounting');
    };
  }, [tasks]); // Re-run when tasks change
  
  // Store component reference in window object for global access
  React.useEffect(() => {
    console.log('Storing TasksView component reference with', tasks.length, 'tasks');
    
    // Store a reference to the component in the window object
    window.currentTasksComponent = {
      tasks: tasks,
      startEditTask: (task) => {
        console.log('startEditTask called from global reference with task:', task);
        startEditTask(task);
      }
    };
    
    // Cleanup function to remove the reference when component unmounts
    return () => {
      window.currentTasksComponent = null;
    };
  }, [tasks]); // Re-run when tasks change
  
  // Handle changes to the task form
  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value
    });
  };
  
  // Add a new task
  const addTask = (e) => {
    e.preventDefault();
    const newTask = { ...taskFormData, id: Date.now() };
    setTasks([...tasks, newTask]);
    setTaskFormData(createTaskModel());
    document.getElementById('addTaskModal').classList.add('hidden');
  };
  
  // Edit a task
  const editTask = (e) => {
    e.preventDefault();
    
    // Update the task in the tasks array
    const updatedTasks = tasks.map(task => 
      task.id === editTaskId ? { ...taskFormData, id: editTaskId } : task
    );
    
    // Update state
    setTasks(updatedTasks);
    setTaskFormData(createTaskModel());
    setIsEditing(false);
    setEditTaskId(null);
    
    // Close the modal
    const modal = document.getElementById('addTaskModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    
    // Log for debugging
    console.log('Task updated:', taskFormData);
  };
  
  // Start editing a task
  const startEditTask = (task) => {
    console.log('startEditTask called with task:', task);
    
    try {
      // Set editing state
      setIsEditing(true);
      setEditTaskId(task.id);
      setTaskFormData({ ...task });
      
      // Get the modal element
      const modal = document.getElementById('addTaskModal');
      
      // Make sure the modal exists and is visible
      if (modal) {
        console.log('Found modal, removing hidden class');
        modal.classList.remove('hidden');
      } else {
        console.error('Modal element not found: addTaskModal');
      }
    } catch (error) {
      console.error('Error in startEditTask:', error);
    }
  };
  
  // Update task status
  const updateTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));
  };
  
  // Update task progress
  const updateTaskProgress = (id, newProgress) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, progress: newProgress } : task
    ));
  };
  
  // Delete a task
  const deleteTask = (id) => {
    if (confirm('Tem a certeza que pretende eliminar esta tarefa?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };
  
  // Modal toggle
  const toggleTaskModal = (show) => {
    const modal = document.getElementById('addTaskModal');
    if (!modal) {
      console.error('Modal element not found: addTaskModal');
      return;
    }
    
    if (show) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
      // Reset form when closing
      setTaskFormData(createTaskModel());
      setIsEditing(false);
      setEditTaskId(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="bg-white rounded-lg shadow p-4 w-full md:w-64">
          <h3 className="font-semibold text-gray-700">Total de Tarefas</h3>
          <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 w-full md:w-64">
          <h3 className="font-semibold text-gray-700">Concluídas</h3>
          <p className="text-3xl font-bold text-green-600">{tasks.filter(task => task.status === 'Concluída').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 w-full md:w-64">
          <h3 className="font-semibold text-gray-700">Em Curso</h3>
          <p className="text-3xl font-bold text-yellow-600">{tasks.filter(task => task.status === 'Em Curso').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 w-full md:w-64">
          <h3 className="font-semibold text-gray-700">Não Iniciadas</h3>
          <p className="text-3xl font-bold text-red-600">{tasks.filter(task => task.status === 'Não Iniciada').length}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Tarefas</h2>
        <button 
          onClick={() => toggleTaskModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          + Nova Tarefa
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`task-card bg-white rounded-lg shadow p-4 border-l-4 ${
              task.priority === 'Alta' 
                ? 'border-red-500' 
                : task.priority === 'Média' 
                  ? 'border-yellow-500' 
                  : 'border-green-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800">{task.title}</h3>
              <div className="flex space-x-2">
                <button 
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 cursor-pointer task-edit-button"
                  title="Editar tarefa"
                  data-task-id={task.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Edit button clicked directly for task ID:', task.id);
                    startEditTask(task);
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 pointer-events-none" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mt-2">{task.description}</p>
            
            <div className="mt-4 flex flex-wrap justify-between">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mb-2">
                {task.category}
              </span>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mb-2">
                {task.priority}
              </span>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              <div>Responsável: {task.assignedTo}</div>
              {task.dueDate && <div>Prazo: {task.dueDate}</div>}
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Progresso</span>
                <span className="text-sm font-medium text-gray-700">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    task.status === 'Concluída' 
                      ? 'bg-green-600' 
                      : task.status === 'Em Curso' 
                        ? 'bg-yellow-400' 
                        : 'bg-gray-400'
                  }`} 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <select 
                className="block text-sm border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
              >
                <option value="Não Iniciada">Não Iniciada</option>
                <option value="Em Curso">Em Curso</option>
                <option value="Concluída">Concluída</option>
              </select>
              
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={task.progress} 
                onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Indicador de conteúdo AI */}
            {task.aiContent && (
              <div className="mt-4 p-2 bg-blue-50 rounded">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm text-blue-600">
                    {task.aiReviewed ? "Conteúdo IA Revisto" : "Conteúdo IA Pendente de Revisão"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Modal para adicionar/editar tarefa */}
      <div id="addTaskModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h2>
          <form onSubmit={isEditing ? editTask : addTask}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Título
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={taskFormData.title}
                onChange={handleTaskFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={taskFormData.description}
                onChange={handleTaskFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignedTo">
                Responsável
              </label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={taskFormData.assignedTo}
                onChange={handleTaskFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                  Prazo
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={taskFormData.dueDate}
                  onChange={handleTaskFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                  Prioridade
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={taskFormData.priority}
                  onChange={handleTaskFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={taskFormData.status}
                  onChange={handleTaskFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Não Iniciada">Não Iniciada</option>
                  <option value="Em Curso">Em Curso</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Categoria
                </label>
                <select
                  id="category"
                  name="category"
                  value={taskFormData.category}
                  onChange={handleTaskFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Investigação">Investigação</option>
                  <option value="Análise">Análise</option>
                  <option value="Escrita">Escrita</option>
                  <option value="Revisão">Revisão</option>
                  <option value="Apresentação">Apresentação</option>
                  <option value="Média">Média</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="progress">
                Progresso: {taskFormData.progress}%
              </label>
              <input
                type="range"
                id="progress"
                name="progress"
                min="0"
                max="100"
                value={taskFormData.progress}
                onChange={handleTaskFormChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                {isEditing ? 'Atualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => toggleTaskModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

window.TasksView = TasksView;
