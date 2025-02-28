// Enhanced ResourcesView component with full functionality
const ResourcesView = ({ resources, setResources }) => {
  // State management
  const [resourceFormData, setResourceFormData] = React.useState({
    title: '',
    type: 'Artigo Científico',
    author: '',
    year: new Date().getFullYear(),
    description: '',
    url: '',
    areas: [],
    relevance: 0,
    notes: ''
  });
  const [filterType, setFilterType] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  
  // Load resources on mount
  React.useEffect(() => {
    try {
      const savedResources = localStorage.getItem('phd-resources');
      if (savedResources) {
        const parsedResources = JSON.parse(savedResources);
        if (Array.isArray(parsedResources)) {
          setResources(parsedResources);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar recursos:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Filter resources
  const filteredResources = React.useMemo(() => {
    return resources.filter(resource => {
      // Type filter
      const typeMatch = filterType === 'all' || resource.type === filterType;
      
      // Search term
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = !searchTerm || 
        resource.title?.toLowerCase().includes(searchLower) ||
        resource.author?.toLowerCase().includes(searchLower) ||
        resource.description?.toLowerCase().includes(searchLower) ||
        resource.areas?.some(area => area.toLowerCase().includes(searchLower));
      
      return typeMatch && searchMatch;
    });
  }, [resources, filterType, searchTerm]);
  
  // Form handlers
  const handleResourceFormChange = (e) => {
    const { name, value } = e.target;
    setResourceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAreaChange = (e) => {
    const areas = e.target.value.split(',').map(area => area.trim()).filter(Boolean);
    setResourceFormData(prev => ({
      ...prev,
      areas
    }));
  };
  
  // Resource management
  const addResource = (e) => {
    e.preventDefault();
    const newResource = {
      ...resourceFormData,
      id: Date.now(),
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    const updatedResources = [...resources, newResource];
    setResources(updatedResources);
    localStorage.setItem('phd-resources', JSON.stringify(updatedResources));
    setShowModal(false);
    setResourceFormData({
      title: '',
      type: 'Artigo Científico',
      author: '',
      year: new Date().getFullYear(),
      description: '',
      url: '',
      areas: [],
      relevance: 0,
      notes: ''
    });
  };
  
  const deleteResource = (id) => {
    if (confirm('Tem a certeza que pretende eliminar este recurso?')) {
      const updatedResources = resources.filter(r => r.id !== id);
      setResources(updatedResources);
      localStorage.setItem('phd-resources', JSON.stringify(updatedResources));
    }
  };
  
  const resetResources = () => {
    try {
      const defaultResources = [
        {
          id: 1,
          title: 'Métodos Econométricos para Dados em Painel',
          type: 'Livro',
          author: 'Wooldridge, J.',
          year: 2020,
          notes: 'Capítulos 10-12 particularmente relevantes para a nossa metodologia',
          area: 'Economia',
          relevance: 80
        },
        {
          id: 2,
          title: 'Abordagem da Teoria dos Jogos à Tomada de Decisão em Gestão',
          type: 'Artigo Científico',
          author: 'Schmidt, B.',
          year: 2023,
          url: 'https://doi.org/10.1234/example',
          notes: 'Fornece estrutura teórica para a nossa análise',
          area: 'Gestão',
          relevance: 70
        }
      ];
      
      setResources(defaultResources);
      localStorage.setItem('phd-resources', JSON.stringify(defaultResources));
      alert('Recursos redefinidos com sucesso!');
    } catch (error) {
      console.error('Erro ao redefinir recursos:', error);
      alert('Erro ao redefinir recursos: ' + error.message);
    }
  };
  
  // Render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Recursos Académicos</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            + Novo Recurso
          </button>
          <button 
            onClick={resetResources}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Redefinir
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-grow max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar recursos..."
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
              filterType === 'all' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('Artigo Científico')}
            className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
              filterType === 'Artigo Científico' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Artigos
          </button>
          <button
            onClick={() => setFilterType('Livro')}
            className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
              filterType === 'Livro' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Livros
          </button>
          <button
            onClick={() => setFilterType('Website')}
            className={`px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg ${
              filterType === 'Website' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Websites
          </button>
        </div>
      </div>
      
      {/* Resource List */}
      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">A carregar recursos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => (
              <div key={resource.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-800">{resource.title}</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setResourceFormData(resource);
                        setShowModal(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => deleteResource(resource.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {resource.type}
                  </span>
                  {resource.relevance && (
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      resource.relevance >= 80 ? 'bg-green-100 text-green-800' :
                      resource.relevance >= 60 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {resource.relevance}% relevante
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mt-2">{resource.author}</p>
                <p className="text-gray-500 text-sm">{resource.year}</p>
                
                {resource.areas?.length > 0 && (
                  <div className="mt-2">
                    {resource.areas.map(area => (
                      <span key={area} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                        {area}
                      </span>
                    ))}
                  </div>
                )}
                
                {resource.description && (
                  <p className="text-gray-600 mt-2 text-sm">{resource.description}</p>
                )}
                
                {resource.url && (
                  <a 
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-2 block text-sm"
                  >
                    Ver recurso online
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">Não foram encontrados recursos.</p>
              <button 
                onClick={resetResources}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Adicionar Recursos Padrão
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Add/Edit Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {resourceFormData.id ? 'Editar Recurso' : 'Novo Recurso'}
            </h3>
            
            <form onSubmit={addResource}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={resourceFormData.title}
                  onChange={handleResourceFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                  Tipo
                </label>
                <select
                  id="type"
                  name="type"
                  value={resourceFormData.type}
                  onChange={handleResourceFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Artigo Científico">Artigo Científico</option>
                  <option value="Livro">Livro</option>
                  <option value="Website">Website</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="author">
                  Autor
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={resourceFormData.author}
                  onChange={handleResourceFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">
                  Ano
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={resourceFormData.year}
                  onChange={handleResourceFormChange}
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
                  value={resourceFormData.description}
                  onChange={handleResourceFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="4"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={resourceFormData.url}
                  onChange={handleResourceFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://..."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="areas">
                  Áreas de Pesquisa
                </label>
                <input
                  type="text"
                  id="areas"
                  value={resourceFormData.areas.join(', ')}
                  onChange={handleAreaChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Economia, Gestão, Ciência de Dados, ..."
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {resourceFormData.id ? 'Guardar Alterações' : 'Adicionar Recurso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Make it available globally
window.ResourcesView = ResourcesView;
