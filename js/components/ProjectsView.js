// Componente de visualização e gestão de projetos
const ProjectsView = ({ projects, setProjects }) => {
  const [projectFormData, setProjectFormData] = React.useState(createProjectModel());
  
  // Handle changes to the project form
  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectFormData({
      ...projectFormData,
      [name]: name === 'members' ? value.split(',').map(member => member.trim()) : value
    });
  };
  
  // Add a new project
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
  };
  
  // Delete a project
  const deleteProject = (id) => {
    if (confirm('Tem a certeza que pretende eliminar este projeto?')) {
      setProjects(projects.filter(project => project.id !== id));
    }
  };
  
  // Modal toggle
  const toggleProjectModal = (show) => {
    const modal = document.getElementById('addProjectModal');
    if (show) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  };
  
  // View AI proposal
  const viewAiProposal = (project) => {
    // Implementar visualização da proposta AI
    if (project.aiProposal) {
      alert(`Proposta AI para "${project.name}":\n\n${project.aiProposal}`);
    } else {
      alert('Não existe proposta AI para este projeto ainda.');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Projetos</h2>
        <button 
          onClick={() => toggleProjectModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          + Novo Projeto
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => viewAiProposal(project)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Ver proposta AI"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    // Modal para editar
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  onClick={() => deleteProject(project.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mt-2">{project.description}</p>
            
            <div className="mt-4">
              <p><span className="font-semibold">Prazo:</span> {project.deadline}</p>
              <p><span className="font-semibold">Estado:</span> {project.status}</p>
              <p><span className="font-semibold">Membros da Equipa:</span> {project.members.join(', ')}</p>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Progresso</span>
                <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    project.status === 'Concluído' 
                      ? 'bg-green-600' 
                      : project.status === 'Em Curso' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-400'
                  }`} 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Indicador de proposta AI */}
            {project.aiProposal && (
              <div className="mt-4 p-2 bg-blue-50 rounded">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm text-blue-600">
                    {project.aiReviewed ? "Proposta AI Revista" : "Proposta AI Pendente de Revisão"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Modal para adicionar novo projeto */}
      <div id="addProjectModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Adicionar Novo Projeto</h2>
          <form onSubmit={addProject}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Nome do Projeto
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={projectFormData.name}
                onChange={handleProjectFormChange}
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
                value={projectFormData.description}
                onChange={handleProjectFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
                Prazo
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={projectFormData.deadline}
                onChange={handleProjectFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="members">
                Membros da Equipa (separados por vírgula)
              </label>
              <input
                type="text"
                id="members"
                name="members"
                value={Array.isArray(projectFormData.members) ? projectFormData.members.join(', ') : projectFormData.members}
                onChange={handleProjectFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Membro 1, Membro 2, ..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={projectFormData.status}
                onChange={handleProjectFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="Não Iniciado">Não Iniciado</option>
                <option value="Em Curso">Em Curso</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="progress">
                Progresso ({projectFormData.progress}%)
              </label>
              <input
                type="range"
                id="progress"
                name="progress"
                min="0"
                max="100"
                value={projectFormData.progress}
                onChange={handleProjectFormChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => toggleProjectModal(false)}
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

window.ProjectsView = ProjectsView;
