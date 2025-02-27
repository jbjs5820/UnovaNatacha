// Componente de visualização e gestão de recursos
const ResourcesView = ({ resources, setResources }) => {
  const [resourceFormData, setResourceFormData] = React.useState(createResourceModel());
  const [filterType, setFilterType] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Filtrar recursos
  const filteredResources = resources.filter(resource => {
    // Filtro por tipo
    const typeMatch = filterType === 'all' || resource.type === filterType;
    
    // Termo de pesquisa
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
                        resource.title.toLowerCase().includes(searchLower) ||
                        resource.authors.toLowerCase().includes(searchLower) ||
                        resource.description.toLowerCase().includes(searchLower) ||
                        resource.areas.some(area => area.toLowerCase().includes(searchLower));
    
    return typeMatch && searchMatch;
  });
  
  // Handle changes to the resource form
  const handleResourceFormChange = (e) => {
    const { name, value } = e.target;
    let newData = {
      ...resourceFormData,
      [name]: value
    };
    
    // Auto-detect research areas for papers when title or abstract changes
    if ((name === 'title' || name === 'description') && resourceFormData.type === 'Artigo Científico') {
      const detectedAreas = detectResearchAreas(`${newData.title} ${newData.description}`);
      if (detectedAreas.length > 0) {
        newData.areas = detectedAreas;
      }
      
      // Calculate relevance score
      newData.relevance = calculateRelevance(newData);
    }
    
    setResourceFormData(newData);
  };
  
  // Handle changes to area tags
  const handleAreaChange = (e) => {
    const areasText = e.target.value;
    setResourceFormData({
      ...resourceFormData,
      areas: areasText.split(',').map(area => area.trim())
    });
  };
  
  // Add a new resource
  const addResource = (e) => {
    e.preventDefault();
    const newResource = {
      ...resourceFormData,
      id: Date.now(),
      areas: typeof resourceFormData.areas === 'string' 
        ? resourceFormData.areas.split(',').map(area => area.trim()) 
        : resourceFormData.areas,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    setResources([...resources, newResource]);
    setResourceFormData(createResourceModel());
    document.getElementById('addResourceModal').classList.add('hidden');
  };
  
  // Delete a resource
  const deleteResource = (id) => {
    if (confirm('Tem a certeza que pretende eliminar este recurso?')) {
      setResources(resources.filter(resource => resource.id !== id));
    }
  };
  
  // Modal toggle
  const toggleResourceModal = (show) => {
    const modal = document.getElementById('addResourceModal');
    if (show) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  };
  
  // Get color based on relevance
  const getRelevanceColor = (relevance) => {
    if (relevance >= 80) return 'bg-green-100 text-green-800';
    if (relevance >= 60) return 'bg-green-50 text-green-700';
    if (relevance >= 40) return 'bg-yellow-100 text-yellow-800';
    if (relevance >= 20) return 'bg-yellow-50 text-yellow-700';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Recursos Académicos</h2>
        <button 
          onClick={() => toggleResourceModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          + Novo Recurso
        </button>
      </div>
      
      {/* Filtros e pesquisa */}
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
      
      {/* Lista de recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-gray-800">{resource.title}</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    // Implementar edição
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
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                resource.type === 'Artigo Científico' ? 'bg-blue-100 text-blue-800' :
                resource.type === 'Livro' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {resource.type}
              </span>
              
              {resource.type === 'Artigo Científico' && resource.relevance > 0 && (
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRelevanceColor(resource.relevance)}`}>
                  Relevância: {resource.relevance}%
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mt-2">
              {resource.description.length > 120 
                ? `${resource.description.substring(0, 120)}...` 
                : resource.description}
            </p>
            
            <div className="mt-4">
              {resource.authors && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Autores:</span> {resource.authors}
                </p>
              )}
              
              {resource.year && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Ano:</span> {resource.year}
                </p>
              )}
              
              {resource.url && (
                <p className="text-sm text-gray-600 truncate">
                  <span className="font-semibold">URL:</span> <a href={resource.url} target="_blank" className="text-blue-600 hover:underline">{resource.url}</a>
                </p>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {resource.areas.map((area, index) => (
                <span key={index} className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {area}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Aviso quando não existem recursos */}
      {filteredResources.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Não foram encontrados recursos com os critérios selecionados.</p>
        </div>
      )}
      
      {/* Modal para adicionar novo recurso */}
      <div id="addResourceModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Adicionar Novo Recurso</h2>
          <form onSubmit={addResource}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                Tipo de Recurso
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
                <option value="Outro">Outro</option>
              </select>
            </div>
            
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="authors">
                Autores
              </label>
              <input
                type="text"
                id="authors"
                name="authors"
                value={resourceFormData.authors}
                onChange={handleResourceFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                min="1900"
                max={new Date().getFullYear()}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                {resourceFormData.type === 'Artigo Científico' ? 'Resumo/Abstract' : 'Descrição'}
              </label>
              <textarea
                id="description"
                name="description"
                value={resourceFormData.description}
                onChange={handleResourceFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
              ></textarea>
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
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Áreas de Pesquisa
                {resourceFormData.type === 'Artigo Científico' && resourceFormData.areas.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">(auto-detectado)</span>
                )}
              </label>
              <input
                type="text"
                value={Array.isArray(resourceFormData.areas) ? resourceFormData.areas.join(', ') : resourceFormData.areas}
                onChange={handleAreaChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Economia, Gestão, Ciência de Dados, ..."
              />
            </div>
            
            {resourceFormData.type === 'Artigo Científico' && resourceFormData.relevance > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Relevância Calculada: {resourceFormData.relevance}%
                </label>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      resourceFormData.relevance >= 80 ? 'bg-green-600' :
                      resourceFormData.relevance >= 50 ? 'bg-blue-600' :
                      resourceFormData.relevance >= 30 ? 'bg-yellow-600' :
                      'bg-gray-400'
                    }`} 
                    style={{ width: `${resourceFormData.relevance}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => toggleResourceModal(false)}
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

window.ResourcesView = ResourcesView;
