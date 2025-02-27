// Componente para pesquisa de artigos científicos
function PaperSearchTab({ resources, setResources, googleApiKey }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Função para pesquisar artigos usando a API Gemini
  const searchPapers = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Obter a chave API e modelo do localStorage ou do EnvConfig
      const apiKey = localStorage.getItem('geminiApiKey') || googleApiKey || EnvConfig.GEMINI_API_KEY;
      const model = localStorage.getItem('geminiModel') || EnvConfig.DEFAULT_MODEL;
      
      // Usar o utilitário GeminiAPI para pesquisar artigos
      const results = await GeminiAPI.searchAcademicPapers(apiKey, searchQuery, { model });
      
      // Processar e formatar os resultados
      const processedResults = results.map(item => ({
        title: item.title,
        link: item.link || '#',
        snippet: item.abstract,
        authors: item.authors || 'Autores não disponíveis',
        year: item.year || 'Ano não disponível',
        journal: item.journal || 'Publicação não disponível'
      }));
      
      setSearchResults(processedResults);
    } catch (err) {
      console.error('Erro na pesquisa:', err);
      setError(err.message || 'Ocorreu um erro ao pesquisar artigos');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para salvar um artigo como recurso
  const saveAsResource = (paper) => {
    const newResource = createResourceModel();
    newResource.id = Date.now();
    newResource.type = 'Artigo Científico';
    newResource.title = paper.title;
    newResource.url = paper.link;
    newResource.authors = paper.authors;
    newResource.year = paper.year !== 'Ano não disponível' ? paper.year : '';
    newResource.description = paper.snippet;
    newResource.dateAdded = new Date().toISOString().split('T')[0];
    
    setResources([...resources, newResource]);
    
    alert(`Artigo "${paper.title}" salvo como recurso.`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Digite termos para pesquisar artigos científicos..."
          className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
        />
        <button
          onClick={searchPapers}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Pesquisando...
            </span>
          ) : 'Pesquisar'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Resultados da Pesquisa</h3>
          <div className="space-y-6">
            {searchResults.map((paper, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-semibold text-blue-700 hover:text-blue-900">
                  <a href={paper.link} target="_blank" rel="noopener noreferrer">
                    {paper.title}
                  </a>
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Autores:</span> {paper.authors}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Ano:</span> {paper.year}
                </p>
                {paper.journal && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Publicação:</span> {paper.journal}
                  </p>
                )}
                <p className="mt-2 text-gray-700">{paper.snippet}</p>
                <div className="mt-3">
                  <button
                    onClick={() => saveAsResource(paper)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-200"
                  >
                    Salvar como Recurso
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {searchResults.length === 0 && !isLoading && searchQuery && !error && (
        <div className="mt-6 text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhum resultado encontrado para a sua pesquisa.</p>
          <p className="text-gray-500 mt-2">Tente termos diferentes ou mais específicos.</p>
        </div>
      )}
    </div>
  );
}

window.PaperSearchTab = PaperSearchTab;
